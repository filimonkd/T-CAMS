import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Boxes,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Landmark,
  Library,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';
import cn from '../../utils/cn';
import { moduleGroups, getModulesForGroup } from '../../config/moduleConfig';
import { useAuth } from '../../context/AuthContext';

const COLLAPSED_STORAGE_KEY = 'tcams_collapsed_groups';

// One icon per module group, so the rail reads as sections rather than a
// uniform list. Keys match moduleConfig.js moduleGroups.
const GROUP_ICONS = {
  procurement: ShoppingCart,
  academic: GraduationCap,
  hrCore: Users,
  asset: Boxes,
  studentFinance: Receipt,
  facilities: Building2,
  library: Library,
  department: Briefcase,
  budget: Landmark,
  finance: Wallet,
  hrAdmin: Users,
};

function readCollapsedGroups() {
  try {
    const raw = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function initials(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Navigation rail.
 *
 * Group visibility still comes from moduleGroups + hasRole() unchanged; only
 * the presentation is new. Collapsed groups persist per viewer, and the group
 * holding the active route always stays open so the current page is reachable.
 */
export default function Sidebar({ onNavigate, isRailCollapsed = false, onToggleRail }) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsedGroups);

  const visibleGroups = useMemo(
    () =>
      moduleGroups
        .filter((group) => hasRole(group.roles))
        .map((group) => ({ ...group, modules: getModulesForGroup(group.key) }))
        .filter((group) => group.modules.length > 0),
    [hasRole],
  );

  const activeModuleKey = location.pathname.startsWith('/modules/')
    ? location.pathname.split('/')[2]
    : null;

  const activeGroupKey = useMemo(() => {
    if (!activeModuleKey) return null;
    return (
      visibleGroups.find((group) => group.modules.some((m) => m.key === activeModuleKey))?.key ?? null
    );
  }, [activeModuleKey, visibleGroups]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      /* storage blocked - collapse state is per-session only */
    }
  }, [collapsed]);

  function toggleGroup(key) {
    setCollapsed((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Brand + rail collapse */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-gray-200 px-4 dark:border-slate-800">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-500 text-white">
          <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        {!isRailCollapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                T-CAMS
              </p>
              <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">
                Compliance Suite
              </p>
            </div>
            {onToggleRail && (
              <button
                type="button"
                onClick={onToggleRail}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden shrink-0 rounded-md p-1.5 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:block"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      {isRailCollapsed && onToggleRail && (
        <button
          type="button"
          onClick={onToggleRail}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="mx-auto mt-3 rounded-md p-1.5 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      <nav
        className="scrollbar-slim flex-1 overflow-y-auto px-3 py-4"
        aria-label="Main navigation"
      >
        <p
          className={cn(
            'px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500',
            isRailCollapsed && 'text-center',
          )}
        >
          {isRailCollapsed ? '•' : 'Main'}
        </p>

        <NavLink
          to="/"
          end
          onClick={onNavigate}
          title="Dashboard"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium transition-colors duration-200',
              isRailCollapsed && 'justify-center px-0',
              isActive
                ? 'bg-brand-500 text-white shadow-subtle'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
            )
          }
        >
          <LayoutDashboard className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          {!isRailCollapsed && 'Dashboard'}
        </NavLink>

        {!isRailCollapsed && (
          <p className="px-2 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Modules
          </p>
        )}

        <div className={cn('space-y-0.5', isRailCollapsed && 'mt-4 space-y-1')}>
          {visibleGroups.map((group) => {
            const GroupIcon = GROUP_ICONS[group.key] || Boxes;
            const isCollapsed = collapsed.includes(group.key) && group.key !== activeGroupKey;
            const panelId = `nav-group-${group.key}`;
            const groupHasActive = group.key === activeGroupKey;

            // Collapsed rail: one icon per group linking to its first module.
            if (isRailCollapsed) {
              return (
                <NavLink
                  key={group.key}
                  to={`/modules/${group.modules[0].key}`}
                  onClick={onNavigate}
                  title={group.label}
                  className={cn(
                    'flex items-center justify-center rounded-control py-2 transition-colors duration-200',
                    groupHasActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                >
                  <GroupIcon className="h-[18px] w-[18px]" strokeWidth={2} />
                </NavLink>
              );
            }

            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={!isCollapsed}
                  aria-controls={panelId}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium transition-colors duration-200',
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                  )}
                >
                  <GroupIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <span className="min-w-0 flex-1 truncate text-left">{group.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
                      isCollapsed && '-rotate-90',
                    )}
                  />
                </button>

                {/* Nested items: indented, with a hairline rail showing hierarchy. */}
                <div
                  id={panelId}
                  className={cn(
                    'grid transition-all duration-200 ease-out',
                    isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
                  )}
                >
                  <ul className="ml-[22px] overflow-hidden border-l border-gray-200 pl-2 dark:border-slate-800">
                    {group.modules.map((module) => (
                      <li key={module.key}>
                        <NavLink
                          to={`/modules/${module.key}`}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            cn(
                              'my-0.5 block truncate rounded-control px-3 py-[7px] text-[13px] transition-colors duration-200',
                              isActive
                                ? 'bg-brand-500 font-medium text-white shadow-subtle'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                            )
                          }
                        >
                          {module.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User profile */}
      <div className="shrink-0 border-t border-gray-200 p-3 dark:border-slate-800">
        <div
          className={cn(
            'flex items-center gap-3 rounded-control px-2 py-1.5',
            isRailCollapsed && 'justify-center px-0',
          )}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/20"
            aria-hidden="true"
          >
            {initials(user?.name, user?.email)}
          </span>
          {!isRailCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-gray-900 dark:text-white">
                  {user?.name || 'Signed in'}
                </p>
                <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
                className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
