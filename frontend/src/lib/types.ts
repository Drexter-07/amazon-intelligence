// lib/types.ts — Complete data model for Amazon Market Intelligence

export interface AnalysisRequest {
  url?: string;           // Amazon Best Sellers URL
  asins?: string[];       // OR direct ASIN list (max 10)
}

export interface ProductData {
  asin: string;
  title: string;
  price: number;
  rating: number;           // 0-5
  reviewCount: number;
  bsr: number;              // Best Seller Rank
  category: string;
  brand: string;
  imageUrl: string;
  url: string;
}

export interface EnrichedProduct extends ProductData {
  estimatedMonthlySales: number;
  estimatedMonthlyRevenue: number;
  revenueShare: number;     // % of total market revenue
  strengthKeywords: string[];
  weaknessKeywords: string[];
  // --- Rich data fields for premium dashboard ---
  currency?: string;
  bullet_points?: string;
  description?: string;
  whats_in_the_box?: string;
  discount_percentage?: number;
  price_strikethrough?: number;
  sales_volume?: string;
  has_videos?: boolean;
  images_count?: number;
  answered_questions_count?: number;
  is_prime_eligible?: boolean;
  rating_stars_distribution?: Array<{ rating: number; percentage: number }>;
  variation?: Array<Record<string, unknown>>;
  buy_it_with?: Array<Record<string, unknown>>;
  frequently_bought_together?: Array<Record<string, unknown>>;
  featured_merchant?: Record<string, unknown>;
}

export interface ReviewData {
  asin: string;
  title: string;
  text: string;
  rating: number;
  date: string;
  verified: boolean;
}

export interface MarketSummary {
  totalMonthlyRevenue: number;
  totalMonthlyUnits: number;
  averagePrice: number;
  averageRating: number;
  marketMaturity: 'emerging' | 'growing' | 'mature' | 'saturated';
  opportunityScore: number;   // 1-10
  opportunityRationale?: string;
}

export interface CriteriaItem {
  criterion: string;
  importance: 'critical' | 'high' | 'medium';
  frequency: number;
  exampleQuote: string;
}

export interface ComplaintItem {
  complaint: string;
  severity: 'deal-breaker' | 'frustration' | 'minor';
  frequency: number;
  opportunity: string;
}

export interface CustomerIntelligence {
  topPurchaseCriteria: CriteriaItem[];
  topComplaints: ComplaintItem[];
  customerLanguage: string[];
  buyerPersona: string;
}

export interface PixiiBrief {
  heroImageFocus: string;
  heroImageDescription: string;
  infographicBullets: string[];
  lifestyleSceneDescription: string;
  topHeadline: string;
  keyBenefitClaims: string[];
  wordsToAvoid: string[];
  differentiationAngle: string;
  urgencyMessage: string;
}

export interface IntelligenceReport {
  marketSummary: MarketSummary;
  customerIntelligence: CustomerIntelligence;
  pixiiBrief: PixiiBrief;
}

export interface FullAnalysisResponse {
  success: boolean;
  products: EnrichedProduct[];
  report?: IntelligenceReport;
  totalMarketRevenue?: number;
  myAsin?: string;              // user's own product ASIN (review analytics mode)
  analysisMode: 'market' | 'review'; // which mode was used
  currencySymbol?: string;
  metadata: {
    generatedAt: string;
    totalReviewsAnalyzed?: number;
    productsAnalyzed: number;
  };
}
