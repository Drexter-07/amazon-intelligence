import os
import httpx
import asyncio

OXYLABS_URL = "https://realtime.oxylabs.io/v1/queries"

async def get_product_detail_and_reviews(asin: str) -> tuple[dict, list[dict]]:
    """
    Fetches the product details and the top ~10 reviews for an ASIN using the amazon_product source.
    """
    OXYLABS_USER = os.getenv("OXYLABS_USERNAME")
    OXYLABS_PASS = os.getenv("OXYLABS_PASSWORD")
    auth = (OXYLABS_USER, OXYLABS_PASS)
    
    payload = {
        "source": "amazon_product",
        "domain": "in",
        "query": asin,
        "parse": True,
        "context": [{"key": "autoselect_variant", "value": True}]
    }
    
    product_data = {}
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post("https://realtime.oxylabs.io/v1/queries", json=payload, auth=auth)
                data = res.json()
                
                if data.get("results") and len(data["results"]) > 0:
                    product_data = data["results"][0].get("content", {})
                    
                    if not product_data or not isinstance(product_data, dict):
                        print(f"WARNING: Attempt {attempt + 1}: Oxylabs returned an empty payload for {asin}. Retrying...")
                        if attempt < 2:
                            await asyncio.sleep(2)
                            continue
                        else:
                            product_data = {}
                    
                    break
        except Exception as e:
            print(f"Oxylabs Product Error for {asin}: {e}")
            if attempt == 2:
                return {}, []
            await asyncio.sleep(2)
    if not product_data:
        return {}, []

    print(f"\n{'='*60}")
    print(f"📦 RAW DATA CAPTURED FOR ASIN: {asin}")
    print(f"{'='*60}")
    for key, value in product_data.items():
        if key in ['reviews', 'images', 'similar_items', 'frequently_bought_together']:
            # For massive arrays, just print the length to avoid flooding the terminal
            if isinstance(value, list):
                print(f"🔹 {key.ljust(28)} : <List with {len(value)} items>")
            else:
                print(f"🔹 {key.ljust(28)} : <{type(value).__name__}>")
            continue
            
        # Convert value to string and truncate if it's too long
        val_str = str(value).replace('\n', ' ')
        if len(val_str) > 80:
            val_str = val_str[:77] + "..."
            
        print(f"🔹 {key.ljust(28)} : {val_str}")
    print(f"{'='*60}\n")

    # Standardize the output format to match our pipeline expectations
    bsr = 0
    final_category = "default"
    sales_rank = product_data.get("sales_rank", [])
    if sales_rank:
        bsr = sales_rank[0].get("rank", 0)
        ladder = sales_rank[0].get("ladder", [])
        if ladder:
            final_category = ladder[0].get("name", "default")
    # Intelligent Fallback for BSR based on review count
    review_count = int(product_data.get("reviews_count", 0))
    if bsr == 0 and review_count > 0:
        if review_count > 100000: bsr = 50
        elif review_count > 10000: bsr = 500
        elif review_count > 1000: bsr = 5000
        elif review_count > 100: bsr = 20000
        else: bsr = 50000
        final_category = "Fallback Estimate"
        
    # Deep Price Extraction
    price = product_data.get("price")
    if not price:
        buybox = product_data.get("buybox", {})
        price = buybox.get("price") if buybox else 0.0
    if not price:
        pricing = product_data.get("pricing", [])
        if pricing:
            price = pricing[0].get("price", 0.0)
            
    # Empty Title Fallback
    raw_title = product_data.get("product_name") or product_data.get("title")
    final_title = raw_title if raw_title else f"Product ({asin})"
    
    currency = product_data.get("currency", "USD")

    # Extract images list for count
    images_list = product_data.get("images", [])

    parsed_product = {
        "asin": asin,
        "title": final_title,
        "price": float(price or 0.0),
        "currency": currency,
        "bsr": int(bsr),
        "rating": float(product_data.get("rating", 0.0)),
        "reviewCount": int(product_data.get("reviews_count", 0)),
        "brand": product_data.get("brand", "Unknown"),
        "category": final_category,
        "imageUrl": images_list[0] if images_list else "",
        "url": product_data.get("url", f"https://www.amazon.in/dp/{asin}"),
        "bullet_points": product_data.get("bullet_points", "") if isinstance(product_data.get("bullet_points"), str) else " | ".join(str(x) for x in product_data.get("bullet_points", [])),
        "description": product_data.get("description", "") if isinstance(product_data.get("description"), str) else " ".join(str(x) for x in product_data.get("description", [])),
        "whats_in_the_box": product_data.get("whats_in_the_box", "") if isinstance(product_data.get("whats_in_the_box"), str) else " | ".join(str(x) for x in product_data.get("whats_in_the_box", [])),
        # --- NEW: Rich data fields for premium dashboard ---
        "discount_percentage": product_data.get("discount_percentage", 0),
        "price_strikethrough": product_data.get("price_strikethrough", 0),
        "sales_volume": product_data.get("sales_volume", ""),
        "has_videos": product_data.get("has_videos", False),
        "images_count": len(images_list),
        "answered_questions_count": product_data.get("answered_questions_count", 0),
        "is_prime_eligible": product_data.get("is_prime_eligible", False),
        "rating_stars_distribution": product_data.get("rating_stars_distribution", []),
        "variation": product_data.get("variation", []),
        "buy_it_with": product_data.get("buy_it_with", []),
        "frequently_bought_together": product_data.get("frequently_bought_together", []),
        "featured_merchant": product_data.get("featured_merchant", {}),
    }
    
    parsed_reviews = []
    # Oxylabs amazon_product source natively returns a list of the top helpful reviews
    all_reviews = product_data.get("reviews", [])
    
    for r in all_reviews:
        parsed_reviews.append({
            "asin": asin,
            "title": r.get("title", ""),
            "text": r.get("content", ""),
            "rating": r.get("rating", 3),
            "date": r.get("timestamp", ""),
            "verified": r.get("is_verified", False),
        })

    return parsed_product, parsed_reviews
