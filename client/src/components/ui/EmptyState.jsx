import cn from '../../utils/cn';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
