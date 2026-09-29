import { useSyncExternalStore } from "react";
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

const SERVER_SNAPSHOT: AppSettings = defaultSettings();

let cached: AppSettings | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): AppSettings {
  if (cached === null) cached = loadSettings();
  return cached;
}

function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSettingsSnapshot(): AppSettings {
  return readSnapshot();
}

function getSettingsServerSnapshot(): AppSettings {
  return SERVER_SNAPSHOT;
}

function notifySettingsChanged() {
  cached = null;
  for (const listener of listeners) listener();
}

export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribeSettings, getSettingsSnapshot, getSettingsServerSnapshot);
}

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
  notifySettingsChanged();
  return next;
}