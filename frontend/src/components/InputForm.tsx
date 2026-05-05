'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  UserRound,
  Swords,
  MessageSquareText,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';

interface Props {
  onSubmit: (input: { myAsin: string; asins: string[] }) => void;
}

export default function InputForm({ onSubmit }: Props) {
  const [myAsin, setMyAsin] = useState('');
  const [competitorAsins, setCompetitorAsins] = useState<string[]>(['']);

  function handleCompetitorChange(index: number, value: string) {
    const newAsins = [...competitorAsins];
    newAsins[index] = value.toUpperCase();
    setCompetitorAsins(newAsins);
  }

  function addCompetitor() {
    if (competitorAsins.length < 9) {
      setCompetitorAsins([...competitorAsins, '']);
    }
  }

  function removeCompetitor(index: number) {
    const newAsins = [...competitorAsins];
    newAsins.splice(index, 1);
    setCompetitorAsins(newAsins);
  }

  function handleSubmit() {
    if (myAsin.trim()) {
      const myAsinClean = myAsin.trim().toUpperCase();
      if (!/^[A-Z0-9]{10}$/.test(myAsinClean)) return;

      const validCompetitors = competitorAsins
        .map(a => a.trim())
        .filter(a => /^[A-Z0-9]{10}$/.test(a) && a !== myAsinClean);

      // Unique competitors only
      const uniqueCompetitors = Array.from(new Set(validCompetitors)).slice(0, 9);

      // Combine: my ASIN first, then competitors
      const allAsins = [myAsinClean, ...uniqueCompetitors];
      onSubmit({ myAsin: myAsinClean, asins: allAsins });
    }
  }

  const isReviewValid = /^[A-Z0-9]{10}$/i.test(myAsin.trim());
  
  const validCompetitorCount = competitorAsins
    .map(a => a.trim())
    .filter(a => /^[A-Z0-9]{10}$/.test(a) && a !== myAsin.trim().toUpperCase())
    .length;

  const reviewFeatures = [
    { icon: UserRound, label: 'Your listing performance' },
    { icon: Swords, label: 'vs. 9 competitors side-by-side' },
    { icon: MessageSquareText, label: 'Key purchase criteria from reviews' },
    { icon: Sparkles, label: 'Pixii Design Brief for YOUR listing' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-orange-600/3 blur-3xl" />
      </div>

      {/* Header */}
      <div className="text-center mb-10 max-w-2xl animate-fade-in-up">
        <Badge
          variant="outline"
          className="mb-6 border-orange-500/30 bg-orange-500/10 text-orange-400 px-4 py-1.5 text-sm font-medium"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Powered by Pixii Intelligence
        </Badge>

        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-gradient-orange">
          Review Analytics Engine
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
          Enter your ASIN + up to 9 competitors.
          <br className="hidden sm:block" />
          Get a full competitive review analysis + Pixii brief.
        </p>
      </div>

      {/* Input Card */}
      <Card
        className="w-full max-w-2xl border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDelay: '0.15s' }}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* My ASIN */}
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">
                <span className="text-orange-400">★</span> Your Product ASIN
              </label>
              <Input
                type="text"
                value={myAsin}
                onChange={e => setMyAsin(e.target.value.toUpperCase())}
                placeholder="B08N5WRWNW"
                maxLength={10}
                className="h-12 bg-secondary border-orange-500/30 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:ring-orange-500"
              />
              <p className="text-muted-foreground/60 text-xs mt-1">
                The ASIN of your own Amazon listing (10-character product ID)
              </p>
            </div>

            {/* Competitor ASINs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
                  Competitor ASINs (up to 9)
                </label>
                <span className="text-xs text-muted-foreground/60">
                  {validCompetitorCount} valid detected
                </span>
              </div>
              
              <div className="space-y-3">
                {competitorAsins.map((asin, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={asin}
                      onChange={e => handleCompetitorChange(index, e.target.value)}
                      placeholder={`Competitor ${index + 1} ASIN (e.g., B07XJ8C8F5)`}
                      maxLength={10}
                      className="h-12 bg-secondary border-border/50 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:ring-orange-500"
                    />
                    {competitorAsins.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompetitor(index)}
                        className="h-12 w-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-all active:scale-90 duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {competitorAsins.length < 9 && (
                <Button
                  variant="outline"
                  onClick={addCompetitor}
                  className="w-full mt-3 border-dashed border-border/50 text-muted-foreground hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all active:scale-[0.98] duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Competitor
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isReviewValid}
            size="lg"
            className="w-full mt-8 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-base h-13 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none disabled:transform-none disabled:hover:translate-y-0 disabled:active:scale-100"
          >
            Analyze Reviews & Competitors →
          </Button>

          {/* Feature badges */}
          <div className="mt-8 grid grid-cols-2 gap-3 stagger-children">
            {reviewFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 text-muted-foreground text-sm"
              >
                <Icon className="h-4 w-4 text-orange-500/70 shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
