'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnrichedProduct } from '@/lib/types';

interface Props {
  products: EnrichedProduct[];
  currencySymbol: string;
  myAsin?: string;
}

export default function PositioningMatrix({ products, currencySymbol, myAsin }: Props) {
  const valid = products.filter((p) => p.price > 0 && p.rating > 0);
  if (valid.length === 0) return null;

  const avgPrice  = valid.reduce((s, p) => s + p.price, 0) / valid.length;
  const avgRating = valid.reduce((s, p) => s + p.rating, 0) / valid.length;
  const minPrice  = Math.min(...valid.map((p) => p.price));
  const maxPrice  = Math.max(...valid.map((p) => p.price));
  const minRating = Math.min(...valid.map((p) => p.rating));
  const maxRating = Math.max(...valid.map((p) => p.rating));

  const priceRange  = maxPrice  - minPrice  || 1;
  const ratingRange = maxRating - minRating || 0.1;

  // Map to 10-90% so dots don't collide with edges
  const getX = (price: number)  => ((price  - minPrice)  / priceRange)  * 80 + 10;
  const getY = (rating: number) => 100 - (((rating - minRating) / ratingRange) * 80 + 10); // invert Y

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Price vs. Value Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Where each brand sits — rated by customers, priced by market. Dashed lines = market average.
        </p>
      </CardHeader>
      <CardContent>
        {/* Quadrant container — 16:9-ish aspect ratio */}
        <div className="relative w-full" style={{ paddingBottom: '58%' }}>
          <div className="absolute inset-0 rounded-2xl border border-white/10 overflow-visible bg-[#0d0d0d]">

            {/* ── Quadrant backgrounds ── */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
              {/* Top-left: Value Champions */}
              <div className="border-r border-b border-white/[0.07] bg-green-500/[0.04] flex items-start justify-start p-3">
                <span className="text-[11px] text-green-500/50 font-medium">Value Champions</span>
              </div>
              {/* Top-right: Premium Players */}
              <div className="border-b border-white/[0.07] bg-blue-500/[0.04] flex items-start justify-end p-3">
                <span className="text-[11px] text-blue-500/50 font-medium">Premium Players</span>
              </div>
              {/* Bottom-left: Budget Risk */}
              <div className="border-r border-white/[0.07] bg-yellow-500/[0.04] flex items-end justify-start p-3">
                <span className="text-[11px] text-yellow-500/50 font-medium">Budget Risk</span>
              </div>
              {/* Bottom-right: Overpriced */}
              <div className="bg-red-500/[0.04] flex items-end justify-end p-3">
                <span className="text-[11px] text-red-500/50 font-medium">Overpriced</span>
              </div>
            </div>

            {/* ── Crosshair lines (market avg) ── */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-white/[0.12]" />
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-white/[0.12]" />
            </div>

            {/* ── Axis labels ── */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 pointer-events-none">
              Price →  (avg {currencySymbol}{Math.round(avgPrice).toLocaleString()})
            </div>
            <div
              className="absolute left-1.5 top-1/2 text-[10px] text-gray-600 pointer-events-none"
              style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}
            >
              Rating → (avg {avgRating.toFixed(1)}★)
            </div>

            {/* ── Product dots ── */}
            {(() => {
              const positionedValid = valid.map(p => ({
                ...p,
                _x: getX(p.price),
                _y: getY(p.rating)
              }));

              const getOffsetPosition = (
                products: any[], 
                currentIndex: number,
                x: number, 
                y: number
              ) => {
                let offsetX = 0;
                let offsetY = 0;
                products.slice(0, currentIndex).forEach(prev => {
                  const dx = Math.abs(prev._x - x);
                  const dy = Math.abs(prev._y - y);
                  if (dx < 12 && dy < 12) { // too close
                    offsetX += 10;
                    offsetY -= 10;
                  }
                });
                return { offsetX, offsetY };
              };

              const dotSize = valid.length > 6 ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';

              return positionedValid.map((p, i) => {
                const isUser = p.asin === myAsin;
                const { offsetX, offsetY } = getOffsetPosition(positionedValid, i, p._x, p._y);

                return (
                  <div
                    key={p.asin}
                    className="absolute group cursor-default"
                    style={{ 
                      left: `${p._x}%`, 
                      top: `${p._y}%`,
                      transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
                      zIndex: isUser ? 10 : 1
                    }}
                  >
                    {/* Dot */}
                    <div
                      className={`rounded-full border-2 flex items-center justify-center font-bold transition-transform duration-150 group-hover:scale-125 select-none ${dotSize} ${
                        isUser
                          ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/40'
                          : 'bg-gray-700/80 border-gray-500 text-gray-300'
                      }`}
                    >
                      {isUser ? '★' : i + 1}
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100]">
                      <div className="bg-[#1a1a1a] border border-white/15 rounded-xl px-3 py-2.5 text-xs shadow-xl whitespace-nowrap">
                        <p className="text-white font-semibold mb-1 max-w-[180px] truncate">{p.brand}</p>
                        <p className="text-gray-400 text-[11px] max-w-[180px] truncate mb-1.5">{p.title.slice(0, 40)}…</p>
                        <p className="text-orange-400">{currencySymbol}{p.price.toLocaleString()}</p>
                        <p className="text-yellow-400">{p.rating.toFixed(1)} ★  ·  {p.reviewCount.toLocaleString()} reviews</p>
                        {isUser && <p className="text-orange-400 mt-1 font-medium">← Your Product</p>}
                      </div>
                      {/* Arrow */}
                      <div className="w-2 h-2 bg-[#1a1a1a] border-b border-r border-white/15 rotate-45 mx-auto -mt-1" />
                    </div>
                  </div>
                );
              });
            })()}

          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            Your Product
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-600 inline-block" />
            Competitors (numbered by revenue rank)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-px border-t border-dashed border-white/40 inline-block" />
            Market Average
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
