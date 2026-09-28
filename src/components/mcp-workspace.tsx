"use client";

import {
  ChevronDown,
  FileText,
  FolderOpen,
  GitFork,
  KeyRound,
  Link2,
  Plug,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Unplug,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Connector, ConnectorStatus } from "@/lib/types";

interface ConnectorUi extends Connector {
  accent: string;
  icon: LucideIcon;
}

const connectorFixtures: ConnectorUi[] = [
  {
    id: "filesystem",
    name: "Filesystem",
    description: "Read and organize files on your device.",
    url: "https://demo.mcp.echogpt.io/filesystem",
    status: "connected",
    tools: ["list_files", "read_file", "search_files"],
    lastChecked: "2m ago",
    accent: "violet",
    icon: FolderOpen,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Issues, PRs, and repo search through your account.",
    url: "https://demo.mcp.echogpt.io/github",
    status: "connected",
    tools: ["list_issues", "get_pull_request", "search_repos", "create_issue", "list_repos"],
    lastChecked: "2m ago",
    accent: "sky",
    icon: GitFork,
  },
  {
    id: "web-search",
    name: "Web Search",
    description: "Fetch live results for grounded answers.",
    url: "https://demo.mcp.echogpt.io/search",
    status: "disconnected",
    tools: ["web_search", "fetch_page"],
    lastChecked: "8m ago",
    accent: "amber",
    icon: Search,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Draft and append notes in your workspace.",
    url: "https://demo.mcp.echogpt.io/broken-demo",
    status: "error",
    tools: ["list_pages", "append_block", "search_notes"],
    lastChecked: "just now",
    accent: "rose",
    icon: FileText,
  },
];

const connectorPresets = [
  { id: "p-fs", name: "Filesystem", url: "https://demo.mcp.echogpt.io/filesystem", tools: ["list_files", "read_file", "search_files"] },
  { id: "p-gh", name: "GitHub", url: "https://demo.mcp.echogpt.io/github", tools: ["list_issues", "get_pull_request"] },
  { id: "p-search", name: "Web Search", url: "https://demo.mcp.echogpt.io/search", tools: ["web_search", "fetch_page"] },
  { id: "p-broken", name: "Broken server", url: "https://demo.mcp.echogpt.io/broken-demo", tools: ["api_call"] },
];

const statusLabels: Record<ConnectorStatus, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  error: "Error",
};

interface Notice {
  level: "ok" | "err";
  text: string;
}

function willFail(url: string): boolean {
  return /brokendemo|broken-demo|fail|errors?/i.test(url);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.hostname.length > 0 && /^https?:$/.test(url.protocol);
  } catch {
    return false;
  }
}

