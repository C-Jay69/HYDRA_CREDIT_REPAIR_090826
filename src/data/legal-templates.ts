// ---------------------------------------------------------------------------
// CreditShield AI — Legal Letter Templates
// FCRA, FDCPA, and CFPB-compliant dispute & request letter generators.
// ---------------------------------------------------------------------------

import { formatDateLong } from './sol-data';

// ---------------------------------------------------------------------------
// Base Types
// ---------------------------------------------------------------------------

export type LetterParams = {
  userName: string;
  userAddress: string;
  userCity: string;
  userState: string;
  userZip: string;
  accountNumber: string;
  creditorName: string;
  amount: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  reason?: string;
};

export type BureauDisputeParams = LetterParams & {
  bureauName: string;
  bureauAddress: string;
  reportReferenceNumber?: string;
  disputedItems: string[];
};

export type FurnisherDisputeParams = LetterParams & {
  furnisherAddress?: string;
  originalCreditor?: string;
};

export type DebtValidationParams = LetterParams & {
  collectorName: string;
  collectorAddress: string;
  originalCreditor?: string;
  noticeDate?: string;
  collectorAccountNumber?: string;
};

export type CeaseDesistParams = LetterParams & {
  collectorName: string;
  collectorAddress: string;
  prohibitPhoneCalls?: boolean;
  prohibitWorkplaceContact?: boolean;
};

export type GoodwillParams = LetterParams & {
  latePaymentDates: string[];
  explanation?: string;
  positiveHistoryYears?: number;
};

export type PayForDeleteParams = LetterParams & {
  settlementAmount: string;
  settlementPercentage?: string;
  responseDeadline?: string;
};

export type IdentityTheftParams = LetterParams & {
  ftcReportNumber: string;
  policeReportNumber?: string;
  discoveryDate: string;
  blockScope: 'full' | 'specific';
  disputedItems?: string[];
};

export type MedicalDebtParams = LetterParams & {
  medicalProvider?: string;
  dateOfService?: string;
  insuranceCompany?: string;
  claimNumber?: string;
  disputeReason: 'paid_by_insurance' | 'not_my_debt' | 'billing_error' | 'already_paid' | 'under_review';
  disputedItems?: string[];
};

export type DuplicateReportingParams = LetterParams & {
  duplicateAccountNumbers: string[];
  bureauName: string;
  bureauAddress: string;
};

export type FrivolousCounterParams = LetterParams & {
  bureauName: string;
  bureauAddress: string;
  frivolousDeterminationDate: string;
  bureauReferenceNumber?: string;
  additionalDocumentation: string[];
  previousDisputeDates: string[];
};

export type AuthorizedUserParams = LetterParams & {
  primaryCardholderName: string;
  dateAdded?: string;
  removalReason: 'never_authorized' | 'divorce_separation' | 'no_longer_relationship' | 'account_negative';
  bureauName?: string;
};

export type CfpbComplaintParams = LetterParams & {
  companyName: string;
  companyAddress?: string;
  product: string;
  subProduct?: string;
  issue: string;
  desiredResolution: string;
  previousAttempts?: string;
  previousAttemptDates?: string[];
};

export type EscalationParams = LetterParams & {
  executiveName?: string;
  executiveTitle?: string;
  companyName: string;
  companyAddress: string;
  previousCorrespondenceDates: string[];
  previousReferenceNumbers?: string[];
  unresolvedIssues: string[];
  desiredResolution: string;
  responseDeadline?: string;
};

export type TemplateCatalogEntry = {
  id: string;
  name: string;
  description: string;
  legalBasis: string;
  templateFn: (params: Record<string, unknown>) => string;
  requiredFields: string[];
};

// ---------------------------------------------------------------------------
// Legal Disclaimer (appended to every letter)
// ---------------------------------------------------------------------------

const LEGAL_DISCLAIMER =
  'This communication is not legal advice. The sender is exercising their rights under applicable federal and state law.';

function buildLetter(parts: {
  recipientAddress?: string;
  body: string;
  recipientName?: string;
  subject?: string;
  referenceLine?: string;
}): string {
  const { recipientAddress, body, recipientName, subject, referenceLine } = parts;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const lines: string[] = [];
  lines.push(today);
  lines.push('');
  if (recipientName) lines.push(recipientName);
  if (recipientAddress) lines.push(recipientAddress);
  lines.push('');
  if (subject) {
    lines.push(`Re: ${subject}`);
    lines.push('');
  }
  if (referenceLine) {
    lines.push(referenceLine);
    lines.push('');
  }
  lines.push(body.trim());
  lines.push('');
  lines.push(LEGAL_DISCLAIMER);
  lines.push('');
  return lines.join('\n');
}

function signatureBlock(userName: string, userAddress: string, userCity: string, userState: string, userZip: string): string {
  return `Sincerely,\n\n${userName}\n${userAddress}\n${userCity}, ${userState} ${userZip}`;
}

