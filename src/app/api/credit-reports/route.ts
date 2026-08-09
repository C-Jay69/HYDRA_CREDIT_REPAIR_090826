import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

// POST /api/credit-reports — Create a credit report with report items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reportSource, reportDate, rawText, fileName, status, items } = body;

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
        rawText: rawText ?? null,
        fileName: fileName ?? null,
        status: status ?? 'uploaded',
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

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/credit-reports]', error);
    return NextResponse.json({ error: 'Failed to create credit report' }, { status: 500 });
  }
}
