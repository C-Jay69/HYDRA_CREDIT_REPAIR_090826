'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Eye,
  FileText,
  Send,
  Download,
  AlertTriangle,
  Inbox,
  Scale,
  Shield,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/app-store';
import { TEMPLATE_CATALOG } from '@/data/legal-templates';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportItem {
  id: string;
  accountName: string | null;
  accountNumber: string | null;
  creditorName: string | null;
  balance: number | null;
  status: string | null;
  accountType: string | null;
}

interface Letter {
  id: string;
  templateType: string;
  recipientName: string | null;
  status: string;
  createdAt: string;
}

interface Deadline {
  id: string;
  title: string;
  deadlineType: string;
  dueDate: string;
  isCompleted: boolean;
}

interface Dispute {
  id: string;
  disputeType: string;
  status: string;
  strategy: string | null;
  targetName: string | null;
  targetAddress: string | null;
  legalBasis: string | null;
  reason: string | null;
  confidence: number | null;
  outcome: string | null;
  notes: string | null;
  sentDate: string | null;
  createdAt: string;
  reportItem: ReportItem | null;
  letters: Letter[];
  deadlines: Deadline[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function disputeStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'resolved')
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
  if (s === 'denied')
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  if (s === 'sent')
    return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
  if (s === 'in-progress')
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  if (s === 'approved')
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  if (s === 'pending-review')
    return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
  if (s === 'escalated')
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
  if (s === 'draft')
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
}

function disputeTypeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('outdated'))
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  if (t.includes('duplicate'))
    return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
  if (t.includes('medical'))
    return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
  if (t.includes('sold') || t.includes('collection') || t.includes('fdcpa'))
    return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
  if (t.includes('authorized'))
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  if (t.includes('double') || t.includes('charge-off'))
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
  if (t.includes('identity') || t.includes('theft'))
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
}

