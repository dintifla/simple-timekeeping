import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

/** Toggles between light and dark theme. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-secondary btn-sm"
      aria-pressed={isDark}
      aria-label={
        isDark ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"
      }
      title={isDark ? "Helles Design" : "Dunkles Design"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
