import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";
type PresetFontFamily = "inter" | "system" | "jetbrains" | "lexend" | "xiawu";
type FontFamily = PresetFontFamily | string;
type DesktopShellThemeBridge = {
  setAppearance?: (theme: Theme) => Promise<void> | void;
};

const FONT_FAMILIES: Record<FontFamily, string> = {
  inter: '"Inter", "Helvetica Neue", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  jetbrains: '"JetBrains Sans", "Inter", "Helvetica Neue", sans-serif',
  lexend: '"Lexend Deca", "Inter", "Helvetica Neue", sans-serif',
  xiawu: '"霞鹜文楷等宽", "LXGW WenKai Mono", "Inter", "Helvetica Neue", sans-serif',
};

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  fontFamily: FontFamily;
  fontSizeScale: number;
  uiScale: number;
  setFontFamily: (fontFamily: FontFamily) => void;
  setFontSizeScale: (scale: number) => void;
  setUiScale: (scale: number) => void;
}

const THEME_STORAGE_KEY = "rudder.theme";
const FONT_FAMILY_STORAGE_KEY = "rudder.fontFamily";
const FONT_SIZE_SCALE_STORAGE_KEY = "rudder.fontSizeScale";
const UI_SCALE_STORAGE_KEY = "rudder.uiScale";
const DARK_THEME_COLOR = "#1f1f1d";
const LIGHT_THEME_COLOR = "#f1f0ef";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readDesktopShell(): DesktopShellThemeBridge | null {
  if (typeof window === "undefined") return null;
  return (window as typeof window & { desktopShell?: DesktopShellThemeBridge }).desktopShell ?? null;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredThemePreference(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Ignore local storage read failures in restricted environments.
  }
  return "system";
}

function getStoredFontFamily(): FontFamily {
  if (typeof window === "undefined") return "inter";
  try {
    const stored = window.localStorage.getItem(FONT_FAMILY_STORAGE_KEY);
    if (!stored) return "inter";
    // Check if it's one of our presets, accept any string for custom system fonts
    return stored as FontFamily;
  } catch {
    // Ignore local storage read failures in restricted environments.
  }
  return "inter";
}

function getStoredFontSizeScale(): number {
  if (typeof window === "undefined") return 100;
  try {
    const stored = window.localStorage.getItem(FONT_SIZE_SCALE_STORAGE_KEY);
    if (stored) {
      const num = parseInt(stored, 10);
      if (num >= 90 && num <= 300 && num % 5 === 0) {
        return num;
      }
    }
  } catch {
    // Ignore local storage read failures in restricted environments.
  }
  return 100;
}

function getStoredUiScale(): number {
  if (typeof window === "undefined") return 100;
  try {
    const stored = window.localStorage.getItem(UI_SCALE_STORAGE_KEY);
    if (stored) {
      const num = parseInt(stored, 10);
      if (num >= 70 && num <= 200 && num % 5 === 0) {
        return num;
      }
    }
  } catch {
    // Ignore local storage read failures in restricted environments.
  }
  return 100;
}

function resolveThemePreference(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolvedTheme = resolveThemePreference(theme);
  const isDark = resolvedTheme === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  root.style.backgroundColor = root.classList.contains("desktop-shell-macos")
    ? "transparent"
    : (isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta instanceof HTMLMetaElement) {
    themeColorMeta.setAttribute("content", isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
  void readDesktopShell()?.setAppearance?.(theme);
}

function applyFontSettings(fontFamily: FontFamily, fontSizeScale: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const fontValue = Object.prototype.hasOwnProperty.call(FONT_FAMILIES, fontFamily)
    ? FONT_FAMILIES[fontFamily as PresetFontFamily]
    : fontFamily;
  root.style.setProperty('--font-sans', fontValue);
  root.style.fontSize = `${(fontSizeScale / 100) * 16}px`;
}


export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredThemePreference());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveThemePreference(getStoredThemePreference()));
  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => getStoredFontFamily());
  const [fontSizeScale, setFontSizeScaleState] = useState<number>(() => getStoredFontSizeScale());
  const [uiScale, setUiScaleState] = useState<number>(() => getStoredUiScale());

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const nextResolvedTheme = resolveThemePreference(current) === "dark" ? "light" : "dark";
      return nextResolvedTheme;
    });
  }, []);

  const setFontFamily = useCallback((nextFontFamily: FontFamily) => {
    setFontFamilyState(nextFontFamily);
  }, []);

  const setFontSizeScale = useCallback((nextScale: number) => {
    setFontSizeScaleState(nextScale);
  }, []);

  const setUiScale = useCallback((nextScale: number) => {
    setUiScaleState(nextScale);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    setResolvedTheme(resolveThemePreference(theme));
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore local storage write failures in restricted environments.
    }
  }, [theme]);

  useEffect(() => {
    applyFontSettings(fontFamily, fontSizeScale);
    try {
      localStorage.setItem(FONT_FAMILY_STORAGE_KEY, fontFamily);
      localStorage.setItem(FONT_SIZE_SCALE_STORAGE_KEY, fontSizeScale.toString());
    } catch {
      // Ignore local storage write failures in restricted environments.
    }
  }, [fontFamily, fontSizeScale]);

  useEffect(() => {
    try {
      localStorage.setItem(UI_SCALE_STORAGE_KEY, uiScale.toString());
    } catch {
      // Ignore local storage write failures in restricted environments.
    }
  }, [uiScale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme !== "system") return;
      const nextResolvedTheme = getSystemTheme();
      setResolvedTheme(nextResolvedTheme);
      applyTheme("system");
    };
    media.addEventListener("change", handleChange);
    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      fontFamily,
      fontSizeScale,
      uiScale,
      setFontFamily,
      setFontSizeScale,
      setUiScale,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, fontFamily, fontSizeScale, uiScale, setFontFamily, setFontSizeScale, setUiScale],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
