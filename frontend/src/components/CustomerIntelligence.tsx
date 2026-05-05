'use client';
import { useRef, useEffect, useState } from 'react';
import { CriteriaItem, CustomerIntelligence as CIType } from '@/lib/types';

interface Props {
  intelligence: CIType;
  currencySymbol?: string;
  totalReviews?: number;
}

export default function CustomerIntelligence({ intelligence, totalReviews }: Props) {
  const { topPurchaseCriteria = [], customerLanguage = [], buyerPersona } = intelligence;

  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setAnimated(true); obs.disconnect(); }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Max frequency for bar scaling
  const maxFreq = Math.max(...topPurchaseCriteria.map((c) => c.frequency), 1);

  // Buyer persona
  const personaStr = typeof buyerPersona === 'string' ? buyerPersona : '';
  const personaWords = personaStr.trim().split(/\s+/).filter(Boolean);
  const personaInitials = personaWords.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || 'B';
  const personaName = personaWords.slice(0, 5).join(' ') || 'Value-Seeking Buyer';

  const sentimentColor = (item: CriteriaItem) => {
    if (item.importance === 'critical') return {
      bar: 'bg-red-500',
      badge: 'bg-red-500/15 text-red-400 border border-red-500/20',
      glow: 'shadow-red-500/20',
      label: 'Critical',
      dot: 'bg-red-500',
    };
    if (item.importance === 'high') return {
      bar: 'bg-orange-500',
      badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
      glow: 'shadow-orange-500/20',
      label: 'High Impact',
      dot: 'bg-orange-500',
    };
    return {
      bar: 'bg-yellow-500',
      badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
      glow: 'shadow-yellow-500/20',
      label: 'Mixed',
      dot: 'bg-yellow-500',
    };
  };

  return (
    <section ref={sectionRef} className="py-8">

      {/* Section header */}
      <div className="mb-10">
        <p className="text-xs text-orange-400 uppercase tracking-widest font-medium mb-2">
          ✦ Act 3
        </p>
        <h2 className="text-3xl font-display text-foreground">The Customer Voice</h2>
        <p className="text-muted-foreground text-sm mt-1">
          What {totalReviews ? totalReviews.toLocaleString() : '1,000+'} customers actually care about
        </p>
      </div>

      {/* Opening pull-quote */}
      {topPurchaseCriteria[0]?.exampleQuote && (
        <div
          className="relative mb-10 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/50 to-transparent p-8"
          style={{
            opacity: animated ? 1 : 0,
            transform: animated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span
            className="absolute top-4 left-6 text-8xl text-orange-500/10 font-serif leading-none select-none"
            aria-hidden
          >❝</span>
          <p className="relative text-xl text-white italic leading-relaxed font-light">
            {topPurchaseCriteria[0].exampleQuote}
          </p>
          <p className="text-xs text-orange-400/60 mt-4">
            — Top customer concern: <span className="text-orange-400">{topPurchaseCriteria[0].criterion}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Criteria bars (2 cols) ── */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5 font-medium">
            Top Purchase Criteria
          </p>

          {topPurchaseCriteria.map((item, i) => {
            const sc = sentimentColor(item);
            const pct = Math.round((item.frequency / maxFreq) * 100);
            const delay = i * 80;
            return (
              <div
                key={i}
                className="group bg-card border border-border/50 rounded-xl p-5 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default"
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                    <span className="text-white font-medium text-sm leading-snug">{item.criterion}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.badge}`}>
                      {sc.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono-data">
                      {item.frequency}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-secondary rounded-full h-1 mb-3">
                  <div
                    className={`h-1 rounded-full transition-all duration-1000 ${sc.bar}`}
                    style={{ width: animated ? `${pct}%` : '0%' }}
                  />
                </div>

                {/* Quote */}
                {item.exampleQuote && (
                  <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-white/10 pl-3">
                    &ldquo;{item.exampleQuote}&rdquo;
                  </p>
                )}
              </div>
            );
          })}

          {/* Customer Language Cloud */}
          {customerLanguage.length > 0 && (
            <div
              className="mt-8 pt-6 border-t border-border/50"
              style={{
                opacity: animated ? 1 : 0,
                transition: 'opacity 0.7s ease 600ms',
              }}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-medium">
                Customer Language
              </p>
              <div className="flex flex-wrap gap-2">
                {customerLanguage.map((phrase, i) => {
                  const sizeClass =
                    i < 3 ? 'text-sm px-3 py-1.5 font-medium'
                    : i < 7 ? 'text-xs px-2.5 py-1'
                    : 'text-[11px] px-2 py-0.5 opacity-50';
                  return (
                    <span
                      key={i}
                      className={`${sizeClass} rounded-full bg-secondary text-foreground/70 border border-border hover:border-orange-500/40 hover:text-orange-400 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-default`}
                    >
                      &ldquo;{phrase}&rdquo;
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Buyer Persona card ── */}
        <div
          className="lg:col-span-1"
          style={{
            opacity: animated ? 1 : 0,
            transform: animated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 300ms, transform 0.6s ease 300ms',
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-medium">
            Buyer Persona
          </p>

          <div className="bg-gradient-to-br from-card to-secondary/50 border border-border/50 rounded-2xl p-6 lg:sticky lg:top-32 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg shadow-orange-500/30">
                {personaInitials}
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-snug">{personaName}</p>
                <p className="text-muted-foreground text-xs mt-0.5">Primary Buyer Persona</p>
                <div className="flex gap-1 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                    ✦ Verified Buyer
                  </span>
                </div>
              </div>
            </div>

            <p className="text-foreground/70 text-sm leading-relaxed">
              {personaStr || 'Customers in this market are price-sensitive yet quality-conscious, balancing value with performance expectations.'}
            </p>

            {/* Traits derived from language */}
            {customerLanguage.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3">Key Priorities</p>
                <div className="flex flex-wrap gap-1.5">
                  {customerLanguage.slice(0, 4).map((lang, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground/60 border border-border">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
