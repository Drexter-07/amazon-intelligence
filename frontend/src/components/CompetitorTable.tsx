'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink,
  Star,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { EnrichedProduct } from '@/lib/types';

interface Props {
  products: EnrichedProduct[];
  myAsin?: string;
  currencySymbol: string;
}

function formatCurrency(value: number, symbol = '$'): string {
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

const tdStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '5px 6px',
  verticalAlign: 'top',
  fontSize: '8pt',
};

export default function CompetitorTable({ products, myAsin, currencySymbol }: Props) {
  const [modalProduct, setModalProduct] = useState<EnrichedProduct | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'quality' | 'copy'>('overview');

  const openModal = (product: EnrichedProduct) => {
    setModalProduct(product);
    setModalTab('overview');
  };

  // ESC key close + body scroll lock (overflow only — never position:fixed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalProduct(null);
    };
    if (modalProduct) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalProduct]);

  return (
    <>  {/* Fragment so modal is NOT a child of section */}
    <section>
      <div className="mb-6">
        <h2 className="text-3xl font-display text-foreground">The Competition Map</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {myAsin
            ? `Your listing vs. ${products.length - 1} competitors — click any row to inspect`
            : `Top ${products.length} products — click any row to inspect`}
        </p>
      </div>

      {/* ═══ PRINT TABLE (HIDDEN ON SCREEN) ═══ */}
      <div data-print-table className="hidden">
        <h2 style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '4pt', fontFamily: 'Georgia, serif' }}>
          Competition Analysis — Full Data
        </h2>
        <p style={{ fontSize: '9pt', color: '#666', marginBottom: '12pt' }}>
          Complete competitive intelligence data
        </p>

        {/* Summary table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', marginBottom: '24pt' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['#','Brand','Product Name','Price','MRP','Discount','Rating','Reviews','Est.Revenue/mo','Market Share','BSR','Prime','Sales Volume','Images','Has Video','LQS'].map(h => (
                <th key={h} style={{ border: '1px solid #ddd', padding: '5px 6px', fontWeight: 600, textAlign: 'left', fontSize: '8pt', background: '#f0f0f0' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const lqs = [
                p.has_videos,
                (p.images_count ?? 0) >= 7,
                !!p.description && !String(p.description).startsWith('http'),
                (p.answered_questions_count ?? 0) >= 50,
                !!p.whats_in_the_box,
              ].filter(Boolean).length * 2;
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{p.brand}</td>
                  <td style={{ ...tdStyle, maxWidth: '180px', fontSize: '7.5pt' }}>
                    {p.title}
                  </td>
                  <td style={tdStyle}>
                    ₹{p.price?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    {p.price_strikethrough ? `₹${p.price_strikethrough?.toLocaleString()}` : '—'}
                  </td>
                  <td style={tdStyle}>
                    {p.discount_percentage ? `${p.discount_percentage}%` : '—'}
                  </td>
                  <td style={tdStyle}>{p.rating}★</td>
                  <td style={tdStyle}>
                    {p.reviewCount?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    ₹{p.estimatedMonthlyRevenue?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>{p.revenueShare}%</td>
                  <td style={tdStyle}>
                    #{p.bsr?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    {p.is_prime_eligible ? 'Yes' : 'No'}
                  </td>
                  <td style={tdStyle}>
                    {p.sales_volume || '—'}
                  </td>
                  <td style={tdStyle}>
                    {p.images_count ?? '—'}
                  </td>
                  <td style={tdStyle}>
                    {p.has_videos ? 'Yes' : 'No'}
                  </td>
                  <td style={tdStyle}>{lqs}/10</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Per-product detail cards */}
        {products.map((p, i) => (
          <div key={i} style={{ pageBreakBefore: 'always', padding: '0 0 24pt 0' }}>
            <h3 style={{ fontSize: '13pt', fontWeight: 'bold', marginBottom: '2pt', color: '#111' }}>
              #{i + 1} — {p.brand}: {p.title?.slice(0, 80)}
            </h3>
            <p style={{ fontSize: '8pt', color: '#888', marginBottom: '12pt' }}>
              ASIN: {p.asin} | BSR: #{p.bsr} | Amazon: amazon.in/dp/{p.asin}
            </p>

            {/* Rating breakdown */}
            {(p.rating_stars_distribution?.length ?? 0) > 0 && (
              <div style={{ marginBottom: '12pt' }}>
                <p style={{ fontSize: '9pt', fontWeight: 600, marginBottom: '4pt' }}>Rating Breakdown</p>
                <table style={{ borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                  <thead>
                    <tr>
                      {['Stars','Percentage'].map(h => (
                        <th key={h} style={{ border: '1px solid #ddd', padding: '3px 8px', background: '#f5f5f5' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[5,4,3,2,1].map(star => {
                      const e = p.rating_stars_distribution?.find((s: any) => s.rating === star);
                      return (
                        <tr key={star}>
                          <td style={{ border: '1px solid #ddd', padding: '3px 8px' }}>{star}★</td>
                          <td style={{ border: '1px solid #ddd', padding: '3px 8px' }}>
                            {e?.percentage ?? 0}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bullet points */}
            {p.bullet_points && (
              <div style={{ marginBottom: '12pt' }}>
                <p style={{ fontSize: '9pt', fontWeight: 600, marginBottom: '4pt' }}>Listing Bullet Points</p>
                {p.bullet_points.split('\n')
                  .filter((b: string) => b.trim())
                  .map((bullet: string, bi: number) => (
                  <p key={bi} style={{ fontSize: '8.5pt', margin: '2pt 0', paddingLeft: '12pt', color: '#333' }}>
                    • {bullet.replace(/^[•\-\*]\s*/, '').trim()}
                  </p>
                ))}
              </div>
            )}

            {/* Variants */}
            {(p.variation?.length ?? 0) > 0 && (
              <div style={{ marginBottom: '12pt' }}>
                <p style={{ fontSize: '9pt', fontWeight: 600, marginBottom: '4pt' }}>
                  Variants ({p.variation!.length})
                </p>
                <p style={{ fontSize: '8.5pt', color: '#555' }}>
                  {p.variation!.map((v: any) => {
                    return v.dimensions 
                      ? Object.values(v.dimensions).join(' · ')
                      : v.name ?? String(v);
                  }).join(', ')}
                </p>
              </div>
            )}

            {/* What's in box */}
            {p.whats_in_the_box && (
              <div style={{ marginBottom: '12pt' }}>
                <p style={{ fontSize: '9pt', fontWeight: 600, marginBottom: '4pt' }}>In the Box</p>
                <p style={{ fontSize: '8.5pt', color: '#555' }}>
                  {p.whats_in_the_box}
                </p>
              </div>
            )}

            {/* Frequently bought with */}
            {(p.buy_it_with?.length ?? 0) > 0 && (
              <div style={{ marginBottom: '12pt' }}>
                <p style={{ fontSize: '9pt', fontWeight: 600, marginBottom: '4pt' }}>Frequently Bought With</p>
                {p.buy_it_with!.map((item: any, ii: number) => (
                  <p key={ii} style={{ fontSize: '8.5pt', margin: '2pt 0', color: '#555' }}>
                    • {item.title} — ₹{item.price}
                  </p>
                ))}
              </div>
            )}

            {/* Description */}
            {p.description && 
              typeof p.description === 'string' &&
              !p.description.startsWith('http') && (
              <div style={{ marginBottom: '12pt' }}>
                <p style={{ fontSize: '9pt', fontWeight: 600, marginBottom: '4pt' }}>Description</p>
                <p style={{ fontSize: '8.5pt', color: '#555', lineHeight: 1.5 }}>
                  {p.description.slice(0, 800)}
                  {p.description.length > 800 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="w-full overflow-x-hidden">
          <Table className="w-full table-fixed bg-card">
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-10 text-muted-foreground">#</TableHead>
                <TableHead className="w-[38%] text-muted-foreground">Product</TableHead>
                <TableHead className="w-[16%] text-right text-muted-foreground">Price</TableHead>
                <TableHead className="w-[20%] text-right text-muted-foreground">Rating</TableHead>
                <TableHead className="w-[16%] text-right text-muted-foreground">Est. Revenue/mo</TableHead>
                <TableHead className="w-[10%] text-right text-muted-foreground pr-6">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => {
                const isMyProduct = !!(myAsin && product.asin === myAsin);
                const rankBorder = isMyProduct
                  ? 'border-l-orange-500'
                  : index === 0 ? 'border-l-yellow-400'
                  : index === 1 ? 'border-l-gray-400'
                  : index === 2 ? 'border-l-amber-700'
                  : 'border-l-white/10';

                return (
                  <TableRow
                    key={product.asin}
                    className={`group border-border/30 transition-all duration-150 cursor-pointer border-l-2 ${rankBorder} ${
                      isMyProduct ? 'bg-orange-500/8 hover:bg-orange-500/12' : 'hover:bg-secondary/50'
                    } active:bg-secondary/30`}
                    onClick={() => openModal(product)}
                  >
                    {/* Rank */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-mono text-xs ${
                          isMyProduct ? 'border-orange-500/60 text-orange-400 bg-orange-500/20'
                          : index < 3 ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
                          : 'border-border text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </Badge>
                    </TableCell>

                    {/* Product */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-start gap-1.5 min-w-0 truncate">
                          {isMyProduct && (
                            <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 shrink-0 mt-0.5">
                              <Star className="h-2.5 w-2.5 mr-0.5" />YOU
                            </Badge>
                          )}
                          {product.is_prime_eligible && (
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                          )}
                          <div className="truncate max-w-0 flex-1 min-w-0">
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm font-medium hover:text-orange-400 transition-colors ${
                                isMyProduct ? 'text-orange-300' : 'text-foreground'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {product.title}
                            </a>
                          </div>
                          <a
                            href={`https://www.amazon.in/dp/${product.asin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-600 hover:text-orange-400 hover:scale-110 active:scale-95 transition-all duration-150"
                            title="View on Amazon"
                          >
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M3.5 3a.5.5 0 000 1H7.3L2.15 9.15a.5.5 0 00.7.7L8 4.7V8.5a.5.5 0 001 0V3.5a.5.5 0 00-.5-.5H3.5z"/>
                            </svg>
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Short product name — strip brand prefix, show next 4 words */}
                          {(() => {
                            const name = product.title ?? '';
                            const brand = product.brand ?? '';
                            const withoutBrand = name.toLowerCase().startsWith(brand.toLowerCase())
                              ? name.slice(brand.length).trim()
                              : name;
                            const shortName = withoutBrand.split(' ').slice(0, 4).join(' ');
                            return (
                              <span className="text-xs text-muted-foreground truncate">
                                {shortName || brand}
                              </span>
                            );
                          })()}
                          <span className="text-[10px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            → Click to inspect
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Price + discount */}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-foreground font-semibold text-sm">
                          {currencySymbol}{product.price.toLocaleString()}
                        </span>
                        {(product.discount_percentage ?? 0) > 0 && (
                          <span className={`text-[10px] font-medium ${
                            (product.discount_percentage ?? 0) >= 70 ? 'text-red-400'
                            : (product.discount_percentage ?? 0) >= 40 ? 'text-amber-400'
                            : 'text-green-400'
                          }`}>
                            {product.discount_percentage}% OFF
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Rating + reviews + mini star bar */}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`font-semibold text-sm ${
                          product.rating >= 4.5 ? 'text-green-400'
                          : product.rating >= 4.0 ? 'text-yellow-400'
                          : 'text-red-400'
                        }`}>
                          {product.rating.toFixed(1)} <span className="text-yellow-400">★</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono-data">
                          {formatNumber(product.reviewCount)} reviews
                        </span>
                        {(product.rating_stars_distribution?.length ?? 0) > 0 && (
                          <div className="flex h-1 rounded-full overflow-hidden w-16 mt-0.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const entry = product.rating_stars_distribution?.find((s) => s.rating === star);
                              const pct = entry?.percentage ?? 0;
                              const color = star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-500' : 'bg-red-500';
                              return <div key={star} className={color} style={{ width: `${pct}%` }} />;
                            })}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Revenue */}
                    <TableCell className={`text-right font-semibold font-mono-data ${
                      isMyProduct ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {formatCurrency(product.estimatedMonthlyRevenue, currencySymbol)}
                    </TableCell>

                    {/* Share mini-bar */}
                    <TableCell className="text-right pr-6">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground font-mono-data">
                          {product.revenueShare}%
                        </span>
                        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isMyProduct ? 'bg-gradient-to-r from-orange-500 to-orange-300'
                              : 'bg-gradient-to-r from-orange-600 to-orange-400'
                            }`}
                            style={{ width: `${Math.min(product.revenueShare, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

    </section>

    {/* ═══ INSPECT MODAL — outside <section> so position:fixed is not constrained ═══ */}
    {modalProduct && (
      <div
        onClick={() => setModalProduct(null)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Modal card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '760px',
            height: '580px',
            backgroundColor: '#111213',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
          >
            {/* HEADER — fixed, never scrolls */}
            <div className="flex-shrink-0 px-6 pt-5 pb-0 border-b border-white/8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <p className="text-xs text-orange-400 uppercase tracking-widest mb-1 font-medium">
                    {modalProduct.brand}
                  </p>
                  <h3 className="text-white font-semibold text-base leading-snug line-clamp-2">
                    {modalProduct.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-600 font-mono">
                      {modalProduct.asin}
                    </span>
                    {modalProduct.bsr && (
                      <span className="text-xs text-gray-600">
                        BSR <span className="text-orange-400">
                          #{modalProduct.bsr?.toLocaleString()}
                        </span>
                      </span>
                    )}
                    {modalProduct.is_prime_eligible && (
                      <span className="text-xs text-blue-400 border border-blue-500/30 rounded px-1.5 py-0.5">
                        Prime
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setModalProduct(null)}
                  className="w-7 h-7 rounded-full bg-white/8 cursor-pointer hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-all duration-200 flex-shrink-0 hover:rotate-90 active:scale-90"
                >✕</button>
              </div>

              {/* Tab bar */}
              <div className="flex gap-0">
                {(['overview', 'quality', 'copy'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`px-4 py-2.5 text-xs font-medium cursor-pointer uppercase tracking-widest border-b-2 transition-all duration-200 -mb-px ${
                      modalTab === tab
                        ? 'text-orange-400 border-orange-500'
                        : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-white/20'
                    }`}
                  >
                    {tab === 'overview' ? 'Overview' 
                     : tab === 'quality' ? 'Listing Quality' 
                     : 'Copy & Variants'}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT — fixed height, no scroll */}
            <div className="flex-1 overflow-hidden">

              {/* TAB 1: Overview */}
              {modalTab === 'overview' && (
                <div className="h-full grid grid-cols-2 divide-x divide-white/8">
                  {/* Left: Product image */}
                  <div className="p-5 flex flex-col">
                    {modalProduct.imageUrl ? (
                      <img
                        src={modalProduct.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full max-h-48 object-contain bg-white rounded-xl mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-white/5 rounded-xl mb-4 flex items-center justify-center text-gray-700 text-sm">
                        No image
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ['Price', `${currencySymbol}${modalProduct.price?.toLocaleString()}`],
                        ['MRP', modalProduct.price_strikethrough 
                          ? `${currencySymbol}${modalProduct.price_strikethrough?.toLocaleString()}` : '—'],
                        ['Discount', modalProduct.discount_percentage 
                          ? `${modalProduct.discount_percentage}% OFF` : '—'],
                        ['Sales/mo', modalProduct.estimatedMonthlySales 
                          ? modalProduct.estimatedMonthlySales?.toLocaleString() : '—'],
                        ['Revenue/mo', modalProduct.estimatedMonthlyRevenue
                          ? `${currencySymbol}${(modalProduct.estimatedMonthlyRevenue/1000).toFixed(0)}K` : '—'],
                        ['Volume', modalProduct.sales_volume || '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="bg-white/4 rounded-lg p-2">
                          <p className="text-gray-600 mb-0.5">{label}</p>
                          <p className="text-white font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Rating breakdown */}
                  <div className="p-5 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-white">
                          {modalProduct.rating?.toFixed(1)}
                        </p>
                        <p className="text-yellow-400 text-lg">★★★★★</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {modalProduct.reviewCount >= 1000
                            ? `${(modalProduct.reviewCount/1000).toFixed(1)}K` 
                            : modalProduct.reviewCount} reviews
                        </p>
                      </div>
                      <div className="flex-1">
                        {[5,4,3,2,1].map(star => {
                          const entry = modalProduct.rating_stars_distribution?.find((s: any) => s.rating === star);
                          const pct = entry?.percentage ?? 0;
                          return (
                            <div key={star} className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs text-gray-500 w-5 text-right">{star}★</span>
                              <div className="flex-1 bg-white/8 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    star >= 4 ? 'bg-green-500' 
                                    : star === 3 ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-8">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Frequently bought with */}
                    {modalProduct.buy_it_with && modalProduct.buy_it_with.length > 0 && (
                      <div className="mt-auto">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Frequently Bought With</p>
                        <div className="space-y-1.5">
                          {modalProduct.buy_it_with.slice(0,2).map((item: any, i: number) => (
                            <a 
                              key={i} 
                              href={`https://www.amazon.in/s?k=${encodeURIComponent(item.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-between items-center bg-white/4 rounded-lg px-3 py-2 text-xs hover:bg-white/10 hover:shadow-lg transition-all cursor-pointer group"
                            >
                              <span className="text-gray-400 truncate flex-1 mr-2 group-hover:text-orange-400 group-hover:underline transition-colors">{item.title}</span>
                              <span className="text-orange-400 font-semibold flex-shrink-0 group-hover:scale-105 transition-transform">
                                {currencySymbol}{item.price}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Listing Quality */}
              {modalTab === 'quality' && (() => {
                const criteria = [
                  { label: 'Has Product Video', 
                    pass: modalProduct.has_videos,
                    impact: 'Videos increase conversion by ~30%' },
                  { label: '7+ Product Images', 
                    pass: (modalProduct.images_count ?? 0) >= 7,
                    impact: `${modalProduct.images_count ?? 0} images found` },
                  { label: 'Rich Text Description', 
                    pass: !!modalProduct.description && !modalProduct.description?.startsWith?.('http'),
                    impact: 'A+ content drives trust' },
                  { label: '50+ Customer Q&A', 
                    pass: (modalProduct.answered_questions_count ?? 0) >= 50,
                    impact: `${modalProduct.answered_questions_count ?? 0} Q&As` },
                  { label: "What's in the Box Listed", 
                    pass: !!modalProduct.whats_in_the_box,
                    impact: 'Reduces return rates' },
                ];
                const score = criteria.filter(c => c.pass).length * 2;
                return (
                  <div className="h-full p-6 grid grid-cols-2 divide-x divide-white/8 gap-0">
                    <div className="pr-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-xl ${
                          score >= 8 ? 'border-green-500 text-green-400' 
                            : score >= 6 ? 'border-yellow-500 text-yellow-400' 
                            : 'border-red-500 text-red-400'
                        }`}>
                          {score}/10
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {score >= 8 ? 'Strong Listing' : score >= 6 ? 'Average Listing' : 'Weak Listing'}
                          </p>
                          <p className="text-xs text-gray-500">Listing quality score</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {criteria.map((c, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className={`text-lg mt-0.5 flex-shrink-0 ${c.pass ? 'text-green-400' : 'text-red-400'}`}>
                              {c.pass ? '✓' : '✗'}
                            </span>
                            <div>
                              <p className={`text-sm font-medium ${c.pass ? 'text-gray-200' : 'text-gray-500'}`}>{c.label}</p>
                              <p className="text-xs text-gray-600">{c.impact}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pl-6">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-3">
                        Variants ({modalProduct.variation?.length ?? 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(modalProduct.variation ?? []).map((v: any, i: number) => {
                          const label = v.dimensions
                            ? Object.values(v.dimensions).join(' · ')
                            : v.name ?? String(v);
                          return (
                            <span key={i} className={`px-2.5 py-1 rounded-full text-xs border ${
                              v.selected
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                : 'bg-white/6 text-gray-400 border-white/10'
                            }`}>{label}</span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: Copy & Variants */}
              {modalTab === 'copy' && (
                <div className="h-full p-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                  
                  {/* Bullet points */}
                  {modalProduct.bullet_points && (
                    <div className="mb-5">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-3">Listing Bullets</p>
                      <div className="space-y-2">
                        {modalProduct.bullet_points
                          .split('\n')
                          .filter((b: string) => b.trim())
                          .slice(0, 6)
                          .map((bullet: string, i: number) => (
                          <div key={i} className="flex gap-2.5 text-sm text-gray-300 leading-relaxed">
                            <span className="text-orange-500 mt-0.5 flex-shrink-0">▸</span>
                            <span>{bullet.replace(/^[•\-\*]\s*/, '').trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* In the box */}
                  {modalProduct.whats_in_the_box && (
                    <div className="border-t border-white/8 pt-4 mb-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">In the Box</p>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {modalProduct.whats_in_the_box}
                      </p>
                    </div>
                  )}

                  {/* Description — with URL filter */}
                  {modalProduct.description && (() => {
                    const desc = modalProduct.description;
                    const isUrls = typeof desc === 'string' && /^https?:\/\//.test(desc.trim());
                    const isUrlArray = Array.isArray(desc) && desc.every((d: any) => typeof d === 'string' && d.startsWith('http'));
                    
                    if (isUrls || isUrlArray) {
                      return (
                        <div className="border-t border-white/8 pt-4">
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Description</p>
                          <div className="bg-white/4 rounded-lg px-3 py-2.5 flex items-center gap-2">
                            <span className="text-gray-600">🖼</span>
                            <p className="text-xs text-gray-500 italic">
                              Image-based A+ content. Click ↗ to view on Amazon.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    const descText = typeof desc === 'string' ? desc : '';
                    const truncated = descText.length > 280 
                      ? descText.slice(0, 280).trim() + '...' 
                      : descText;

                    return (
                      <div className="border-t border-white/8 pt-4">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Description</p>
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                          {truncated}
                        </p>
                        <a
  href={`https://www.amazon.in/dp/${modalProduct.asin}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs text-orange-400 hover:text-orange-300 mt-1 inline-flex items-center gap-1 transition-colors"
>
  Full details on Amazon ↗
</a>

                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
