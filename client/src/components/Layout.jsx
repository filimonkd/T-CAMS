import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moduleGroups, getModulesForGroup } from '../config/moduleConfig';

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const visibleGroups = moduleGroups.filter((group) => hasRole(group.roles));

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-lg font-semibold text-slate-900">T-CAMS</p>
          <p className="text-xs text-slate-500">{user?.role || 'Guest'}</p>
        </div>
        <nav className="space-y-4 px-2 py-4">
          {visibleGroups.map((group) => {
            const modules = getModulesForGroup(group.key);
            if (modules.length === 0) {
              return null;
            }
            return (
              <div key={group.key}>
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
                <ul className="mt-1 space-y-0.5">
                  {modules.map((module) => (
                    <li key={module.key}>
                      <NavLink
                        to={`/modules/${module.key}`}
                        className={({ isActive }) =>
                          `block rounded px-2 py-1.5 text-sm ${
                            isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                          }`
                        }
                      >
                        {module.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <p className="text-sm text-slate-500">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="rounded px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Log out
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
