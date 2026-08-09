'use client';

import { useEffect, useState } from 'react';
import {
  Scale,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Calculator,
  AlertTriangle,
  Inbox,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  totalDisputes: number;
  activeDisputes: number;
  resolvedDisputes: number;
  deniedDisputes: number;
  pendingDeadlines: number;
  upcomingDeadlines: number;
  totalReports: number;
  documents: number;
  recentActivity: RecentDispute[];
}

interface RecentDispute {
  id: string;
  disputeType: string;
  targetName: string | null;
  status: string;
  confidence: number | null;
  createdAt: string;
  reportItem?: {
    accountName: string | null;
  } | null;
}

interface DeadlineEntry {
  id: string;
  title: string;
  deadlineType: string;
  dueDate: string;
  isCompleted: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatCountdown(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  return `${days} day${days !== 1 ? 's' : ''} left`;
}

function deadlineBadgeColor(days: number): string {
  if (days < 3) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  if (days < 7) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
  return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
}

function disputeStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'resolved') return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
  if (s === 'denied') return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  if (s === 'sent' || s === 'in-progress') return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  if (s === 'draft' || s === 'pending-review') return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
  if (s === 'approved') return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function deadlineTypeLabel(type: string): string {
  if (type === '30-day-investigation') return '30-Day Investigation';
  if (type === '5-day-validation') return '5-Day Validation';
  if (type === 'sol-expiration') return 'SOL Expiration';
  return type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function confidenceBarColor(value: number): string {
  if (value >= 75) return '[&>div]:bg-emerald-500';
  if (value >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
}

// ---------------------------------------------------------------------------
// Stat Cards Skeleton
// ---------------------------------------------------------------------------

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="mt-2 h-8 w-16" />
            <Skeleton className="mt-1 h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  iconBgClass: string;
}

function StatCard({ label, value, icon: Icon, colorClass, iconBgClass }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={cn('flex size-8 items-center justify-center rounded-lg', iconBgClass)}>
            <Icon className={cn('size-4', colorClass)} />
          </div>
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Deadlines Skeleton
// ---------------------------------------------------------------------------

function DeadlinesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table Skeleton
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-2 flex-1" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        <Button
          className="mt-4"
          onClick={() => useAppStore.getState().setCurrentPage('upload')}
        >
          <Upload className="mr-2 size-4" />
          Upload Your First Report
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const userId = useAppStore((s) => s.userId);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const [data, setData] = useState<DashboardData | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [dashRes, dlRes] = await Promise.all([
          fetch(`/api/dashboard?userId=${encodeURIComponent(userId)}`),
          fetch(`/api/deadlines?userId=${encodeURIComponent(userId)}`),
        ]);

        if (!dashRes.ok || !dlRes.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const dashJson = await dashRes.json();
        const dlJson = await dlRes.json();

        if (!cancelled) {
          setData(dashJson.data);
          setDeadlines(dlJson.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Sort deadlines by dueDate ascending
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <StatCardsSkeleton />
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="pt-0">
              <DeadlinesSkeleton />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="pt-0">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Error Loading Dashboard</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error ?? 'No data available'}</p>
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

  // -----------------------------------------------------------------------
  // Empty state (no disputes, no reports)
  // -----------------------------------------------------------------------
  if (data.totalDisputes === 0 && data.totalReports === 0) {
    return (
      <div className="space-y-6">
        <StatCardsSkeleton />
        <EmptyState
          title="Welcome to CreditShield AI"
          description="Upload your first credit report to get started. Our AI will analyze your report, identify issues, and help you create dispute letters backed by federal law."
        />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Full dashboard
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ---- Row 1: Stat Cards ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Disputes"
          value={data.totalDisputes}
          icon={Scale}
          colorClass="text-primary"
          iconBgClass="bg-primary/10"
        />
        <StatCard
          label="Active Disputes"
          value={data.activeDisputes}
          icon={Clock}
          colorClass="text-amber-600 dark:text-amber-400"
          iconBgClass="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          label="Resolved"
          value={data.resolvedDisputes}
          icon={CheckCircle}
          colorClass="text-emerald-600 dark:text-emerald-400"
          iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          label="Denied"
          value={data.deniedDisputes}
          icon={XCircle}
          colorClass="text-red-600 dark:text-red-400"
          iconBgClass="bg-red-100 dark:bg-red-900/30"
        />
      </div>

      {/* ---- Row 2: Deadlines + Quick Actions ---- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Deadlines */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-amber-500" />
              Upcoming Deadlines
              {data.pendingDeadlines > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  {data.pendingDeadlines} pending
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Deadlines sorted by urgency</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {sortedDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="size-8 text-emerald-500" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  No pending deadlines — you&apos;re all caught up!
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[320px]">
                <div className="space-y-2">
                  {sortedDeadlines.map((dl) => {
                    const days = daysUntil(dl.dueDate);
                    return (
                      <div
                        key={dl.id}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div
                          className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            days < 3
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : days < 7
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          )}
                        >
                          {days < 0 ? '!' : days}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{dl.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deadlineTypeLabel(dl.deadlineType)} &middot; Due {formatDate(dl.dueDate)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn('shrink-0 text-[11px]', deadlineBadgeColor(days))}
                        >
                          {formatCountdown(days)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setCurrentPage('upload')}
              >
                <Upload className="size-4 text-primary" />
                Upload Report
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setCurrentPage('disputes')}
              >
                <FileText className="size-4 text-blue-500" />
                New Dispute
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setCurrentPage('calculator')}
              >
                <Calculator className="size-4 text-amber-500" />
                Check SOL
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Total Reports</span>
                <span className="font-medium text-foreground">{data.totalReports}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Documents</span>
                <span className="font-medium text-foreground">{data.documents}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Row 3: Recent Activity ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Last {data.recentActivity.length} dispute{data.recentActivity.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {data.recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No recent activity to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">Account Name</TableHead>
                    <TableHead className="min-w-[130px]">Dispute Type</TableHead>
                    <TableHead className="min-w-[120px]">Target</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[120px]">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentActivity.map((dispute) => {
                    const conf = dispute.confidence ?? 0;
                    return (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">
                          {dispute.reportItem?.accountName ?? 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground capitalize">
                            {dispute.disputeType.replace(/-/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{dispute.targetName ?? 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-[11px] capitalize', disputeStatusColor(dispute.status))}
                          >
                            {dispute.status.replace(/-/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(dispute.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={conf}
                              className={cn('h-2 w-16', confidenceBarColor(conf))}
                            />
                            <span className="text-xs text-muted-foreground">{conf}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
