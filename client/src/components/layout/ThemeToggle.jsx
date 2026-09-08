import Button from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { IconMoon, IconSun } from '../ui/icons';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      leadingIcon={isDark ? IconSun : IconMoon}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    />
  );
}
