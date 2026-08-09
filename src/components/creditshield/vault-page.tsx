'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Upload,
  Search,
  FileText,
  ImageIcon,
  File,
  Trash2,
  FolderOpen,
  X,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DocumentCategory =
  | 'credit-report'
  | 'dispute-letter'
  | 'collection-notice'
  | 'police-report'
  | 'ftc-report'
  | 'payment-proof'
  | 'other';

interface VaultDocument {
  id: string;
  userId: string;
  fileName: string;
  category: DocumentCategory;
  description: string;
  relatedDisputeId?: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  'credit-report': 'Credit Report',
  'dispute-letter': 'Dispute Letter',
  'collection-notice': 'Collection Notice',
  'police-report': 'Police Report',
  'ftc-report': 'FTC Report',
  'payment-proof': 'Payment Proof',
  other: 'Other',
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  'credit-report': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'dispute-letter': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'collection-notice': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'police-report': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'ftc-report': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'payment-proof': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
};

const FILTER_OPTIONS: { value: DocumentCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'credit-report', label: 'Credit Reports' },
  { value: 'dispute-letter', label: 'Dispute Letters' },
  { value: 'collection-notice', label: 'Collection Notices' },
  { value: 'police-report', label: 'Police Reports' },
  { value: 'ftc-report', label: 'FTC Reports' },
  { value: 'payment-proof', label: 'Payment Proof' },
  { value: 'other', label: 'Other' },
];

function getFileType(fileName: string): 'pdf' | 'image' | 'text' {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'].some((ext) => lower.endsWith(ext)))
    return 'image';
  return 'text';
}

function getFileIcon(type: 'pdf' | 'image' | 'text') {
  switch (type) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />;
    case 'image':
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    case 'text':
      return <File className="h-8 w-8 text-green-500" />;
  }
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + '...';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VaultPage() {
  const userId = useAppStore((s) => s.userId);

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    fileName: '',
    category: 'credit-report' as DocumentCategory,
    description: '',
    relatedDisputeId: '',
  });
  const [uploading, setUploading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<VaultDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : data.documents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchDocuments();
  }, [userId, fetchDocuments]);

  // Upload handler
  const handleUpload = async () => {
    if (!uploadForm.fileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }
    setUploading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...uploadForm, userId }),
      });
      if (!res.ok) throw new Error('Failed to upload document');
      toast.success('Document uploaded successfully');
      setUploadOpen(false);
      setUploadForm({ fileName: '', category: 'credit-report', description: '', relatedDisputeId: '' });
      fetchDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete document');
      toast.success('Document deleted');
      setDeleteTarget(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and search
  const filteredDocs = documents.filter((doc) => {
    if (activeFilter !== 'all' && doc.category !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.fileName.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header + Upload */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Document Vault</h2>
          <p className="text-sm text-muted-foreground">
            Manage your credit repair documents, letters, and evidence.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={activeFilter === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <X className="h-10 w-10 text-destructive" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchDocuments}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && documents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="rounded-full bg-muted p-4">
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">No documents yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload your credit reports, dispute letters, and supporting documents to get started.
              </p>
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filtered Empty State */}
      {!loading && !error && documents.length > 0 && filteredDocs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No documents match your current filter.</p>
            <Button variant="outline" size="sm" onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Document Grid */}
      {!loading && !error && filteredDocs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filteredDocs.map((doc) => {
            const fileType = getFileType(doc.fileName);
            return (
              <Card
                key={doc.id}
                className="group relative transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4 space-y-3">
                  {/* File Icon + Delete */}
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-muted p-2">
                      {getFileIcon(fileType)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => setDeleteTarget(doc)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* File Name */}
                  <p className="text-sm font-medium leading-tight" title={doc.fileName}>
                    {truncate(doc.fileName, 32)}
                  </p>

                  {/* Category Badge */}
                  <Badge
                    variant="secondary"
                    className={cn('text-xs', CATEGORY_COLORS[doc.category])}
                  >
                    {CATEGORY_LABELS[doc.category]}
                  </Badge>

                  {/* Description */}
                  {doc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {truncate(doc.description, 80)}
                    </p>
                  )}

                  {/* Upload Date */}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(doc.createdAt)}
                  </p>

                  {/* Related Dispute */}
                  {doc.relatedDisputeId && (
                    <p className="text-xs text-muted-foreground">
                      Dispute: {truncate(doc.relatedDisputeId, 12)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a document to your vault. Provide the file details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                placeholder="e.g., Experian_Report_2024.pdf"
                value={uploadForm.fileName}
                onChange={(e) => setUploadForm((f) => ({ ...f, fileName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(val) =>
                  setUploadForm((f) => ({ ...f, category: val as DocumentCategory }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this document..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="relatedDisputeId">Related Dispute ID (optional)</Label>
              <Input
                id="relatedDisputeId"
                placeholder="e.g., disp_abc123"
                value={uploadForm.relatedDisputeId}
                onChange={(e) =>
                  setUploadForm((f) => ({ ...f, relatedDisputeId: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.fileName}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
