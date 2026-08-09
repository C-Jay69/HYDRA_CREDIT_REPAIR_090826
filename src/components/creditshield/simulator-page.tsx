'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Minus,
  Plus,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface ScoreAction {
  id: string;
  label: string;
  description: string;
  minImpact: number;
  maxImpact: number;
  checked: boolean;
}

const INITIAL_ACTIONS: ScoreAction[] = [
  {
    id: 'remove-collection',
    label: 'Remove outdated collection',
    description: 'Collections older than 7 years that should have been removed from your report.',
    minImpact: 30,
    maxImpact: 50,
    checked: false,
  },
  {
    id: 'remove-late-payment',
    label: 'Remove inaccurate late payment',
    description: 'A late payment that is incorrect, duplicated, or not yours.',
    minImpact: 15,
    maxImpact: 30,
    checked: false,
  },
  {
    id: 'pay-down-cc',
    label: 'Pay down credit card balance',
    description: 'Reducing credit card utilization below 30% (ideally under 10%).',
    minImpact: 10,
    maxImpact: 40,
    checked: false,
  },
  {
    id: 'remove-duplicate',
    label: 'Remove duplicate entry',
    description: 'Eliminate a duplicate negative item being reported more than once.',
    minImpact: 10,
    maxImpact: 20,
    checked: false,
  },
  {
    id: 'resolve-identity-theft',
    label: 'Resolve identity theft items',
    description: 'Remove fraudulent accounts opened due to identity theft.',
    minImpact: 20,
    maxImpact: 50,
    checked: false,
  },
  {
    id: 'pay-for-delete',
    label: 'Successful pay-for-delete',
    description: 'Negotiate removal of a collection account in exchange for payment.',
    minImpact: 15,
    maxImpact: 30,
    checked: false,
  },
  {
    id: 'remove-medical',
    label: 'Remove medical debt under $500',
    description: 'Under CFPB 2023 rules, medical debts under $500 should not appear on credit reports.',
    minImpact: 10,
    maxImpact: 25,
    checked: false,
  },
  {
    id: 'add-positive-history',
    label: 'Add positive account history',
    description: 'Adding a positive tradeline or becoming an authorized user on a seasoned account.',
    minImpact: 5,
    maxImpact: 15,
    checked: false,
  },
];

interface ScoreZone {
  min: number;
  max: number;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  barColor: string;
}