// ---------------------------------------------------------------------------
// 1. FCRA \u00a7 609 — Request for File Disclosure
// ---------------------------------------------------------------------------

export function generate609Letter(params: BureauDisputeParams): string {
  const { userName, userAddress, userCity, userState, userZip, bureauName, bureauAddress } = params;

  const body = `Dear ${bureauName},

I am writing to request a complete copy of my consumer credit file, pursuant to my rights under the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681g(a)(1) (Section 609).

Under FCRA \u00a7 609(a)(1), every consumer reporting agency is required to disclose to a consumer, upon request, all information in the consumer's file at the time of the request. This includes, but is not limited to:

  \u2022 All information in my credit file, including sources;
  \u2022 All records of inquiries made regarding my file;
  \u2022 The current credit score, if a score has been generated;
  \u2022 A list of any persons or entities that have obtained a copy of my credit report within the past two years (or one year for employment purposes);
  \u2022 All information regarding any items that have been the subject of a dispute.

Please provide a complete copy of my consumer file within fifteen (15) days of receipt of this letter, as required under 15 U.S.C. \u00a7 1681i(a)(1).

If you are unable to provide a complete disclosure, please identify in writing the specific information that is being withheld and the reason for such withholding.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: bureauName,
    recipientAddress: bureauAddress,
    subject: `FCRA \u00a7 609 Request for Full File Disclosure \u2014 ${userName}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 2. FCRA \u00a7 611 — Dispute to Credit Bureaus
// ---------------------------------------------------------------------------

export function generate611Letter(params: BureauDisputeParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    bureauName, bureauAddress, reportReferenceNumber, disputedItems,
  } = params;

  const itemList = disputedItems.map((item, i) => `${i + 1}. ${item}`).join('\n');

  const body = `Dear ${bureauName},

I am writing to dispute the following information that appears on my consumer credit report. Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681i(a)(1) (Section 611), I hereby request that you conduct a reasonable reinvestigation of the items listed below.

Under FCRA \u00a7 611(a)(1), if the completeness or accuracy of any item of information contained in a consumer's file at a consumer reporting agency is disputed by the consumer and the consumer notifies the agency of such dispute, the agency shall conduct a reasonable reinvestigation to determine whether the disputed information is inaccurate.

The following items are either inaccurate, incomplete, or unverifiable:

${itemList}

I am requesting that you:

  1. Conduct a reasonable reinvestigation of each disputed item within thirty (30) days, as required by 15 U.S.C. \u00a7 1681i(a)(1);
  2. Delete or modify the disputed information if it is found to be inaccurate, incomplete, or unverifiable;
  3. Provide me with a corrected copy of my credit report upon completion of the reinvestigation;
  4. Notify each furnisher of the disputed information that the information is disputed, as required by 15 U.S.C. \u00a7 1681i(a)(2).

${reportReferenceNumber ? `Reference Number: ${reportReferenceNumber}\n` : ''}
Please send all correspondence and results to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: bureauName,
    recipientAddress: bureauAddress,
    subject: `FCRA \u00a7 611 Dispute of Inaccurate Information \u2014 ${userName}`,
    referenceLine: reportReferenceNumber ? `Reference Number: ${reportReferenceNumber}` : undefined,
    body,
  });
}

// ---------------------------------------------------------------------------
// 3. FCRA \u00a7 623 — Dispute to Furnishers (Direct Dispute)
// ---------------------------------------------------------------------------

export function generate623Letter(params: FurnisherDisputeParams): string {
  const { userName, userAddress, userCity, userState, userZip, accountNumber, creditorName, amount, date, reason } = params;

  const body = `Dear ${creditorName},

I am writing to directly dispute the accuracy of information you have furnished to one or more consumer reporting agencies regarding the account listed below. Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681s-2(a)(3) (Section 623), and Regulation V, 12 C.F.R. \u00a7 1022.43, I hereby submit a direct dispute to you as the furnisher of this information.

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Amount in Dispute: ${amount}
  \u2022 Date of Last Activity: ${formatDateLong(date)}
  ${reason ? `\u2022 Reason for Dispute: ${reason}` : ''}

Under FCRA \u00a7 623(a)(3), if a consumer disputes the accuracy of any information furnished by a person to a consumer reporting agency, and the dispute is directly conveyed to the person by the consumer, the person shall conduct a reasonable investigation with respect to the disputed information and review all relevant information provided by the consumer reporting agency, the consumer, and any other information source.

I am requesting that you:

  1. Conduct a reasonable investigation within thirty (30) days of receiving this notice, as required by 15 U.S.C. \u00a7 1681s-2(a)(4);
  2. Report the results of your investigation to all consumer reporting agencies to which you furnished the disputed information;
  3. If the information is found to be inaccurate or incomplete, promptly notify each consumer reporting agency to which the information was furnished of the necessary corrections;
  4. Provide me with the results of your investigation in writing, including any corrected information.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: creditorName,
    subject: `FCRA \u00a7 623 Direct Dispute \u2014 Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 4. FDCPA \u00a7 809 — Debt Validation Request
// ---------------------------------------------------------------------------

export function generateFdcpaValidation(params: DebtValidationParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, collectorName, collectorAddress, amount,
    originalCreditor, noticeDate, collectorAccountNumber,
  } = params;

  const acct = collectorAccountNumber ?? accountNumber;

  const body = `Dear ${collectorName},

I am writing in response to your ${noticeDate ? `notice dated ${formatDateLong(noticeDate)}` : 'collection notice'} regarding the above-referenced account. Pursuant to my rights under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. \u00a7 1692g(a)(3) (Section 809), I hereby request validation of this alleged debt.

Under FDCPA \u00a7 809(a), within five (5) days after the initial communication with a consumer in connection with the collection of any debt, a debt collector shall send the consumer a written notice containing the amount of the debt, the name of the creditor, and a statement that the consumer has thirty (30) days to dispute the validity of the debt.

I dispute the validity of all or part of this debt. Please provide the following verification:

  \u2022 The original signed application or contract creating this alleged debt;
  \u2022 A complete accounting and itemization of the amount claimed to be owed;
  \u2022 Any judgment or court order related to this debt;
  \u2022 Proof that your company has been assigned or authorized to collect this debt;
  \u2022 The name and address of the original creditor (if different from your company);
  \u2022 A copy of any assignment or transfer of this debt from the original creditor to your company;
  \u2022 Proof that the statute of limitations has not expired on this debt.

Account Information:
  \u2022 Account Number: ${acct}
  \u2022 Amount Claimed: ${amount}
  ${originalCreditor ? `\u2022 Original Creditor: ${originalCreditor}` : ''}

Please be advised that until you provide the requested validation, you may not continue to collect on this debt, and you must cease all collection activity, as required by 15 U.S.C. \u00a7 1692g(b). Please send all verification to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: collectorName,
    recipientAddress: collectorAddress,
    subject: `FDCPA \u00a7 809 Debt Validation Request \u2014 Account ${acct}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 5. FDCPA \u00a7 805(c) — Cease and Desist
// ---------------------------------------------------------------------------

export function generateCeaseDesist(params: CeaseDesistParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, collectorName, collectorAddress, amount,
    prohibitPhoneCalls, prohibitWorkplaceContact,
  } = params;

  const prohibitions: string[] = [
    'Immediately cease and desist all communication with me regarding the above-referenced debt.',
  ];
  if (prohibitPhoneCalls !== false) {
    prohibitions.push('Do not contact me by telephone at any number, including my cell phone, home phone, or any other telephone number associated with me.');
  }
  if (prohibitWorkplaceContact !== false) {
    prohibitions.push('Do not contact me at my place of employment or any workplace.');
  }
  prohibitions.push('You may only contact me to confirm that you will cease all collection efforts or to notify me of a specific remedy that you intend to pursue.');

  const prohibitionList = prohibitions.map((p) => `  \u2022 ${p}`).join('\n');

  const body = `Dear ${collectorName},

I am exercising my right under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. \u00a7 1692c(c) (Section 805(c)), to request that you immediately cease and desist all communication with me regarding the debt referenced below.

Under FDCPA \u00a7 805(c), if a consumer notifies a debt collector in writing that the consumer refuses to pay a debt or that the consumer wishes the debt collector to cease further communication with the consumer, the debt collector shall not communicate further with the consumer with respect to such debt, except to advise the consumer that the debt collector's further efforts are being terminated or to notify the consumer that the debt collector or creditor may invoke specified remedies.

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Amount Claimed: ${amount}

I am hereby directing you to:

${prohibitionList}

Please be advised that any further communication from you in violation of this request may constitute a violation of the FDCPA and may subject you to statutory damages, actual damages, and attorney's fees under 15 U.S.C. \u00a7 1692k.

Please send all written correspondence regarding this matter to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: collectorName,
    recipientAddress: collectorAddress,
    subject: `FDCPA \u00a7 805(c) Cease and Desist \u2014 Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 6. Goodwill Adjustment Request
// ---------------------------------------------------------------------------

export function generateGoodwillLetter(params: GoodwillParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, creditorName, amount, latePaymentDates,
    explanation, positiveHistoryYears,
  } = params;

  const datesList = latePaymentDates.map((d) => `  \u2022 ${formatDateLong(d)}`).join('\n');

  const body = `Dear ${creditorName},

I am writing as a valued customer regarding my account referenced below. I am respectfully requesting a goodwill adjustment to remove the late payment notation(s) from my credit report.

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Current Balance: ${amount}
  ${positiveHistoryYears ? `\u2022 Years of Positive Payment History: ${positiveHistoryYears}` : ''}

Late Payment Date(s):
${datesList}

${explanation ? `Explanation: I experienced an unexpected financial hardship at the time of the late payment(s). ${explanation} This was an isolated incident and does not reflect my overall commitment to maintaining a positive payment history with your institution.\n\n` : ''}I take full responsibility for the late payment(s) and have since resumed timely payments. I have been a loyal customer and would greatly appreciate your consideration in removing these late payment notations as a gesture of goodwill.

While I understand you are not legally obligated to make this adjustment, I am hopeful that you will review my overall positive account history and grant this request. Removing these late payments would significantly improve my credit standing and would reinforce my loyalty to your company.

Please send your response to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: creditorName,
    subject: `Goodwill Adjustment Request \u2014 Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 7. Pay-for-Delete Negotiation
// ---------------------------------------------------------------------------

export function generatePayForDelete(params: PayForDeleteParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, creditorName, amount, settlementAmount,
    settlementPercentage, responseDeadline,
  } = params;

  const deadline = responseDeadline ? formatDateLong(responseDeadline) : 'thirty (30) days of receipt';

  const body = `Dear ${creditorName},

I am writing to propose a settlement offer for the account referenced below. I am willing to pay a lump sum in exchange for the complete removal of this account from all consumer credit reporting agencies.

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Original Amount: ${amount}
  \u2022 Proposed Settlement Amount: ${settlementAmount}
  ${settlementPercentage ? `\u2022 Settlement Percentage: ${settlementPercentage} of the original balance` : ''}

Terms of the Offer:

1. Upon receipt of the settlement amount of ${settlementAmount}, you agree to delete or request the deletion of this account from my credit reports maintained by Equifax, Experian, TransUnion, and any other consumer reporting agency to which this account was reported.

2. You agree to notify all consumer reporting agencies that the account should be completely removed, not merely marked as "paid" or "settled."

3. You agree to provide me with written confirmation that the deletion has been requested, including the name of each consumer reporting agency contacted.

4. This offer is contingent upon your written acceptance returned to me within ${deadline}.

5. Upon receipt of your written acceptance, I will send payment via certified check or money order within fifteen (15) business days.

Please be advised that this offer is being made in good faith. I am under no legal obligation to pay any amount beyond what is being offered, and the statute of limitations on this debt may impact your ability to collect. This settlement represents a mutually beneficial resolution.

Please send your written acceptance or counter-offer to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: creditorName,
    subject: `Pay-for-Delete Settlement Offer \u2014 Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 8. FCRA \u00a7 605B — Identity Theft Dispute
// ---------------------------------------------------------------------------

export function generateIdentityTheftDispute(params: IdentityTheftParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, creditorName, amount,
    ftcReportNumber, policeReportNumber, discoveryDate,
    blockScope, disputedItems,
  } = params;

  const isFullBlock = blockScope === 'full';
  const itemList = disputedItems?.map((item, i) => `${i + 1}. ${item}`).join('\n') ?? '  \u2022 Account Number: ' + accountNumber;

  const body = `Dear ${creditorName},

I am a victim of identity theft and am writing to dispute the following information that appears on my consumer credit report as a result of fraudulent activity. Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681c-2 (Section 605B), I hereby request that you block the reporting of this fraudulent information.

Identity Theft Report Information:
  \u2022 FTC Identity Theft Report Number: ${ftcReportNumber}
  ${policeReportNumber ? `\u2022 Police Report Number: ${policeReportNumber}` : ''}
  \u2022 Date Identity Theft Discovered: ${formatDateLong(discoveryDate)}

Under FCRA \u00a7 605B(a)(1), a consumer reporting agency shall block the reporting of any information in the file of a consumer that the consumer identifies as resulting from identity theft, not later than four (4) business days after the date of receipt of the following information from the consumer:

  1. The identity of the consumer;
  2. A copy of an identity theft report;
  3. The identification of the information in the consumer's file that is the result of identity theft;
  4. A statement by the consumer that the information is not the result of any transaction by the consumer.

${isFullBlock ? 'I am requesting a FULL BLOCK of all information in my credit file that is the result of identity theft.' : `The following specific items are the result of identity theft:\n\n${itemList}`}

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Amount: ${amount}
  \u2022 Creditor: ${creditorName}

I certify under penalty of perjury that the information identified above is not the result of any transaction by me and is the result of identity theft.

Please block the reporting of this information within four (4) business days, as required by 15 U.S.C. \u00a7 1681c-2(a)(1), and provide me with written confirmation of the block.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: creditorName,
    subject: `FCRA \u00a7 605B Identity Theft Block Request \u2014 ${userName}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 9. Medical Debt CFPB 2023 Rules Dispute
// ---------------------------------------------------------------------------

const MEDICAL_DISPUTE_REASONS: Record<string, string> = {
  paid_by_insurance: 'The medical debt was paid by my insurance company and should not be reported as an outstanding balance.',
  not_my_debt: 'I do not recognize this medical debt and believe it is the result of fraud, mistaken identity, or a billing error.',
  billing_error: 'There is a billing error associated with this account, and the amount reported is inaccurate.',
  already_paid: 'This medical debt has already been paid in full and should not appear as an outstanding balance on my credit report.',
  under_review: 'This medical debt is currently under review by my insurance company and the balance is disputed.',
};

export function generateMedicalDebtDispute(params: MedicalDebtParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, creditorName, amount,
    medicalProvider, dateOfService, insuranceCompany,
    claimNumber, disputeReason, disputedItems,
  } = params;

  const reasonText = MEDICAL_DISPUTE_REASONS[disputeReason] ?? 'This medical debt is being disputed.';
  const itemList = disputedItems?.map((item, i) => `${i + 1}. ${item}`).join('\n') ?? '';

  const body = `Dear ${creditorName},

I am writing to dispute the reporting of medical debt information on my consumer credit report. Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681i(a)(1) (Section 611), and consistent with the CFPB's 2023 Final Rules on Medical Debt Collection (88 FR 39820), I hereby dispute the accuracy of the following medical debt information.

${reasonText}

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Amount in Dispute: ${amount}
  ${medicalProvider ? `\u2022 Medical Provider: ${medicalProvider}` : ''}
  ${dateOfService ? `\u2022 Date of Service: ${formatDateLong(dateOfService)}` : ''}
  ${insuranceCompany ? `\u2022 Insurance Company: ${insuranceCompany}` : ''}
  ${claimNumber ? `\u2022 Insurance Claim Number: ${claimNumber}` : ''}

Under the CFPB's 2023 Final Rules:

  \u2022 Medical debt in collections under $500 is prohibited from being included in consumer credit reports;
  \u2022 Medical debts that have been paid by insurance must be removed from credit reports;
  \u2022 Furnishers have an obligation to ensure medical debt information is accurate and complete before reporting.

${itemList ? `The following specific items are disputed:\n\n${itemList}\n\n` : ''}I am requesting that you:

  1. Conduct a reasonable reinvestigation within thirty (30) days of receipt of this letter;
  2. Delete or correct the disputed medical debt information if it is found to be inaccurate, incomplete, or covered by the CFPB's 2023 medical debt reporting rules;
  3. Provide me with written results of your investigation and a corrected copy of my credit report.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: creditorName,
    subject: `Medical Debt Dispute (CFPB 2023 Rules) \u2014 Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 10. Duplicate Reporting Dispute
// ---------------------------------------------------------------------------

export function generateDuplicateReportingDispute(params: DuplicateReportingParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, creditorName, amount,
    duplicateAccountNumbers, bureauName, bureauAddress,
  } = params;

  const dupList = duplicateAccountNumbers.map((acct, i) => `  ${i + 1}. Account Number: ${acct}`).join('\n');

  const body = `Dear ${bureauName},

I am writing to dispute the presence of duplicate account listings on my consumer credit report. Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681i(a)(1) (Section 611), I hereby request that you investigate and remove the duplicate entries.

The following accounts appear to be duplicate listings for the same obligation:

${dupList}

Original Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Creditor: ${creditorName}
  \u2022 Amount: ${amount}

Under FCRA \u00a7 611(a)(1), consumer reporting agencies are required to conduct a reasonable reinvestigation of any disputed information. The presence of duplicate account listings constitutes an inaccurately reported consumer file, as it inflates the number of accounts and may negatively impact my credit score.

I am requesting that you:

  1. Conduct a reasonable reinvestigation within thirty (30) days of receipt of this letter;
  2. Consolidate or remove the duplicate account listing(s), retaining only one accurate entry;
  3. Provide me with a corrected copy of my credit report upon completion of the reinvestigation.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: bureauName,
    recipientAddress: bureauAddress,
    subject: `Duplicate Reporting Dispute \u2014 ${creditorName} Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 11. Counter to Frivolous Dispute Rejection
// ---------------------------------------------------------------------------

export function generateFrivolousDisputeCounter(params: FrivolousCounterParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, creditorName, amount,
    bureauName, bureauAddress, frivolousDeterminationDate,
    bureauReferenceNumber, additionalDocumentation,
    previousDisputeDates,
  } = params;

  const prevDates = previousDisputeDates.map((d) => `  \u2022 ${formatDateLong(d)}`).join('\n');
  const docsList = additionalDocumentation.map((doc, i) => `${i + 1}. ${doc}`).join('\n');

  const body = `Dear ${bureauName},

I am writing in response to your determination dated ${formatDateLong(frivolousDeterminationDate)} that my previous dispute(s) were frivolous or irrelevant. I strenuously object to this determination and am providing additional information and documentation to support the validity of my dispute.

${bureauReferenceNumber ? `Bureau Reference Number: ${bureauReferenceNumber}\n\n` : ''}Previous Dispute Date(s):
${prevDates}

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Creditor: ${creditorName}
  \u2022 Amount: ${amount}

Under FCRA \u00a7 611(a)(3), a consumer reporting agency may terminate a reinvestigation if it reasonably determines that the dispute is frivolous or irrelevant. However, the FCRA requires that the agency must notify the consumer of such determination, including the specific reasons for the finding, and must provide the consumer with an opportunity to submit additional relevant information.

I am now submitting the following additional documentation and information to demonstrate that this dispute is neither frivolous nor irrelevant:

${docsList}

I am requesting that you:

  1. Reopen the reinvestigation within five (5) business days of receipt of this letter;
  2. Conduct a thorough and reasonable reinvestigation of the disputed items;
  3. Delete or correct the disputed information if it is found to be inaccurate, incomplete, or unverifiable;
  4. Provide me with written results of your reinvestigation and a corrected copy of my credit report.

Please be advised that a failure to conduct a proper reinvestigation may constitute a violation of the FCRA, 15 U.S.C. \u00a7 1681i, and may subject your organization to liability for damages and attorney's fees.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: bureauName,
    recipientAddress: bureauAddress,
    subject: `Response to Frivolous Dispute Determination \u2014 ${creditorName} Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 12. Authorized User Removal Request
// ---------------------------------------------------------------------------

const AU_REMOVAL_REASONS: Record<string, string> = {
  never_authorized: 'I never authorized the addition of myself as an authorized user on this account.',
  divorce_separation: 'I am going through a divorce/separation and need to be removed as an authorized user.',
  no_longer_relationship: 'I am no longer in a relationship with the primary cardholder and request removal.',
  account_negative: 'The account has developed negative information that is adversely affecting my credit.',
};

export function generateAuthorizedUserRemoval(params: AuthorizedUserParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, creditorName, primaryCardholderName,
    dateAdded, removalReason, bureauName,
  } = params;

  const reasonText = AU_REMOVAL_REASONS[removalReason] ?? 'I am requesting removal as an authorized user on this account.';

  const body = `Dear ${creditorName},

I am writing to request the immediate removal of my name as an authorized user on the following credit card account.

Account Information:
  \u2022 Account Number: ${accountNumber}
  \u2022 Primary Cardholder: ${primaryCardholderName}
  ${dateAdded ? `\u2022 Date Added as Authorized User: ${formatDateLong(dateAdded)}` : ''}

Reason for Removal Request: ${reasonText}

Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681i, and your own policies regarding authorized user accounts, I am entitled to have my name removed from this account. As an authorized user, I am not the primary obligor on this account and should not be held responsible for any balance or negative information associated with it.

${bureauName ? `I am also requesting that you notify ${bureauName} and all other consumer reporting agencies to remove this account from my credit report.\n\n` : ''}I am requesting that you:

  1. Remove my name as an authorized user from this account within ten (10) business days of receipt of this letter;
  2. Notify all consumer reporting agencies that I am no longer an authorized user on this account;
  3. Ensure that no further activity on this account is reported in connection with my name;
  4. Provide me with written confirmation that my name has been removed.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: creditorName,
    subject: `Authorized User Removal Request \u2014 Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 13. CFPB Complaint Template
// ---------------------------------------------------------------------------

export function generateCfpbComplaint(params: CfpbComplaintParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, companyName, companyAddress,
    product, subProduct, issue, desiredResolution,
    previousAttempts, previousAttemptDates,
  } = params;

  const prevDates = previousAttemptDates?.map((d) => `  \u2022 ${formatDateLong(d)}`).join('\n') ?? '';

  const body = `To: Consumer Financial Protection Bureau
Subject: Consumer Complaint Against ${companyName}

I am filing this complaint against ${companyName} regarding their conduct related to ${product}${subProduct ? ` (${subProduct})` : ''}. I have attempted to resolve this matter directly with the company but have been unsuccessful.

Company Information:
  \u2022 Company Name: ${companyName}
  ${companyAddress ? `\u2022 Company Address: ${companyAddress}` : ''}
  \u2022 Account Number: ${accountNumber}

Description of the Issue:
${issue}

${previousAttempts ? `Previous Resolution Attempts:\n${previousAttempts}\n\n` : ''}${prevDates ? `Dates of Previous Attempts:${prevDates}\n\n` : ''}Desired Resolution:
${desiredResolution}

I believe that ${companyName} has violated the following consumer protection laws:

  \u2022 Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681 et seq.
  \u2022 Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. \u00a7 1692 et seq.
  \u2022 Consumer Financial Protection Act of 2010, 12 U.S.C. \u00a7 5301 et seq.

I respectfully request that the CFPB investigate this matter and take appropriate action to ensure compliance with federal consumer protection laws.

Complainant Information:

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: 'Consumer Financial Protection Bureau',
    recipientAddress: '1700 G Street NW, Washington, DC 20552',
    subject: `Consumer Complaint Against ${companyName} \u2014 ${product}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// 14. Escalation Letter
// ---------------------------------------------------------------------------

export function generateEscalationLetter(params: EscalationParams): string {
  const {
    userName, userAddress, userCity, userState, userZip,
    accountNumber, companyName, companyAddress,
    executiveName, executiveTitle,
    previousCorrespondenceDates, previousReferenceNumbers,
    unresolvedIssues, desiredResolution, responseDeadline,
  } = params;

  const prevDates = previousCorrespondenceDates.map((d) => `  \u2022 ${formatDateLong(d)}`).join('\n');
  const refNums = previousReferenceNumbers?.map((r) => `  \u2022 Reference: ${r}`).join('\n') ?? '';
  const issueList = unresolvedIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n');
  const deadline = responseDeadline ? formatDateLong(responseDeadline) : 'fifteen (15) business days of receipt';

  const body = `Dear ${executiveName ? `${executiveTitle ?? 'Executive'} ${executiveName}` : 'Executive Customer Relations'},

I am writing to escalate an unresolved matter to your attention after multiple attempts to resolve it through standard customer service channels. I am deeply concerned about the lack of resolution and the ongoing impact on my credit standing.

${previousReferenceNumbers ? `Previous Reference Numbers:\n${refNums}\n\n` : ''}Previous Correspondence Date(s):
${prevDates}

Company Information:
  \u2022 Company: ${companyName}
  \u2022 Account Number: ${accountNumber}

The following issues remain unresolved:

${issueList}

Despite my previous attempts to resolve this matter in good faith, ${companyName} has failed to take appropriate corrective action. This failure may constitute a violation of the Fair Credit Reporting Act (FCRA), 15 U.S.C. \u00a7 1681 et seq., and other applicable federal and state consumer protection laws.

I am requesting the following resolution:

${desiredResolution}

Please investigate this matter and provide a written response within ${deadline}. If this matter is not resolved to my satisfaction, I reserve the right to:

  1. File a formal complaint with the Consumer Financial Protection Bureau (CFPB);
  2. File a complaint with my state Attorney General's office;
  3. Pursue all available legal remedies, including damages under the FCRA and FDCPA.

I would prefer to resolve this matter amicably and without the need for further escalation. I look forward to your prompt response.

Please send all correspondence to the address listed below.

${signatureBlock(userName, userAddress, userCity, userState, userZip)}`;

  return buildLetter({
    recipientName: executiveName ? `${executiveTitle ?? ''} ${executiveName}`.trim() : 'Executive Customer Relations',
    recipientAddress: companyAddress,
    subject: `Escalation: Unresolved Dispute \u2014 Account ${accountNumber}`,
    body,
  });
}

// ---------------------------------------------------------------------------
// Template Catalog
// ---------------------------------------------------------------------------

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    id: 'fcra-609',
    name: 'FCRA \u00a7 609 Request for File Disclosure',
    description: 'Request a complete copy of your consumer credit file from a credit bureau under FCRA \u00a7 609(a)(1).',
    legalBasis: '15 U.S.C. \u00a7 1681g(a)(1)',
    templateFn: (p) => generate609Letter(p as unknown as BureauDisputeParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'bureauName', 'bureauAddress'],
  },
  {
    id: 'fcra-611',
    name: 'FCRA \u00a7 611 Dispute to Credit Bureaus',
    description: 'Dispute inaccurate, incomplete, or unverifiable information on your credit report with a credit bureau.',
    legalBasis: '15 U.S.C. \u00a7 1681i(a)(1)',
    templateFn: (p) => generate611Letter(p as unknown as BureauDisputeParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'bureauName', 'bureauAddress', 'disputedItems'],
  },
  {
    id: 'fcra-623',
    name: 'FCRA \u00a7 623 Dispute to Furnishers',
    description: 'Direct dispute with a furnisher of credit information under FCRA \u00a7 623 and Regulation V.',
    legalBasis: '15 U.S.C. \u00a7 1681s-2(a)(3); 12 C.F.R. \u00a7 1022.43',
    templateFn: (p) => generate623Letter(p as unknown as FurnisherDisputeParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'amount', 'date'],
  },
  {
    id: 'fdcpa-809',
    name: 'FDCPA \u00a7 809 Debt Validation Request',
    description: 'Request validation of a debt from a debt collector within 30 days of initial communication.',
    legalBasis: '15 U.S.C. \u00a7 1692g',
    templateFn: (p) => generateFdcpaValidation(p as unknown as DebtValidationParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'collectorName', 'collectorAddress', 'amount'],
  },
  {
    id: 'fdcpa-805c',
    name: 'FDCPA \u00a7 805(c) Cease and Desist',
    description: 'Direct a debt collector to immediately cease all communication regarding a debt.',
    legalBasis: '15 U.S.C. \u00a7 1692c(c)',
    templateFn: (p) => generateCeaseDesist(p as unknown as CeaseDesistParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'collectorName', 'collectorAddress', 'amount'],
  },
  {
    id: 'goodwill',
    name: 'Goodwill Adjustment Request',
    description: 'Request a creditor to remove late payment notations as a goodwill gesture.',
    legalBasis: 'No statutory basis; voluntary creditor adjustment',
    templateFn: (p) => generateGoodwillLetter(p as unknown as GoodwillParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'amount', 'latePaymentDates'],
  },
  {
    id: 'pay-for-delete',
    name: 'Pay-for-Delete Negotiation',
    description: 'Offer a lump-sum settlement in exchange for complete deletion of the account from credit reports.',
    legalBasis: 'No statutory basis; contractual negotiation',
    templateFn: (p) => generatePayForDelete(p as unknown as PayForDeleteParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'amount', 'settlementAmount'],
  },
  {
    id: 'identity-theft-605b',
    name: 'FCRA \u00a7 605B Identity Theft Dispute',
    description: 'Request a block on fraudulent information resulting from identity theft under FCRA \u00a7 605B.',
    legalBasis: '15 U.S.C. \u00a7 1681c-2',
    templateFn: (p) => generateIdentityTheftDispute(p as unknown as IdentityTheftParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'amount', 'ftcReportNumber', 'discoveryDate', 'blockScope'],
  },
  {
    id: 'medical-debt-cfpb-2023',
    name: 'Medical Debt Dispute (CFPB 2023 Rules)',
    description: 'Dispute medical debt reporting under FCRA \u00a7 611 and the CFPB\u2019s 2023 medical debt collection rules.',
    legalBasis: '15 U.S.C. \u00a7 1681i(a)(1); 88 FR 39820 (CFPB Final Rule)',
    templateFn: (p) => generateMedicalDebtDispute(p as unknown as MedicalDebtParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'amount', 'disputeReason'],
  },
  {
    id: 'duplicate-reporting',
    name: 'Duplicate Reporting Dispute',
    description: 'Dispute duplicate account listings on a credit report that inflate the number of reported accounts.',
    legalBasis: '15 U.S.C. \u00a7 1681i(a)(1)',
    templateFn: (p) => generateDuplicateReportingDispute(p as unknown as DuplicateReportingParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'amount', 'duplicateAccountNumbers', 'bureauName', 'bureauAddress'],
  },
  {
    id: 'frivolous-counter',
    name: 'Counter to Frivolous Dispute Rejection',
    description: 'Respond to a credit bureau\u2019s determination that a dispute was frivolous or irrelevant, providing additional documentation.',
    legalBasis: '15 U.S.C. \u00a7 1681i(a)(3)',
    templateFn: (p) => generateFrivolousDisputeCounter(p as unknown as FrivolousCounterParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'amount', 'bureauName', 'bureauAddress', 'frivolousDeterminationDate', 'additionalDocumentation', 'previousDisputeDates'],
  },
  {
    id: 'authorized-user-removal',
    name: 'Authorized User Removal Request',
    description: 'Request removal as an authorized user from a credit card account.',
    legalBasis: '15 U.S.C. \u00a7 1681i; creditor policies',
    templateFn: (p) => generateAuthorizedUserRemoval(p as unknown as AuthorizedUserParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'creditorName', 'primaryCardholderName', 'removalReason'],
  },
  {
    id: 'cfpb-complaint',
    name: 'CFPB Complaint',
    description: 'File a formal consumer complaint with the Consumer Financial Protection Bureau.',
    legalBasis: 'Consumer Financial Protection Act of 2010, 12 U.S.C. \u00a7 5301 et seq.',
    templateFn: (p) => generateCfpbComplaint(p as unknown as CfpbComplaintParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'companyName', 'product', 'issue', 'desiredResolution'],
  },
  {
    id: 'escalation',
    name: 'Escalation Letter',
    description: 'Escalate an unresolved dispute to executive-level management with threats of regulatory action.',
    legalBasis: '15 U.S.C. \u00a7 1681 et seq.; 15 U.S.C. \u00a7 1692 et seq.',
    templateFn: (p) => generateEscalationLetter(p as unknown as EscalationParams),
    requiredFields: ['userName', 'userAddress', 'userCity', 'userState', 'userZip', 'accountNumber', 'companyName', 'companyAddress', 'previousCorrespondenceDates', 'unresolvedIssues', 'desiredResolution'],
  },
];
