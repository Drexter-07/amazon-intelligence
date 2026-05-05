'use client';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  steps: string[];
  currentStep: number;
}

export default function LoadingState({ steps, currentStep }: Props) {
  const progressPercent = Math.min(
    ((currentStep + 1) / steps.length) * 100,
    95
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg">
        {/* Animated logo / spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-orange-500/10 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
          Analyzing Market Data
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          This typically takes 1–2 minutes
        </p>

        {/* Progress bar */}
        <Progress
          value={progressPercent}
          className="h-2 mb-8 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-orange-600 [&>div]:to-orange-400 [&>div]:transition-all [&>div]:duration-1000"
        />

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const isDone = i < currentStep;
            const isCurrent = i === currentStep;
            const isPending = i > currentStep;

            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ${
                  isCurrent
                    ? 'bg-orange-500/10 border border-orange-500/20'
                    : isDone
                    ? 'bg-secondary/50'
                    : 'opacity-40'
                }`}
              >
                {/* Step indicator */}
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-orange-500 animate-spin shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}

                {/* Step label */}
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-orange-400'
                      : isDone
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-muted-foreground/50 mt-8">
          💡 Tip: Results are cached — subsequent analyses of the same category are faster.
        </p>
      </div>
    </div>
  );
}
