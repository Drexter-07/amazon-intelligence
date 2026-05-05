'use client';
import { useRef, useEffect, useState } from 'react';
import { PixiiBrief as PixiiBriefType, EnrichedProduct } from '@/lib/types';

interface Props {
  brief: PixiiBriefType;
  products?: EnrichedProduct[];
  myAsin?: string;
  currencySymbol?: string;
  totalReviews?: number;
}

function calcLQS(p?: Partial<EnrichedProduct>): number {
  if (!p) return 0;
  return [
    !!p.has_videos,
    (p.images_count ?? 0) >= 7,
    !!p.description,
    (p.answered_questions_count ?? 0) >= 50,
    !!p.whats_in_the_box,
  ].filter(Boolean).length * 2;
}

export default function PixiiBrief({ brief, products = [], myAsin, currencySymbol = '₹', totalReviews }: Props) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const userProduct = (myAsin ? products.find((p) => p.asin === myAsin) : undefined) ?? products[0];
  const competitors = myAsin ? products.filter((p) => p.asin !== myAsin) : products.slice(1);
  const topCompetitor = competitors[0];

  const userLQS = calcLQS(userProduct);
  const topLQS = calcLQS(topCompetitor);

  const headline = brief.topHeadline ?? '';
  const differentiationAngle = brief.differentiationAngle ?? '';
  const bullets = brief.infographicBullets ?? [];
  const wordsToAvoid = brief.wordsToAvoid ?? [];
  const keyBenefits = brief.keyBenefitClaims ?? [];
  const compCount = competitors.length + 1;

  return (
    <section ref={sectionRef} className="py-8">

      {/* ── Full-width gradient header with curtain reveal ── */}
      <div
        className="rounded-2xl bg-gradient-to-br from-orange-950/80 via-orange-900/30 to-card border border-orange-500/20 px-8 py-14 mb-12 relative overflow-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div className="relative max-w-3xl">
          <p className="text-orange-400 text-xs uppercase tracking-widest mb-3 font-medium">
            ✦ Act 5 — Your Pixii Brief
          </p>
          <h2
            className="text-4xl font-display text-white mb-3 leading-tight"
            style={{
              clipPath: visible ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
              transition: 'clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1) 200ms',
            }}
          >
            {headline || 'Your Market Entry Strategy'}
          </h2>
          <p className="text-gray-400 text-sm">
            Based on{' '}
            <span className="text-orange-400 font-semibold">
              {totalReviews ? totalReviews.toLocaleString() : '1,000+'}
            </span>{' '}
            customer reviews and{' '}
            <span className="text-orange-400 font-semibold">{compCount}</span>{' '}
            competitors
          </p>
        </div>
      </div>

      {/* ── Differentiation Angle hero ── */}
      {differentiationAngle && (
        <div
          className="bg-gradient-to-r from-orange-500/12 via-orange-500/6 to-transparent border border-orange-500/25 rounded-2xl p-8 mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 400ms, transform 0.7s ease 400ms',
          }}
        >
          <p className="text-orange-400 text-xs uppercase tracking-widest mb-3 font-medium">
            Core Differentiation Angle
          </p>
          <p className="text-white text-xl font-semibold leading-relaxed mb-4">
            {differentiationAngle}
          </p>
          {brief.urgencyMessage && (
            <p className="text-muted-foreground text-sm leading-relaxed border-t border-orange-500/15 pt-4 mt-4">
              {brief.urgencyMessage}
            </p>
          )}
        </div>
      )}

      {/* ── 2×2 magazine grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">

        {/* Hero Headline */}
        <div
          className="bg-card border border-border/50 rounded-2xl p-6 hover:border-orange-500/20 transition-colors"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease 500ms, transform 0.6s ease 500ms',
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Hero Headline</p>
          <p className="text-white text-xl font-bold leading-snug mb-5">
            {headline || 'Your listing headline here'}
          </p>
          {keyBenefits.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
              {keyBenefits.map((claim, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs border border-border bg-secondary text-foreground/70">
                  {claim}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Listing Bullet Strategy */}
        <div
          className="bg-card border border-border/50 rounded-2xl p-6 hover:border-orange-500/20 transition-colors"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease 600ms, transform 0.6s ease 600ms',
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Listing Bullet Strategy</p>
          <div className="space-y-3">
            {bullets.slice(0, 5).map((bullet, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-orange-500 shrink-0 mt-0.5 font-bold">▸</span>
                <span className="text-foreground/80 leading-snug">{bullet}</span>
              </div>
            ))}
            {bullets.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No bullet strategy data available</p>
            )}
          </div>
        </div>

        {/* Words to Avoid */}
        <div
          className="bg-card border border-border/50 rounded-2xl p-6 hover:border-red-500/20 transition-colors"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease 700ms, transform 0.6s ease 700ms',
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Words to Avoid</p>
          {wordsToAvoid.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {wordsToAvoid.map((word, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-red-500/8 text-red-400 text-xs border border-red-500/20 line-through decoration-red-500">
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No overused phrases detected in competitor listings
            </p>
          )}
        </div>

        {/* Visual Direction */}
        <div
          className="bg-card border border-border/50 rounded-2xl p-6 hover:border-orange-500/20 transition-colors"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease 800ms, transform 0.6s ease 800ms',
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Visual Direction</p>
          <div className="space-y-4">
            {brief.heroImageFocus && (
              <div>
                <p className="text-xs text-orange-400 font-semibold mb-1.5">Hero Image Focus</p>
                <p className="text-sm text-foreground/70 leading-relaxed">{brief.heroImageFocus}</p>
              </div>
            )}
            {brief.heroImageDescription && (
              <div>
                <p className="text-xs text-orange-400 font-semibold mb-1.5">Hero Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{brief.heroImageDescription}</p>
              </div>
            )}
            {brief.lifestyleSceneDescription && (
              <div>
                <p className="text-xs text-orange-400 font-semibold mb-1.5">Lifestyle Scene</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{brief.lifestyleSceneDescription}</p>
              </div>
            )}
            {!brief.heroImageFocus && !brief.heroImageDescription && !brief.lifestyleSceneDescription && (
              <p className="text-xs text-muted-foreground italic">No visual direction data available</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Listing Comparison ── */}
      {userProduct && topCompetitor && (
        <div
          className="bg-card border border-border/50 rounded-2xl p-6 mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease 900ms, transform 0.7s ease 900ms',
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            What Your Listing Is Missing vs #1 Competitor
          </p>
          <p className="text-xs text-muted-foreground/60 mb-6">
            You vs <span className="text-foreground/50">{topCompetitor.brand}</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Product Videos', you: !!userProduct.has_videos, them: !!topCompetitor.has_videos },
              { label: 'Images (7+)', you: (userProduct.images_count ?? 0) >= 7, them: (topCompetitor.images_count ?? 0) >= 7 },
              { label: 'Rich Description', you: !!userProduct.description, them: !!topCompetitor.description },
              { label: 'Q&A (50+)', you: (userProduct.answered_questions_count ?? 0) >= 50, them: (topCompetitor.answered_questions_count ?? 0) >= 50 },
              { label: "In the Box", you: !!userProduct.whats_in_the_box, them: !!topCompetitor.whats_in_the_box },
              { label: 'Listing Quality', you: `${userLQS}/10`, them: `${topLQS}/10`, isScore: true },
            ].map((item, i) => {
              const youBool = item.isScore ? undefined : (item.you as boolean);
              const themBool = item.isScore ? undefined : (item.them as boolean);
              const youWins = item.isScore
                ? parseInt(String(item.you)) > parseInt(String(item.them))
                : !!item.you && !item.them;
              const youLoses = item.isScore
                ? parseInt(String(item.you)) < parseInt(String(item.them))
                : !item.you;

              return (
                <div key={i} className={`rounded-xl p-4 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 ${youWins ? 'bg-green-500/10 border-green-500/30' : youLoses ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                  <p className="text-xs text-muted-foreground mb-3 leading-snug">{item.label}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground mb-1">You</p>
                      {item.isScore ? (
                        <span className={`text-sm font-bold font-mono-data ${parseInt(String(item.you)) >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                          {String(item.you)}
                        </span>
                      ) : (
                        <span className={`text-lg font-bold ${youBool ? 'text-green-400' : 'text-red-400'}`}>
                          {youBool ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground/40 text-xs">vs</span>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground mb-1">#1</p>
                      {item.isScore ? (
                        <span className={`text-sm font-bold font-mono-data ${parseInt(String(item.them)) >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                          {String(item.them)}
                        </span>
                      ) : (
                        <span className={`text-lg font-bold ${themBool ? 'text-green-400' : 'text-red-400'}`}>
                          {themBool ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Final CTA ── */}
      <div
        className="text-center py-12 border-t border-border/30"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease 1000ms',
        }}
      >
        <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto leading-relaxed">
          You now have the intelligence. Turn these insights into a listing that converts.
        </p>
        <a
          href="https://pixii.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold px-12 py-4 rounded-full text-base transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95"
        >
          ✦ Design My Pixii Listing
        </a>
        <p className="text-muted-foreground/50 text-xs mt-5">
          Join 1,200+ brands who turned market gaps into marketing hooks
        </p>
      </div>
    </section>
  );
}
