import type { ToolId } from "@/lib/types";

export type ThemeMode = "light" | "dark" | "system";

export type OpenBehavior = "last-tool" | "chat";

export interface AppSettings {
  themeMode: ThemeMode;
  defaultModelId: string;
  defaultLanguage: string;
  openBehavior: OpenBehavior;
  includePageContext: boolean;
  lastTool: ToolId;
}

const STORAGE_KEY = "echogpt.demo.settings.v1";

export function defaultSettings(): AppSettings {
  return {
    themeMode: "system",
    defaultModelId: "fast",
    defaultLanguage: "English",
    openBehavior: "chat",
    includePageContext: true,
    lastTool: "chat",
  };
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function isOpenBehavior(value: unknown): value is OpenBehavior {
  return value === "last-tool" || value === "chat";
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...defaultSettings(),
      ...parsed,
      themeMode: isThemeMode(parsed.themeMode) ? parsed.themeMode : "system",
      openBehavior: isOpenBehavior(parsed.openBehavior) ? parsed.openBehavior : "chat",
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...loadSettings(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode) — preferences simply stay in memory.
  }
  return next;
}