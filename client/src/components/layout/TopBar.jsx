import Breadcrumbs from './Breadcrumbs';
import ThemeToggle from './ThemeToggle';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { IconBell, IconMenu } from '../ui/icons';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ onOpenSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        leadingIcon={IconMenu}
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="lg:hidden"
      />

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {user?.role && (
          <Badge tone="brand" className="mr-1 hidden sm:inline-flex">
            {user.role.replace(/_/g, ' ')}
          </Badge>
        )}
        <ThemeToggle />
        {/*
          There is no notifications endpoint in the API, so this opens nothing
          and deliberately shows no unread count - a badge here would be
          invented data. Wire it up when a notifications resource exists.
        */}
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          leadingIcon={IconBell}
          aria-label="Notifications (none available)"
          title="Notifications are not available yet"
          disabled
        />
      </div>
    </header>
  );
}
