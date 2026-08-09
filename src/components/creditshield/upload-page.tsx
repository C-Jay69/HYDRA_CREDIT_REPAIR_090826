'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  Brain,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  ShieldCheck,
  Flag,
  DollarSign,
  CheckCircle2,
  Loader2,
  Inbox,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface ReportItem {
  id: string; // local unique key
  accountName: string;
  accountNumber: string;
  creditorName: string;
  balance: string;
  originalAmount: string;
  dateOpened: string;
  dateClosed: string;
  dateDelinquent: string;
  status: string;
  accountType: string;
  isMedical: boolean;
  isAuthorizedUser: boolean;
  flaggedUnknown: boolean;
  flaggedBalance: boolean;
}

interface AnalyzedItemResult {
  reportItemId: string;
  issues: AnalysisIssue[];
  scoreImpact: string;
}

interface AnalysisIssue {
  category: string;
  description: string;
  recommendedAction: string;
  legalBasis: string;
  confidence: number;
  disputeType: string;
  strategy: string | null;
}

interface AnalysisResponse {
  data: {
    analysis: {
      items: AnalyzedItemResult[];
    };
    disputesCreated: number;
    disputes: Array<{ id: string }>;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPORT_SOURCES = [
  { value: 'experian', label: 'Experian' },
  { value: 'equifax', label: 'Equifax' },
  { value: 'transunion', label: 'TransUnion' },
  { value: 'annualcreditreport.com', label: 'AnnualCreditReport.com' },
];

const ACCOUNT_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'paid', label: 'Paid' },
  { value: 'charged-off', label: 'Charged-Off' },
  { value: 'in-collections', label: 'In Collections' },
  { value: 'late', label: 'Late' },
];

const ACCOUNT_TYPES = [
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'medical', label: 'Medical' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'student-loan', label: 'Student Loan' },
  { value: 'other', label: 'Other' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
];

const CATEGORY_COLORS: Record<string, string> = {
  outdated: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  duplicate: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'medical-debt': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'sold-debt': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'authorized-user-negative': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'double-negative': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'identity-theft': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
};

