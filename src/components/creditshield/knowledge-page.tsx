'use client';
/* eslint-disable react/jsx-key */

import { useState } from 'react';
import {
  BookOpen,
  Scale,
  Shield,
  FileText,
  HelpCircle,
  Lightbulb,
  BookMarked,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type KnowledgeSection =
  | 'rights-us'
  | 'rights-ca'
  | 'fcra'
  | 'fdcpa'
  | 'pipeda'
  | 'strategies'
  | 'glossary'
  | 'faqs';

interface NavItem {
  id: KnowledgeSection;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'rights-us', label: 'Your Rights (US)', icon: <Scale className="h-4 w-4" /> },
  { id: 'rights-ca', label: 'Your Rights (Canada)', icon: <Shield className="h-4 w-4" /> },
  { id: 'fcra', label: 'FCRA Guide', icon: <FileText className="h-4 w-4" /> },
  { id: 'fdcpa', label: 'FDCPA Guide', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'pipeda', label: 'PIPEDA Guide', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'strategies', label: 'Dispute Strategies', icon: <Lightbulb className="h-4 w-4" /> },
  { id: 'glossary', label: 'Glossary', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="h-4 w-4" /> },
];

// ---------------------------------------------------------------------------
// Content Components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-bold tracking-tight mb-3">{children}</h3>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="text-base font-semibold mt-5 mb-2">{children}</h4>;
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-3 ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function LegalCite({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-medium">{children}</code>;
}

function ContentCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {title && <SectionHeading>{title}</SectionHeading>}
      {children}
    </div>
  );
}

// ===========================================================================
// US Rights Content
// ===========================================================================

function RightsUSContent() {
  return (
    <ContentCard title="Your Rights Under U.S. Federal Law">
      <SubHeading>Fair Credit Reporting Act (FCRA) Overview</SubHeading>
      <Para>
        The Fair Credit Reporting Act (<LegalCite>15 U.S.C. § 1681 et seq.</LegalCite>) is the primary federal
        law governing the collection, dissemination, and use of consumer credit information. Enacted in 1970 and
        amended numerous times since, the FCRA regulates credit reporting agencies (CRAs) — Equifax, Experian, and
        TransUnion — as well as furnishers of credit information (banks, creditors, debt collectors) and users of
        credit reports (landlords, employers, insurers). The FCRA is designed to promote accuracy, fairness, and
        privacy of consumer information contained in the files of CRAs.
      </Para>
      <Para>
        Under the FCRA, consumers have the right to know what information is in their credit files, the right to
        dispute inaccurate or incomplete information, and the right to have errors corrected. Credit reporting agencies
        must investigate disputes within 30 days (<LegalCite>15 U.S.C. § 1681i(a)(1)</LegalCite>), and if the
        disputed information is found to be inaccurate, incomplete, or unverifiable, the CRA must delete or correct it.
        The FCRA also limits who can access your credit report and under what circumstances ("permissible purpose").
      </Para>

      <SubHeading>Right to Dispute Inaccurate Information</SubHeading>
      <Para>
        Section 611 of the FCRA (<LegalCite>15 U.S.C. § 1681i</LegalCite>) gives consumers the right to dispute any
        item in their credit file that they believe is inaccurate, incomplete, or unverifiable. When you file a dispute,
        the CRA must forward all relevant information to the furnisher of the disputed data. The furnisher must then
        investigate, review all relevant information, and report its findings back to the CRA. If the furnisher finds
        the disputed information is inaccurate or incomplete, it must notify all CRAs to which it reported the information.
        Consumers may also submit a "statement of dispute" of up to 100 words that will be included in future credit reports.
      </Para>

      <SubHeading>Right to Free Annual Credit Reports</SubHeading>
      <Para>
        Under <LegalCite>15 U.S.C. § 1681j</LegalCite>, each of the three nationwide CRAs must provide you with one free
        copy of your credit report every 12 months upon your request. You can obtain these reports through
        AnnualCreditReport.com, the only authorized source for free annual credit reports under federal law.
        Additionally, you are entitled to a free report if:
      </Para>
      <BulletList
        items={[
          'A company takes adverse action against you based on information in your report',
          'You are unemployed and plan to seek employment within 60 days',
          'You are on welfare',
          'Your report is inaccurate because of fraud, including identity theft',
          'You have been denied credit, insurance, or employment in the past 60 days',
        ]}
      />

      <SubHeading>Right to Accurate Information</SubHeading>
      <Para>
        The FCRA imposes a duty of accuracy on both CRAs and furnishers. Section 623 (<LegalCite>15 U.S.C. § 1681s-2</LegalCite>)
        requires that any entity that furnishes information to a CRA must provide accurate information. Furnishers
        must also conduct reasonable investigations when they receive notice of a dispute from a CRA. If a furnisher
        determines that information it provided is inaccurate, it must correct the error and notify all CRAs that
        received the data. Willful or negligent violations of these duties can result in statutory damages of
        $100 to $1,000 per violation, plus actual damages and attorney’s fees (<LegalCite>15 U.S.C. § 1681n, § 1681o</LegalCite>).
      </Para>

      <SubHeading>Statute of Limitations on Credit Reporting</SubHeading>
      <Para>
        While the statute of limitations (SOL) on debt collection varies by state (typically 3-10 years), the FCRA
        has its own reporting time limits. Most negative items must be removed from your credit report after 7 years
        from the date of first delinquency (<LegalCite>15 U.S.C. § 1681c(a)</LegalCite>). Bankruptcies can remain for
        10 years (Chapter 7) or 7 years (Chapter 13). Tax liens can remain for 7 years from the date paid. These FCRA
        reporting limits are separate from and often shorter than state SOL periods for debt collection lawsuits.
      </Para>

      <SubHeading>Furnisher Obligations</SubHeading>
      <Para>
        Under the FCRA and the FACT Act amendments, furnishers have specific obligations:
      </Para>
      <BulletList
        items={[
          <span><LegalCite>§ 623(a)(1)</LegalCite> — Furnishers must provide accurate information to CRAs</span>,
          <span><LegalCite>§ 623(a)(2)</LegalCite> — Furnishers must notify CRAs when a consumer disputes information directly with them</span>,
          <span><LegalCite>§ 623(b)(1)</LegalCite> — Furnishers must investigate disputes forwarded by CRAs and report results within 30 days</span>,
          <span><LegalCite>§ 623(a)(5)</LegalCite> — Furnishers must notify CRAs when a debt has been discharged in bankruptcy</span>,
          <span>Direct disputes (<LegalCite>§ 623(a)(8)</LegalCite>) allow consumers to dispute directly with the furnisher, who must investigate and respond within 30 days</span>,
        ]}
      />
    </ContentCard>
  );
}

