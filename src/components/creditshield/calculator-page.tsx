'use client';

import { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  Gavel,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { US_SOL_DATA } from '@/data/sol-data';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
];

const CANADA_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
];

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'written_contract', label: 'Written Contract' },
  { value: 'oral_contract', label: 'Oral Contract' },
  { value: 'open_account', label: 'Open Account' },
  { value: 'medical_debt', label: 'Medical Debt' },
  { value: 'auto_loan', label: 'Auto Loan' },
  { value: 'student_loan', label: 'Student Loan' },
];

interface SolResult {
  expired: boolean;
  expirationDate: string;
  years: string;
  yearsCalculated: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalculatorPage() {
  const userCountry = useAppStore((s) => s.userCountry);
  const userState = useAppStore((s) => s.userState);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const [country, setCountry] = useState<'US' | 'CA'>(userCountry);
  const [state, setState] = useState(userState || '');
  const [debtType, setDebtType] = useState('credit_card');
  const [lastPaymentDate, setLastPaymentDate] = useState('');
  const [result, setResult] = useState<SolResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive regions
  const regions = country === 'US' ? US_STATES : CANADA_PROVINCES;

  const handleCalculate = async () => {
    if (!state || !lastPaymentDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setResult(null);
    setCalculating(true);

    try {
      const res = await fetch('/api/sol-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastPaymentDate, state, country, debtType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  // Compute days remaining
  const daysRemaining =
    result && !result.expired
      ? Math.ceil(
          (new Date(result.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : null;

  const formatExpirationDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">SOL Calculator</h2>
        <p className="text-sm text-muted-foreground">
          Determine if a debt&apos;s statute of limitations has expired.
        </p>
      </div>

      {/* Calculator Form Card */}
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate SOL Expiration
          </CardTitle>
          <CardDescription>
            Enter your debt details to check whether the statute of limitations has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {/* Country */}
          <div className="grid gap-2">
            <Label>Country</Label>
            <Select value={country} onValueChange={(val) => { setCountry(val as 'US' | 'CA'); setState(''); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* State / Province */}
          <div className="grid gap-2">
            <Label>{country === 'US' ? 'State' : 'Province'}</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger><SelectValue placeholder={country === 'US' ? 'Select a state' : 'Select a province'} /></SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label} ({r.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Debt Type */}
          <div className="grid gap-2">
            <Label>Debt Type</Label>
            <Select value={debtType} onValueChange={setDebtType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEBT_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Last Payment Date */}
          <div className="grid gap-2">
            <Label htmlFor="lastPaymentDate">Last Payment Date</Label>
            <Input
              id="lastPaymentDate"
              type="date"
              value={lastPaymentDate}
              onChange={(e) => setLastPaymentDate(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          <Button onClick={handleCalculate} disabled={calculating || !state || !lastPaymentDate} className="w-full">
            {calculating ? (
              <>
                <Skeleton className="mr-2 h-4 w-4 rounded" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && !result.error && (
        <Card className={cn(
          'mx-auto max-w-xl border-2',
          result.expired ? 'border-green-500/50' : 'border-red-500/50'
        )}>
          <CardContent className="pt-6 space-y-6">
            {/* Status Indicator */}
            <div className={cn(
              'flex items-center justify-center gap-3 rounded-lg p-6',
              result.expired
                ? 'bg-green-50 dark:bg-green-950/30'
                : 'bg-red-50 dark:bg-red-950/30'
            )}>
              {result.expired ? (
                <>
                  <ShieldCheck className="h-12 w-12 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">EXPIRED</p>
                    <p className="text-sm text-green-600 dark:text-green-500">The statute of limitations has expired</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldX className="h-12 w-12 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">NOT EXPIRED</p>
                    <p className="text-sm text-red-600 dark:text-red-500">The debt is still within the SOL period</p>
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Statute of Limitations</p>
                <p className="text-xl font-bold">{result.years} {result.years === '1' ? 'year' : 'years'}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Expiration Date</p>
                <p className="text-xl font-bold">{formatExpirationDate(result.expirationDate)}</p>
              </div>
            </div>

            {/* Can They Sue? */}
            <div className={cn(
              'flex items-center gap-3 rounded-lg p-4',
              result.expired
                ? 'bg-green-50 dark:bg-green-950/20'
                : 'bg-amber-50 dark:bg-amber-950/20'
            )}>
              <Gavel className={cn('h-5 w-5', result.expired ? 'text-green-600' : 'text-amber-600')} />
              <div>
                <p className="font-semibold">
                  Can they sue?{' '}
                  <Badge variant={result.expired ? 'default' : 'destructive'}>
                    {result.expired ? 'No' : 'Yes'}
                  </Badge>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.expired
                    ? 'The creditor or collector cannot legally sue you for this debt because the statute of limitations has expired. If they file a lawsuit, you can raise the SOL defense to have it dismissed.'
                    : 'The creditor or collector can still file a lawsuit to collect this debt. The SOL has not yet expired, so the debt is legally enforceable. Consider your options carefully.'}
                </p>
              </div>
            </div>

            {/* Action CTA */}
            {result.expired ? (
              <Button
                className="w-full"
                onClick={() => setCurrentPage('disputes')}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Generate Cease &amp; Desist Letter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Days Remaining</span>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    <Clock className="mr-1 h-4 w-4" />
                    {daysRemaining !== null ? daysRemaining : '—'} days
                  </Badge>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setCurrentPage('deadlines')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Monitor This Deadline
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              This calculator provides estimates based on state statutes and may not account for tolling, resets, or jurisdictional nuances. Consult a licensed attorney for legal advice.
            </p>
          </CardContent>
        </Card>
      )}

      {/* SOL Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronDown className="h-5 w-5" />
            SOL Reference Table — All 50 US States
          </CardTitle>
          <CardDescription>
            Statute of limitations for common debt types by state. Ranges indicate variation by court interpretation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sol-table">
              <AccordionTrigger>View Full SOL Reference Table</AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">State</TableHead>
                        <TableHead>Credit Card</TableHead>
                        <TableHead>Written Contract</TableHead>
                        <TableHead>Oral Contract</TableHead>
                        <TableHead>Open Account</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {US_SOL_DATA.map((entry) => {
                        const cc = entry.debtTypes.find((d) => d.type === 'credit_card');
                        const wc = entry.debtTypes.find((d) => d.type === 'written_contract');
                        const oc = entry.debtTypes.find((d) => d.type === 'oral_contract');
                        const oa = entry.debtTypes.find((d) => d.type === 'open_account');
                        return (
                          <TableRow key={entry.state}>
                            <TableCell className="font-medium">{entry.state}</TableCell>
                            <TableCell>{cc?.years ?? entry.years} yrs</TableCell>
                            <TableCell>{wc?.years ?? '—'}</TableCell>
                            <TableCell>{oc?.years ?? '—'}</TableCell>
                            <TableCell>{oa?.years ?? '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
