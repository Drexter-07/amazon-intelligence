import os
import json
from anthropic import AsyncAnthropic

REPORT_TOOL = {
    "name": "generate_market_report",
    "description": "Generate structured Amazon market intelligence from product and review data.",
    "input_schema": {
        "type": "object",
        "required": ["marketSummary", "topPurchaseCriteria", "topComplaints", "customerLanguage", "buyerPersona", "pixiiBrief"],
        "properties": {
            "marketSummary": {
                "type": "object",
                "required": ["totalMonthlyRevenue", "totalMonthlyUnits", "averagePrice", "averageRating", "marketMaturity", "opportunityScore", "opportunityRationale"],
                "properties": {
                    "totalMonthlyRevenue": {"type": "number"},
                    "totalMonthlyUnits": {"type": "integer"},
                    "averagePrice": {"type": "number"},
                    "averageRating": {"type": "number"},
                    "marketMaturity": {"type": "string", "enum": ["emerging", "growing", "mature", "saturated"]},
                    "opportunityScore": {"type": "integer", "description": "1-10 score"},
                    "opportunityRationale": {"type": "string"},
                },
            },
            "topPurchaseCriteria": {
                "type": "array",
                "minItems": 3,
                "maxItems": 5,
                "items": {
                    "type": "object",
                    "required": ["criterion", "importance", "frequency", "exampleQuote"],
                    "properties": {
                        "criterion": {"type": "string"},
                        "importance": {"type": "string", "enum": ["critical", "high", "medium"]},
                        "frequency": {"type": "integer", "description": "percent of reviews mentioning this"},
                        "exampleQuote": {"type": "string", "description": "paraphrased, under 20 words"},
                    },
                },
            },
            "topComplaints": {
                "type": "array",
                "minItems": 2,
                "maxItems": 4,
                "items": {
                    "type": "object",
                    "required": ["complaint", "severity", "frequency", "opportunity"],
                    "properties": {
                        "complaint": {"type": "string"},
                        "severity": {"type": "string", "enum": ["deal-breaker", "frustration", "minor"]},
                        "frequency": {"type": "integer"},
                        "opportunity": {"type": "string", "description": "how a new listing wins on this"},
                    },
                },
            },
            "customerLanguage": {
                "type": "array",
                "minItems": 5,
                "maxItems": 10,
                "items": {"type": "string", "description": "exact phrases customers use in reviews"},
            },
            "buyerPersona": {"type": "string", "description": "2-3 sentence buyer description"},
            "pixiiBrief": {
                "type": "object",
                "required": [
                    "heroImageFocus", "heroImageDescription", "infographicBullets",
                    "lifestyleSceneDescription", "topHeadline", "keyBenefitClaims",
                    "wordsToAvoid", "differentiationAngle", "urgencyMessage"
                ],
                "properties": {
                    "heroImageFocus": {"type": "string"},
                    "heroImageDescription": {"type": "string", "description": "detailed enough for AI image generator"},
                    "infographicBullets": {"type": "array", "minItems": 5, "maxItems": 5, "items": {"type": "string"}},
                    "lifestyleSceneDescription": {"type": "string"},
                    "topHeadline": {"type": "string", "description": "max 10 words, uses customer language"},
                    "keyBenefitClaims": {"type": "array", "minItems": 3, "maxItems": 3, "items": {"type": "string"}},
                    "wordsToAvoid": {"type": "array", "minItems": 3, "maxItems": 6, "items": {"type": "string"}},
                    "differentiationAngle": {"type": "string"},
                    "urgencyMessage": {"type": "string"},
                },
            },
        },
    },
}

