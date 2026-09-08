import { Link, useLocation, useParams } from 'react-router-dom';
import { moduleConfig, moduleGroups } from '../../config/moduleConfig';
import { IconChevronRight } from '../ui/icons';

/**
 * Derives the trail from the current route rather than a separate registry,
 * so it stays correct as long as routes.jsx and moduleConfig.js agree.
 */
export default function Breadcrumbs() {
  const location = useLocation();
  const { moduleKey, id } = useParams();

  const crumbs = [{ label: 'Dashboard', to: '/' }];

  if (moduleKey) {
    const config = moduleConfig[moduleKey];
    const group = config ? moduleGroups.find((item) => item.key === config.group) : null;

    if (group) {
      // The group is a label only - there is no route that lists a whole group.
      crumbs.push({ label: group.label });
    }
    crumbs.push({
      label: config?.label || moduleKey,
      to: id ? `/modules/${moduleKey}` : undefined,
    });
    if (id) {
      crumbs.push({ label: id.length > 10 ? `${id.slice(0, 8)}…` : id });
    }
  } else if (location.pathname !== '/') {
    crumbs.push({ label: location.pathname });
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="truncate rounded text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={
                    isLast
                      ? 'truncate font-medium text-slate-900 dark:text-white'
                      : 'truncate text-slate-500 dark:text-slate-400'
                  }
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
