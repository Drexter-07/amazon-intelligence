import re
import asyncio
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models import EnrichedProduct, IntelligenceReport
from services.oxylabs import get_product_detail_and_reviews
from services.bsr_calculator import estimate_monthly_sales, calculate_revenue
from services.claude import generate_intelligence_report

router = APIRouter()

class ReviewAnalyticsRequest(BaseModel):
    myAsin: Optional[str] = None
    asins: list[str]

def extract_asin(text: str) -> str:
    # Try to extract ASIN from URL
    match = re.search(r"(/dp/|/product/)([A-Z0-9]{10})", text)
    if match:
        return match.group(2)
    # Try direct ASIN
    match = re.search(r"^[A-Z0-9]{10}$", text.strip().upper())
    if match:
        return match.group(0)
    return ""

@router.post("/review-analytics")
async def review_analytics(req: ReviewAnalyticsRequest):
    if not req.asins:
        raise HTTPException(status_code=400, detail="Provide at least one ASIN")

    # Step 1: Extract ASINs
    asins = []
    for input_text in req.asins:
        asin = extract_asin(input_text)
        if asin and asin not in asins:
            asins.append(asin)
    
    asins = asins[:10] # Max 10

    if not asins:
        raise HTTPException(status_code=400, detail="No valid ASINs found in inputs")

    # Step 2: Product details + reviews in parallel via Oxylabs
    async def fetch_data_safe(asin: str):
        try:
            return await get_product_detail_and_reviews(asin)
        except Exception:
            return ({
                "asin": asin, "title": asin, "price": 0.0, "bsr": 0, 
                "rating": 0.0, "reviewCount": 0, "brand": "Unknown", 
                "category": "default", "imageUrl": "", "url": f"https://www.amazon.com/dp/{asin}"
            }, [])

    promises = [fetch_data_safe(a) for a in asins]
    results = await asyncio.gather(*promises)
    
    products = []
    all_reviews = []
    for r in results:
        if r[0] and "asin" in r[0]:
            products.append(r[0])
            all_reviews.append({"asin": r[0]["asin"], "reviews": r[1]})

    # Step 2.5: Dynamic Price Averaging
    # If any product has $0.00 price, try to assign it the average of the others
    valid_prices = [p["price"] for p in products if p["price"] > 0]
    avg_price = sum(valid_prices) / len(valid_prices) if valid_prices else 29.99
    
    for p in products:
        if p["price"] == 0.0:
            p["price"] = round(avg_price, 2)

    # Step 3: Revenue estimates
    revenue_data = []
    for p in products:
        est = estimate_monthly_sales(p.get("bsr", 0), p.get("category", "default"))
        monthly_sales = est["estimatedMonthlySales"]
        revenue_data.append({
            "asin": p.get("asin"),
            "monthlySales": monthly_sales,
            "monthlyRevenue": calculate_revenue(monthly_sales, p.get("price", 0.0))
        })

    total_reviews = sum(len(r.get("reviews", [])) for r in all_reviews)

    # Step 4: Claude analysis
    try:
        report_data = await generate_intelligence_report(products, all_reviews, revenue_data)
        report = IntelligenceReport(**report_data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude analysis failed: {str(e)}")

    # Step 5: Enrich products
    total_revenue = sum(r["monthlyRevenue"] for r in revenue_data)
    enriched = []
    
    for p in products:
        rev = next((r for r in revenue_data if r["asin"] == p["asin"]), {})
        monthly_rev = rev.get("monthlyRevenue", 0.0)
        revenue_share = round((monthly_rev / total_revenue * 100)) if total_revenue > 0 else 0
        
        enriched_p = {
            **p,
            "estimatedMonthlySales": rev.get("monthlySales", 0),
            "estimatedMonthlyRevenue": monthly_rev,
            "revenueShare": revenue_share,
            "strengthKeywords": [],
            "weaknessKeywords": []
        }
        enriched.append(EnrichedProduct(**enriched_p))
        
    enriched.sort(key=lambda x: x.estimatedMonthlyRevenue, reverse=True)

    # Determine dominant currency symbol
    currencies = [p.get("currency", "USD") for p in products]
    dominant_currency = max(set(currencies), key=currencies.count) if currencies else "USD"
    
    currency_map = {
        "USD": "$",
        "INR": "₹",
        "GBP": "£",
        "EUR": "€",
        "CAD": "CA$",
        "AUD": "AU$"
    }
    currency_symbol = currency_map.get(dominant_currency, "$")

    return {
        "success": True,
        "products": enriched,
        "report": report,
        "myAsin": req.myAsin,
        "analysisMode": "review",
        "currencySymbol": currency_symbol,
        "metadata": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "totalReviewsAnalyzed": total_reviews,
            "productsAnalyzed": len(products)
        }
    }