DEFAULT_BRIEF = {
    "heroImageFocus": "Product on clean background",
    "heroImageDescription": "Clean product shot showing key features.",
    "infographicBullets": ["Quality materials", "Easy to use", "Great value", "Fast results", "Customer approved"],
    "lifestyleSceneDescription": "Person using product in everyday setting.",
    "topHeadline": "The Smart Choice for Discerning Buyers",
    "keyBenefitClaims": ["High quality", "Great value", "Trusted by thousands"],
    "wordsToAvoid": ["premium", "high-quality", "best-in-class"],
    "differentiationAngle": "Address the most common customer complaint directly.",
    "urgencyMessage": "Join thousands of satisfied customers.",
}

async def generate_intelligence_report(products: list[dict], all_reviews: list[dict], revenue_data: list[dict]) -> dict:
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    
    review_summary = []
    for review_entry in all_reviews:
        asin = review_entry.get("asin")
        reviews = review_entry.get("reviews", [])
        product = next((p for p in products if p.get("asin") == asin), {})
        
        positive = [r["text"][:150] for r in reviews if r.get("rating", 0) >= 4][:25]
        negative = [r["text"][:150] for r in reviews if r.get("rating", 0) <= 2][:20]
        
        avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0
        
        review_summary.append({
            "asin": asin,
            "productName": product.get("title", asin)[:70],
            "totalSampled": len(reviews),
            "avgRating": round(avg_rating, 1),
            "positiveReviews": positive,
            "negativeReviews": negative,
        })
        
    product_summary = []
    for p in products:
        rev = next((r for r in revenue_data if r.get("asin") == p.get("asin")), {})
        product_summary.append({
            "asin": p.get("asin"),
            "title": p.get("title", "")[:80],
            "brand": p.get("brand"),
            "price": p.get("price"),
            "rating": p.get("rating"),
            "reviewCount": p.get("reviewCount"),
            "bsr": p.get("bsr"),
            "estimatedMonthlySales": rev.get("monthlySales", 0),
            "estimatedMonthlyRevenue": rev.get("monthlyRevenue", 0),
            "bulletPoints": p.get("bullet_points", ""),
            "description": p.get("description", "")[:500],  # Truncate to save tokens
            "whatsInTheBox": p.get("whats_in_the_box", ""),
        })
        
    prompt = f"""You are an expert Amazon market analyst for Pixii — an AI listing design tool.
Analyze this data. Be SPECIFIC. Reference actual review content. No generic advice.

PRODUCTS:
{json.dumps(product_summary, indent=2)}

REVIEWS:
{json.dumps(review_summary, indent=2)}

Call generate_market_report with your complete analysis now."""

    response = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4096,
        tools=[REPORT_TOOL],
        tool_choice={"type": "tool", "name": "generate_market_report"},
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Process the tool block output
    tool_block = next((block for block in response.content if block.type == "tool_use"), None)
    if not tool_block:
        raise Exception("Claude did not return tool_use block")
        
    report = tool_block.input
    
    # We must format the response to match the IntelligenceReport model perfectly.
    # The models.py expects: marketSummary, customerIntelligence, pixiiBrief
    # customerIntelligence must contain: topPurchaseCriteria, topComplaints, customerLanguage, buyerPersona
    
    market_summary = {
        "totalMonthlyRevenue": 0, "totalMonthlyUnits": 0, "averagePrice": 0,
        "averageRating": 0, "marketMaturity": "growing", "opportunityScore": 5,
        "opportunityRationale": "Analysis incomplete."
    }
    market_summary.update(report.get("marketSummary", {}))
    
    pixii_brief = DEFAULT_BRIEF.copy()
    pixii_brief.update(report.get("pixiiBrief", {}))
    
    customer_intelligence = {
        "topPurchaseCriteria": report.get("topPurchaseCriteria", []),
        "topComplaints": report.get("topComplaints", []),
        "customerLanguage": report.get("customerLanguage", []),
        "buyerPersona": report.get("buyerPersona", "Analysis incomplete.")
    }
    
    return {
        "marketSummary": market_summary,
        "customerIntelligence": customer_intelligence,
        "pixiiBrief": pixii_brief,
    }
