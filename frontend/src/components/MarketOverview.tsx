'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Package,
  Tag,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { EnrichedProduct, MarketSummary } from '@/lib/types';
import { useCountUp } from '@/lib/useCountUp';

interface Props {
  summary: MarketSummary;
  products: EnrichedProduct[];
  currencySymbol: string;
  myAsin?: string;
}

function formatCurrency(value: number, symbol: string = '$'): string {
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

const maturityConfig: Record<string, { classes: string; glow: string }> = {
  emerging: { classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30', glow: 'glow-blue' },
  growing: { classes: 'bg-green-500/20 text-green-400 border-green-500/30', glow: 'glow-green' },
  mature: { classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', glow: 'glow-orange' },
  saturated: { classes: 'bg-red-500/20 text-red-400 border-red-500/30', glow: 'glow-red' },
};

const opportunityColors = (score: number): string => {
  if (score >= 7) return 'text-green-400';
  if (score >= 4) return 'text-yellow-400';
  return 'text-red-400';
};

/* ═══════════════════════════════════════════════════════════ */
/*  STAT CARD WITH COUNT-UP ANIMATION                          */
/* ═══════════════════════════════════════════════════════════ */

function StatCard({ label, rawValue, formattedPrefix, formattedSuffix, icon: Icon, accent }: {
  label: string;
  rawValue: number;
  formattedPrefix: string;
  formattedSuffix: string;
  icon: React.ElementType;
  accent: string;
}) {
  const decimals = rawValue >= 1_000_000 ? 1 : rawValue >= 1_000 ? 1 : rawValue >= 10 ? 0 : 1;
  const displayTarget = rawValue >= 1_000_000
    ? rawValue / 1_000_000
    : rawValue >= 1_000
    ? rawValue / 1_000
    : rawValue;

  const [ref, displayValue] = useCountUp(displayTarget, 1800, decimals);
  const suffix = rawValue >= 1_000_000 ? 'M' : rawValue >= 1_000 ? 'K' : '';

  return (
    <div className="stat-card bg-card border border-border/50 p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${accent}`} />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono-data">
        <span ref={ref} data-stat-value>
          {formattedPrefix}{displayValue}{suffix}{formattedSuffix}
        </span>
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  CUSTOM RICH TOOLTIP — Mini Intelligence Card               */
/* ═══════════════════════════════════════════════════════════ */

interface ChartDataItem {
  name: string;
  title: string;
  brand: string;
  revenue: number;
  share: number;
  price: number;
  rating: number;
  reviewCount: number;
  estimatedMonthlySales: number;
  sales_volume: string;
  discount_percentage: number;
}

function ChartTooltip({ active, payload, currencySymbol }: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
  currencySymbol: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const d = payload[0].payload;
  const discountLabel = d.discount_percentage >= 70
    ? { text: 'Discount Trap', color: 'text-red-400' }
    : d.discount_percentage >= 40
    ? { text: 'Price Inflated', color: 'text-yellow-400' }
    : d.discount_percentage > 0
    ? { text: 'Price Honest', color: 'text-green-400' }
    : null;

  return (
    <div
      className="font-mono-data"
      style={{
        background: '#1A1A2E',
        border: '1px solid rgba(249, 115, 22, 0.3)',
        borderRadius: '10px',
        padding: '14px 16px',
        minWidth: '280px',
        lineHeight: 1.7,
        zIndex: 100,
      }}
    >
      {/* Product name */}
      <p className="text-white font-semibold text-sm mb-1" style={{ fontFamily: 'var(--font-body)' }}>
        {d.title?.slice(0, 50)}{(d.title?.length || 0) > 50 ? '…' : ''}
      </p>
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '6px 0 8px' }} />

      {/* Row 1: Revenue + Share */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-green-400 font-semibold">
          {formatCurrency(d.revenue, currencySymbol)}/mo
        </span>
        <span className="text-muted-foreground">
          · <span className="text-orange-400 font-semibold">{d.share}%</span> market share
        </span>
      </div>

      {/* Row 2: Units + Price */}
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-foreground">
          {formatNumber(d.estimatedMonthlySales)} units
        </span>
        <span className="text-muted-foreground">
          · {currencySymbol}{d.price.toLocaleString()} avg price
        </span>
      </div>

      {/* Row 3: Rating + Reviews */}
      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-yellow-400">
          ★ {d.rating.toFixed(1)}
        </span>
        <span className="text-muted-foreground">
          · {formatNumber(d.reviewCount)} reviews
        </span>
      </div>

      {/* Row 4: Sales Volume (Amazon's own demand signal) */}
      {d.sales_volume && (
        <div className="text-xs mt-1.5">
          <span className="text-blue-400">📈 {d.sales_volume}</span>
          <span className="text-muted-foreground"> this month</span>
        </div>
      )}

      {/* Row 5: Discount Depth */}
      {d.discount_percentage > 0 && (
        <div className="text-xs mt-1">
          <span className={discountLabel?.color || 'text-muted-foreground'}>
            Discount depth: {d.discount_percentage}% off MRP
          </span>
          {discountLabel && (
            <span className={`ml-1.5 text-[10px] ${discountLabel.color}`}>
              ({discountLabel.text})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  TYPEWRITER EFFECT                                          */
/* ═══════════════════════════════════════════════════════════ */

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(prev => {
          if (prev.length >= text.length) {
            clearInterval(interval);
            return prev;
          }
          return text.slice(0, prev.length + 1);
        });
      }, 28);
    }, 600);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return <>{displayedText}</>;
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                             */
/* ═══════════════════════════════════════════════════════════ */

export default function MarketOverview({ summary, products, currencySymbol, myAsin }: Props) {

  // Prepare chart data — use ASIN as the unique Y-axis key to prevent
  // Recharts from conflating two products with the same brand name (e.g., two Noise products).
  // A separate `label` field holds the human-readable display name.
  const chartData = products.slice(0, 10).map((p) => ({
    // Unique key — Recharts uses this to match the correct bar → tooltip
    name: p.asin,
    // Human-readable label shown on the Y-axis tick
    label: p.brand?.slice(0, 12) || p.asin,
    revenue: p.estimatedMonthlyRevenue,
    share: p.revenueShare,
    asin: p.asin,
    title: p.title,
    brand: p.brand,
    price: p.price,
    rating: p.rating,
    reviewCount: p.reviewCount,
    estimatedMonthlySales: p.estimatedMonthlySales,
    sales_volume: p.sales_volume || '',
    discount_percentage: p.discount_percentage || 0,
  }));

  // Identify user's product by ASIN, not position
  const myIndex = myAsin ? chartData.findIndex(d => d.asin === myAsin) : -1;

  // Top competitor = highest revenue product that is NOT the user's
  const topCompetitorIndex = chartData.findIndex((_, i) => i !== myIndex);

  const getBarColor = (index: number): string => {
    if (index === myIndex) return '#3b82f6';            // blue = Your Listing
    if (index === topCompetitorIndex) return '#f97316';  // orange = Top Competitor
    return '#475569';                                    // gray = Others
  };

  const maturity = maturityConfig[summary.marketMaturity] || maturityConfig.growing;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display text-foreground">The Market Pulse</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Estimated market size and revenue distribution
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">
            Opportunity Score
          </p>
          <div className="flex items-center gap-2 justify-end">
            <TrendingUp className={`h-5 w-5 ${opportunityColors(summary.opportunityScore)}`} />
            <span className={`text-3xl font-bold font-mono-data ${opportunityColors(summary.opportunityScore)}`}>
              {summary.opportunityScore}/10
            </span>
          </div>
        </div>
      </div>

      {/* ═══ HERO STAT CARDS WITH COUNT-UP ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Monthly Revenue"
          rawValue={summary.totalMonthlyRevenue}
          formattedPrefix={currencySymbol}
          formattedSuffix=""
          icon={DollarSign}
          accent="text-green-400"
        />
        <StatCard
          label="Monthly Units Sold"
          rawValue={summary.totalMonthlyUnits}
          formattedPrefix=""
          formattedSuffix=""
          icon={Package}
          accent="text-blue-400"
        />
        <StatCard
          label="Average Price"
          rawValue={summary.averagePrice}
          formattedPrefix={currencySymbol}
          formattedSuffix=""
          icon={Tag}
          accent="text-orange-400"
        />
        <StatCard
          label="Average Rating"
          rawValue={summary.averageRating}
          formattedPrefix=""
          formattedSuffix=" ★"
          icon={Star}
          accent="text-yellow-400"
        />
      </div>

      {/* ═══ MARKET MATURITY + TERMINAL ANALYSIS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border/50 transition-all duration-300 hover:shadow-md hover:border-orange-500/20">
          <CardContent className="p-5 flex flex-col items-start gap-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Market Maturity
            </p>
            <Badge
              variant="outline"
              className={`text-sm capitalize px-4 py-1.5 ${maturity.classes} ${maturity.glow}`}
            >
              {summary.marketMaturity}
            </Badge>
          </CardContent>
        </Card>

        {summary.opportunityRationale && (
          <div className="md:col-span-2">
            <div className="terminal-box transition-all duration-300 hover:shadow-lg hover:border-orange-500/30">
              <span className="text-orange-400/80 text-xs uppercase tracking-widest block mb-2">
                ▸ Intelligence Briefing
              </span>
              <TypewriterText text={summary.opportunityRationale} />
            </div>
          </div>
        )}
      </div>

      {/* ═══ REVENUE DISTRIBUTION — HORIZONTAL BAR CHART ═══ */}
      <Card className="bg-card border-border/50 transition-all duration-300 hover:shadow-lg hover:border-orange-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Revenue Distribution — Top {chartData.length} Products
          </CardTitle>
          <div className="flex gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Your Listing
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" /> Top Competitor
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-slate-600 inline-block" /> Others
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: Math.max(chartData.length * 48, 200), width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v, currencySymbol)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    // Find the matching product by ASIN to get its label
                    const item = chartData.find((d) => d.name === payload.value);
                    return (
                      <text
                        x={x}
                        y={y}
                        dy={4}
                        textAnchor="end"
                        fill="#9ca3af"
                        fontSize={12}
                      >
                        {item?.label || payload.value}
                      </text>
                    );
                  }}
                />
                <Tooltip
                  content={<ChartTooltip currencySymbol={currencySymbol} />}
                  cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={28}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={getBarColor(idx)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
