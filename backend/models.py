"""
models.py — Pydantic models matching the TypeScript types exactly
"""
from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel


# ── Request ──────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    url: Optional[str] = None          # Best Sellers URL (market mode)
    asins: Optional[list[str]] = None  # ASIN list (review analytics mode)
    myAsin: Optional[str] = None       # user's own ASIN (highlighted in table)


# ── Product ───────────────────────────────────────────────────
class ProductData(BaseModel):
    asin: str
    title: str
    price: float
    rating: float
    reviewCount: int
    bsr: int
    category: str
    brand: str
    imageUrl: str
    url: str


class EnrichedProduct(ProductData):
    estimatedMonthlySales: int
    estimatedMonthlyRevenue: float
    revenueShare: float
    strengthKeywords: list[str] = []
    weaknessKeywords: list[str] = []
    # --- Rich data fields for premium dashboard ---
    currency: Optional[str] = "USD"
    bullet_points: Optional[str] = ""
    description: Optional[str] = ""
    whats_in_the_box: Optional[str] = ""
    discount_percentage: Optional[float] = 0
    price_strikethrough: Optional[float] = 0
    sales_volume: Optional[str] = ""
    has_videos: Optional[bool] = False
    images_count: Optional[int] = 0
    answered_questions_count: Optional[int] = 0
    is_prime_eligible: Optional[bool] = False
    rating_stars_distribution: Optional[list] = []
    variation: Optional[list] = []
    buy_it_with: Optional[list] = []
    frequently_bought_together: Optional[list] = []
    featured_merchant: Optional[dict] = {}


# ── Review ────────────────────────────────────────────────────
class ReviewData(BaseModel):
    asin: str
    title: str
    text: str
    rating: int
    date: str
    verified: bool


# ── Report sections ───────────────────────────────────────────
class MarketSummary(BaseModel):
    totalMonthlyRevenue: float
    totalMonthlyUnits: int
    averagePrice: float
    averageRating: float
    marketMaturity: Literal["emerging", "growing", "mature", "saturated"]
    opportunityScore: int
    opportunityRationale: str # Made required per Claude schema


class CriteriaItem(BaseModel):
    criterion: str
    importance: Literal["critical", "high", "medium"]
    frequency: int
    exampleQuote: str


class ComplaintItem(BaseModel):
    complaint: str
    severity: Literal["deal-breaker", "frustration", "minor"]
    frequency: int
    opportunity: str


class CustomerIntelligence(BaseModel):
    topPurchaseCriteria: list[CriteriaItem]
    topComplaints: list[ComplaintItem]
    customerLanguage: list[str]
    buyerPersona: str


class PixiiBrief(BaseModel):
    heroImageFocus: str
    heroImageDescription: str
    infographicBullets: list[str]
    lifestyleSceneDescription: str
    topHeadline: str
    keyBenefitClaims: list[str]
    wordsToAvoid: list[str]
    differentiationAngle: str
    urgencyMessage: str


class IntelligenceReport(BaseModel):
    marketSummary: MarketSummary
    customerIntelligence: CustomerIntelligence
    pixiiBrief: PixiiBrief


# ── Response ──────────────────────────────────────────────────
class ReportMetadata(BaseModel):
    generatedAt: str
    totalReviewsAnalyzed: int
    productsAnalyzed: int


class AnalyzeResponse(BaseModel):
    success: bool
    products: list[EnrichedProduct]
    report: IntelligenceReport
    myAsin: Optional[str] = None
    analysisMode: Literal["market", "review"]
    metadata: ReportMetadata
