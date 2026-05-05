'use client';
import { useState, useEffect, useRef } from 'react';
import { ComplaintItem, EnrichedProduct } from '@/lib/types';

interface Props {
  complaints: ComplaintItem[];
  products?: EnrichedProduct[];
  currencySymbol?: string;
  totalMarketRevenue?: number;
}

const severityRank: Record<string, number> = { 'deal-breaker': 3, frustration: 2, minor: 1 };

export default function GapAnalysis({ complaints, products = [], currencySymbol = '₹', totalMarketRevenue = 0 }: Props) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  // Header entrance
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Staggered card entrance
  useEffect(() => {
    const observers = cardRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisibleCards((prev) => new Set([...prev, i])), i * 100);
            obs.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, [complaints]);

  const sorted = [...complaints].sort(
    (a, b) => (severityRank[b.severity] ?? 0) - (severityRank[a.severity] ?? 0)
  );

  const hasDiscountDependency = products.some((c) => (c.discount_percentage ?? 0) > 60);

  const severityConfig = (severity: string) => {
    if (severity === 'deal-breaker') return {
      card: 'border-red-500/30 bg-red-500/[0.03]',
      badge: 'bg-red-500/15 text-red-400 border border-red-500/25',
      bar: 'bg-red-500',
      icon: '🔴',
      label: 'Deal-Breaker',
    };
    if (severity === 'frustration') return {
      card: 'border-amber-500/30 bg-amber-500/[0.03]',
      badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
      bar: 'bg-amber-500',
      icon: '🟡',
      label: 'Frustration',
    };
    return {
      card: 'border-border/50 bg-card',
      badge: 'bg-secondary text-muted-foreground border border-border',
      bar: 'bg-muted-foreground',
      icon: '⚪',
      label: 'Minor',
    };
  };

  const formatRevenue = (n: number) => {
    if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString();
  };

  return (
    <section className="py-8">

      {/* Section header */}
      <div
        ref={headerRef}
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <p className="text-xs text-orange-400 uppercase tracking-widest font-medium mb-2">
          ✦ Act 4
        </p>
        <h2 className="text-3xl font-display text-foreground">The Opportunity Gap</h2>
        <p className="text-muted-foreground text-sm mt-1 mb-8">
          <span className="text-orange-400 font-semibold">{sorted.length} reasons</span> your competitors are losing customers right now
        </p>
      </div>

      {/* Discount dependency warning */}
      {hasDiscountDependency && (
        <div
          className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-5 mb-8 flex items-start gap-4"
          style={{
            opacity: headerVisible ? 1 : 0,
            transition: 'opacity 0.5s ease 200ms',
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl shrink-0">
            ⚠
          </div>
          <div>
            <p className="text-amber-300 font-semibold text-sm">Discount Dependency Warning</p>
            <p className="text-amber-200/60 text-xs mt-1.5 leading-relaxed">
              Multiple competitors are running 60%+ discounts to maintain sales velocity. This market is
              price-war territory — differentiation on quality is your exit ramp.
            </p>
          </div>
        </div>
      )}

      {/* Gap cards — staggered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sorted.map((c, i) => {
          const st = severityConfig(c.severity);
          const revenueAtRisk = totalMarketRevenue > 0
            ? Math.round((c.frequency / 100) * totalMarketRevenue)
            : 0;

          return (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`border rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${st.card}`}
              style={{
                opacity: visibleCards.has(i) ? 1 : 0,
                transform: visibleCards.has(i) ? 'translateY(0)' : 'translateY(24px)',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl font-bold text-white/10 leading-none shrink-0 font-mono-data tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-foreground font-semibold text-sm leading-snug">{c.complaint}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${st.badge}`}>
                  {st.label}
                </span>
              </div>

              {/* Frequency bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Complaint frequency</span>
                  <span className="text-foreground/70 font-mono-data">{c.frequency}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-1000 ${st.bar}`}
                    style={{ width: visibleCards.has(i) ? `${Math.min(c.frequency, 100)}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Revenue at risk */}
              {revenueAtRisk > 0 && (
                <div className="bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 mb-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Revenue at risk</p>
                  <p className="text-red-400 font-bold text-lg font-mono-data">
                    {currencySymbol}{formatRevenue(revenueAtRisk)}<span className="text-xs font-normal text-red-400/60">/mo</span>
                  </p>
                </div>
              )}

              {/* Your Move */}
              {c.opportunity && (
                <div className="bg-green-500/8 border border-green-500/15 rounded-xl px-4 py-3">
                  <p className="text-xs text-green-400 font-semibold mb-1">✦ Your Move</p>
                  <p className="text-xs text-green-300/70 leading-relaxed">{c.opportunity}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