const SCORE_ZONES: ScoreZone[] = [
  { min: 300, max: 579, label: 'Very Poor', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30', textColor: 'text-red-700 dark:text-red-400', barColor: 'bg-red-500' },
  { min: 580, max: 669, label: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', textColor: 'text-orange-700 dark:text-orange-400', barColor: 'bg-orange-500' },
  { min: 670, max: 739, label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', textColor: 'text-yellow-700 dark:text-yellow-400', barColor: 'bg-yellow-500' },
  { min: 740, max: 799, label: 'Very Good', color: 'text-lime-600', bgColor: 'bg-lime-50 dark:bg-lime-950/30', textColor: 'text-lime-700 dark:text-lime-400', barColor: 'bg-lime-500' },
  { min: 800, max: 850, label: 'Excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', textColor: 'text-emerald-700 dark:text-emerald-400', barColor: 'bg-emerald-500' },
];

function getZone(score: number): ScoreZone {
  return SCORE_ZONES.find((z) => score >= z.min && score <= z.max) ?? SCORE_ZONES[0];
}

function getScoreColor(score: number): string {
  const zone = getZone(score);
  return zone.color;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SimulatorPage() {
  const [currentScore, setCurrentScore] = useState(650);
  const [actions, setActions] = useState<ScoreAction[]>(INITIAL_ACTIONS);

  // Compute estimated new score
  const estimatedResult = useMemo(() => {
    let totalMin = 0;
    let totalMax = 0;
    actions.forEach((a) => {
      if (a.checked) {
        totalMin += a.minImpact;
        totalMax += a.maxImpact;
      }
    });
    const avgImpact = actions.some((a) => a.checked)
      ? Math.round((totalMin + totalMax) / 2)
      : 0;
    const estimatedScore = Math.min(850, Math.max(300, currentScore + avgImpact));
    return {
      minGain: totalMin,
      maxGain: totalMax,
      avgImpact,
      estimatedScore,
      estimatedMin: Math.min(850, Math.max(300, currentScore + totalMin)),
      estimatedMax: Math.min(850, Math.max(300, currentScore + totalMax)),
    };
  }, [currentScore, actions]);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const resetAll = () => {
    setCurrentScore(650);
    setActions(INITIAL_ACTIONS);
  };

  const currentZone = getZone(currentScore);
  const estimatedZone = getZone(estimatedResult.estimatedScore);
  const progressPercent = ((currentScore - 300) / 550) * 100;
  const estimatedProgressPercent = ((estimatedResult.estimatedScore - 300) / 550) * 100;

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <Alert className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-300">
          <strong>Educational Tool Only.</strong> This simulator provides rough estimates of potential credit
          score improvements based on common credit repair actions. Results are not guaranteed and should
          not be relied upon as financial advice. Actual score changes depend on many individual factors
          including your complete credit history, existing accounts, and scoring model variations.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column — Inputs */}
        <div className="space-y-6">
          {/* Score Slider Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Current Estimated Score</CardTitle>
              <CardDescription>
                Adjust the slider to set your current estimated credit score (300–850).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <span className={cn('text-5xl font-bold', getScoreColor(currentScore))}>
                  {currentScore}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className={cn('text-sm', currentZone.bgColor, currentZone.textColor)}>
                  {currentZone.label}
                </Badge>
              </div>
              <Slider
                min={300}
                max={850}
                step={1}
                value={[currentScore]}
                onValueChange={([val]) => setCurrentScore(val)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>300</span>
                <span>500</span>
                <span>650</span>
                <span>750</span>
                <span>850</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Checklist Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Credit Repair Actions
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
              </CardTitle>
              <CardDescription>
                Toggle actions you plan to take. Each shows the estimated point impact range.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {actions.map((action) => (
                <label
                  key={action.id}
                  htmlFor={action.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                    action.checked
                      ? 'border-primary/50 bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <Checkbox
                    id={action.id}
                    checked={action.checked}
                    onCheckedChange={() => toggleAction(action.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{action.label}</span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        +{action.minImpact} to +{action.maxImpact}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Result */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimated Result</CardTitle>
              <CardDescription>
                Based on your current score and selected actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Comparison */}
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className={cn('text-4xl font-bold', getScoreColor(currentScore))}>
                    {currentScore}
                  </p>
                  <Badge variant="secondary" className={cn('mt-1', currentZone.bgColor, currentZone.textColor)}>
                    {currentZone.label}
                  </Badge>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Minus className="h-4 w-4" />
                    <div className="h-px w-8 bg-border" />
                    <ArrowIcon />
                    <div className="h-px w-8 bg-border" />
                    <Plus className="h-4 w-4" />
                  </div>
                  <Badge
                    className={cn(
                      'text-sm',
                      estimatedResult.avgImpact > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {estimatedResult.avgImpact > 0
                      ? `+${estimatedResult.avgImpact} pts (avg)`
                      : 'No change'}
                  </Badge>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Estimated</p>
                  <p className={cn('text-4xl font-bold', getScoreColor(estimatedResult.estimatedScore))}>
                    {estimatedResult.estimatedScore}
                  </p>
                  <Badge variant="secondary" className={cn('mt-1', estimatedZone.bgColor, estimatedZone.textColor)}>
                    {estimatedZone.label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Visual Gauge */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Score Range Gauge</p>
                {/* Zone legend bar */}
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                  <div className="flex-1 bg-red-500" />
                  <div className="flex-1 bg-orange-500" />
                  <div className="flex-1 bg-yellow-500" />
                  <div className="flex-1 bg-lime-500" />
                  <div className="flex-1 bg-emerald-500" />
                </div>
                {/* Current score marker */}
                <div className="relative h-6">
                  <div
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${progressPercent}%` }}
                  >
                    <span className="text-xs font-medium text-muted-foreground">Current</span>
                    <div className="h-2 w-0.5 bg-muted-foreground" />
                  </div>
                  <div
                    className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${estimatedProgressPercent}%` }}
                  >
                    <div className={cn('h-2 w-2 rounded-full', estimatedZone.barColor)} />
                    <span className={cn('text-xs font-bold', estimatedZone.color)}>Estimated</span>
                  </div>
                </div>
                {/* Labels */}
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>300</span>
                  <span>579</span>
                  <span>669</span>
                  <span>739</span>
                  <span>799</span>
                  <span>850</span>
                </div>
              </div>

              <Separator />

              {/* Impact Summary */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Impact Summary</p>
                {actions.some((a) => a.checked) ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actions selected</span>
                      <span className="font-medium">{actions.filter((a) => a.checked).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Conservative estimate</span>
                      <span className="font-medium text-green-600">+{estimatedResult.minGain} pts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Best case estimate</span>
                      <span className="font-medium text-green-600">+{estimatedResult.maxGain} pts</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated range</span>
                      <span className="font-bold">
                        {estimatedResult.estimatedMin} – {estimatedResult.estimatedMax}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select actions above to see estimated impact on your credit score.
                  </p>
                )}
              </div>

              <Separator />

              {/* Score Zone Reference */}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  FICO Score Ranges
                </p>
                <div className="grid gap-2">
                  {SCORE_ZONES.map((zone) => (
                    <div key={zone.label} className={cn('flex items-center justify-between rounded-md px-3 py-1.5', zone.bgColor)}>
                      <div className="flex items-center gap-2">
                        <div className={cn('h-3 w-3 rounded-sm', zone.barColor)} />
                        <span className={cn('text-sm font-medium', zone.textColor)}>{zone.label}</span>
                      </div>
                      <span className={cn('text-xs', zone.textColor)}>{zone.min} – {zone.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple arrow icon component
function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
