'use client';
import { useState, useEffect, useRef } from 'react';
import { Printer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarketOverview from './MarketOverview';
import CompetitorTable from './CompetitorTable';
import PositioningMatrix from './PriceValueScatter';
import CustomerIntelligence from './CustomerIntelligence';
import GapAnalysis from './GapAnalysis';
import PixiiBrief from './PixiiBrief';
import { ErrorBoundary } from './ErrorBoundary';
import { FullAnalysisResponse } from '@/lib/types';
import { useScrollReveal } from '@/lib/useScrollReveal';

// ── Acts definition ──────────────────────────────────────────────────────────
const ACTS = [
  { id: 'act-1', label: 'Market Pulse' },
  { id: 'act-2', label: 'Competition Map' },
  { id: 'act-3', label: 'Customer Voice' },
  { id: 'act-4', label: 'Opportunity Gap' },
  { id: 'act-5', label: 'Pixii Brief' },
];

const HEADER_HEIGHT = 88; // px — logo row (56) + nav tabs (32)

interface Props {
  data: FullAnalysisResponse;
  onReset: () => void;
}

export default function ReportDashboard({ data, onReset }: Props) {
  const { products, report, metadata, myAsin, currencySymbol = '₹' } = data;

  const [activeAct, setActiveAct] = useState(1);
  const [showBackTop, setShowBackTop] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const act1Ref = useScrollReveal();
  const act2Ref = useScrollReveal();
  const act3Ref = useScrollReveal();
  const act4Ref = useScrollReveal();
  const act5Ref = useScrollReveal();

  // Track scroll → active act + back-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowBackTop(scrollY > 400);

      // Detect which act is in view
      for (let i = ACTS.length - 1; i >= 0; i--) {
        const el = document.getElementById(ACTS[i].id);
        if (el && el.offsetTop - HEADER_HEIGHT - 16 <= scrollY) {
          setActiveAct(i + 1);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to act with header offset
  const scrollToAct = (actId: string) => {
    const el = document.getElementById(actId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Export with toast feedback
  const handleExport = () => {
    // Give browser time to apply print styles
    setTimeout(() => window.print(), 100);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const totalReviews = metadata.totalReviewsAnalyzed ?? 0;
  const totalProducts = metadata.productsAnalyzed ?? 0;

  return (
    <div className="min-h-screen pb-24">

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  STICKY HEADER — 88px total, no overflow                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-[#080808] border-b border-white/[0.08] shadow-lg shadow-black/50">

        {/* Row 1 — Logo + buttons (h-14 = 56px) */}
        <header className="flex items-center justify-between px-6 h-14 max-w-[1600px] mx-auto">
          <span className="text-lg font-bold text-orange-400 tracking-tight">✦ Pixii Intelligence</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="gap-1.5 text-gray-400 hover:text-orange-400 hover:underline hover:bg-orange-500/10 active:scale-95 no-print text-xs transition-all duration-200"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-1.5 text-xs no-print border-white/10 hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/10 text-gray-300 active:scale-95 transition-all duration-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Report
            </Button>
          </div>
        </header>

        {/* Row 2 — Act nav tabs (h-8 = 32px) */}
        <nav className="flex items-center border-t border-white/[0.05] px-6 max-w-[1600px] mx-auto overflow-x-auto scrollbar-none flex-nowrap min-w-0">
          {ACTS.map((act, i) => (
            <button
              key={act.id}
              onClick={() => scrollToAct(act.id)}
              className={`flex-shrink-0 cursor-pointer px-4 py-3 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeAct === i + 1
                  ? 'text-orange-400 border-orange-500'
                  : 'text-gray-500 border-transparent hover:text-orange-300 hover:border-orange-500/50 hover:bg-white/5'
              }`}
            >
              <span className="hidden sm:inline">Act {i + 1}: </span>{act.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Credibility bar (not sticky — sits below header) ── */}
      <div className="flex items-center justify-center gap-5 px-6 py-2 bg-white/[0.02] border-b border-white/[0.05] text-xs text-gray-600 flex-wrap">
        <span>✦ Analysed <span className="text-orange-400 font-semibold">{totalReviews.toLocaleString()}</span> reviews</span>
        <span className="text-gray-800">·</span>
        <span><span className="text-orange-400 font-semibold">{totalProducts}</span> competitors mapped</span>
        <span className="text-gray-800">·</span>
        <span><span className="text-orange-400 font-semibold">{totalProducts * 50}+</span> data points</span>
        <span className="text-gray-800 hidden sm:inline">·</span>
        <span className="hidden sm:inline">
          Generated at <span className="text-gray-400">
            {new Date(metadata.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  REPORT CONTENT                                               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-0">

        {/* ─── ACT 1: MARKET PULSE ─── */}
        <section id="act-1">
          <div ref={act1Ref} className="reveal">
            <ErrorBoundary fallbackMessage="Failed to load Market Pulse data.">
              <MarketOverview
                summary={report?.marketSummary || {
                  totalMonthlyRevenue: data.totalMarketRevenue || 0,
                  totalMonthlyUnits: products.reduce((s, p) => s + p.estimatedMonthlySales, 0),
                  averagePrice: products.length ? products.reduce((s, p) => s + p.price, 0) / products.length : 0,
                  averageRating: products.length ? products.reduce((s, p) => s + p.rating, 0) / products.length : 0,
                  marketMaturity: 'growing',
                  opportunityScore: 7,
                }}
                products={products}
                currencySymbol={currencySymbol}
                myAsin={myAsin}
              />
            </ErrorBoundary>
          </div>
        </section>

        <div className="act-divider" />

        {/* ─── ACT 2: COMPETITION MAP ─── */}
        <section id="act-2">
          <div ref={act2Ref} className="reveal space-y-6">
            <ErrorBoundary fallbackMessage="Failed to load Competition Map data.">
              <CompetitorTable products={products} myAsin={myAsin} currencySymbol={currencySymbol} />
              <PositioningMatrix products={products} myAsin={myAsin} currencySymbol={currencySymbol} />
            </ErrorBoundary>
          </div>
        </section>

        {report && (
          <>
            <div className="act-divider" />

            {/* ─── ACT 3: CUSTOMER VOICE ─── */}
            <section id="act-3">
              <div ref={act3Ref} className="reveal">
                <ErrorBoundary fallbackMessage="Failed to load Customer Voice data.">
                  <CustomerIntelligence
                    intelligence={report.customerIntelligence}
                    totalReviews={metadata.totalReviewsAnalyzed}
                  />
                </ErrorBoundary>
              </div>
            </section>

            <div className="act-divider" />

            {/* ─── ACT 4: OPPORTUNITY GAP ─── */}
            <section id="act-4">
              <div ref={act4Ref} className="reveal">
                <ErrorBoundary fallbackMessage="Failed to load Opportunity Gap data.">
                  <GapAnalysis
                    complaints={report.customerIntelligence.topComplaints}
                    products={products}
                    currencySymbol={currencySymbol}
                    totalMarketRevenue={data.totalMarketRevenue ?? report.marketSummary?.totalMonthlyRevenue ?? 0}
                  />
                </ErrorBoundary>
              </div>
            </section>

            <div className="act-divider" />

            {/* ─── ACT 5: PIXII BRIEF ─── */}
            <section id="act-5">
              <div ref={act5Ref} className="reveal">
                <ErrorBoundary fallbackMessage="Failed to load Pixii Brief data.">
                  <PixiiBrief
                    brief={report.pixiiBrief}
                    products={products}
                    myAsin={myAsin}
                    currencySymbol={currencySymbol}
                    totalReviews={metadata.totalReviewsAnalyzed}
                  />
                </ErrorBoundary>
              </div>
            </section>
          </>
        )}
      </div>

      {/* ── Back-to-top FAB ── */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full bg-orange-500 cursor-pointer hover:bg-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-110 hover:-translate-y-1 hover:shadow-orange-400/50 active:scale-90 no-print"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      {/* ── Export toast ── */}
      {showToast && (
        <div data-toast className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-white/15 rounded-full px-5 py-2.5 text-sm text-white shadow-xl flex items-center gap-2.5 no-print">
          <span className="text-green-400">✓</span>
          Report ready to print / save as PDF
        </div>
      )}
    </div>
  );
}
