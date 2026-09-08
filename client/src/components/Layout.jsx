import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import cn from '../utils/cn';
import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import Button from './ui/Button';
import { IconX } from './ui/icons';

/**
 * App shell: a persistent sidebar from `lg` up, and an overlay drawer below
 * that. Composition only - the navigation itself lives in layout/Sidebar.jsx.
 */
export default function Layout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  // A route change means the drawer has served its purpose.
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop: fixed rail. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 dark:border-slate-800 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile / tablet: overlay drawer. */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200',
            isDrawerOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setIsDrawerOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={cn(
            'absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] border-r border-slate-200 shadow-overlay transition-transform duration-200 ease-out dark:border-slate-800',
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="absolute right-2 top-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              leadingIcon={IconX}
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close navigation"
            />
          </div>
          <Sidebar onNavigate={() => setIsDrawerOpen(false)} />
        </div>
      </div>

      <div className="lg:pl-64">
        <TopBar onOpenSidebar={() => setIsDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
