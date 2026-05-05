'use client';
import { useState } from 'react';
import InputForm from '@/components/InputForm';
import LoadingState from '@/components/LoadingState';
import ReportDashboard from '@/components/ReportDashboard';
import { FullAnalysisResponse } from '@/lib/types';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AppState = 'idle' | 'loading' | 'done' | 'error';

const LOADING_STEPS = [
  'Scanning Amazon listings...',
  'Scraping product data...',
  'Collecting customer reviews...',
  'Running AI analysis on purchase patterns...',
  'Generating your Pixii Design Brief...',
];

export default function Home() {
  const [state, setState] = useState<AppState>('idle');
  const [reportData, setReportData] = useState<FullAnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  async function handleSubmit(input: { myAsin: string; asins: string[] }) {
    setState('loading');
    setLoadingStep(0);
    setErrorMsg('');

    // Simulate step progression during the long API call
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 15000);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const endpoint = '/api/review-analytics';
      const payload = { asins: input.asins, myAsin: input.myAsin };
      
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearInterval(stepInterval);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.detail || 'Something went wrong');
      }

      setReportData(data);
      setState('done');
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('error');
    }
  }

  function handleReset() {
    setState('idle');
    setReportData(null);
    setErrorMsg('');
    setLoadingStep(0);
  }

  return (
    <main className="min-h-screen">
      {state === 'idle' && <InputForm onSubmit={handleSubmit} />}

      {state === 'loading' && (
        <LoadingState steps={LOADING_STEPS} currentStep={loadingStep} />
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-lg font-medium">{errorMsg}</p>
          </div>
          <Button onClick={handleReset} variant="default" size="lg" className="gap-2 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {state === 'done' && reportData && (
        <ReportDashboard data={reportData} onReset={handleReset} />
      )}
    </main>
  );
}
