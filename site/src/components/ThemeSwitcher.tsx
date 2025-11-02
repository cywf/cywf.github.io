import { useEffect, useState } from 'react';

const THEMES = [
  { value: 'nightfall', label: '🌙 Nightfall' },
  { value: 'dracula', label: '🧛 Dracula' },
  { value: 'cyberpunk', label: '🤖 Cyberpunk' },
  { value: 'dark-neon', label: '✨ Dark Neon' },
  { value: 'hackerman', label: '💻 Hackerman' },
  { value: 'gamecore', label: '🎮 Gamecore' },
  { value: 'neon-accent', label: '🌈 Neon Accent' },
];

const DEFAULT_THEME = 'nightfall';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      return;
    }

    // Check prefers-color-scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? DEFAULT_THEME : DEFAULT_THEME;
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm" aria-label="Select theme">
        🎨 Theme
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-200 rounded-box w-52 menu">
        {THEMES.map((t) => (
          <li key={t.value}>
            <button
              onClick={() => handleThemeChange(t.value)}
              className={theme === t.value ? 'active' : ''}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