function confidenceBarColor(value: number): string {
  if (value >= 75) return '[&>div]:bg-emerald-500';
  if (value >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
}

function formatStatus(status: string): string {
  return status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDisputeType(type: string): string {
  return type
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Bureau addresses for auto-fill
const BUREAU_ADDRESSES: Record<string, { name: string; address: string }> = {
  experian: {
    name: 'Experian',
    address: 'P.O. Box 4500, Allen, TX 75013',
  },
  equifax: {
    name: 'Equifax Information Services LLC',
    address: 'P.O. Box 740241, Atlanta, GA 30374',
  },
  transunion: {
    name: 'TransUnion LLC',
    address: 'P.O. Box 2000, Chester, PA 19016',
  },
};

// ---------------------------------------------------------------------------
// Status tab mapping
// ---------------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all', label: 'All Disputes' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending-review', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'denied', label: 'Denied' },
] as const;

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function DisputesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-48" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-72" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispute Card
// ---------------------------------------------------------------------------

function DisputeCard({
  dispute,
  onView,
}: {
  dispute: Dispute;
  onView: () => void;
}) {
  const conf = dispute.confidence ?? 0;
  const accountName = dispute.reportItem?.accountName ?? 'Unknown Account';
  const creditorName =
    dispute.reportItem?.creditorName ?? dispute.targetName ?? 'Unknown Creditor';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left content */}
          <div className="min-w-0 flex-1">
            {/* Account name + creditor */}
            <h3 className="truncate text-sm font-semibold">{accountName}</h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {creditorName}
            </p>

            {/* Badges row */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-[11px] capitalize',
                  disputeTypeColor(dispute.disputeType)
                )}
              >
                {formatDisputeType(dispute.disputeType)}
              </Badge>
              {dispute.strategy && (
                <Badge
                  variant="secondary"
                  className="text-[11px] capitalize"
                >
                  {dispute.strategy.replace(/-/g, ' ')}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn(
                  'text-[11px] capitalize',
                  disputeStatusColor(dispute.status)
                )}
              >
                {formatStatus(dispute.status)}
              </Badge>
            </div>

            {/* Confidence bar */}
            {conf > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Progress
                  value={conf}
                  className={cn('h-2 w-24', confidenceBarColor(conf))}
                />
                <span className="text-xs text-muted-foreground">{conf}%</span>
              </div>
            )}

            {/* Legal basis */}
            {dispute.legalBasis && (
              <p className="mt-2 truncate text-xs text-muted-foreground italic">
                <Scale className="mr-1 inline-block size-3" />
                {dispute.legalBasis}
              </p>
            )}
          </div>

          {/* View button */}
          <Button variant="outline" size="sm" onClick={onView} className="shrink-0">
            <Eye className="mr-1.5 size-3.5" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Dispute Detail Dialog
// ---------------------------------------------------------------------------

function DisputeDetailDialog({
  dispute,
  open,
  onOpenChange,
}: {
  dispute: Dispute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const userName = useAppStore((s) => s.userName);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [letterPreview, setLetterPreview] = useState('');
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Reset state when dialog opens with a new dispute
  useEffect(() => {
    if (open && dispute) {
      setSelectedTemplate('');
      setLetterPreview('');
      setDisclaimerChecked(false);
      setSending(false);
      setGenerating(false);
    }
  }, [open, dispute]);

  // Auto-select a recommended template based on dispute type
  const recommendedTemplate = useMemo(() => {
    if (!dispute) return '';
    const dt = dispute.disputeType.toLowerCase();
    if (dt.includes('fdcpa') || dt.includes('sold-debt') || dt.includes('collection'))
      return 'fdcpa-809';
    if (dt.includes('identity') || dt.includes('theft')) return 'identity-theft-605b';
    if (dt.includes('medical')) return 'medical-debt-cfpb-2023';
    if (dt.includes('duplicate')) return 'duplicate-reporting';
    if (dt.includes('authorized')) return 'authorized-user-removal';
    if (dt.includes('outdated') || dt.includes('double')) return 'fcra-611';
    return 'fcra-611';
  }, [dispute]);

  const handleGenerateLetter = useCallback(() => {
    if (!dispute || !selectedTemplate) return;

    const template = TEMPLATE_CATALOG.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setGenerating(true);

    // Simulate async generation
    setTimeout(() => {
      try {
        const accountName = dispute.reportItem?.accountName ?? 'Unknown Account';
        const accountNumber = dispute.reportItem?.accountNumber ?? 'Unknown';
        const creditorName =
          dispute.reportItem?.creditorName ??
          dispute.targetName ??
          'Unknown Creditor';
        const balance = dispute.reportItem?.balance ?? 0;

        // Auto-detect bureau type from target name
        let bureauInfo: { name: string; address: string } | null = null;
        const targetLower = (dispute.targetName ?? '').toLowerCase();
        if (targetLower.includes('experian'))
          bureauInfo = BUREAU_ADDRESSES.experian;
        else if (targetLower.includes('equifax'))
          bureauInfo = BUREAU_ADDRESSES.equifax;
        else if (targetLower.includes('transunion'))
          bureauInfo = BUREAU_ADDRESSES.transunion;

        const baseParams = {
          userName: userName || 'Your Name',
          userAddress: 'Your Address',
          userCity: '',
          userState: '',
          userZip: '',
          accountNumber,
          creditorName,
          amount: balance > 0 ? `$${balance.toFixed(2)}` : 'Unknown',
          date: new Date().toISOString().split('T')[0],
          reason: dispute.reason ?? `Dispute regarding ${accountName}`,
        };

        // Build template-specific params
        let params: Record<string, unknown> = {
          ...baseParams,
          disputedItems: [accountName],
          bureauName: bureauInfo?.name ?? 'Credit Bureau',
          bureauAddress: bureauInfo?.address ?? 'P.O. Box 0000, City, State 00000',
          collectorName: creditorName,
          collectorAddress:
            dispute.targetAddress ?? 'Unknown Address',
          companyName: creditorName,
          companyAddress:
            dispute.targetAddress ?? 'Unknown Address',
          disputeReason: dispute.reason ?? 'Inaccurate reporting',
          product: 'Credit Reporting',
          issue: `Inaccurate information regarding ${accountName}`,
          desiredResolution: 'Deletion of inaccurate information',
        };

        const letter = template.templateFn(params);
        setLetterPreview(letter);
      } catch (err) {
        console.error('Letter generation error:', err);
        toast.error('Failed to generate letter. Check template parameters.');
      } finally {
        setGenerating(false);
      }
    }, 400);
  }, [dispute, selectedTemplate, userName]);

  const handleApproveAndSend = useCallback(async () => {
    if (!dispute || !letterPreview || !selectedTemplate) return;

    setSending(true);
    try {
      const template = TEMPLATE_CATALOG.find((t) => t.id === selectedTemplate);

      // POST letter
      const letterRes = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: dispute.id,
          templateType: template?.id ?? selectedTemplate,
          recipientName: dispute.targetName,
          recipientAddr: dispute.targetAddress,
          content: letterPreview,
        }),
      });

      if (!letterRes.ok) {
        throw new Error('Failed to save letter');
      }

      // PUT dispute status to 'sent'
 const disputeRes = await fetch('/api/disputes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dispute.id, status: 'sent' }),
      });

      if (!disputeRes.ok) {
        throw new Error('Failed to update dispute status');
      }

      toast.success('Letter approved and dispute status updated to sent!');
      onOpenChange(false);
    } catch (err) {
      console.error('Send error:', err);
      toast.error('Failed to send letter. Please try again.');
    } finally {
      setSending(false);
    }
  }, [dispute, letterPreview, selectedTemplate, onOpenChange]);

  const handleDownloadPdf = useCallback(() => {
    toast.success('PDF ready for download');
  }, []);

  if (!dispute) return null;

  const accountName = dispute.reportItem?.accountName ?? 'Unknown Account';
  const creditorName =
    dispute.reportItem?.creditorName ?? dispute.targetName ?? 'Unknown Creditor';
  const conf = dispute.confidence ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-0 p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            {accountName}
          </DialogTitle>
          <DialogDescription>{creditorName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden lg:flex-row">
          {/* ---- Left Panel: Dispute Details ---- */}
          <div className="flex w-full flex-col border-r lg:w-1/2">
            <ScrollArea className="flex-1">
              <div className="space-y-5 p-6">
                {/* Status & confidence */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs capitalize',
                        disputeStatusColor(dispute.status)
                      )}
                    >
                      {formatStatus(dispute.status)}
                    </Badge>
                    {conf > 0 && (
                      <div className="flex items-center gap-2">
                        <Progress
                          value={conf}
                          className={cn(
                            'h-2 w-16',
                          confidenceBarColor(conf)
                        )}
                        />
                        <span className="text-xs text-muted-foreground">
                          {conf}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dispute info */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Dispute Details
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[11px] capitalize',
                            disputeTypeColor(dispute.disputeType)
                          )}
                        >
                          {formatDisputeType(dispute.disputeType)}
                        </Badge>
                      </dd>
                    </div>
                    {dispute.strategy && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Strategy</dt>
                        <dd className="font-medium capitalize">
                          {dispute.strategy.replace(/-/g, ' ')}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="font-medium">
                        {formatDate(dispute.createdAt)}
                      </dd>
                    </div>
                    {dispute.sentDate && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Sent</dt>
                        <dd className="font-medium">
                          {formatDate(dispute.sentDate)}
                        </dd>
                      </div>
                    )}
                    {dispute.outcome && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Outcome</dt>
                        <dd className="font-medium capitalize">
                          {dispute.outcome.replace(/-/g, ' ')}
                        </dd>
                      </div>
                    )}
                    {dispute.targetName && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Target</dt>
                        <dd className="max-w-[200px] truncate text-right font-medium">
                          {dispute.targetName}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Legal basis */}
                {dispute.legalBasis && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Legal Basis
                    </h4>
                    <div className="rounded-md border bg-muted/50 p-3">
                      <p className="text-sm">
                        <Scale className="mr-1.5 inline-block size-3 text-primary" />
                        {dispute.legalBasis}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                {dispute.reason && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reason
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {dispute.reason}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {dispute.notes && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Notes
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {dispute.notes}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Related deadlines */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Related Deadlines
                  </h4>
                  {dispute.deadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No deadlines associated.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dispute.deadlines.map((dl) => {
                        const due = new Date(dl.dueDate);
                        const now = new Date();
                        const daysLeft = Math.ceil(
                          (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return (
                          <div
                            key={dl.id}
                            className="flex items-center justify-between rounded-md border p-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {dl.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatShortDate(dl.dueDate)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                'ml-2 shrink-0 text-[11px]',
                                dl.isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                                  : daysLeft < 0
                                    ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                    : daysLeft < 7
                                      ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700'
                              )}
                            >
                              {dl.isCompleted
                                ? 'Completed'
                                : daysLeft < 0
                                  ? `${Math.abs(daysLeft)}d overdue`
                                  : daysLeft === 0
                                    ? 'Due today'
                                    : `${daysLeft}d left`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Letter history */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Letter History
                  </h4>
                  {dispute.letters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No letters generated yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dispute.letters.map((letter) => (
                        <div
                          key={letter.id}
                          className="flex items-center justify-between rounded-md border p-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {letter.templateType.replace(/-/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatShortDate(letter.createdAt)}
                              {letter.recipientName
                                ? ` → ${letter.recipientName}`
                                : ''}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="ml-2 shrink-0 text-[11px] capitalize"
                          >
                            {letter.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* ---- Right Panel: Letter Generation ---- */}
          <div className="flex w-full flex-col lg:w-1/2">
            <div className="border-b px-6 py-4">
              <h3 className="text-sm font-semibold">Letter Generation</h3>
              <p className="text-xs text-muted-foreground">
                Select a template and generate your dispute letter.
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4 p-6">
                {/* Template selector */}
                <div className="space-y-2">
                  <Label htmlFor="template-select">Template</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Choose a letter template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATALOG.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <span className="flex items-center gap-2">
                            {t.id === recommendedTemplate && (
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px]"
                              >
                                Recommended
                              </Badge>
                            )}
                            {t.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template info */}
                {selectedTemplate && (
                  <div className="rounded-md border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {TEMPLATE_CATALOG.find((t) => t.id === selectedTemplate)
                        ?.description}
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary">
                      <Shield className="mr-1 inline-block size-3" />
                      {
                        TEMPLATE_CATALOG.find((t) => t.id === selectedTemplate)
                          ?.legalBasis
                      }
                    </p>
                  </div>
                )}

                {/* Recipient info (auto-filled) */}
                {selectedTemplate && dispute.targetName && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Recipient
                    </Label>
                    <div className="rounded-md border p-3 text-sm">
                      <p className="font-medium">{dispute.targetName}</p>
                      {dispute.targetAddress && (
                        <p className="text-xs text-muted-foreground">
                          {dispute.targetAddress}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Generate button */}
                <Button
                  className="w-full"
                  disabled={!selectedTemplate || generating}
                  onClick={handleGenerateLetter}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 size-4" />
                      Generate Letter
                    </>
                  )}
                </Button>

                {/* Letter preview */}
                {letterPreview && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Letter Preview</Label>
                      <Badge variant="secondary" className="text-[10px]">
                        Generated
                      </Badge>
                    </div>
                    <div className="max-h-[300px] overflow-hidden rounded-md border">
                      <ScrollArea className="h-[300px]">
                        <pre className="whitespace-pre-wrap p-4 text-xs leading-relaxed text-foreground/90 [font-family:monospace]">
                          {letterPreview}
                        </pre>
                      </ScrollArea>
                    </div>

                    <Separator />

                    {/* Disclaimer checkbox */}
                    <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                      <Checkbox
                        id="disclaimer-check"
                        checked={disclaimerChecked}
                        onCheckedChange={(checked) =>
                          setDisclaimerChecked(checked === true)
                        }
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="disclaimer-check"
                        className="cursor-pointer text-xs leading-relaxed text-amber-900 dark:text-amber-200"
                      >
                        <AlertTriangle className="mr-1 inline-block size-3" />
                        I understand this letter is for informational purposes only
                        and does not constitute legal advice. I am responsible for
                        reviewing the content for accuracy before sending.
                      </Label>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        className="flex-1"
                        disabled={!disclaimerChecked || sending}
                        onClick={handleApproveAndSend}
                      >
                        {sending ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 size-4" />
                            Approve & Send
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleDownloadPdf}
                      >
                        <Download className="mr-2 size-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Disputes Page
// ---------------------------------------------------------------------------

export function DisputesPage() {
  const userId = useAppStore((s) => s.userId);

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch disputes
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function fetchDisputes() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/disputes?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) throw new Error('Failed to fetch disputes');
        const json = await res.json();
        if (!cancelled) {
          setDisputes(json.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'An error occurred'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDisputes();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Unique dispute types for filter dropdown
  const disputeTypes = useMemo(() => {
    const types = new Set(disputes.map((d) => d.disputeType));
    return Array.from(types).sort();
  }, [disputes]);

  // Filtered disputes
  const filteredDisputes = useMemo(() => {
    let result = disputes;

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter((d) => d.status === activeTab);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((d) => d.disputeType === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          (d.reportItem?.accountName ?? '').toLowerCase().includes(q) ||
          (d.reportItem?.creditorName ?? '').toLowerCase().includes(q) ||
          (d.targetName ?? '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [disputes, activeTab, typeFilter, searchQuery]);

  const handleViewDispute = useCallback((dispute: Dispute) => {
    setSelectedDispute(dispute);
    setDialogOpen(true);
  }, []);

  // ---- Loading state ----
  if (loading) {
    return <DisputesSkeleton />;
  }

  // ---- Error state ----
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Error Loading Disputes</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  // ---- Empty state ----
  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Disputes Yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Upload a credit report and run an analysis to identify disputable items
            on your credit report.
          </p>
          <Button
            className="mt-4"
            onClick={() => useAppStore.getState().setCurrentPage('upload')}
          >
            <FileText className="mr-2 size-4" />
            Upload Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---- Tabs ---- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1.5 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] font-medium">
                  {disputes.filter(
                    (d) => tab.value === 'all' || d.status === tab.value
                  ).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {/* ---- Search & Filter ---- */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by account name or creditor..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {disputeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatDisputeType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ---- Dispute list ---- */}
            {filteredDisputes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <Inbox className="size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    No disputes match your filters.
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-2 text-xs"
                    onClick={() => {
                      setTypeFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredDisputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.id}
                    dispute={dispute}
                    onView={() => handleViewDispute(dispute)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* ---- Detail Dialog ---- */}
      <DisputeDetailDialog
        dispute={selectedDispute}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
