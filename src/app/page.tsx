"use client";

import {
  ArrowUp,
  Blocks,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Crown,
  FilePenLine,
  GitCompare,
  ImageIcon,
  Languages,
  MessageSquare,
  MoreHorizontal,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Settings2,
  Sparkles,
  SquarePen,
  Sun,
  UserRound,
  Video,
  WandSparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ThemePreference } from "@/lib/types";

const capabilities = [
  { label: "Chat", description: "Ask about this page", icon: MessageSquare },
  { label: "Write", description: "Draft and refine text", icon: FilePenLine },
  { label: "Read", description: "Summarize a source", icon: BookOpen },
  { label: "Translate", description: "Translate selected text", icon: Languages },
  { label: "Image", description: "Create visuals", icon: ImageIcon },
  { label: "Video", description: "Create motion", icon: Video },
  { label: "Compare", description: "Compare two sources", icon: GitCompare },
  { label: "MCP", description: "Connect external tools", icon: Blocks },
];

const suggestions = [
  { label: "Summarize this page", icon: BookOpen },
  { label: "Explain it in simple terms", icon: WandSparkles },
];

export default function Home() {
  return (
    <main className="extension-shell">
      <TooltipProvider delayDuration={200}>
        <ExtensionContent />
      </TooltipProvider>
    </main>
  );
}

const themeQuery = "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(themeQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readSystemTheme(): ThemePreference {
  return window.matchMedia(themeQuery).matches ? "dark" : "light";
}

function readServerTheme(): ThemePreference {
  return "light";
}

function ExtensionContent() {
  const [activeCapability, setActiveCapability] = useState("Chat");
  const [prompt, setPrompt] = useState("");
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, readSystemTheme, readServerTheme);
  const [themeOverride, setThemeOverride] = useState<ThemePreference | null>(null);
  const theme = themeOverride ?? systemTheme;
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setThemeOverride(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <header className="topbar">
        <div className="brand-lockup">
          <Image className="brand-mark" src="/logo-echogpt.svg" alt="" width={128} height={128} preload />
          <span>EchoGPT</span>
        </div>
        <div className="topbar-actions">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                onClick={toggleTheme}
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="workspace-layout">
        <nav
          className={`capability-rail${railCollapsed ? " is-collapsed" : ""}`}
          aria-label="Capabilities"
        >
          <button
            className="rail-item rail-item-muted rail-collapse"
            type="button"
            aria-label={railCollapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!railCollapsed}
            onClick={() => setRailCollapsed((collapsed) => !collapsed)}
          >
            {railCollapsed ? (
              <PanelLeftOpen className="rail-icon" size={17} aria-hidden="true" />
            ) : (
              <PanelLeftClose className="rail-icon" size={17} aria-hidden="true" />
            )}
            <span className="rail-label">{railCollapsed ? "Show" : "Hide"}</span>
          </button>

          <div className="rail-middle">
          {capabilities.slice(0, 4).map((capability) => (
            <button
              className={`rail-item${activeCapability === capability.label ? " is-active" : ""}`}
              key={capability.label}
              type="button"
              aria-current={activeCapability === capability.label ? "page" : undefined}
              onClick={() => setActiveCapability(capability.label)}
            >
              <capability.icon className="rail-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{capability.label}</span>
            </button>
          ))}

          {moreOpen && (
            <div className="rail-more-features">
              {capabilities.slice(4).map((capability) => (
                <button
                  className={`rail-item${activeCapability === capability.label ? " is-active" : ""}`}
                  key={capability.label}
                  type="button"
                  aria-current={activeCapability === capability.label ? "page" : undefined}
                  onClick={() => setActiveCapability(capability.label)}
                >
                  <capability.icon className="rail-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{capability.label}</span>
                </button>
              ))}
            </div>
          )}

          <button
            className="rail-item rail-item-muted"
            type="button"
            aria-label={moreOpen ? "Collapse extra capabilities" : "Show extra capabilities"}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
          >
            {moreOpen ? (
              <ChevronUp className="rail-icon" size={17} aria-hidden="true" />
            ) : (
              <MoreHorizontal className="rail-icon" size={17} aria-hidden="true" />
            )}
            <span>{moreOpen ? "Less" : "More"}</span>
          </button>
          </div>

          <div className="rail-section-divider" />

          <div className="rail-bottom-group" role="group" aria-label="Account and settings">
            <button
              className="rail-item rail-item-muted"
              type="button"
              aria-disabled="true"
              aria-label="Upgrade to Premium — coming in the full version, not available in this prototype"
            >
              <Crown className="rail-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Upgrade</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rail-item rail-item-muted" type="button" aria-label="Open settings">
                  <Settings2 className="rail-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>Settings</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Demo settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) =>
                    setThemeOverride(value === "dark" ? "dark" : "light")
                  }
                >
                  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Account — connect in the full version</DropdownMenuItem>
                <DropdownMenuItem disabled>Sync — not available in this demo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="rail-profile"
              type="button"
              aria-disabled="true"
              aria-label="Demo User — account is not connected in this prototype"
            >
              <Avatar aria-hidden="true">
                <AvatarFallback>
                  <UserRound size={15} />
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </nav>

        <section className="workspace" aria-labelledby="workspace-title">
          <div className="workspace-scroll">
            <div className="workspace-heading">
              <div>
                <div className="title-row">
                  <h1 id="workspace-title">{activeCapability}</h1>
                  <span className="beta-label">Beta</span>
                </div>
                <p className="workspace-subtitle">Your page-aware AI workspace</p>
              </div>
              <div className="heading-actions">
                <button className="secondary-button" type="button"><Plus size={14} /> New chat</button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open chat history">
                      <SquarePen size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Open chat history</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="context-chip">
              <span className="page-favicon" aria-hidden="true">A</span>
              <span className="context-copy"><strong>Current page</strong><span>Introducing Arc</span></span>
              <span className="context-domain">arc.net</span>
              <button className="context-remove" type="button" aria-label="Remove current page context"><X size={14} /></button>
            </div>

            <div className="welcome-panel">
              <div className="welcome-icon"><Sparkles size={18} /></div>
              <p className="eyebrow">Welcome to EchoGPT</p>
              <h2>What would you like to explore?</h2>
              <p>Ask questions, summarize content, or turn ideas into something new.</p>
            </div>

            <div className="quick-actions" aria-label="Quick actions">
              {suggestions.map((suggestion) => (
                <button type="button" key={suggestion.label} onClick={() => setPrompt(suggestion.label)}>
                  <suggestion.icon size={15} />
                  <span>{suggestion.label}</span>
                  <ArrowUp size={13} className="quick-arrow" />
                </button>
              ))}
            </div>
          </div>

          <div className="composer-wrap">
            <label htmlFor="prompt">Ask EchoGPT anything</label>
            <textarea
              id="prompt"
              placeholder="Ask about this page..."
              rows={3}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <div className="composer-footer">
              <button className="model-chip" type="button">EchoGPT Fast <ChevronDown size={13} /></button>
              <div className="composer-actions">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[20px] font-light text-muted-foreground"
                      aria-label="Attach a file"
                    >
                      +
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach a file</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" aria-label="Send prompt">
                      <Send size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Send prompt</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </section >
      </div >
    </>
  );
}
