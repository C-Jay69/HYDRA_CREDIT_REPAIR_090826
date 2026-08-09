'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Upload,
  Scale,
  Clock,
  FolderLock,
  Calculator,
  TrendingUp,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAppStore, type Page } from '@/store/app-store';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  page: Page;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
  { label: 'Upload & Analyze', page: 'upload', icon: Upload },
  { label: 'Disputes', page: 'disputes', icon: Scale },
  { label: 'Deadlines', page: 'deadlines', icon: Clock },
  { label: 'Document Vault', page: 'vault', icon: FolderLock },
  { label: 'SOL Calculator', page: 'calculator', icon: Calculator },
  { label: 'Score Simulator', page: 'simulator', icon: TrendingUp },
  { label: 'Knowledge Base', page: 'knowledge', icon: BookOpen },
];

function NavItemButton({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const currentPage = useAppStore((s) => s.currentPage);
  const isActive = currentPage === item.page;
  const Icon = item.icon;

  const button = (
    <button
      onClick={onNavigate}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-slate-700/50 text-white'
          : 'text-slate-300 hover:bg-slate-700/30 hover:text-white',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate: (page: Page) => void;
}) {
  const currentPage = useAppStore((s) => s.currentPage);
  const userName = useAppStore((s) => s.userName);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 border-b border-slate-700/50 px-4 py-4',
        collapsed && 'justify-center px-2'
      )}>
        <Shield className="size-8 shrink-0 text-blue-400" />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight">CreditShield AI</h1>
            <p className="text-[11px] text-slate-400">Legal Credit Repair Automation</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItemButton
              key={item.page}
              item={item}
              collapsed={collapsed}
              onNavigate={() => onNavigate(item.page)}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t border-slate-700/50">
        {/* Settings */}
        <div className="px-3 pt-3">
          <NavItemButton
            item={{ label: 'Settings', page: 'settings', icon: Settings }}
            collapsed={collapsed}
            onNavigate={() => onNavigate('settings')}
          />
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {userName || 'User'}
                </p>
                <p className="truncate text-xs text-slate-400">CreditShield Account</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger is handled by Header, but we expose a trigger via store */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent collapsed={false} onNavigate={handleNavigate} />
          </SheetContent>
        </Sheet>
        {/* Expose mobileOpen setter so Header can trigger it */}
        <MobileSidebarSync onOpenChange={setMobileOpen} />
      </>
    );
  }

  // Desktop: fixed sidebar
  const collapsed = !sidebarOpen;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <SidebarContent collapsed={collapsed} onNavigate={handleNavigate} />

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-7 z-50 flex size-6 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm hover:bg-slate-100',
          collapsed && 'rotate-180'
        )}
      >
        <ChevronLeft className="size-3" />
        <span className="sr-only">
          {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </span>
      </Button>
    </aside>
  );
}

/**
 * Internal helper: listens for sidebar toggle events on the window
 * so the Header hamburger button can open the mobile sheet.
 */
function MobileSidebarSync({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.open === 'boolean') {
        onOpenChange(detail.open);
      }
    };
    window.addEventListener('creditshield:mobile-sidebar', handler);
    return () =>
      window.removeEventListener('creditshield:mobile-sidebar', handler);
  }, [onOpenChange]);

  return null;
}

/**
 * Utility to open the mobile sidebar from the Header component.
 */
export function openMobileSidebar() {
  window.dispatchEvent(
    new CustomEvent('creditshield:mobile-sidebar', { detail: { open: true } })
  );
}
