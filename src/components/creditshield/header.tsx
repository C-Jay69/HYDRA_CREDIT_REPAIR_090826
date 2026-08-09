'use client';

import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAppStore, type Page } from '@/store/app-store';
import { openMobileSidebar } from '@/components/creditshield/sidebar';
import { useEffect, useState } from 'react';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  upload: 'Upload & Analyze',
  disputes: 'Disputes',
  deadlines: 'Deadlines',
  vault: 'Document Vault',
  calculator: 'SOL Calculator',
  simulator: 'Score Simulator',
  knowledge: 'Knowledge Base',
  settings: 'Settings',
};

export function Header() {
  const currentPage = useAppStore((s) => s.currentPage);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const userName = useAppStore((s) => s.userName);
  const [isMobile, setIsMobile] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch upcoming deadlines count
  useEffect(() => {
    const userId = useAppStore.getState().userId;
    if (!userId) return;
    async function fetchCount() {
      try {
        const res = await fetch(`/api/deadlines?userId=${encodeURIComponent(userId)}&upcoming=true`);
        if (res.ok) {
          const data = await res.json();
          setUpcomingCount(Array.isArray(data) ? data.length : data.data?.length ?? 0);
        }
      } catch {
        // Silently fail — will show 0
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = () => {
    if (isMobile) {
      openMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  const initials = userName
    ? userName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-white px-4 gap-3">
      {/* Left: hamburger + title */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMenuClick}
        className="shrink-0 text-slate-600 hover:text-slate-900"
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle navigation</span>
      </Button>

      <h2 className="text-lg font-semibold text-slate-900 truncate">
        {PAGE_TITLES[currentPage]}
      </h2>

      {/* Right: notifications + avatar */}
      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => useAppStore.getState().setCurrentPage('deadlines')}
              className="relative text-slate-600 hover:text-slate-900"
            >
              <Bell className="size-5" />
              {upcomingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]"
                >
                  {upcomingCount > 9 ? '9+' : upcomingCount}
                </Badge>
              )}
              <span className="sr-only">
                Notifications
                {upcomingCount > 0 && ` (${upcomingCount} upcoming)`}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {upcomingCount > 0
              ? `${upcomingCount} upcoming deadline${upcomingCount !== 1 ? 's' : ''}`
              : 'No upcoming deadlines'}
          </TooltipContent>
        </Tooltip>

        <Avatar className="size-8">
          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