function categoryLabel(cat: string): string {
  return cat
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function confidenceColor(val: number): string {
  if (val >= 75) return '[&>div]:bg-emerald-500';
  if (val >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
}

function createEmptyItem(): ReportItem {
  return {
    id: crypto.randomUUID(),
    accountName: '',
    accountNumber: '',
    creditorName: '',
    balance: '',
    originalAmount: '',
    dateOpened: '',
    dateClosed: '',
    dateDelinquent: '',
    status: 'open',
    accountType: 'credit-card',
    isMedical: false,
    isAuthorizedUser: false,
    flaggedUnknown: false,
    flaggedBalance: false,
  };
}

// ---------------------------------------------------------------------------
// Progress Stepper
// ---------------------------------------------------------------------------

function ProgressStepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Upload', icon: Upload },
    { num: 2, label: 'Review', icon: FileText },
    { num: 3, label: 'Analyze', icon: Brain },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;
        const Icon = step.icon;

        return (
          <div key={step.num} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  'h-0.5 w-8 md:w-16 transition-colors',
                  currentStep > step.num ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Upload
// ---------------------------------------------------------------------------

function Step1Upload({
  items,
  setItems,
  reportSource,
  setReportSource,
  uploadedFile,
  setUploadedFile,
  onNext,
}: {
  items: ReportItem[];
  setItems: React.Dispatch<React.SetStateAction<ReportItem[]>>;
  reportSource: string;
  setReportSource: (v: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (v: File | null) => void;
  onNext: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ReportItem, value: string | boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setUploadedFile(files[0]);
    }
  }, [setUploadedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const hasValidItems = items.some(
    (item) => item.accountName.trim().length > 0
  );

  const fileName = uploadedFile?.name ?? null;

  return (
    <div className="space-y-6">
      {/* Report Source */}
      <div>
        <Label className="text-sm font-medium">Report Source</Label>
        <Select value={reportSource} onValueChange={setReportSource}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue placeholder="Select a credit bureau or source" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_SOURCES.map((src) => (
              <SelectItem key={src.value} value={src.value}>
                {src.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Drag & Drop Zone */}
      <div>
        <Label className="text-sm font-medium">Upload Credit Report (PDF)</Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          {fileName ? (
            <>
              <CheckCircle2 className="size-10 text-emerald-500" />
              <p className="mt-3 text-sm font-medium">{fileName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF ready for upload. Now add the accounts from your report below so they can be analyzed.
              </p>
            </>
          ) : (
            <>
              <Upload className="size-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                Drop your credit report here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF files only. Maximum 25MB.
              </p>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Manual Entry */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Manual Entry</Label>
            <p className="text-xs text-muted-foreground">
              Enter report items from your credit report manually
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="mr-1 size-4" />
            Add Item
          </Button>
        </div>

        {items.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No items added yet. Click &quot;Add Item&quot; to begin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="mt-3 max-h-[500px]">
            <div className="space-y-4">
              {items.map((item, idx) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Item #{idx + 1}
                      </CardTitle>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Account Name */}
                      <div className="space-y-1">
                        <Label className="text-xs">Account Name *</Label>
                        <Input
                          placeholder="e.g. Chase Sapphire"
                          value={item.accountName}
                          onChange={(e) => updateItem(item.id, 'accountName', e.target.value)}
                        />
                      </div>
                      {/* Account Number */}
                      <div className="space-y-1">
                        <Label className="text-xs">Account Number</Label>
                        <Input
                          placeholder="e.g. ****1234"
                          value={item.accountNumber}
                          onChange={(e) => updateItem(item.id, 'accountNumber', e.target.value)}
                        />
                      </div>
                      {/* Creditor Name */}
                      <div className="space-y-1">
                        <Label className="text-xs">Creditor Name</Label>
                        <Input
                          placeholder="e.g. JPMorgan Chase"
                          value={item.creditorName}
                          onChange={(e) => updateItem(item.id, 'creditorName', e.target.value)}
                        />
                      </div>
                      {/* Balance */}
                      <div className="space-y-1">
                        <Label className="text-xs">Current Balance ($)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.balance}
                          onChange={(e) => updateItem(item.id, 'balance', e.target.value)}
                        />
                      </div>
                      {/* Original Amount */}
                      <div className="space-y-1">
                        <Label className="text-xs">Original Amount ($)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.originalAmount}
                          onChange={(e) => updateItem(item.id, 'originalAmount', e.target.value)}
                        />
                      </div>
                      {/* Status */}
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select value={item.status} onValueChange={(v) => updateItem(item.id, 'status', v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Account Type */}
                      <div className="space-y-1">
                        <Label className="text-xs">Account Type</Label>
                        <Select value={item.accountType} onValueChange={(v) => updateItem(item.id, 'accountType', v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Date Opened */}
                      <div className="space-y-1">
                        <Label className="text-xs">Date Opened</Label>
                        <Input
                          type="date"
                          value={item.dateOpened}
                          onChange={(e) => updateItem(item.id, 'dateOpened', e.target.value)}
                        />
                      </div>
                      {/* Date Closed */}
                      <div className="space-y-1">
                        <Label className="text-xs">Date Closed</Label>
                        <Input
                          type="date"
                          value={item.dateClosed}
                          onChange={(e) => updateItem(item.id, 'dateClosed', e.target.value)}
                        />
                      </div>
                      {/* Date Delinquent */}
                      <div className="space-y-1">
                        <Label className="text-xs">Date Delinquent</Label>
                        <Input
                          type="date"
                          value={item.dateDelinquent}
                          onChange={(e) => updateItem(item.id, 'dateDelinquent', e.target.value)}
                        />
                      </div>
                      {/* Checkboxes */}
                      <div className="flex items-center gap-6 sm:col-span-2 lg:col-span-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`medical-${item.id}`}
                            checked={item.isMedical}
                            onCheckedChange={(v) => updateItem(item.id, 'isMedical', !!v)}
                          />
                          <Label htmlFor={`medical-${item.id}`} className="text-xs cursor-pointer">
                            Medical Debt
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`auth-${item.id}`}
                            checked={item.isAuthorizedUser}
                            onCheckedChange={(v) => updateItem(item.id, 'isAuthorizedUser', !!v)}
                          />
                          <Label htmlFor={`auth-${item.id}`} className="text-xs cursor-pointer">
                            Authorized User
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Add Another Item */}
        {items.length > 0 && (
          <Button
            variant="outline"
            className="mt-3 w-full border-dashed"
            onClick={addItem}
          >
            <Plus className="mr-2 size-4" />
            Add Another Item
          </Button>
        )}
      </div>

      <Separator />

      {/* Next Button */}
      <div className="flex justify-end">
        <Button
          disabled={!reportSource || !hasValidItems}
          onClick={onNext}
        >
          Review Items
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Review
// ---------------------------------------------------------------------------

function Step2Review({
  items,
  setItems,
  reportSource,
  uploadedFile,
  jurisdiction,
  setJurisdiction,
  country,
  setCountry,
  onBack,
  onAnalyze,
  analyzing,
}: {
  items: ReportItem[];
  setItems: React.Dispatch<React.SetStateAction<ReportItem[]>>;
  reportSource: string;
  uploadedFile: string | null;
  jurisdiction: string;
  setJurisdiction: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
  analyzing: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ReportItem | null>(null);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const startEdit = (item: ReportItem) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem(null);
  };

  const saveEdit = () => {
    if (!editItem) return;
    setItems((prev) =>
      prev.map((item) => (item.id === editItem.id ? editItem : item))
    );
    setEditingId(null);
    setEditItem(null);
  };

  const toggleFlag = (id: string, field: 'flaggedUnknown' | 'flaggedBalance') => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const isEditing = (id: string) => editingId === id;

  return (
    <div className="space-y-6">
      {/* Jurisdiction selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Jurisdiction</CardTitle>
          <CardDescription>
            Select your state or province for accurate legal analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {country === 'CA' ? 'Province' : 'State'}
              </Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      country === 'CA'
                        ? 'Select a province'
                        : 'Select a state'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {country === 'US' ? (
                    <SelectGroup>
                      <SelectLabel>U.S. States</SelectLabel>
                      {US_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : (
                    <SelectGroup>
                      <SelectLabel>Canadian Provinces</SelectLabel>
                      {CANADIAN_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded File Info */}
      {uploadedFile && (
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <FileText className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{uploadedFile}</p>
              <p className="text-xs text-muted-foreground">
                Source: {reportSource ? reportSource.charAt(0).toUpperCase() + reportSource.slice(1) : 'Unknown'}{' - '}{items.length} item{items.length !== 1 ? 's' : ''} entered for analysis
              </p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 shrink-0">
              Uploaded
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Report Items ({items.length})
          </CardTitle>
          <CardDescription>
            Review your items. Flag items you don&apos;t recognize or believe have
            incorrect balances.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Unknown?</TableHead>
                  <TableHead className="text-center">Bad Balance?</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {isEditing(item.id) ? (
                        <Input
                          className="h-8 w-40"
                          value={editItem?.accountName ?? ''}
                          onChange={(e) =>
                            setEditItem((prev) =>
                              prev ? { ...prev, accountName: e.target.value } : null
                            )
                          }
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-sm">{item.accountName || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground">{item.creditorName}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing(item.id) ? (
                        <Select
                          value={editItem?.status ?? 'open'}
                          onValueChange={(v) =>
                            setEditItem((prev) =>
                              prev ? { ...prev, status: v } : null
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[11px] capitalize"
                        >
                          {item.status.replace(/-/g, ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing(item.id) ? (
                        <Input
                          type="number"
                          className="h-8 w-24"
                          value={editItem?.balance ?? ''}
                          onChange={(e) =>
                            setEditItem((prev) =>
                              prev ? { ...prev, balance: e.target.value } : null
                            )
                          }
                        />
                      ) : (
                        <span className="text-sm">
                          {item.balance ? `$${Number(item.balance).toLocaleString()}` : '—'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {item.accountType.replace(/-/g, ' ')}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleFlag(item.id, 'flaggedUnknown')}
                        className={cn(
                          'inline-flex size-7 items-center justify-center rounded-full transition-colors',
                          item.flaggedUnknown
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                        title="Flag as unknown (possible identity theft)"
                      >
                        <Flag className="size-3.5" />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleFlag(item.id, 'flaggedBalance')}
                        className={cn(
                          'inline-flex size-7 items-center justify-center rounded-full transition-colors',
                          item.flaggedBalance
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                        title="Flag as incorrect balance"
                      >
                        <DollarSign className="size-3.5" />
                      </button>
                    </TableCell>
                    <TableCell>
                      {isEditing(item.id) ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                            onClick={saveEdit}
                          >
                            <CheckCircle2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            onClick={cancelEdit}
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => startEdit(item)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                No report items added yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                {uploadedFile
                  ? 'Your PDF was received, but items must be entered manually for analysis. Go back to add items from your credit report.'
                  : 'Go back and add the accounts from your credit report manually.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onBack}
              >
                <Plus className="mr-1.5 size-3.5" />
                Add Items
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flag Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Flag className="size-3 text-red-500" />
          <span>Flagged Unknown = Possible identity theft</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="size-3 text-amber-500" />
          <span>Flagged Balance = Believed incorrect</span>
        </div>
      </div>

      {/* Navigation */}
      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={analyzing}>
          <ChevronLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button onClick={onAnalyze} disabled={items.length === 0 || analyzing}>
          {analyzing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2 size-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Analysis Results
// ---------------------------------------------------------------------------

function Step3Results({
  items,
  analysisData,
  onBack,
  onNewReport,
}: {
  items: ReportItem[];
  analysisData: AnalysisResponse;
  onBack: () => void;
  onNewReport: () => void;
}) {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const analysisItems = analysisData.data.analysis.items;

  // Compute summary
  const totalIssues = analysisItems.reduce((sum, a) => sum + a.issues.length, 0);
  const highConfidence = analysisItems.reduce(
    (sum, a) => sum + a.issues.filter((i) => i.confidence >= 75).length,
    0
  );
  const itemsWithIssues = analysisItems.filter((a) => a.issues.length > 0).length;

  const getItemName = (reportItemId: string) => {
    const item = items.find((i) => i.id === reportItemId);
    return item?.accountName ?? 'Unknown Account';
  };

  const getItemStatus = (reportItemId: string) => {
    const item = items.find((i) => i.id === reportItemId);
    return item?.status ?? 'unknown';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalIssues}</p>
                <p className="text-xs text-muted-foreground">Issues Found</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <ShieldCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highConfidence}</p>
                <p className="text-xs text-muted-foreground">High Confidence</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{itemsWithIssues}</p>
                <p className="text-xs text-muted-foreground">Items Need Attention</p>
              </div>
            </div>
          </div>
          {analysisData.data.disputesCreated > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-foreground">
                {analysisData.data.disputesCreated} dispute
                {analysisData.data.disputesCreated !== 1 ? 's' : ''}
              </strong>{' '}
              created automatically and can be found in the Disputes page.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Per-item results */}
      {analysisItems.map((analyzed) => {
        if (analyzed.issues.length === 0) return null;

        return (
          <Card key={analyzed.reportItemId}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">
                  {getItemName(analyzed.reportItemId)}
                </CardTitle>
                <Badge variant="outline" className="text-[11px] capitalize">
                  {getItemStatus(analyzed.reportItemId).replace(/-/g, ' ')}
                </Badge>
              </div>
              <CardDescription>
                {analyzed.issues.length} issue{analyzed.issues.length !== 1 ? 's' : ''} detected
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {analyzed.issues.map((issue, issueIdx) => (
                <div
                  key={`${analyzed.reportItemId}-${issueIdx}`}
                  className="rounded-lg border p-4 space-y-3"
                >
                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[11px]',
                        CATEGORY_COLORS[issue.category] ?? 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {categoryLabel(issue.category)}
                    </Badge>
                    <div className="flex items-center gap-2 ml-auto">
                      <Progress
                        value={issue.confidence}
                        className={cn('h-2 w-20', confidenceColor(issue.confidence))}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {issue.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm">{issue.description}</p>

                  {/* Recommended Action */}
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Recommended Action
                    </p>
                    <p className="text-sm">{issue.recommendedAction}</p>
                  </div>

                  {/* Legal Basis */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Legal Basis
                    </p>
                    <p className="text-xs text-muted-foreground">{issue.legalBasis}</p>
                  </div>

                  {/* Create Dispute */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage('disputes')}
                  >
                    <FileText className="mr-1.5 size-3.5" />
                    View in Disputes
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Clean Report Message */}
      {totalIssues === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <ShieldCheck className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Report Looks Clean</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Our AI analysis didn&apos;t find any common dispute issues on this report.
              You can still manually create disputes from the Disputes page if you
              believe there are errors.
            </p>
            <Button
              className="mt-4"
              onClick={() => setCurrentPage('disputes')}
            >
              <FileText className="mr-2 size-4" />
              Go to Disputes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Review
        </Button>
        <Button onClick={onNewReport}>
          <Upload className="mr-2 size-4" />
          Upload Another Report
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload Page (main export)
// ---------------------------------------------------------------------------

export function UploadPage() {
  const userId = useAppStore((s) => s.userId);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 state
  const [items, setItems] = useState<ReportItem[]>([]);
  const [reportSource, setReportSource] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Step 2 state
  const [jurisdiction, setJurisdiction] = useState('');
  const [country, setCountry] = useState('US');

  // Step 3 state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Step 1 -> Step 2
  const handleNext = () => {
    setStep(2);
  };

  // Step 2 -> Step 1
  const handleBackToStep1 = () => {
    setStep(1);
  };

  // Run analysis: Step 2 -> Step 3
  const handleAnalyze = async () => {
    if (!userId) return;

    setAnalyzing(true);
    setAnalysisError(null);
    setUploadProgress(0);

    try {
      // 1. Create the credit report via API with file upload
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('reportSource', reportSource);
      formData.append('status', 'uploaded');
      formData.append('items', JSON.stringify(items.map((item) => ({
        accountName: item.accountName,
        accountNumber: item.accountNumber || undefined,
        creditorName: item.creditorName || undefined,
        balance: item.balance ? parseFloat(item.balance) : undefined,
        originalAmount: item.originalAmount ? parseFloat(item.originalAmount) : undefined,
        dateOpened: item.dateOpened || undefined,
        dateClosed: item.dateClosed || undefined,
        dateDelinquent: item.dateDelinquent || undefined,
        status: item.status,
        accountType: item.accountType || undefined,
        isMedical: item.isMedical,
        isAuthorizedUser: item.isAuthorizedUser,
      }))));

      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null || prev >= 90) return prev ?? 90;
          return prev + 10;
        });
      }, 100);

      const createRes = await fetch('/api/credit-reports', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!createRes.ok) {
        throw new Error('Failed to create credit report');
      }

      const createJson = await createRes.json();
      const reportId = createJson.data.id;

      // 2. Run analysis
      const analyzeRes = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          userId,
          jurisdiction,
          country,
        }),
      });

      if (!analyzeRes.ok) {
        throw new Error('Failed to analyze credit report');
      }

      const analyzeJson = await analyzeRes.json();
      setAnalysisData(analyzeJson);
      setStep(3);
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      );
    } finally {
      setAnalyzing(false);
      setUploadProgress(null);
    }
  };

  // Reset for new report
  const handleNewReport = () => {
    setStep(1);
    setItems([]);
    setReportSource('');
    setUploadedFile(null);
    setJurisdiction('');
    setCountry('US');
    setAnalysisData(null);
    setAnalysisError(null);
  };

  // Step 3 -> Step 2
  const handleBackToStep2 = () => {
    setStep(2);
  };

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center py-4">
        <ProgressStepper currentStep={step} />
      </div>

      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="w-full max-w-2xl mx-auto">
          <Progress value={uploadProgress} className="h-2" />
          <p className="mt-1 text-xs text-center text-muted-foreground">
            {uploadProgress < 100 ? `Uploading and parsing PDF... ${uploadProgress}%` : 'Upload complete. Analyzing...'}
          </p>
        </div>
      )}

      {/* Step title */}
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight">
          {step === 1 && 'Upload Credit Report'}
          {step === 2 && 'Review Report Items'}
          {step === 3 && 'Analysis Results'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 && 'Add your credit report items for AI-powered analysis'}
          {step === 2 && 'Verify your data and flag any suspicious items'}
          {step === 3 && 'Issues found by our legal analysis engine'}
        </p>
      </div>

      {/* Analysis Error */}
      {analysisError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-start gap-3 pt-0">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Analysis Error
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {analysisError}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {step === 1 && (
        <Step1Upload
          items={items}
          setItems={setItems}
          reportSource={reportSource}
          setReportSource={setReportSource}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          onNext={handleNext}
        />
      )}

      {step === 2 && (
        <Step2Review
          items={items}
          setItems={setItems}
          reportSource={reportSource}
          uploadedFile={uploadedFile?.name ?? null}
          jurisdiction={jurisdiction}
          setJurisdiction={setJurisdiction}
          country={country}
          setCountry={setCountry}
          onBack={handleBackToStep1}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
        />
      )}

      {step === 3 && analysisData && (
        <Step3Results
          items={items}
          analysisData={analysisData}
          onBack={handleBackToStep2}
          onNewReport={handleNewReport}
        />
      )}
    </div>
  );
}
