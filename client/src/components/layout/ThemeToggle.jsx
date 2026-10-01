import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="rounded-control border border-gray-200 p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
