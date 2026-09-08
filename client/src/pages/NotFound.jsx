import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { IconHome, IconSearch } from '../components/ui/icons';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex max-w-sm flex-col items-center text-center">
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <IconSearch className="h-5 w-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Error 404
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link to="/" className="mt-6">
          <Button variant="primary" leadingIcon={IconHome}>
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