export function McpWorkspace() {
  const [connectors, setConnectors] = useState<ConnectorUi[]>(connectorFixtures);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const generationTokenRef = useRef(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [nameError, setNameError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const totalTools = connectors.reduce((sum, connector) => sum + connector.tools.length, 0);

  const toggleExpand = (id: string) => {
    setExpandedId((previous) => (previous === id ? null : id));
  };

  const checkAll = () => {
    if (checking) return;
    setChecking(true);
    window.setTimeout(() => {
      setConnectors((previous) =>
        previous.map((connector) => ({
          ...connector,
          lastChecked: connector.status === "error" ? connector.lastChecked : "just now",
        })),
      );
      setChecking(false);
      setNotice({ level: "ok", text: "All connectors checked." });
    }, 900);
  };

  const toggleConnection = (id: string) => {
    if (busyId) return;
    setBusyId(id);
    const token = ++generationTokenRef.current;
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      setConnectors((previous) =>
        previous.map((connector) => {
          if (connector.id !== id) return connector;
          if (connector.status === "connected") {
            setNotice({ level: "ok", text: `${connector.name} disconnected.` });
            return { ...connector, status: "disconnected" as const };
          }
          const next = willFail(connector.url) ? "error" : "connected";
          setNotice(
            next === "error"
              ? { level: "err", text: `${connector.name} is unreachable (demo server always fails).` }
              : { level: "ok", text: `${connector.name} connected — ${connector.tools.length} tools exposed.` },
          );
          return { ...connector, status: next, lastChecked: "just now" };
        }),
      );
      setBusyId(null);
    }, 850);
  };

  const removeConnector = (id: string) => {
    const removed = connectors.find((connector) => connector.id === id);
    setConnectors((previous) => previous.filter((connector) => connector.id !== id));
    if (removed) setNotice({ level: "ok", text: `${removed.name} removed from the toolbox.` });
  };

  const applyPreset = (preset: (typeof connectorPresets)[number]) => {
    setName(preset.name);
    setUrl(preset.url);
    setToken("");
    setNameError("");
    setUrlError("");
  };

  const submitConnector = () => {
    const nameValid = name.trim().length >= 2;
    const urlValid = isValidUrl(url.trim());
    setNameError(nameValid ? "" : "Name needs at least 2 characters.");
    setUrlError(urlValid ? "" : "Enter a full http(s) server URL.");
    if (!nameValid || !urlValid) return;

    setConnecting(true);
    const connectorToken = ++generationTokenRef.current;
    window.setTimeout(() => {
      if (connectorToken !== generationTokenRef.current) return;
      const nextStatus: ConnectorStatus = willFail(url) ? "error" : "connected";
      const connector: ConnectorUi = {
        id: `c-${Date.now()}`,
        name: name.trim(),
        description: "Manually added connector.",
        url: url.trim(),
        status: nextStatus,
        tools: connectorPresets[0].tools,
        lastChecked: "just now",
        accent: nextStatus === "error" ? "rose" : "emerald",
        icon: Plug,
      };
      setConnectors((previous) => [connector, ...previous]);
      setNotice(
        nextStatus === "error"
          ? { level: "err", text: `${connector.name} added, but the server is unreachable (demo failure).` }
          : { level: "ok", text: `${connector.name} connected to the toolbox.` },
      );
      setConnecting(false);
      setDialogOpen(false);
      setName("");
      setUrl("");
      setToken("");
    }, 900);
  };

  const validateUrlOnInput = (value: string) => {
    setUrl(value);
    setUrlError(value.trim() && !isValidUrl(value) ? "Enter a full http(s) server URL." : "");
  };

  return (
    <div className="mcp-layout">
      <div className="mcp-scroll">
        <div className="mc-summary">
          <div className="mc-summary-text">
            <h2 className="mc-summary-title">Toolbox</h2>
            <p className="mc-summary-line">
              {totalTools} tools across {connectors.length} connectors
              {checking ? " · checking…" : ` · ${connectors[0]?.lastChecked ?? "-"}`}
            </p>
          </div>
          <button
            type="button"
            className="icon-action"
            aria-label="Check connector statuses again"
            disabled={checking}
            onClick={checkAll}
          >
            <RefreshCw size={14} className={checking ? "mc-spin" : ""} aria-hidden="true" />
          </button>
        </div>

        {notice ? (
          <p className={`mc-notice is-${notice.level}`} role="status">
            {notice.text}
          </p>
        ) : null}

        <Button className="w-full" onClick={() => setDialogOpen(true)}>
          <Plus size={15} aria-hidden="true" />
          Add connector
        </Button>

        {connectors.length === 0 ? (
          <div className="history-empty">
            <Plug size={18} aria-hidden="true" />
            <p>The toolbox is empty. Add a connector to expose tools to Chat.</p>
          </div>
        ) : (
          <ul className="mc-list" aria-label="Connectors">
            {connectors.map((connector) => {
              const open = expandedId === connector.id;
              const busy = busyId === connector.id;
              return (
                <li
                  key={connector.id}
                  className={`mc-card${open ? " is-open" : ""}${connector.status === "error" ? " has-error" : ""}`}
                >
                  <button
                    type="button"
                    className="mc-head"
                    aria-expanded={open}
                    aria-controls={`mc-drawer-${connector.id}`}
                    onClick={() => toggleExpand(connector.id)}
                  >
                    <span className={`mc-tile ${connector.accent}`} aria-hidden="true">
                      <connector.icon size={15} />
                    </span>
                    <span className="mc-head-text">
                      <span className="mc-name">{connector.name}</span>
                      <span className="mc-url">{connector.url.replace(/^https?:\/\//, "")}</span>
                    </span>
                    <span className={`mc-pill is-${connector.status}`}>
                      <span className="mc-pill-dot" aria-hidden="true" />
                      {statusLabels[connector.status]}
                    </span>
                    <ChevronDown size={14} className="mc-chevron" aria-hidden="true" />
                  </button>

                  {open ? (
                    <div className="mc-drawer" id={`mc-drawer-${connector.id}`}>
                      <p className="mc-desc">{connector.description}</p>
                      <div className="mc-row">
                        <Link2 size={12} aria-hidden="true" />
                        <span className="mc-row-text">{connector.url}</span>
                      </div>
                      <div className="mc-tools-label">
                        {connector.tools.length} tools exposed
                        <span className="mc-last-check">checked {connector.lastChecked}</span>
                      </div>
                      <div className="mc-tools" role="list" aria-label={`${connector.name} tools`}>
                        {connector.tools.map((tool) => (
                          <span className="mc-tool" role="listitem" key={tool}>
                            {tool}
                          </span>
                        ))}
                      </div>
                      {connector.status === "error" ? (
                        <p className="mc-error-note" role="alert">
                          This demo server always fails — it exists so the error state can be tested.
                        </p>
                      ) : null}
                      <div className="mc-drawer-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => toggleConnection(connector.id)}
                        >
                          {busy ? (
                            <RefreshCw size={13} className="mc-spin" aria-hidden="true" />
                          ) : connector.status === "connected" ? (
                            <Unplug size={13} aria-hidden="true" />
                          ) : (
                            <Plug size={13} aria-hidden="true" />
                          )}
                          {busy ? "Working…" : connector.status === "connected" ? "Disconnect" : "Connect"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mc-remove"
                          disabled={busy}
                          onClick={() => removeConnector(connector.id)}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mcp-footer">
        <p className="mcp-note">
          <ShieldCheck size={12} aria-hidden="true" />
          Demo only — no real MCP server is contacted and no token leaves this popup.
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="mc-dialog">
          <DialogHeader>
            <DialogTitle className="mc-dialog-title">Add a connector</DialogTitle>
            <DialogDescription className="mc-dialog-desc">
              Point this popup at a demo MCP server. Nothing actually connects.
            </DialogDescription>
          </DialogHeader>

          <div className="mc-dialog-body">
            <div className="mc-presets-label">Start from a sample server</div>
            <div className="mc-presets" role="group" aria-label="Sample servers">
              {connectorPresets.map((preset) => (
                <button type="button" key={preset.id} className="prompt-chip" onClick={() => applyPreset(preset)}>
                  {preset.id === "p-broken" ? `${preset.name} (fails)` : preset.name}
                </button>
              ))}
            </div>

            <div className="write-field">
              <label htmlFor="mc-name">Name</label>
              <input
                id="mc-name"
                className="url-input"
                type="text"
                placeholder="e.g. Company wiki"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(event.target.value.trim() && event.target.value.trim().length < 2 ? "Name needs at least 2 characters." : "");
                }}
              />
              {nameError ? (
                <p className="mc-field-error" role="alert">{nameError}</p>
              ) : null}
            </div>

            <div className="write-field">
              <label htmlFor="mc-url">Server URL</label>
              <input
                id="mc-url"
                className="url-input"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={url}
                onChange={(event) => validateUrlOnInput(event.target.value)}
              />
              {urlError ? (
                <p className="mc-field-error" role="alert">{urlError}</p>
              ) : null}
            </div>

            <div className="write-field">
              <label htmlFor="mc-token">
                <KeyRound size={12} aria-hidden="true" />
                Auth token <span className="mc-optional">optional</span>
              </label>
              <input
                id="mc-token"
                className="url-input"
                type="password"
                placeholder="••••••••"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </div>

            <p className="mc-security">
              <ShieldCheck size={13} aria-hidden="true" />
              Demo only — the token is never stored, sent, or claimed to be secure.
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={connecting}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={submitConnector} disabled={connecting || !name.trim() || !url.trim()}>
              {connecting ? (
                <>
                  <RefreshCw size={14} className="mc-spin" aria-hidden="true" />
                  Connecting…
                </>
              ) : (
                <>
                  <Plus size={14} aria-hidden="true" />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}