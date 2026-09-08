import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import cn from '../../utils/cn';
import { moduleGroups, getModulesForGroup } from '../../config/moduleConfig';
import { useAuth } from '../../context/AuthContext';
import { IconChevronDown, IconHome, IconLayers, IconLogOut, IconShield } from '../ui/icons';
import Button from '../ui/Button';

const COLLAPSED_STORAGE_KEY = 'tcams_collapsed_groups';

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
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/**
 * Navigation for every module the signed-in role can reach.
 *
 * Group visibility still comes from moduleGroups + hasRole() exactly as
 * before; only the presentation changed. Collapsed groups persist per viewer,
 * and the group containing the active route is always expanded so the current
 * page is never hidden.
 */
export default function Sidebar({ onNavigate }) {
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
    return visibleGroups.find((group) => group.modules.some((module) => module.key === activeModuleKey))?.key ?? null;
  }, [activeModuleKey, visibleGroups]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      /* storage blocked - collapse state is per-session only */
    }
  }, [collapsed]);

  function toggleGroup(key) {
    setCollapsed((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5 dark:border-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-600 text-white">
          <IconShield className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">T-CAMS</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">Compliance &amp; Administration</p>
        </div>
      </div>

      <nav className="scrollbar-slim flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium transition-colors duration-200',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
            )
          }
        >
          <IconHome className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>

        {visibleGroups.map((group) => {
          const isCollapsed = collapsed.includes(group.key) && group.key !== activeGroupKey;
          const panelId = `nav-group-${group.key}`;

          return (
            <div key={group.key} className="pt-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={!isCollapsed}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-2 rounded-control px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition-colors duration-200 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <span className="truncate">{group.label}</span>
                <IconChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                    isCollapsed && '-rotate-90',
                  )}
                />
              </button>

              <div
                id={panelId}
                className={cn(
                  'grid transition-all duration-200 ease-out',
                  isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
                )}
              >
                <ul className="overflow-hidden">
                  {group.modules.map((module) => (
                    <li key={module.key}>
                      <NavLink
                        to={`/modules/${module.key}`}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-2.5 rounded-control py-2 pl-3 pr-3 text-sm transition-colors duration-200',
                            isActive
                              ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={cn(
                                'h-4 w-0.5 shrink-0 rounded-full transition-colors duration-200',
                                isActive ? 'bg-brand-600 dark:bg-brand-400' : 'bg-transparent',
                              )}
                            />
                            <IconLayers className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            <span className="truncate">{module.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-control px-2 py-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
            aria-hidden="true"
          >
            {initials(user?.name, user?.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {user?.name || 'Signed in'}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={IconLogOut}
            onClick={logout}
            aria-label="Log out"
            title="Log out"
          />
        </div>
      </div>
    </div>
  );
}
