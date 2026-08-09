'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Clock,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  List,
  GitBranch,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeadlineDispute {
  id: string;
  disputeType: string;
  status: string;
  targetName: string | null;
  reportItem?: {
    accountName: string | null;
    creditorName: string | null;
  } | null;
}

interface Deadline {
  id: string;
  title: string;
  deadlineType: string;
  dueDate: string;
  isCompleted: boolean;
  completedDate: string | null;
  dispute: DeadlineDispute;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(dueDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatCountdown(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  return `${days} day${days !== 1 ? 's' : ''} remaining`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function deadlineTypeLabel(type: string): string {
  if (type === '30-day-investigation') return '30-Day Investigation';
  if (type === '5-day-validation') return '5-Day Validation';
  if (type === 'sol-expiration') return 'SOL Expiration';
  return type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function deadlineTypeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('30-day') || t.includes('investigation'))
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  if (t.includes('5-day') || t.includes('validation'))
    return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
  if (t.includes('sol'))
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700';
}

function urgencyColor(days: number): string {
  if (days < 0) return 'text-red-600 dark:text-red-400';
  if (days < 7) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

function urgencyDotColor(days: number, isCompleted: boolean): string {
  if (isCompleted) return 'bg-emerald-500';
  if (days < 0) return 'bg-red-500';
  if (days < 7) return 'bg-amber-500';
  return 'bg-blue-500';
}

function urgencyLineColor(days: number, isCompleted: boolean): string {
  if (isCompleted) return 'bg-emerald-200 dark:bg-emerald-800';
  if (days < 0) return 'bg-red-200 dark:bg-red-800';
  if (days < 7) return 'bg-amber-200 dark:bg-amber-800';
  return 'bg-slate-200 dark:bg-slate-700';
}

function daysBadgeColor(days: number): string {
  if (days < 0) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  if (days === 0) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
  if (days < 7) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
  return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
}

// ---------------------------------------------------------------------------
// Summary stat card
// ---------------------------------------------------------------------------

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  iconBgClass: string;
}

function SummaryCard({ label, value, icon: Icon, colorClass, iconBgClass }: SummaryCardProps) {
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
// Summary skeleton
// ---------------------------------------------------------------------------

function SummarySkeleton() {
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
// Timeline view skeleton
// ---------------------------------------------------------------------------

function TimelineSkeleton() {
  return (
    <Card>
      <CardContent className="pt-0">
        <div className="space-y-6 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="mt-1 w-0.5 flex-1" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Timeline view
// ---------------------------------------------------------------------------

function TimelineView({
  deadlines,
  onMarkComplete,
  markingId,
}: {
  deadlines: Deadline[];
  onMarkComplete: (id: string) => void;
  markingId: string | null;
}) {
  if (deadlines.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Deadlines</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Deadlines will appear here once you have active disputes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-0">
        <div className="relative space-y-0 py-4">
          {deadlines.map((deadline, index) => {
            const days = daysUntil(deadline.dueDate);
            const isLast = index === deadlines.length - 1;
            const accountName = deadline.dispute?.reportItem?.accountName ?? 'Unknown Account';
            const creditorName = deadline.dispute?.reportItem?.creditorName ?? deadline.dispute?.targetName ?? 'Unknown Creditor';

            return (
              <div key={deadline.id} className="flex gap-4">
                {/* Vertical line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'mt-1.5 size-4 shrink-0 rounded-full border-2 border-white ring-2 dark:border-slate-900',
                      urgencyDotColor(days, deadline.isCompleted),
                      deadline.isCompleted ? 'ring-emerald-200 dark:ring-emerald-800' : days < 0 ? 'ring-red-200 dark:ring-red-800' : days < 7 ? 'ring-amber-200 dark:ring-amber-800' : 'ring-blue-200 dark:ring-blue-800'
                    )}
                  >
                    {deadline.isCompleted && (
                      <Check className="size-2.5 text-white" />
                    )}
                  </div>
                  {!isLast && (
                    <div className={cn('mt-1 w-0.5 flex-1 min-h-[24px]', urgencyLineColor(days, deadline.isCompleted))} />
                  )}
                </div>

                {/* Content */}
                <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                  {/* Date header */}
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDate(deadline.dueDate)}
                  </p>

                  {/* Title + type badge */}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className={cn(
                      'text-sm font-semibold',
                      deadline.isCompleted && 'line-through text-muted-foreground'
                    )}>
                      {deadline.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px]', deadlineTypeColor(deadline.deadlineType))}
                    >
                      {deadlineTypeLabel(deadline.deadlineType)}
                    </Badge>
                  </div>

                  {/* Related dispute info */}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {accountName}{creditorName !== accountName ? ` · ${creditorName}` : ''}
                  </p>

                  {/* Countdown */}
                  <div className="mt-2 flex items-center gap-3">
                    {deadline.isCompleted ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 text-[11px]"
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        Completed
                      </Badge>
                    ) : (
                      <>
                        <Badge
                          variant="outline"
                          className={cn('text-[11px]', daysBadgeColor(days))}
                        >
                          <Clock className="mr-1 size-3" />
                          {formatCountdown(days)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={markingId === deadline.id}
                          onClick={() => onMarkComplete(deadline.id)}
                        >
                          {markingId === deadline.id ? (
                            <span className="flex items-center gap-1">
                              <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Updating...
                            </span>
                          ) : (
                            <>
                              <Check className="mr-1 size-3" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// List view (table)
// ---------------------------------------------------------------------------

function ListView({
  deadlines,
  onMarkComplete,
  markingId,
  sortDir,
  onToggleSort,
}: {
  deadlines: Deadline[];
  onMarkComplete: (id: string) => void;
  markingId: string | null;
  sortDir: 'asc' | 'desc';
  onToggleSort: () => void;
}) {
  if (deadlines.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Deadlines</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Deadlines will appear here once you have active disputes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Deadline</TableHead>
                <TableHead className="min-w-[150px]">Type</TableHead>
                <TableHead className="min-w-[160px]">Dispute</TableHead>
                <TableHead
                  className="min-w-[120px] cursor-pointer select-none"
                  onClick={onToggleSort}
                >
                  <span className="flex items-center gap-1">
                    Due Date
                    <span className="text-xs text-muted-foreground">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  </span>
                </TableHead>
                <TableHead className="min-w-[100px]">Days Left</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[130px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines.map((deadline) => {
                const days = daysUntil(deadline.dueDate);
                const accountName = deadline.dispute?.reportItem?.accountName ?? 'Unknown Account';
                const creditorName = deadline.dispute?.reportItem?.creditorName ?? deadline.dispute?.targetName ?? 'Unknown Creditor';

                return (
                  <TableRow key={deadline.id}>
                    <TableCell className="font-medium">{deadline.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px]', deadlineTypeColor(deadline.deadlineType))}
                      >
                        {deadlineTypeLabel(deadline.deadlineType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{accountName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{creditorName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(deadline.dueDate)}</span>
                    </TableCell>
                    <TableCell>
                      {deadline.isCompleted ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <span className={cn('text-sm font-medium', urgencyColor(days))}>
                          {formatCountdown(days)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {deadline.isCompleted ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 text-[11px]"
                        >
                          <CheckCircle2 className="mr-1 size-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn('text-[11px]', daysBadgeColor(days))}
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!deadline.isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={markingId === deadline.id}
                          onClick={() => onMarkComplete(deadline.id)}
                        >
                          {markingId === deadline.id ? (
                            <span className="flex items-center gap-1">
                              <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Updating...
                            </span>
                          ) : (
                            <>
                              <Check className="mr-1 size-3" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Deadlines Page
// ---------------------------------------------------------------------------

export function DeadlinesPage() {
  const userId = useAppStore((s) => s.userId);

  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Fetch deadlines on mount
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function fetchDeadlines() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/deadlines?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error('Failed to fetch deadlines');
        const json = await res.json();
        if (!cancelled) {
          setDeadlines(json.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDeadlines();
    return () => { cancelled = true; };
  }, [userId]);

  // Mark deadline as complete
  const handleMarkComplete = useCallback(async (id: string) => {
    setMarkingId(id);
    try {
      const res = await fetch('/api/deadlines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isCompleted: true }),
      });
      if (!res.ok) throw new Error('Failed to update deadline');

      // Update local state optimistically
      setDeadlines((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isCompleted: true } : d))
      );

      toast.success('Deadline marked as complete!');
    } catch (err) {
      console.error('Mark complete error:', err);
      toast.error('Failed to update deadline. Please try again.');
    } finally {
      setMarkingId(null);
    }
  }, []);

  // Toggle sort direction
  const handleToggleSort = useCallback(() => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Sorted deadlines (by due date)
  const sortedDeadlines = useMemo(() => {
    return [...deadlines].sort((a, b) => {
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [deadlines, sortDir]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const total = deadlines.length;
    const overdue = deadlines.filter((d) => !d.isCompleted && daysUntil(d.dueDate) < 0).length;
    const dueThisWeek = deadlines.filter(
      (d) => !d.isCompleted && daysUntil(d.dueDate) >= 0 && daysUntil(d.dueDate) <= 7
    ).length;
    const completed = deadlines.filter((d) => d.isCompleted).length;

    return { total, overdue, dueThisWeek, completed };
  }, [deadlines]);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="space-y-6">
        <SummarySkeleton />
        <TimelineSkeleton />
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Error Loading Deadlines</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ---- Summary Cards ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Total Deadlines"
          value={summaryStats.total}
          icon={CalendarClock}
          colorClass="text-primary"
          iconBgClass="bg-primary/10"
        />
        <SummaryCard
          label="Overdue"
          value={summaryStats.overdue}
          icon={AlertTriangle}
          colorClass="text-red-600 dark:text-red-400"
          iconBgClass="bg-red-100 dark:bg-red-900/30"
        />
        <SummaryCard
          label="Due This Week"
          value={summaryStats.dueThisWeek}
          icon={Clock}
          colorClass="text-amber-600 dark:text-amber-400"
          iconBgClass="bg-amber-100 dark:bg-amber-900/30"
        />
        <SummaryCard
          label="Completed"
          value={summaryStats.completed}
          icon={CheckCircle2}
          colorClass="text-emerald-600 dark:text-emerald-400"
          iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
        />
      </div>

      {/* ---- View Toggle ---- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">All Deadlines</h2>
          <Badge variant="secondary" className="text-[11px]">
            {deadlines.length} total
          </Badge>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(val) => {
            if (val) setViewMode(val as 'timeline' | 'list');
          }}
          variant="outline"
        >
          <ToggleGroupItem value="timeline" className="gap-1.5 text-xs">
            <GitBranch className="size-3.5" />
            Timeline
          </ToggleGroupItem>
          <ToggleGroupItem value="list" className="gap-1.5 text-xs">
            <List className="size-3.5" />
            List
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ---- View Content ---- */}
      {viewMode === 'timeline' ? (
        <TimelineView
          deadlines={sortedDeadlines}
          onMarkComplete={handleMarkComplete}
          markingId={markingId}
        />
      ) : (
        <ListView
          deadlines={sortedDeadlines}
          onMarkComplete={handleMarkComplete}
          markingId={markingId}
          sortDir={sortDir}
          onToggleSort={handleToggleSort}
        />
      )}
    </div>
  );
}
