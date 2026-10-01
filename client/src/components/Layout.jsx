import { useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import cn from '../utils/cn';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import { moduleConfig } from '../config/moduleConfig';

const RAIL_STORAGE_KEY = 'tcams_rail_collapsed';

function readRailCollapsed() {
  try {
    return localStorage.getItem(RAIL_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * App shell: a persistent rail from `lg` up (collapsible to an icon strip),
 * and an overlay drawer below that. Composition only - navigation lives in
 * layout/Sidebar.jsx.
 */
export default function Layout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(readRailCollapsed);
  const location = useLocation();
  const { moduleKey } = useParams();

  const pageTitle = moduleKey ? moduleConfig[moduleKey]?.label : 'Dashboard';

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(RAIL_STORAGE_KEY, isRailCollapsed ? '1' : '0');
    } catch {
      /* storage blocked - rail state is per-session only */
    }
  }, [isRailCollapsed]);

  useEffect(() => {
    if (!isDrawerOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isDrawerOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-gray-200 transition-[width] duration-200 dark:border-slate-800 lg:block',
          isRailCollapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <Sidebar
          isRailCollapsed={isRailCollapsed}
          onToggleRail={() => setIsRailCollapsed((prev) => !prev)}
        />
      </aside>

      {/* Mobile / tablet drawer */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-200',
            isDrawerOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setIsDrawerOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={cn(
            'absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] border-r border-gray-200 shadow-overlay transition-transform duration-200 ease-out dark:border-slate-800',
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close navigation"
            className="absolute right-2 top-3.5 z-10 rounded-control p-1.5 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
          <Sidebar onNavigate={() => setIsDrawerOpen(false)} />
        </div>
      </div>

      <div className={cn('transition-[padding] duration-200', isRailCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64')}>
        <TopBar onOpenSidebar={() => setIsDrawerOpen(true)} title={pageTitle} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
