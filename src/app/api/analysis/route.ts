import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Types for the analysis engine
// ---------------------------------------------------------------------------

type DetectedIssue = {
  category: string;
  description: string;
  recommendedAction: string;
  legalBasis: string;
  confidence: number;
  disputeType: string;
  strategy: string | null;
};

type AnalyzedItem = {
  reportItemId: string;
  issues: DetectedIssue[];
  scoreImpact: string;
};

// ---------------------------------------------------------------------------
// Helper: determine if a status string is "negative"
// ---------------------------------------------------------------------------

const NEGATIVE_STATUSES = new Set([
  'charged-off',
  'in-collections',
  'late',
  'collection',
  'charged off',
]);

function isNegativeStatus(status: string): boolean {
  const lower = status.toLowerCase();
  if (NEGATIVE_STATUSES.has(lower)) return true;
  if (lower.includes('charge') && lower.includes('off')) return true;
  if (lower.includes('collect')) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Rule-based analysis logic
// ---------------------------------------------------------------------------

function analyzeItems(
  items: {
    id: string;
    accountName: string;
    accountNumber: string | null;
    creditorName: string | null;
    balance: number | null;
    originalAmount: number | null;
    dateOpened: Date | null;
    dateClosed: Date | null;
    dateDelinquent: Date | null;
    status: string;
    accountType: string | null;
    isMedical: boolean;
    isAuthorizedUser: boolean;
  }[],
  jurisdiction: string | null,
  country: string
): AnalyzedItem[] {
  const now = new Date();
  const results: AnalyzedItem[] = [];

  // Pre-compute duplicate groups (same balance AND same dateDelinquent)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const issues: DetectedIssue[] = [];
    let scoreImpact = 'low';

    // -----------------------------------------------------------------------
    // 1. Outdated items (past credit reporting period)
    //    US: 7 years from dateDelinquent | CA: 6 years
    // -----------------------------------------------------------------------
    if (item.dateDelinquent) {
      const reportingYears = country === 'CA' ? 6 : 7;
      const cutoff = new Date(item.dateDelinquent);
      cutoff.setFullYear(cutoff.getFullYear() + reportingYears);

      if (now > cutoff) {
        scoreImpact = 'high';
        const confidence = country === 'CA' ? 90 : 95;
        issues.push({
          category: 'outdated',
          description: `This item's delinquency date (${item.dateDelinquent.toISOString().split('T')[0]}) is more than ${reportingYears} years old. It should have been removed from your credit report under ${country === 'CA' ? 'provincial reporting guidelines' : 'FCRA § 605(a)(4)'}.`,
          recommendedAction: 'File a dispute with each bureau to have this outdated negative item removed immediately.',
          legalBasis: country === 'CA' ? 'Provincial consumer reporting legislation' : 'FCRA § 605(a)(4) — 7-year reporting limit for adverse information',
          confidence,
          disputeType: '611-bureau',
          strategy: null,
        });
      }
    }

    // -----------------------------------------------------------------------
    // 2. Duplicate detection (same balance AND same dateDelinquent)
    // -----------------------------------------------------------------------
    for (let j = i + 1; j < items.length; j++) {
      const other = items[j];
      const sameBalance = item.balance !== null && other.balance !== null && Math.abs(item.balance - other.balance) < 1;
      const sameDelinquency = item.dateDelinquent && other.dateDelinquent
        && item.dateDelinquent.getTime() === other.dateDelinquent.getTime();

      if (sameBalance && sameDelinquency) {
        scoreImpact = 'high';
        issues.push({
          category: 'duplicate',
          description: `This item appears to be a duplicate of "${other.accountName}" (account #${other.accountNumber ?? 'N/A'}). Both have the same balance ($${item.balance}) and delinquency date.`,
          recommendedAction: 'File a dispute claiming duplicate reporting. Request removal of the duplicate entry.',
          legalBasis: 'FCRA § 605(a)(3) — Inaccurate information must be removed or corrected',
          confidence: 85,
          disputeType: '611-bureau',
          strategy: 'duplicate-removal',
        });
        break; // Only flag the first duplicate match
      }
    }

    // -----------------------------------------------------------------------
    // 3. Medical debt (CFPB 2023 rule)
    // -----------------------------------------------------------------------
    if (item.isMedical) {
      const balance = item.balance ?? 0;
      const isPaid = item.status.toLowerCase() === 'paid';

      if (isPaid) {
        scoreImpact = 'medium';
        issues.push({
          category: 'medical-debt',
          description: `This is a paid medical collection ($${balance}). Under the CFPB 2023 Medical Debt Rule and NCAN agreement, paid medical collections should not appear on credit reports.`,
          recommendedAction: 'File a dispute to have this paid medical collection removed from your report.',
          legalBasis: 'CFPB 2023 Medical Debt Rule; NCAN/Equifax/Experian/Transunion Agreement (2022)',
          confidence: 90,
          disputeType: 'medical-debt',
          strategy: null,
        });
      } else if (balance < 500) {
        scoreImpact = 'medium';
        issues.push({
          category: 'medical-debt',
          description: `This is a medical debt under $500 ($${balance}). Under the CFPB 2023 rule, medical debts under $500 must be excluded from credit reports.`,
          recommendedAction: 'File a dispute citing the CFPB 2023 Medical Debt Reporting Rule to have this excluded.',
          legalBasis: 'CFPB 2023 Medical Debt Rule — exclusion of medical debts under $500',
          confidence: 85,
          disputeType: 'medical-debt',
          strategy: null,
        });
      } else {
        scoreImpact = 'medium';
        issues.push({
          category: 'medical-debt',
          description: `This is a medical debt of $${balance}. Medical debt reporting is subject to special protections. Verify this debt is valid and not already covered by insurance.`,
          recommendedAction: 'Request validation of the medical debt and check if it should be covered by insurance or charity care.',
          legalBasis: 'CFPB 2023 Medical Debt Rule; HIPAA considerations',
          confidence: 75,
          disputeType: 'medical-debt',
          strategy: null,
        });
      }
    }

    // -----------------------------------------------------------------------
    // 4. Sold debt / collection / charged-off
    // -----------------------------------------------------------------------
    const statusLower = item.status.toLowerCase();
    if (statusLower.includes('collection') || statusLower.includes('charged-off') || statusLower.includes('charge off')) {
      scoreImpact = 'high';
      issues.push({
        category: 'sold-debt',
        description: `This account is in "${item.status}" status. Collection and charged-off accounts often have chain-of-custody issues and may not be properly validated.`,
        recommendedAction: 'Send a debt validation letter (FDCPA § 809) to the collector within 30 days of initial communication. Request full chain of title and accounting.',
        legalBasis: 'FDCPA § 809 — Validation of debts',
        confidence: 60,
        disputeType: 'fdcpa-validation',
        strategy: '609-method',
      });
    }

    // -----------------------------------------------------------------------
    // 5. Authorized user with negative status
    // -----------------------------------------------------------------------
    if (item.isAuthorizedUser && isNegativeStatus(item.status)) {
      scoreImpact = 'high';
      issues.push({
        category: 'authorized-user-negative',
        description: `You are listed as an authorized user on "${item.accountName}" which has a negative status ("${item.status}"). As an authorized user, you are not legally responsible for this debt.`,
        recommendedAction: 'File a dispute to be removed as an authorized user from this account, or contact the bureau directly to request removal.',
        legalBasis: 'FCRA § 605(a)(2) — Authorized user information; bureau policies',
        confidence: 65,
        disputeType: '611-bureau',
        strategy: 'authorized-user',
      });
    }

    // -----------------------------------------------------------------------
    // 6. Charge-off + collection for same debt (detect across all items)
    // -----------------------------------------------------------------------
    const isChargedOff = statusLower.includes('charge');
    const isCollection = statusLower.includes('collect');

    if (!isChargedOff && !isCollection) {
      // Check if OTHER items in the report share the same creditor + original amount
      // suggesting the original was charged off AND sent to collections
      for (let k = 0; k < items.length; k++) {
        if (k === i) continue;
        const other = items[k];
        const otherStatus = other.status.toLowerCase();
        const otherIsChargedOff = otherStatus.includes('charge');
        const otherIsCollection = otherStatus.includes('collect');

        if (
          ((isChargedOff && otherIsCollection) || (isCollection && otherIsChargedOff)) &&
          item.creditorName &&
          other.creditorName &&
          item.originalAmount !== null &&
          other.originalAmount !== null &&
          Math.abs(item.originalAmount - other.originalAmount) < 1
        ) {
          scoreImpact = 'high';
          issues.push({
            category: 'double-negative',
            description: `Both a charge-off ("${other.accountName}") and a collection entry ("${item.accountName}") appear for the same original debt amount ($${item.originalAmount}). This is duplicate negative reporting.`,
            recommendedAction: 'File a dispute citing double negative reporting. The bureau should only report one status. Request removal of the collection entry.',
            legalBasis: 'FCRA § 605(a)(3) — Inaccurate information; FCRA § 611(a)(1) — Reinvestigation requirement',
            confidence: 80,
            disputeType: '611-bureau',
            strategy: 'duplicate-removal',
          });
          break;
        }
      }
    }

    // If no issues detected, skip the item
    if (issues.length === 0) {
      scoreImpact = 'none';
    }

    results.push({
      reportItemId: item.id,
      issues,
      scoreImpact,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// POST /api/analysis — Analyze a credit report
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, userId, jurisdiction, country } = body;

    if (!reportId || !userId) {
      return NextResponse.json(
        { error: 'reportId and userId are required' },
        { status: 400 }
      );
    }

    // 1. Fetch the credit report with items
    const report = await db.creditReport.findUnique({
      where: { id: reportId },
      include: { reportItems: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Credit report not found' }, { status: 404 });
    }

    if (report.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Run rule-based analysis
    const analysisItems = analyzeItems(
      report.reportItems,
      jurisdiction ?? null,
      country ?? 'US'
    );

    const analysisResult = { items: analysisItems };

    // 3. Save analysis result to the report
    await db.creditReport.update({
      where: { id: reportId },
      data: {
        status: 'analyzed',
        analysisResult: JSON.stringify(analysisResult),
      },
    });

    // 4. Create Dispute and Deadline records for each detected issue
    const createdDisputes: Array<{
      id: string;
      userId: string;
      reportItemId: string | null;
      disputeType: string;
      strategy: string | null;
      targetName: string | null;
      targetAddress: string | null;
      legalBasis: string | null;
      reason: string | null;
      confidence: number | null;
      status: string;
      sentDate: Date | null;
      responseDate: Date | null;
      deadline: Date | null;
      outcome: string | null;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    for (const analyzedItem of analysisItems) {
      if (analyzedItem.issues.length === 0) continue;

      for (const issue of analyzedItem.issues) {
        // Find the corresponding report item for creditor name
        const reportItem = report.reportItems.find((ri) => ri.id === analyzedItem.reportItemId);

        const dispute = await db.dispute.create({
          data: {
            userId,
            reportItemId: analyzedItem.reportItemId,
            disputeType: issue.disputeType,
            strategy: issue.strategy,
            targetName: reportItem?.creditorName ?? report?.reportSource ?? null,
            targetAddress: null,
            legalBasis: issue.legalBasis,
            reason: issue.description,
            confidence: issue.confidence,
            status: 'draft',
          },
        });

        createdDisputes.push(dispute);

        // 5. Create Deadline records for the dispute
        const now = new Date();

        // 30-day investigation deadline (FCRA § 611(a)(1))
        const investigationDeadline = new Date(now);
        investigationDeadline.setDate(investigationDeadline.getDate() + 30);

        await db.deadline.create({
          data: {
            disputeId: dispute.id,
            deadlineType: '30-day-investigation',
            title: `30-Day Investigation Deadline — ${reportItem?.accountName ?? 'Unknown Account'}`,
            dueDate: investigationDeadline,
          },
        });

        // For FDCPA validation disputes, add a 5-day validation deadline
        if (issue.disputeType === 'fdcpa-validation') {
          const validationDeadline = new Date(now);
          validationDeadline.setDate(validationDeadline.getDate() + 5);

          await db.deadline.create({
            data: {
              disputeId: dispute.id,
              deadlineType: '5-day-validation',
              title: `5-Day Debt Validation Deadline — ${reportItem?.accountName ?? 'Unknown Account'}`,
              dueDate: validationDeadline,
            },
          });
        }

        // For identity theft disputes, no special extra deadline needed
        // (the 30-day one covers the FCRA investigation)
      }
    }

    return NextResponse.json({
      data: {
        analysis: analysisResult,
        disputesCreated: createdDisputes.length,
        disputes: createdDisputes,
      },
    });
  } catch (error) {
    console.error('[POST /api/analysis]', error);
    return NextResponse.json({ error: 'Failed to analyze credit report' }, { status: 500 });
  }
}
