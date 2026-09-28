"use client";

import {
  Check,
  ChevronDown,
  Globe2,
  Info,
  Keyboard,
  Languages,
  Monitor,
  Moon,
  Sun,
  Trash2,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { humanLanguages } from "@/lib/languages";
import { demoModels } from "@/lib/models";
import type { AppSettings, OpenBehavior, ThemeMode } from "@/lib/settings";

interface SettingsWorkspaceProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  historyCount: number;
  saved: boolean;
}

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="set-row">
      <div className="set-row-head">
        <span className="set-row-label">{label}</span>
        {children}
      </div>
      <p className="set-row-desc">{description}</p>
    </div>
  );
}

const themeOptions: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const openBehaviorOptions: Array<{ value: OpenBehavior; label: string; description: string }> = [
  { value: "last-tool", label: "Last tool", description: "Continue where you left off" },
  { value: "chat", label: "Chat", description: "Always start on Chat" },
];

const shortcutRows = [
  { keys: ["Enter"], action: "Send the prompt" },
  { keys: ["Shift", "Enter"], action: "Insert a new line" },
  { keys: ["Esc"], action: "Blur the input / close an open menu" },
];

export function SettingsWorkspace({
  settings,
  onChange,
  onClearHistory,
  historyCount,
  saved,
}: SettingsWorkspaceProps) {
  return (
    <div className="set-layout">
      <div className="set-scroll">
        <div className="set-group">
          <div className="set-group-head">
            <span className="set-tile set-tile-violet" aria-hidden="true">
              <Moon size={15} />
            </span>
            <div>
              <h2>Appearance</h2>
              <p>Theme follows your device when set to System.</p>
            </div>
          </div>
          <div className="set-seg" role="radiogroup" aria-label="Theme">
            {themeOptions.map((option) => {
              const active = settings.themeMode === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  role="radio"
                  aria-checked={active}
                  className={`set-chip${active ? " is-selected" : ""}`}
                  onClick={() => onChange({ themeMode: option.value })}
                >
                  <option.icon size={13} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="set-group">
          <div className="set-group-head">
            <span className="set-tile set-tile-sky" aria-hidden="true">
              <Languages size={15} />
            </span>
            <div>
              <h2>Defaults</h2>
              <p>Used when a workspace starts fresh.</p>
            </div>
          </div>

          <SettingRow
            label="Default model"
            description="Pre-selected for new prompts and translations."
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`set-select${settings.defaultModelId ? "" : ""}`}
                  aria-label={`Default model: ${demoModels.find((model) => model.id === settings.defaultModelId)?.label}`}
                >
                  <span className="set-select-label">
                    {demoModels.find((model) => model.id === settings.defaultModelId)?.label ?? "EchoGPT Fast"}
                  </span>
                  <ChevronDown size={13} aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Default model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={settings.defaultModelId}
                  onValueChange={(value) => onChange({ defaultModelId: value })}
                >
                  {demoModels.map((option) => (
                    <DropdownMenuRadioItem key={option.id} value={option.id}>
                      {option.label}
                      <span className="model-detail">{option.description}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SettingRow>

          <SettingRow
            label="Default language"
            description="Pre-selected target for translation."
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="set-select"
                  aria-label={`Default language: ${settings.defaultLanguage}`}
                >
                  <span className="set-select-label">{settings.defaultLanguage}</span>
                  <ChevronDown size={13} aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="set-menu">
                <DropdownMenuLabel>Default language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={settings.defaultLanguage}
                  onValueChange={(value) => onChange({ defaultLanguage: value })}
                >
                  {humanLanguages.map((language) => (
                    <DropdownMenuRadioItem key={language} value={language}>
                      {language}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SettingRow>

          <SettingRow
            label="Open behavior"
            description="Which workspace appears when this popup opens."
          >
            <div className="set-seg" role="radiogroup" aria-label="Open behavior">
              {openBehaviorOptions.map((option) => {
                const active = settings.openBehavior === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    role="radio"
                    aria-checked={active}
                    className={`set-chip${active ? " is-selected" : ""}`}
                    onClick={() => onChange({ openBehavior: option.value })}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </SettingRow>
        </div>

        <div className="set-group">
          <div className="set-group-head">
            <span className="set-tile set-tile-amber" aria-hidden="true">
              <Globe2 size={15} />
            </span>
            <div>
              <h2>Page context</h2>
              <p>How Chat treats the current page.</p>
            </div>
          </div>
          <div className="set-row">
            <div className="set-row-head">
              <span className="set-row-label">Include current page context by default</span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.includePageContext}
                className={`set-switch${settings.includePageContext ? " is-on" : ""}`}
                onClick={() => onChange({ includePageContext: !settings.includePageContext })}
              >
                <span className="set-knob" aria-hidden="true" />
                <span className="sr-only">Include current page context by default</span>
              </button>
            </div>
            <p className="set-row-desc">
              Saved as a preference. The demo still never reads the real page — this applies when the page-context adapter lands in the handoff phase.
            </p>
          </div>
        </div>

        <div className="set-group">
          <div className="set-group-head">
            <span className="set-tile set-tile-rose" aria-hidden="true">
              <Trash2 size={15} />
            </span>
            <div>
              <h2>Data</h2>
              <p>Local demo history keeps nothing outside this browser.</p>
            </div>
          </div>
          <div className="set-row">
            <div className="set-row-head">
              <span className="set-row-label">Chat history</span>
            </div>
            <p className="set-row-desc">
              {historyCount > 0
                ? `${historyCount} session conversation${historyCount === 1 ? "" : "s"} are kept for this session only.`
                : "No session conversations saved yet."}
            </p>
            <Button variant="outline" className="set-clear" onClick={onClearHistory} disabled={historyCount === 0}>
              <Trash2 size={13} aria-hidden="true" />
              Clear local demo history
            </Button>
          </div>
        </div>

        <div className="set-group">
          <div className="set-group-head">
            <span className="set-tile set-tile-emerald" aria-hidden="true">
              <Keyboard size={15} />
            </span>
            <div>
              <h2>Shortcuts</h2>
              <p>As implemented in this prototype.</p>
            </div>
          </div>
          <ul className="set-shortcuts">
            {shortcutRows.map((row) => (
              <li key={row.action} className="set-shortcut-row">
                <span className="set-shortcut-action">{row.action}</span>
                <span className="set-shortcut-keys">
                  {row.keys.map((key) => (
                    <kbd className="set-kbd" key={key}>
                      {key}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="set-group">
          <div className="set-group-head">
            <span className="set-tile set-tile-violet" aria-hidden="true">
              <Info size={15} />
            </span>
            <div>
              <h2>About</h2>
              <p>Version and privacy notes.</p>
            </div>
          </div>
          <div className="set-about">
            <Image className="set-about-logo" src="/logo-echogpt.svg" alt="" width={40} height={40} />
            <div className="set-about-text">
              <span className="set-about-name">EchoGPT Chrome Extension</span>
              <span className="set-about-version">Frontend design prototype · v0.1.0 (build 11/13)</span>
            </div>
          </div>
          <p className="set-privacy">
            Settings are stored only in this browser&apos;s local storage. No data, tokens, or prompts leave this popup — this is a demo and nothing connects to a live service.
          </p>
        </div>
      </div>

      <div className="set-footer">
        <p className="set-footer-note" aria-hidden="true">
          Preferences save locally — they never sync to an account.
        </p>
        <span className={`set-saved${saved ? " is-visible" : ""}`} role="status">
          <Check size={12} aria-hidden="true" />
          Saved locally
        </span>
      </div>
    </div>
  );
}