// ===========================================================================
// Canada Rights Content
// ===========================================================================

function RightsCAContent() {
  return (
    <ContentCard title="Your Rights Under Canadian Law">
      <SubHeading>PIPEDA Overview</SubHeading>
      <Para>
        The Personal Information Protection and Electronic Documents Act (<LegalCite>PIPEDA</LegalCite>, S.C. 2000, c. 5)
        is Canada’s federal private-sector privacy law. PIPEDA governs how private organizations collect, use, and disclose
        personal information in the course of commercial activity. It applies to inter-provincial and international
        transactions. Credit bureaus operating in Canada (Equifax Canada and TransUnion Canada) are subject to PIPEDA’s
        provisions, which include the right to access your personal information and the right to challenge its accuracy.
      </Para>
      <Para>
        PIPEDA is based on 10 fair information principles, including: Accountability, Identifying Purposes, Consent,
        Limiting Collection, Limiting Use/Disclosure/Retention, Accuracy, Safeguards, Openness, Individual Access, and
        Challenging Compliance. Under Principle 9 (Individual Access), you have the right to access your personal
        information held by an organization, and under Principle 10 (Challenging Compliance), you can challenge the
        accuracy and completeness of that information and have it amended as appropriate.
      </Para>

      <SubHeading>Provincial Privacy Laws</SubHeading>
      <Para>
        Several Canadian provinces have enacted their own privacy legislation that is deemed "substantially similar"
        to PIPEDA, which means the provincial law applies instead of PIPEDA within those provinces:
      </Para>
      <BulletList
        items={[
          <span><strong>Alberta:</strong> Personal Information Protection Act (PIPA), SA 2003, c P-6.5</span>,
          <span><strong>British Columbia:</strong> Personal Information Protection Act (PIPA), SBC 2003, c 63</span>,
          <span><strong>Quebec:</strong> Act respecting the protection of personal information in the private sector, CQLR c P-39.1 (recently strengthened by Law 25)</span>,
          <span><strong>Ontario:</strong> Has specific consumer reporting legislation under the Consumer Reporting Act, RSO 1990, c C.33</span>,
        ]}
      />
      <Para>
        Ontario’s Consumer Reporting Act is particularly relevant for credit repair. It gives consumers the right to
        access their credit report, dispute inaccurate information, and have errors corrected within a reasonable time.
        Quebec’s Law 25 (An Act to modernize legislative provisions as regards the protection of personal information)
        significantly strengthens privacy rights, including the right to data portability and the right to be forgotten.
      </Para>

      <SubHeading>Right to Access and Correct Information</SubHeading>
      <Para>
        Under PIPEDA Principle 9, upon making a written request and providing sufficient identification, you are entitled
        to access all personal information an organization has about you. The organization must respond within a
        reasonable time (typically 30 days) and may charge a minimal fee. If you believe any information is inaccurate
        or incomplete, you can request a correction. The organization must either make the correction or attach a
        statement of disagreement to your file. Credit bureaus in Canada must also provide a free copy of your credit
        report upon request once per year.
      </Para>

      <SubHeading>Dispute Process in Canada</SubHeading>
      <Para>
        To dispute an item on your Canadian credit report, you should first contact the relevant credit bureau
        (Equifax Canada or TransUnion Canada) in writing, clearly identifying the disputed item and explaining why
        it is inaccurate. The bureau must investigate and correct or remove unverifiable information. You should
        also contact the furnisher (creditor or collection agency) directly. If the dispute is not resolved to your
        satisfaction, you can file a complaint with the Office of the Privacy Commissioner of Canada or your
        provincial privacy commissioner. For Ontario residents, complaints about credit reporting can also be filed
        with the Ministry of Government and Consumer Services.
      </Para>

      <SubHeading>Collection Agency Rules</SubHeading>
      <Para>
        Debt collection in Canada is regulated at the provincial level. Each province has legislation governing
        collection agencies:
      </Para>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Province</TableHead>
            <TableHead>Legislation</TableHead>
            <TableHead>Key Restrictions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ['Ontario', 'Collection and Debt Settlement Services Act, 2010', 'No calls on holidays; max 3 calls/week'],
            ['Alberta', 'Fair Trading Act, RSA 2000, c F-2', 'No calls on Sundays; max 3 calls/7 days'],
            ['BC', 'Business Practices and Consumer Protection Act', 'No calls on Sundays/statutory holidays'],
            ['Quebec', 'Consumer Protection Act, CQLR c P-40.1', 'Strict rules; many debt collection restrictions'],
          ].map(([prov, leg, key]) => (
            <TableRow key={prov}>
              <TableCell className="font-medium">{prov}</TableCell>
              <TableCell className="text-xs">{leg}</TableCell>
              <TableCell className="text-xs">{key}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ContentCard>
  );
}

// ===========================================================================
// FCRA Guide Content
// ===========================================================================

function FCRAContent() {
  return (
    <ContentCard title="Fair Credit Reporting Act — Detailed Guide">
      <SubHeading>§ 609 — File Disclosure (15 U.S.C. § 1681g)</SubHeading>
      <Para>
        Section 609 of the FCRA grants consumers the right to obtain all information in their credit file.
        Upon your request, a CRA must disclose to you: (1) all information in your file at the time of the
        request, (2) the sources of that information, and (3) a list of everyone who has received your credit
        report in the past two years (or one year for employment purposes). The "method of verification"
        clause (<LegalCite>§ 609(a)(1)</LegalCite>) requires CRAs to disclose how they verified disputed
        information, including the name, address, and phone number of the furnisher. This is a powerful tool in
        credit repair — if a CRA cannot provide this information, the item may be unverifiable and must be removed.
      </Para>

      <SubHeading>§ 611 — Procedure in Case of Disputed Accuracy (15 U.S.C. § 1681i)</SubHeading>
      <Para>
        Section 611 is the heart of the FCRA dispute process. Key provisions include:
      </Para>
      <BulletList
        items={[
          <span><strong>30-day investigation period:</strong> The CRA must complete its reinvestigation within 30 days of receiving your dispute. This period may be extended by 15 days if you provide additional relevant information.</span>,
          <span><strong>Forwarding to furnisher:</strong> All relevant information regarding the dispute must be forwarded to the furnisher promptly (<LegalCite>§ 611(a)(2)</LegalCite>).</span>,
          <span><strong>Furnisher investigation:</strong> The furnisher must conduct a reasonable investigation and review all relevant information, including information provided by the consumer.</span>,
          <span><strong>Deletion of unverifiable information:</strong> If the CRA cannot verify the disputed information, it must promptly delete it from your file (<LegalCite>§ 611(a)(5)</LegalCite>).</span>,
          <span><strong>Consumer notification:</strong> The CRA must provide written results of the reinvestigation within 5 business days of completion, including a free updated credit report if changes were made.</span>,
          <span><strong>Statement of dispute:</strong> If the dispute is not resolved to your satisfaction, you may file a brief statement (100 words or less) explaining the dispute, which will be included in future reports.</span>,
        ]}
      />

      <SubHeading>§ 623 — Responsibilities of Furnishers (15 U.S.C. § 1681s-2)</SubHeading>
      <Para>
        Section 623, added by the FACT Act of 2003, establishes the duties of entities that furnish information to
        CRAs. The most important provisions are:
      </Para>
      <BulletList
        items={[
          <span><LegalCite>§ 623(a)(1)(A)</LegalCite> — Furnishers may not furnish information they know is inaccurate</span>,
          <span><LegalCite>§ 623(a)(2)</LegalCite> — After receiving notice of a consumer dispute from a CRA, the furnisher must conduct a reasonable investigation and report results</span>,
          <span><LegalCite>§ 623(a)(5)</LegalCite> — Furnishers must notify CRAs when a debt has been discharged in bankruptcy</span>,
          <span><LegalCite>§ 623(b)(1)(A)</LegalCite> — Direct dispute: consumers may dispute directly with the furnisher, who must investigate and respond within 30 days</span>,
          <span><LegalCite>§ 623(a)(8)</LegalCite> — Furnishers must establish reasonable written policies and procedures regarding the accuracy and integrity of information they furnish</span>,
        ]}
      />
      <Para>
        A key distinction: while consumers can only sue furnishers under <LegalCite>§ 623(a)(2)</LegalCite> for
        failing to investigate after receiving notice from a CRA, they can file direct disputes under
        <LegalCite>§ 623(b)</LegalCite> independently. Violations of <LegalCite>§ 623(b)</LegalCite> are
        enforceable by the FTC and state attorneys general, and consumers may have private rights of action
        in certain circumstances.
      </Para>

      <SubHeading>§ 605B — Block of Information Resulting from Identity Theft (15 U.S.C. § 1681c-2)</SubHeading>
      <Para>
        Section 605B provides critical protections for identity theft victims. When a consumer submits an identity
        theft report to a CRA, the CRA must block the reporting of any information in the consumer’s file that
        results from identity theft within 4 business days. To initiate a block, you must provide:
      </Para>
      <BulletList
        items={[
          'An identity theft report (filed with the FTC or a local law enforcement agency)',
          'Identification of the information to be blocked',
          'A statement that the information does not relate to any transaction by the consumer',
        ]}
      />
      <Para>
        Once a block is placed, the CRA must notify the furnisher that the information has been blocked. The furnisher
        may not subsequently report the blocked information to any CRA. If a consumer is found to have made a false
        statement, they may be subject to criminal penalties under <LegalCite>18 U.S.C. § 1001</LegalCite>.
      </Para>

      <SubHeading>§ 605 — Requirements Regarding Obsolete Information (15 U.S.C. § 1681c)</SubHeading>
      <Para>
        Section 605 sets the time limits for how long negative information can appear on your credit report:
      </Para>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Type</TableHead>
            <TableHead>Reporting Period</TableHead>
            <TableHead>Citation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ['Most negative items (lates, collections, charge-offs)', '7 years from date of first delinquency', '§ 605(a)(2)'],
            ['Bankruptcy — Chapter 7', '10 years from date of filing', '§ 605(a)(1)'],
            ['Bankruptcy — Chapter 13', '7 years from date of filing', '§ 605(a)(2)'],
            ['Paid tax liens', '7 years from date paid', '§ 605(a)(3)'],
            ['Unpaid tax liens', 'Indefinite (but most bureaus remove after 10-15 years)', '§ 605(a)(3)'],
            ['Civil judgments', '7 years or until statute of limitations expires', '§ 605(a)(2)'],
            ['Inquiries', '2 years', '§ 605(a)(5)'],
            ['Medical debt (paid)', 'Removed immediately (CFPB 2023 directive)', 'CFPB guidance'],
            ['Medical debt (<$500, unpaid)', 'Removed (CFPB 2023 directive)', 'CFPB guidance'],
          ].map(([item, period, cite]) => (
            <TableRow key={item}>
              <TableCell className="text-xs font-medium">{item}</TableCell>
              <TableCell className="text-xs">{period}</TableCell>
              <TableCell className="text-xs"><LegalCite>{cite}</LegalCite></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ContentCard>
  );
}

// ===========================================================================
// FDCPA Guide Content
// ===========================================================================

function FDCPAContent() {
  return (
    <ContentCard title="Fair Debt Collection Practices Act — Detailed Guide">
      <Para>
        The Fair Debt Collection Practices Act (<LegalCite>15 U.S.C. § 1692 et seq.</LegalCite>) regulates the
        conduct of third-party debt collectors. It does not apply to original creditors collecting their own debts,
        but it does apply to collection agencies, debt buyers, and attorneys who regularly collect debts. Enforced by
        the CFPB, FTC, and state attorneys general, the FDCPA provides significant protections for consumers.
      </Para>

      <SubHeading>§ 809 — Validation of Debts (15 U.S.C. § 1692g)</SubHeading>
      <Para>
        Within 5 days of initial communication with a consumer, a debt collector must send a written validation notice
        containing:
      </Para>
      <BulletList
        items={[
          'The amount of the debt',
          'The name of the creditor to whom the debt is owed',
          'A statement that unless the consumer disputes the debt within 30 days, the collector will assume it is valid',
          'A statement that if the consumer disputes the debt in writing within 30 days, the collector will obtain verification and mail it to the consumer',
          'A statement that upon the consumer’s written request within 30 days, the collector will provide the name and address of the original creditor (if different from the current creditor)',
        ]}
      />
      <Para>
        This is a powerful tool. If you send a timely dispute (within 30 days), the collector must cease collection
        activity until they provide verification. If they cannot validate the debt, they may not continue collecting.
        Note: the FDCPA does not define what constitutes adequate "verification," but courts have generally required
        some documentation from the original creditor.
      </Para>

      <SubHeading>§ 805(c) — Cease Communications (15 U.S.C. § 1692c(c))</SubHeading>
      <Para>
        If a consumer sends a written request to a debt collector demanding that they cease further communication,
        the collector must stop all communication except to: (1) notify the consumer that further efforts are being
        terminated, or (2) notify the consumer that the collector or creditor may invoke specified remedies. This
        "cease and desist" right is absolute — the collector does not need a specific reason. However, a cease
        communication letter does not eliminate the debt; it only stops the collector’s calls and letters. The
        creditor may still pursue other legal remedies, such as filing a lawsuit.
      </Para>

      <SubHeading>Prohibited Practices (§ 806-808)</SubHeading>
      <Para>
        The FDCPA prohibits debt collectors from engaging in a wide range of abusive, unfair, or deceptive practices:
      </Para>
      <BulletList
        items={[
          <span><strong>Harassment (<LegalCite>§ 806</LegalCite>):</strong> Using or threatening violence, using obscene or profane language, publishing a "shame list," advertising the sale of a debt to coerce payment, making repeated calls with intent to annoy, abuse, or harass</span>,
          <span><strong>False or misleading representations (<LegalCite>§ 807</LegalCite>):</strong> Falsely representing the character, amount, or legal status of a debt; falsely implying non-payment will result in arrest or legal action; threatening to take action that is not legally available; falsely representing themselves as attorneys</span>,
          <span><strong>Unfair practices (<LegalCite>§ 808</LegalCite>):</strong> Collecting any amount not authorized by the debt agreement or by law; depositing a post-dated check early; threatening to deposit a post-dated check early; using unfair practices to collect a debt</span>,
          <span><strong>Communication restrictions (<LegalCite>§ 805</LegalCite>):</strong> Cannot call before 8 AM or after 9 PM in the consumer’s time zone; cannot call at the consumer’s place of employment if told it is not permitted; cannot communicate with third parties about the debt (with limited exceptions)</span>,
        ]}
      />

      <SubHeading>Harassment Protections & Private Right of Action</SubHeading>
      <Para>
        The FDCPA provides a private right of action for consumers. If a debt collector violates the FDCPA, you may
        file a lawsuit within one year of the violation. You can recover: (1) actual damages (including emotional
        distress), (2) statutory damages up to $1,000 per violation, and (3) reasonable attorney’s fees and costs.
        Class actions are also permitted, with a statutory cap of the lesser of $500,000 or 1% of the collector’s
        net worth. Many FDCPA cases result in settlements, as debt collectors often prefer to settle rather than
        risk statutory damages and attorney’s fees. Evidence of violations should be carefully documented — keep
        recordings (where legal), call logs, letters, and notes.
      </Para>
    </ContentCard>
  );
}

// ===========================================================================
// PIPEDA Guide Content
// ===========================================================================

function PIPEDAContent() {
  return (
    <ContentCard title="PIPEDA — Privacy Protection for Canadian Consumers">
      <SubHeading>Overview of PIPEDA</SubHeading>
      <Para>
        The Personal Information Protection and Electronic Documents Act (<LegalCite>PIPEDA</LegalCite>) is Canada’s
        comprehensive federal privacy law for the private sector. Enacted in 2000, it establishes ground rules for how
        organizations may collect, use, and disclose personal information in the course of commercial activity.
        PIPEDA applies to credit bureaus, lenders, and other entities that handle consumer credit information.
      </Para>
      <Para>
        PIPEDA is overseen and enforced by the Office of the Privacy Commissioner of Canada (OPC). The Privacy
        Commissioner investigates complaints, conducts audits, and can take cases to the Federal Court for
        enforcement. The Commissioner’s findings are not legally binding, but the Federal Court can order
        organizations to comply with PIPEDA and award damages to affected individuals.
      </Para>

      <SubHeading>The 10 Fair Information Principles</SubHeading>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Principle</TableHead>
            <TableHead>Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ['1. Accountability', 'An organization is responsible for personal information under its control.'],
            ['2. Identifying Purposes', 'The purposes for collecting personal information must be identified at or before collection.'],
            ['3. Consent', 'Knowledge and consent are required for the collection, use, or disclosure of personal information.'],
            ['4. Limiting Collection', 'Collection should be limited to what is necessary for the identified purposes.'],
            ['5. Limiting Use/Disclosure/Retention', 'Information shall only be used or disclosed for the purposes for which it was collected, and kept only as long as necessary.'],
            ['6. Accuracy', 'Personal information shall be as accurate, complete, and up-to-date as necessary for its intended purpose.'],
            ['7. Safeguards', 'Personal information must be protected by appropriate security measures.'],
            ['8. Openness', 'Organizations must be open about their policies and practices regarding personal information.'],
            ['9. Individual Access', 'Upon request, individuals must be informed of the existence, use, and disclosure of their personal information and be given access to it.'],
            ['10. Challenging Compliance', 'Individuals may challenge an organization’s compliance with the above principles and have it investigated.'],
          ].map(([principle, summary]) => (
            <TableRow key={principle}>
              <TableCell className="text-xs font-medium">{principle}</TableCell>
              <TableCell className="text-xs">{summary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SubHeading>Consumer Rights Under PIPEDA</SubHeading>
      <Para>
        Under Principle 9 (Individual Access), you have the right to request access to all personal information an
        organization holds about you. The organization must respond within a reasonable time (generally 30 days),
        provide the information in an understandable form, identify the source, and explain how it has been used
        and disclosed. They may charge a minimal fee. Under Principle 10 (Challenging Compliance), if you believe
        any information is inaccurate or incomplete, you can request a correction. The organization must correct
        the information or annotate it with your statement of dispute. If the organization refuses, you can file a
        complaint with the Privacy Commissioner of Canada.
      </Para>

      <SubHeading>Filing a Complaint</SubHeading>
      <Para>
        To file a PIPEDA complaint, you can submit a complaint form to the Office of the Privacy Commissioner of
        Canada online, by mail, or by fax. The OPC will review your complaint and attempt to resolve it through
        mediation or investigation. If the matter cannot be resolved, the Commissioner may make recommendations
        to the organization or, in rare cases, take the matter to Federal Court. Many provinces also have their
        own privacy commissioners who can handle complaints under provincial legislation.
      </Para>
    </ContentCard>
  );
}

// ===========================================================================
// Dispute Strategies Content
// ===========================================================================

function StrategiesContent() {
  return (
    <ContentCard title="Credit Repair Dispute Strategies">
      <SubHeading>The 609 Method</SubHeading>
      <Para>
        The "609 Method" is named after Section 609 of the FCRA (<LegalCite>15 U.S.C. § 1681g</LegalCite>), which
        gives consumers the right to request disclosure of all information in their credit file. The strategy involves
        writing to each CRA requesting a full copy of your file, including the "method of verification" for each item —
        that is, the name, address, and phone number of whoever provided the information. If the CRA cannot produce
        this verification information, the item must be removed. While not a legal loophole, this method can be
        effective because it forces CRAs to demonstrate they properly verified each item, which they sometimes cannot do.
      </Para>

      <SubHeading>Double Dispute Tactic</SubHeading>
      <Para>
        The Double Dispute involves disputing the same item with both the CRA and the furnisher simultaneously.
        Under <LegalCite>FCRA § 611</LegalCite>, when you dispute with a CRA, they must forward the dispute to the
        furnisher. Under <LegalCite>FCRA § 623(a)(8)</LegalCite>, you can also file a direct dispute with the furnisher.
        By disputing with both, you create two parallel investigation tracks. If the furnisher fails to investigate
        the direct dispute, that’s an FCRA violation. If the CRA fails to conduct a reasonable investigation, that’s
        also a violation. This dual approach increases pressure on both parties to verify or delete the item.
      </Para>

      <SubHeading>Pay-for-Delete</SubHeading>
      <Para>
        A "pay-for-delete" is a negotiated agreement where you offer to pay all or part of a debt in exchange
        for the collection agency or creditor agreeing to remove the negative item from your credit report.
        While credit bureaus officially state that collection agencies should report accurate information
        (meaning a paid collection should be reported as paid, not deleted), many collection agencies will
        agree to a pay-for-delete as a matter of business practice, especially for smaller balances. Always
        get the agreement in writing before making any payment. If the collector agrees but doesn’t follow
        through, you can dispute the remaining item with the CRA using the written agreement as evidence.
      </Para>

      <SubHeading>Goodwill Letters</SubHeading>
      <Para>
        A goodwill letter is a request to a creditor asking them to remove a negative mark (typically a late payment)
        as a gesture of goodwill. This strategy works best when you have a long, otherwise positive history with the
        creditor, the late payment was an isolated incident, and you have since maintained a perfect payment record.
        Goodwill letters are most effective with original creditors rather than collection agencies. They are not
        legally required to comply, but many will as a customer retention measure. Be polite, take responsibility,
        explain the circumstances, and emphasize your positive history.
      </Para>

      <SubHeading>Medical Debt Exemptions</SubHeading>
      <Para>
        Medical debt receives special treatment under both federal guidance and the FCRA. In 2023, the CFPB announced
        that the three major CRAs would remove:
      </Para>
      <BulletList
        items={[
          'All paid medical collection accounts from credit reports',
          'Unpaid medical collection accounts under $500',
          'All medical collection accounts (paid and unpaid) after a 12-month waiting period (extended from 6 months)',
        ]}
      />
      <Para>
        If you have medical debt on your report that meets these criteria and it has not been removed, you should
        dispute it immediately citing the CFPB’s 2023 medical debt reporting changes. This applies nationwide and
        does not depend on your state’s laws.
      </Para>

      <SubHeading>Duplicate Reporting Removal</SubHeading>
      <Para>
        When a debt is sold from one collection agency to another, or charged off by the original creditor and
        simultaneously sent to a collection agency, the same debt may appear multiple times on your credit report.
        This is known as duplicate reporting. Under the FCRA, each negative item should appear only once. If the
        same debt is reported by both the original creditor (as a charge-off) and a collection agency (as a
        collection), you are being penalized twice for a single delinquency. Dispute duplicate entries by
        pointing out that the same obligation is being reported multiple times, which constitutes double
        damage to your credit score and violates the principle of accurate reporting under <LegalCite>§ 623(a)(1)</LegalCite>.
      </Para>

      <SubHeading>SOL + FCRA Combination Strategy</SubHeading>
      <Para>
        This advanced strategy combines two legal concepts: (1) if the statute of limitations has expired on a
        debt, the collector cannot legally sue you; and (2) if the FCRA reporting period has expired (generally 7
        years), the item should not appear on your credit report. Even when the SOL has expired but the FCRA
        reporting period has not, you can argue that continued reporting is misleading because the debt is no
        longer legally enforceable. Some consumers have had success with this argument. Conversely, if the FCRA
        period has expired but the item still appears, dispute it as obsolete under <LegalCite>§ 605(a)(2)</LegalCite>.
      </Para>

      <SubHeading>Authorized User Removal</SubHeading>
      <Para>
        If you were added as an authorized user on someone else’s credit card and that account has negative
        information (high utilization, late payments), you can request its removal from your credit report.
        Under FCRA regulations, you have the right to dispute any information on your report you believe is
        inaccurate. Contact the CRA and state that you are an authorized user and did not incur the debt.
        Some consumers have also been successful in having negative accounts removed by contacting the card
        issuer directly and asking to be removed from the account. Note: being an authorized user is different
        from being a joint account holder — as an authorized user, you are not legally responsible for the debt.
      </Para>

      <SubHeading>Charge-Off vs. Collection</SubHeading>
      <Para>
        When a creditor charges off a debt (typically after 120-180 days of non-payment), they write it off as a
        loss for accounting purposes. The debt may then be sold to a collection agency. On your credit report, you
        may see both the original creditor’s charge-off and the collection agency’s entry. Key points:
      </Para>
      <BulletList
        items={[
          'A charge-off is not forgiveness — you still owe the debt',
          'A charge-off and a collection for the same debt is duplicate reporting and can be disputed',
          'Both items will remain for 7 years from the date of first delinquency (not from the charge-off date)',
          'Paying a charge-off does not remove it from your report, but updates it to "paid charge-off," which is viewed more favorably',
          'Negotiating a pay-for-delete on a charged-off account held by a collection agency can remove both entries',
        ]}
      />
    </ContentCard>
  );
}

// ===========================================================================
// Glossary Content
// ===========================================================================

const GLOSSARY_TERMS = [
  {
    term: 'Credit Bureau',
    definition:
      'A company that collects and maintains consumer credit information and provides it to creditors, employers, landlords, and others. The three major U.S. bureaus are Equifax, Experian, and TransUnion. In Canada, Equifax Canada and TransUnion Canada operate.',
  },
  {
    term: 'Furnisher',
    definition:
      'Any entity that provides information about a consumer to a credit bureau. This includes banks, credit card companies, auto lenders, collection agencies, and any other creditor that reports to the bureaus.',
  },
  {
    term: 'Statute of Limitations (SOL)',
    definition:
      'The legally defined time period during which a creditor or collector can file a lawsuit to collect a debt. SOL periods vary by state (3-10 years) and by debt type. After the SOL expires, the debt is "time-barred" — a collector can still attempt to collect but cannot file a lawsuit.',
  },
  {
    term: 'Charge-Off',
    definition:
      'An accounting action by a creditor writing off a debt as uncollectible, typically after 120-180 days of non-payment. A charge-off is a serious negative item on a credit report but does not mean the debt is forgiven or that collection efforts will stop.',
  },
  {
    term: 'Collection Agency',
    definition:
      'A third-party company that attempts to collect debts on behalf of original creditors or that has purchased delinquent debts. Collection agencies are regulated by the FDCPA and must follow specific rules regarding communication, validation, and prohibited practices.',
  },
  {
    term: 'Dispute',
    definition:
      'A formal request to a credit bureau or furnisher to investigate and correct inaccurate, incomplete, or unverifiable information on a credit report. Under FCRA § 611, CRAs must complete investigations within 30 days.',
  },
  {
    term: 'Validation',
    definition:
      'Under FDCPA § 809, a debt collector must provide validation of a debt upon the consumer’s written request within 30 days of initial communication. Validation typically includes proof of the debt amount and the consumer’s obligation to pay.',
  },
  {
    term: 'Cease and Desist',
    definition:
      'A written request to a debt collector under FDCPA § 805(c) demanding that they stop all communication with the consumer. Once received, the collector may only contact the consumer to confirm the cessation or to notify of specific legal remedies.',
  },
  {
    term: 'Fraud Alert',
    definition:
      'A notice placed on a credit file warning creditors that the consumer may be a victim of fraud. Under FCRA § 605A, an initial fraud alert lasts 1 year and requires creditors to take reasonable steps to verify the consumer’s identity before extending credit. An extended alert (7 years) requires an identity theft report.',
  },
  {
    term: 'Security Freeze',
    definition:
      'Also called a "credit freeze," this is a tool under FCRA § 605A that allows consumers to block access to their credit report, preventing new creditors from opening accounts. Freezes must be placed and lifted at no cost. They do not affect your credit score or existing accounts.',
  },
  {
    term: 'Authorized User',
    definition:
      'A person added to someone else’s credit card account with charging privileges but without legal responsibility for the debt. The account’s history appears on the authorized user’s credit report, which can be beneficial (if positive) or harmful (if negative).',
  },
  {
    term: 'Delinquency',
    definition:
      'A failure to make a required payment on time. Delinquencies are reported to credit bureaus after 30 days and remain on credit reports for 7 years. The severity increases at 60, 90, and 120+ day marks.',
  },
  {
    term: 'Re-aging',
    definition:
      'The illegal practice of changing the date of first delinquency on a debt to make it appear more recent than it actually is, thereby extending the time it can appear on a credit report. This is a violation of FCRA § 623(a)(5) and can result in the item being removed.',
  },
  {
    term: 'Permissible Purpose',
    definition:
      'Under FCRA § 604, a credit bureau may only provide a consumer’s credit report to entities with a legally recognized need, such as: a creditor considering an application, an employer (with consent), an insurer, a landlord, or in response to a court order.',
  },
  {
    term: 'Soft Inquiry',
    definition:
      'A review of your credit report that does not affect your credit score. Soft inquiries include: checking your own credit, promotional inquiries by creditors, and inquiries by companies with whom you already have an account. They are visible to you but not to other creditors.',
  },
  {
    term: 'Hard Inquiry',
    definition:
      'A credit check initiated when you apply for credit (credit card, loan, mortgage, etc.). Hard inquiries typically reduce your credit score by a few points and remain on your report for 2 years. Multiple hard inquiries within a short period (e.g., rate shopping) are often treated as a single inquiry for scoring purposes.',
  },
];

function GlossaryContent() {
  return (
    <ContentCard title="Credit Repair Glossary">
      <Para>
        The following terms are commonly used in credit repair, credit reporting, and debt collection. Understanding
        this terminology is essential for effectively managing your credit and exercising your legal rights.
      </Para>
      <div className="space-y-4">
        {GLOSSARY_TERMS.map((entry, i) => (
          <div key={i} className="rounded-lg border p-4">
            <p className="font-semibold text-sm">{entry.term}</p>
            <p className="mt-1 text-sm text-muted-foreground">{entry.definition}</p>
          </div>
        ))}
      </div>
    </ContentCard>
  );
}

// ===========================================================================
// FAQs Content
// ===========================================================================

const FAQ_ITEMS = [
  {
    q: 'How long do negative items stay on my credit report?',
    a: 'Most negative items, including late payments, collections, charge-offs, and civil judgments, remain on your credit report for 7 years from the date of first delinquency (FCRA § 605(a)(2)). Chapter 7 bankruptcies remain for 10 years from the filing date, while Chapter 13 bankruptcies remain for 7 years. Tax liens remain for 7 years from the date they are paid. Medical debts under $500 and all paid medical collections have been removed under the CFPB’s 2023 directive. Inquiries remain for 2 years. Positive information can remain indefinitely.',
  },
  {
    q: 'What is the difference between the statute of limitations and the credit reporting period?',
    a: 'These are two separate legal concepts. The statute of limitations (SOL) is the time limit for filing a lawsuit to collect a debt — it varies by state (3-10 years) and by debt type. The FCRA reporting period is the time a negative item can appear on your credit report — generally 7 years nationwide. A debt can have an expired SOL (cannot be sued) but still appear on your credit report, or vice versa. Understanding both is critical for effective credit repair.',
  },
  {
    q: 'Can I dispute items on my credit report myself, or do I need a credit repair company?',
    a: 'You absolutely can dispute items yourself — everything a credit repair company does, you can do for free. Under the FCRA, you have the right to dispute any inaccurate information directly with the credit bureaus. Credit repair companies cannot legally do anything you cannot do yourself. Many charge significant fees for services you can perform at no cost. If you do choose a credit repair company, they are prohibited by the CROA (Credit Repair Organizations Act) from charging you before performing services.',
  },
  {
    q: 'How do I submit a dispute to the credit bureaus?',
    a: 'You can dispute online (through each bureau’s website), by mail (certified mail with return receipt recommended), or by phone. For written disputes, include: your full name, address, date of birth, Social Insurance/Social Security Number, the specific items you are disputing, the reason for the dispute, and any supporting documentation. Send disputes to each bureau separately, as they do not share information. Keep copies of everything and use certified mail for a paper trail.',
  },
  {
    q: 'What happens if the credit bureau doesn’t respond within 30 days?',
    a: 'Under FCRA § 611(a)(1), the CRA must complete its reinvestigation within 30 days of receiving your dispute (with a possible 15-day extension if you provide additional information). If they fail to complete the investigation within this period, they must delete the disputed information from your file. This is one of the strongest consumer protections — if the 30-day deadline is missed, the item must be removed, period. Document the date you sent the dispute and follow up promptly.',
  },
  {
    q: 'Can a collection agency sue me after the statute of limitations has expired?',
    a: 'They can technically file a lawsuit, but the case should be dismissed if you raise the SOL defense. If a debt collector files a lawsuit on a time-barred debt, this is a violation of the FDCPA in many jurisdictions. You must affirmatively raise the SOL defense in court — it is not automatically applied. If you make any payment or even acknowledge the debt in writing, you may restart ("toll") the SOL in some states. Always consult an attorney if you receive a lawsuit summons.',
  },
  {
    q: 'What is a pay-for-delete agreement and is it legally binding?',
    a: 'A pay-for-delete is a negotiated agreement where you pay a debt (or a portion of it) and the collector agrees to remove the account from your credit report entirely. While credit bureaus state that collection agencies should report accurate information (suggesting they should report "paid" rather than delete), many collectors will agree to delete as a business decision. Always get the agreement in writing before paying. If the collector accepts payment but doesn’t follow through, you can file a dispute with the CRA using the written agreement as evidence of their commitment.',
  },
  {
    q: 'How do I handle identity theft on my credit report?',
    a: 'Take these steps immediately: (1) File an identity theft report with the FTC at IdentityTheft.gov and/or with local police. (2) Place a fraud alert or security freeze on your credit reports. (3) Send a dispute to each CRA citing FCRA § 605B, including your identity theft report and identifying the fraudulent accounts. (4) The CRA must block the fraudulent information within 4 business days. (5) Contact the furnishers of the fraudulent accounts. (6) File a complaint with the CFPB if issues are not resolved.',
  },
  {
    q: 'Does paying off a collection improve my credit score?',
    a: 'It depends. Paying off a collection changes the status to "paid" but the collection account itself remains on your report for 7 years. Some newer scoring models (FICO 9, VantageScore 4.0) ignore paid collections entirely, which can improve your score under those models. Older models still factor in paid collections. A better option may be a pay-for-delete, where the collector agrees to remove the account entirely upon payment. Always negotiate this in writing before paying.',
  },
  {
    q: 'What is the CFPB and how can they help with credit issues?',
    a: 'The Consumer Financial Protection Bureau (CFPB) is a U.S. federal agency responsible for consumer protection in the financial sector. You can file complaints against credit bureaus, furnishers, debt collectors, and other financial companies through the CFPB’s complaint portal at consumerfinance.gov/complaints. The CFPB forwards your complaint to the company, which must respond within 15-60 days. The CFPB also publishes complaint data and takes enforcement action against companies that violate consumer financial laws. Filing a CFPB complaint is free and can be an effective escalation tool.',
  },
  {
    q: 'Can I have accurate but negative information removed from my credit report?',
    a: 'Generally no — accurate negative information cannot be removed before the FCRA reporting period expires. However, there are exceptions: (1) if the information cannot be verified upon dispute, it must be removed; (2) goodwill adjustments by creditors are possible; (3) pay-for-delete agreements can result in removal; (4) duplicate reporting of the same debt can be disputed. Be cautious of any company that claims it can remove accurate negative items — this is often a scam.',
  },
];

function FAQsContent() {
  return (
    <ContentCard title="Frequently Asked Questions">
      <Para>
        Common questions about credit repair, credit reports, and your legal rights.
      </Para>
      <div className="space-y-4">
        {FAQ_ITEMS.map((faq, i) => (
          <div key={i} className="rounded-lg border p-4">
            <p className="flex items-start gap-2 text-sm font-semibold">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {faq.q}
            </p>
            <p className="mt-2 pl-6 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </ContentCard>
  );
}

// ===========================================================================
// Main Knowledge Page Component
// ===========================================================================

function renderContent(section: KnowledgeSection) {
  switch (section) {
    case 'rights-us':
      return <RightsUSContent />;
    case 'rights-ca':
      return <RightsCAContent />;
    case 'fcra':
      return <FCRAContent />;
    case 'fdcpa':
      return <FDCPAContent />;
    case 'pipeda':
      return <PIPEDAContent />;
    case 'strategies':
      return <StrategiesContent />;
    case 'glossary':
      return <GlossaryContent />;
    case 'faqs':
      return <FAQsContent />;
  }
}

export function KnowledgePage() {
  const [activeSection, setActiveSection] = useState<KnowledgeSection>('rights-us');

  return (
    <div className="space-y-6">
      {/* Desktop: sidebar + content */}
      <div className="hidden md:grid md:grid-cols-[1fr_3fr] gap-6">
        {/* Sidebar Navigation */}
        <Card className="h-fit sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50',
                    activeSection === item.id
                      ? 'bg-primary/5 font-medium text-primary border-r-2 border-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.icon}
                  {item.label}
                  <ChevronRight className={cn(
                    'ml-auto h-3.5 w-3.5 transition-transform',
                    activeSection === item.id && 'text-primary'
                  )} />
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="pr-4">
            {renderContent(activeSection)}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile: horizontal tabs + content */}
      <div className="md:hidden space-y-4">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(item.id)}
                className="shrink-0"
              >
                {item.icon}
                <span className="ml-1.5 hidden sm:inline">{item.label}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        {renderContent(activeSection)}
      </div>
    </div>
  );
}
