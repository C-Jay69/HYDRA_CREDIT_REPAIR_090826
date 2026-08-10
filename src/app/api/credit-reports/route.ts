import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PDFParse } from 'pdf-parse';
import { writeFile } from 'fs/promises';
import path from 'path';

// Types for parsed credit report items
interface ParsedReportItem {
  accountName: string;
  accountNumber?: string;
  creditorName?: string;
  balance?: number;
  originalAmount?: number;
  dateOpened?: string;
  dateClosed?: string;
  dateDelinquent?: string;
  status: string;
  accountType?: string;
  isMedical?: boolean;
  isAuthorizedUser?: boolean;
}

// Simple parser for credit report PDF text
function parseCreditReportText(text: string, source: string): ParsedReportItem[] {
  const items: ParsedReportItem[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Common patterns for credit reports
  // This is a basic parser - real implementation would need more sophisticated parsing per bureau
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for account-like patterns
    // Pattern: Account name followed by numbers (account number, balances, dates)
    const accountMatch = line.match(/^([A-Za-z][A-Za-z\s&.'-]{2,40}?)\s+(\*{0,4}\d{4}|\d{4,})\s+(.+)$/);
    if (accountMatch) {
      const [, accountName, accountNumber, rest] = accountMatch;

      // Try to extract balance, status, dates from rest
      const balanceMatch = rest.match(/\$?([\d,]+\.?\d*)/);
      const statusMatch = rest.match(/\b(open|closed|paid|charged.?off|collection|late|current)\b/i);

      items.push({
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        creditorName: '',
        balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : undefined,
        status: statusMatch ? statusMatch[1].toLowerCase().replace(' ', '-') : 'open',
        accountType: undefined,
        isMedical: false,
        isAuthorizedUser: false,
      });
      continue;
    }

    // Pattern: Bureau-specific formats
    // Equifax often has: "ACCOUNT NAME  ACCOUNT #  BALANCE  STATUS  DATE OPENED"
    if (source === 'equifax' || source === 'experian' || source === 'transunion') {
      // Try tab-separated or multi-space separated
      const parts = line.split(/\s{2,}|\t/).filter(p => p.length > 0);
      if (parts.length >= 4) {
        // Heuristic: first part is name, second might be account number, look for $ amounts
        const name = parts[0];
        const hasDollar = parts.some(p => p.includes('$') || /^\d+\.?\d*$/.test(p));
        if (hasDollar && name.length > 3 && name.length < 50) {
          let balance: number | undefined;
          let accountNumber = '';
          let status = 'open';

          for (const part of parts) {
            const dollarMatch = part.match(/\$?([\d,]+\.\d{2})/);
            if (dollarMatch && !balance) {
              balance = parseFloat(dollarMatch[1].replace(/,/g, ''));
            }
            const acctMatch = part.match(/(\*{0,4}\d{4}|\d{6,})/);
            if (acctMatch && !accountNumber) {
              accountNumber = acctMatch[1];
            }
            const statusMatch = part.match(/^(open|closed|paid|charged.?off|collection|late|current)$/i);
            if (statusMatch) {
              status = statusMatch[1].toLowerCase().replace(' ', '-');
            }
          }

          if (balance !== undefined || accountNumber) {
            items.push({
              accountName: name,
              accountNumber: accountNumber || undefined,
              creditorName: '',
              balance,
              status,
              isMedical: false,
              isAuthorizedUser: false,
            });
          }
        }
      }
    }
  }

  // Deduplicate by account name
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.accountName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 50); // Limit to 50 items
}

// GET /api/credit-reports?userId=xxx — List credit reports for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    const reports = await db.creditReport.findMany({
      where: { userId },
      include: {
        reportItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error('[GET /api/credit-reports]', error);
    return NextResponse.json({ error: 'Failed to fetch credit reports' }, { status: 500 });
  }
}

// POST /api/credit-reports — Create a credit report with optional PDF upload and parsing
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let userId: string;
    let reportSource: string;
    let reportDate: string | null = null;
    let items: any[] = [];
    let fileName: string | null = null;
    let rawText: string | null = null;
    let filePath: string | null = null;
    let fileSize: number | null = null;
    let parsedItems: ParsedReportItem[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      userId = formData.get('userId') as string;
      reportSource = formData.get('reportSource') as string;
      const reportDateStr = formData.get('reportDate') as string | null;
      if (reportDateStr) reportDate = reportDateStr;

      const itemsStr = formData.get('items') as string | null;
      if (itemsStr) {
        try {
          items = JSON.parse(itemsStr);
        } catch {
          items = [];
        }
      }

      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        fileName = file.name;
        fileSize = file.size;

        // Save file to public/uploads
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const fullPath = path.join(uploadDir, uniqueName);
        await writeFile(fullPath, buffer);
        filePath = `/uploads/${uniqueName}`;

        // Parse PDF if it's a PDF file
        if (file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
          try {
            const parser = new PDFParse({ data: buffer });
            const textResult = await parser.getText();
            rawText = textResult.text;
            await parser.destroy();

            // Parse the extracted text into structured items
            parsedItems = parseCreditReportText(rawText, reportSource);
          } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            rawText = 'PDF parsing failed';
          }
        }
      }
    } else {
      // JSON body (backward compatibility)
      const body = await request.json();
      userId = body.userId;
      reportSource = body.reportSource;
      reportDate = body.reportDate ?? null;
      rawText = body.rawText ?? null;
      fileName = body.fileName ?? null;
      items = body.items ?? [];
    }

    if (!userId || !reportSource) {
      return NextResponse.json(
        { error: 'userId and reportSource are required' },
        { status: 400 }
      );
    }

    // Combine manual items with parsed items (manual takes priority)
    const allItems = [...items, ...parsedItems.filter(p => 
      !items.some(m => m.accountName?.toLowerCase() === p.accountName.toLowerCase())
    )];

    const report = await db.creditReport.create({
      data: {
        userId,
        reportSource,
        reportDate: reportDate ? new Date(reportDate) : null,
        rawText,
        fileName,
        filePath,
        fileSize,
        status: filePath ? 'uploaded' : 'uploaded',
        reportItems: {
          create: (allItems ?? []).map(
            (item: {
              accountName: string;
              accountNumber?: string;
              creditorName?: string;
              balance?: number;
              originalAmount?: number;
              dateOpened?: string;
              dateClosed?: string;
              dateDelinquent?: string;
              status: string;
              accountType?: string;
              isMedical?: boolean;
              isAuthorizedUser?: boolean;
            }) => ({
              accountName: item.accountName,
              accountNumber: item.accountNumber ?? null,
              creditorName: item.creditorName ?? null,
              balance: item.balance ?? null,
              originalAmount: item.originalAmount ?? null,
              dateOpened: item.dateOpened ? new Date(item.dateOpened) : null,
              dateClosed: item.dateClosed ? new Date(item.dateClosed) : null,
              dateDelinquent: item.dateDelinquent ? new Date(item.dateDelinquent) : null,
              status: item.status,
              accountType: item.accountType ?? null,
              isMedical: item.isMedical ?? false,
              isAuthorizedUser: item.isAuthorizedUser ?? false,
            })
          ),
        },
      },
      include: { reportItems: true },
    });

    // Auto-create a document record in the vault for the uploaded PDF
    if (filePath && fileName) {
      await db.document.create({
        data: {
          userId,
          fileName,
          fileType: 'pdf',
          category: 'credit-report',
          description: `Credit report from ${reportSource}`,
          fileSize,
          filePath,
        },
      });
    }

    // Return parsed items so frontend can populate the form
    return NextResponse.json({ 
      data: report, 
      parsedItems: parsedItems.map(p => ({
        ...p,
        balance: p.balance ?? '',
        originalAmount: p.originalAmount ?? '',
      }))
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/credit-reports]', error);
    return NextResponse.json({ error: 'Failed to create credit report' }, { status: 500 });
  }
}