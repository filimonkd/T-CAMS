import { Bell, Menu, Search } from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
import ThemeToggle from './ThemeToggle';

/**
 * Header: breadcrumbs on the left, icon actions on the right, matching the
 * reference. White surface with a hairline bottom border.
 */
export default function TopBar({ onOpenSidebar, title }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="-ml-1 shrink-0 rounded-control p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        {title && (
          <p className="truncate text-[15px] font-semibold leading-tight text-gray-900 dark:text-white">
            {title}
          </p>
        )}
        <Breadcrumbs />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          aria-label="Search"
          title="Search"
          className="rounded-control border border-gray-200 p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        {/*
          Disabled on purpose: the API exposes no notifications resource, so
          there is nothing to open and no unread count that would not be
          invented. Enable once such an endpoint exists.
        */}
        <button
          type="button"
          disabled
          aria-label="Notifications (none available)"
          title="Notifications are not available yet"
          className="rounded-control border border-gray-200 p-2 text-gray-400 opacity-60 dark:border-slate-700 dark:text-slate-500"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
