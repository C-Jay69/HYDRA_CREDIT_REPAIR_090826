'use client';

import { useEffect } from 'react';
import { useAppStore, type Page } from '@/store/app-store';
import { Sidebar } from '@/components/creditshield/sidebar';
import { Header } from '@/components/creditshield/header';
import { DisclaimerDialog } from '@/components/creditshield/disclaimer-dialog';
import { DashboardPage } from '@/components/creditshield/dashboard-page';
import { UploadPage } from '@/components/creditshield/upload-page';
import { DisputesPage } from '@/components/creditshield/disputes-page';
import { DeadlinesPage } from '@/components/creditshield/deadlines-page';
import { VaultPage } from '@/components/creditshield/vault-page';
import { CalculatorPage } from '@/components/creditshield/calculator-page';
import { SimulatorPage } from '@/components/creditshield/simulator-page';
import { KnowledgePage } from '@/components/creditshield/knowledge-page';
import { SettingsPage } from '@/components/creditshield/settings-page';

const PAGE_COMPONENTS: Record<Page, React.ComponentType> = {
  dashboard: DashboardPage,
  upload: UploadPage,
  disputes: DisputesPage,
  deadlines: DeadlinesPage,
  vault: VaultPage,
  calculator: CalculatorPage,
  simulator: SimulatorPage,
  knowledge: KnowledgePage,
  settings: SettingsPage,
};

export default function Home() {
  const { currentPage, sidebarOpen, disclaimerAccepted, userId } = useAppStore();

  useEffect(() => {
    const saved = localStorage.getItem('creditshield_user');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const store = useAppStore.getState();
        if (data.id) store.setUserId(data.id);
        if (data.name || data.state || data.country) {
          store.setUserInfo(data.name || '', data.state || '', (data.country || 'US') as 'US' | 'CA');
        }
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('creditshield_disclaimer');
    if (saved === 'accepted') {
      useAppStore.getState().acceptDisclaimer();
    }
  }, []);

  useEffect(() => {
    if (disclaimerAccepted) {
      localStorage.setItem('creditshield_disclaimer', 'accepted');
    }
  }, [disclaimerAccepted]);

  const PageComponent = PAGE_COMPONENTS[currentPage];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <PageComponent />
        </main>
        <footer className="border-t bg-white px-6 py-4 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} CreditShield AI. All rights reserved.</p>
            <p className="text-center">
              This platform does not provide legal advice. Consult a licensed attorney for legal guidance.
            </p>
            <p>Not a lawyer. Not legal advice. Results not guaranteed.</p>
          </div>
        </footer>
      </div>
      <DisclaimerDialog />
    </div>
  );
}
