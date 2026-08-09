'use client';

import { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/app-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const FULL_SECTIONS = [
  {
    title: '1. NOT LEGAL ADVICE',
    content: `CreditShield AI is an educational and informational tool designed to assist consumers in understanding their rights under federal and state credit reporting laws, including the Fair Credit Reporting Act (FCRA), the Fair Debt Collection Practices Act (FDCPA), and the Credit Repair Organizations Act (CROA). This platform does NOT provide legal advice, and no attorney-client relationship is created by your use of this service. The information, letter templates, and guidance provided are for general educational purposes only and should not be construed as legal counsel for any specific situation.`,
  },
  {
    title: '2. NO GUARANTEES',
    content: `CreditShield AI makes no guarantees, promises, or representations regarding the outcome of any dispute, credit repair effort, or legal proceeding. Credit bureaus and furnishers may reject disputes for any reason permitted by law. Results depend on many factors including the accuracy of the information you provide, the specific circumstances of your credit report items, and the applicable law in your jurisdiction. Past performance or case studies referenced in this platform are not guarantees of future results.`,
  },
  {
    title: '3. USER RESPONSIBILITY',
    items: [
      'You are solely responsible for reviewing all generated letters and documents before sending them to ensure accuracy and completeness.',
      'You must verify all legal citations, statutes, and references provided by this tool before relying on them in any dispute or legal communication.',
      'You are responsible for maintaining records of all correspondence with credit bureaus, furnishers, and collection agencies.',
      'You must ensure that all information provided to credit bureaus and furnishers is truthful and accurate. Submitting false or misleading information may constitute fraud and is subject to both civil and criminal penalties under federal law.',
    ],
  },
  {
    title: '4. PROHIBITED USES',
    items: [
      'You may not use this platform to submit false, misleading, or fraudulent disputes or claims to credit bureaus or furnishers.',
      'You may not use this platform to impersonate another person or dispute items on another person\'s credit report without proper legal authority.',
      'You may not use this platform to harass, threaten, or intimidate any credit bureau, furnisher, collection agency, or individual.',
      'You may not use this platform for any purpose that violates applicable federal, state, or local laws, including but not limited to the FCRA, FDCPA, CROA, and any applicable state credit reporting or debt collection statutes.',
    ],
  },
  {
    title: '5. ACCURATE LEGAL CITATIONS',
    content: `While CreditShield AI strives to provide accurate legal citations and references, the law is complex and subject to change. Court interpretations of statutes may vary by jurisdiction and over time. You are strongly encouraged to consult with a licensed attorney in your jurisdiction for legal advice specific to your situation. The legal citations provided are current as of the knowledge cutoff date and may not reflect the most recent legislative changes, court rulings, or regulatory guidance.`,
  },
];

const ABBREVIATED_TEXT =
  'This tool generates educational credit dispute letters. It does not provide legal advice. You are responsible for reviewing all generated content for accuracy before sending. Do not submit false or fraudulent disputes. See full disclaimers in Settings.';

export function DisclaimerDialog({ showFull = true }: { showFull?: boolean }) {
  const disclaimerAccepted = useAppStore((s) => s.disclaimerAccepted);
  const acceptDisclaimer = useAppStore((s) => s.acceptDisclaimer);
  const [checked, setChecked] = useState(false);

  // When showFull is true, this is the first-visit full disclaimer dialog
  // When showFull is false, this is a pre-action abbreviated reminder
  const isFull = showFull;

  // First-visit dialog: show when not accepted and full mode
  const showFirstVisit = isFull && !disclaimerAccepted;
  // Pre-action dialog: show when accepted but full mode is false (caller controls visibility via key/remount)
  // In abbreviated mode, the caller is responsible for mounting/unmounting

  return (
    <AlertDialog
      open={showFirstVisit}
      onOpenChange={(open) => {
        // Prevent closing without accepting
        if (!open && !disclaimerAccepted) return;
      }}
    >
      <AlertDialogContent className={isFull ? 'sm:max-w-2xl max-h-[90vh]' : 'sm:max-w-lg'}>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-blue-500" />
            <AlertDialogTitle className="text-lg">
              Important Legal Disclaimer
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="sr-only">
            Legal disclaimer that must be accepted before using CreditShield AI.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isFull ? (
          <ScrollArea className="max-h-[50vh] pr-2">
            <div className="space-y-5">
              {FULL_SECTIONS.map((section, i) => (
                <div key={i}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                    {section.title}
                  </h3>
                  {section.content && (
                    <p className="text-sm leading-relaxed text-slate-600">
                      {section.content}
                    </p>
                  )}
                  {section.items && (
                    <ul className="ml-6 list-disc space-y-1.5">
                      {section.items.map((item, j) => (
                        <li
                          key={j}
                          className="text-sm leading-relaxed text-slate-600"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {i < FULL_SECTIONS.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-sm leading-relaxed text-amber-900">
                {ABBREVIATED_TEXT}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Checkbox
            id="disclaimer-check"
            checked={checked}
            onCheckedChange={(val) => setChecked(val === true)}
          />
          <Label
            htmlFor="disclaimer-check"
            className="text-sm leading-snug text-slate-700 cursor-pointer"
          >
            I have read and understand the above disclaimers
          </Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={acceptDisclaimer}
            disabled={!checked}
            className="bg-blue-600 hover:bg-blue-700"
          >
            I Accept & Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
