import { useAuth } from '../context/AuthContext';
import { moduleGroups, getModulesForGroup } from '../config/moduleConfig';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const visibleGroups = moduleGroups.filter((group) => hasRole(group.roles));
  const moduleCount = visibleGroups.reduce((sum, group) => sum + getModulesForGroup(group.key).length, 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="mt-1 text-sm text-slate-500">
        You have access to {moduleCount} module{moduleCount === 1 ? '' : 's'} across {visibleGroups.length} area
        {visibleGroups.length === 1 ? '' : 's'}. Pick one from the sidebar to get started.
      </p>
    </div>
  );
}
