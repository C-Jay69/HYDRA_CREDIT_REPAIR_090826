import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PDFParse } from 'pdf-parse';
import { writeFile } from 'fs/promises';
import path from 'path';

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
          create: (items ?? []).map(
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

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/credit-reports]', error);
    return NextResponse.json({ error: 'Failed to create credit report' }, { status: 500 });
  }
}