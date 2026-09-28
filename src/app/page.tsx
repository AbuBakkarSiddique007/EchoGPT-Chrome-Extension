"use client";

import {
  ArrowUp,
  Blocks,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
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
  RotateCcw,
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
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

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
import { CompareWorkspace } from "@/components/compare-workspace";
import { ReadWorkspace } from "@/components/read-workspace";
import { StudioWorkspace } from "@/components/studio-workspace";
import { TranslateWorkspace } from "@/components/translate-workspace";
import { WriteWorkspace } from "@/components/write-workspace";
import type {
  Conversation,
  GenerationState,
  Message,
  ModelOption,
  QuickAction,
  ThemePreference,
  ToolId,
} from "@/lib/types";

const capabilities: Array<{ id: ToolId; label: string; description: string; icon: typeof MessageSquare }> = [
  { id: "chat", label: "Chat", description: "Ask about this page", icon: MessageSquare },
  { id: "write", label: "Write", description: "Draft and refine text", icon: FilePenLine },
  { id: "read", label: "Read", description: "Summarize a source", icon: BookOpen },
  { id: "translate", label: "Translate", description: "Translate selected text", icon: Languages },
  { id: "image", label: "Image", description: "Create visuals", icon: ImageIcon },
  { id: "video", label: "Video", description: "Create motion", icon: Video },
  { id: "compare", label: "Compare", description: "Compare two sources", icon: GitCompare },
  { id: "mcp", label: "MCP", description: "Connect external tools", icon: Blocks },
];

const quickActions = [
  { id: "summarize", label: "Summarize this page", tool: "chat" },
  { id: "explain", label: "Explain it in simple terms", tool: "chat" },
] as const satisfies readonly QuickAction[];

const quickActionIcons = {
  summarize: BookOpen,
  explain: WandSparkles,
} as const;

const modelOptions: ModelOption[] = [
  { id: "fast", label: "EchoGPT Fast", description: "Speedy, everyday answers" },
  { id: "pro", label: "EchoGPT Pro", description: "Deeper, more careful reasoning" },
  { id: "mini", label: "EchoGPT Mini", description: "Lightweight, low-latency replies" },
];

function demoReply(prompt: string): string {
  const text = prompt.toLowerCase();
  if (text.includes("summar")) {
    return "Here is a demo summary of the current page: EchoGPT is a browser-side AI companion. It can read the page you are on, answer questions about it, and help you create new content. This reply is generated locally to demonstrate the chat flow.";
  }
  if (text.includes("explain") || text.includes("simple")) {
    return "Here is a plain-language demo explanation of the selected context: a browser extension that brings an AI workspace to any webpage you visit. This reply is generated locally to demonstrate the chat flow.";
  }
  return `Demo reply: I received "${prompt}". In the full version I would use the current page as context and answer here. No model call has been made in this prototype.`;
}

function createConversation(id: number): Conversation {
  return { id: `demo-${id}`, title: "New chat", messages: [] };
}

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
  const [activeTool, setActiveTool] = useState<ToolId>("chat");
  const [prompt, setPrompt] = useState("");
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, readSystemTheme, readServerTheme);
  const [themeOverride, setThemeOverride] = useState<ThemePreference | null>(null);
  const theme = themeOverride ?? systemTheme;
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const idRef = useRef(1);
  const [conversation, setConversation] = useState<Conversation>({
    id: "demo-1",
    title: "New chat",
    messages: [],
  });
  const [history, setHistory] = useState<Conversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [generation, setGeneration] = useState<GenerationState>("completed");
  const [selectedModel, setSelectedModel] = useState<ModelOption>(modelOptions[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const generationTokenRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [conversation.messages, generation]);

  const toggleTheme = () => {
    setThemeOverride(theme === "light" ? "dark" : "light");
  };

  const activeCapability = capabilities.find((capability) => capability.id === activeTool);

  const runAssistantReply = (promptText: string) => {
    const token = ++generationTokenRef.current;
    setGeneration("generating");
    const showError = promptText.toLowerCase().includes("show an error");
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      const reply: Message = {
        id: `m-${++idRef.current}`,
        role: "assistant",
        content: showError
          ? "This is a simulated failure — no model was called. Asking the same question again will retry the demo."
          : demoReply(promptText),
        status: showError ? "error" : "complete",
      };
      setConversation((conversation) => ({
        ...conversation,
        messages: [...conversation.messages, reply],
      }));
      setGeneration(showError ? "error" : "completed");
    }, 900);
  };

  const handleSend = (raw: string) => {
    const text = raw.trim();
    if (!text || generation === "generating") return;
    const userMessage: Message = {
      id: `m-${++idRef.current}`,
      role: "user",
      content: text,
      status: "complete",
    };
    setConversation((conversation) => ({
      ...conversation,
      messages: [...conversation.messages, userMessage],
    }));
    setPrompt("");
    composerRef.current?.focus();
    runAssistantReply(text);
  };

  const archiveCurrentConversation = (): Conversation | null => {
    if (conversation.messages.length === 0) return null;
    const title = (conversation.messages.find((message) => message.role === "user")?.content ?? "New chat").slice(0, 42);
    return { ...conversation, title };
  };

  const handleNewChat = () => {
    generationTokenRef.current += 1;
    const archived = archiveCurrentConversation();
    if (archived) setHistory((items) => [archived, ...items]);
    setConversation(createConversation(++idRef.current));
    setGeneration("completed");
    setHistoryOpen(false);
    setPrompt("");
  };

  const restoreConversation = (saved: Conversation) => {
    generationTokenRef.current += 1;
    const archived = archiveCurrentConversation();
    setHistory((items) => {
      const kept = items.filter((item) => item.id !== saved.id);
      return archived ? [archived, ...kept] : kept;
    });
    setConversation(saved);
    setGeneration("completed");
    setHistoryOpen(false);
    setPrompt("");
  };

  const copyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      // Clipboard API is unavailable outside a secure context.
    }
  };

  const regenerate = (message: Message) => {
    if (generation === "generating") return;
    const index = conversation.messages.findIndex((matched) => matched.id === message.id);
    if (index < 0) return;
    const precedingUser = [...conversation.messages.slice(0, index)]
      .reverse()
      .find((matched) => matched.role === "user");
    setConversation((conversation) => ({
      ...conversation,
      messages: conversation.messages.slice(0, index),
    }));
    runAssistantReply(precedingUser?.content ?? "");
  };

  const handleInsertToPrompt = (text: string) => {
    setPrompt(text);
    setActiveTool("chat");
  };

  const handleComposerKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(prompt);
    } else if (event.key === "Escape") {
      event.currentTarget.blur();
    }
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
              className={`rail-item${activeCapability?.id === capability.id ? " is-active" : ""}`}
              key={capability.label}
              type="button"
              aria-current={activeCapability?.id === capability.id ? "page" : undefined}
              onClick={() => setActiveTool(capability.id)}
            >
              <capability.icon className="rail-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{capability.label}</span>
            </button>
          ))}

          {moreOpen && (
            <div className="rail-more-features">
              {capabilities.slice(4).map((capability) => (
                <button
                  className={`rail-item${activeCapability?.id === capability.id ? " is-active" : ""}`}
                  key={capability.label}
                  type="button"
                  aria-current={activeCapability?.id === capability.id ? "page" : undefined}
                  onClick={() => setActiveTool(capability.id)}
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
          <div className="workspace-heading">
            <div>
              <div className="title-row">
                <h1 id="workspace-title">{activeCapability?.label ?? "Chat"}</h1>
                <span className="beta-label">Beta</span>
              </div>
              <p className="workspace-subtitle">{activeCapability?.description ?? "Your page-aware AI workspace"}</p>
            </div>
            <div className="heading-actions">
              {activeTool === "chat" ? (
                <>
                <button className="secondary-button" type="button" onClick={handleNewChat}><Plus size={14} /> New chat</button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Chat history"
                      aria-expanded={historyOpen}
                      onClick={() => setHistoryOpen((open) => !open)}
                    >
                      <SquarePen size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Chat history</TooltipContent>
                </Tooltip>
                </>
              ) : null}
            </div>
          </div>

          {activeTool === "chat" ? (
            <div className="workspace-scroll" ref={scrollRef}>
            {historyOpen ? (
              <div className="history-pane">
                <div className="history-header">
                  <h2>Chat history</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close chat history"
                        onClick={() => setHistoryOpen(false)}
                      >
                        <X size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Close chat history</TooltipContent>
                  </Tooltip>
                </div>
                {history.length === 0 ? (
                  <p className="history-empty">
                    No saved conversations yet. Chat, then press New chat to keep it here — history is kept for this session only.
                  </p>
                ) : (
                  <ul className="history-list">
                    {history.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="history-item"
                          aria-label={`Restore conversation: ${item.title}`}
                          onClick={() => restoreConversation(item)}
                        >
                          <span className="history-title">{item.title}</span>
                          <span className="history-meta">
                            {item.messages.length} message{item.messages.length === 1 ? "" : "s"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : conversation.messages.length === 0 ? (
              <>
                <div className="welcome-panel">
                  <div className="welcome-icon"><Sparkles size={18} /></div>
                  <p className="eyebrow">Welcome to EchoGPT</p>
                  <h2>What would you like to explore?</h2>
                  <p>Ask questions, summarize content, or turn ideas into something new.</p>
                </div>

                <div className="quick-actions" aria-label="Quick actions">
                  {quickActions.map((action) => {
                    const Icon = quickActionIcons[action.id];
                    return (
                      <button type="button" key={action.id} onClick={() => handleSend(action.label)}>
                        <Icon size={15} />
                        <span>{action.label}</span>
                        <ArrowUp size={13} className="quick-arrow" />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="message-list" aria-label="Conversation">
                {conversation.messages.map((message) => (
                  <div className={`message-row ${message.role}`} key={message.id}>
                    {message.role === "assistant" ? (
                      <span className="message-avatar" aria-hidden="true"><Bot size={14} /></span>
                    ) : null}
                    <div className={`message-bubble${message.status === "error" ? " error" : ""}`}>
                      {message.role === "assistant" ? (
                        <span className={message.status === "error" ? "error-marker" : "demo-marker"}>
                          {message.status === "error" ? "Error" : "Demo"}
                        </span>
                      ) : null}
                      <p>{message.content}</p>
                      {message.role === "assistant" && message.status === "complete" ? (
                        <div className="message-actions">
                          <button
                            type="button"
                            className="icon-action"
                            aria-label="Copy reply"
                            onClick={() => copyMessage(message)}
                          >
                            {copiedId === message.id ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                          {conversation.messages[conversation.messages.length - 1]?.id === message.id ? (
                            <button
                              type="button"
                              className="icon-action"
                              aria-label="Regenerate reply"
                              onClick={() => regenerate(message)}
                            >
                              <RotateCcw size={13} />
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                      {message.role === "assistant" && message.status === "error" ? (
                        <div className="message-actions">
                          <button
                            type="button"
                            className="icon-action"
                            aria-label="Retry generating this reply"
                            onClick={() => regenerate(message)}
                          >
                            <RotateCcw size={13} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {generation === "generating" ? (
                  <div className="message-row assistant">
                    <span className="message-avatar" aria-hidden="true"><Bot size={14} /></span>
                    <div className="message-bubble generating">
                      <span className="demo-marker">Demo</span>
                      <p className="generating-text">
                        <span className="typing-dots" aria-hidden="true"><span /><span /><span /></span>
                        <span role="status">Generating…</span>
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            </div>
          ) : activeTool === "write" ? (
            <WriteWorkspace onInsertToPrompt={handleInsertToPrompt} />
          ) : activeTool === "read" ? (
            <ReadWorkspace />
          ) : activeTool === "translate" ? (
            <TranslateWorkspace />
          ) : activeTool === "image" ? (
            <StudioWorkspace kind="image" />
          ) : activeTool === "video" ? (
            <StudioWorkspace kind="video" />
          ) : activeTool === "compare" ? (
            <CompareWorkspace />
          ) : (
            <div className="workspace-scroll">
              <div className="welcome-panel">
                <div className="welcome-icon">
                  {activeCapability ? (
                    <activeCapability.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <Blocks size={18} />
                  )}
                </div>
                <p className="eyebrow">Coming soon</p>
                <h2>{activeCapability?.label ?? "This workspace"} is coming next</h2>
                <p>This capability is part of the prototype build sequence and will land in a later part.</p>
              </div>
            </div>
          )}

          {activeTool === "chat" && !historyOpen ? (
          <div className="composer-wrap">
            <label htmlFor="prompt">Ask EchoGPT anything</label>
            <textarea
              id="prompt"
              ref={composerRef}
              placeholder="Ask about this page..."
              rows={3}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleComposerKeyDown}
            />
            <div className="composer-footer">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="model-chip"
                    type="button"
                    aria-label={`Model: ${selectedModel.label}`}
                  >
                    {selectedModel.label} <ChevronDown size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top">
                  <DropdownMenuLabel>Demo models</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedModel.id}
                    onValueChange={(value) =>
                      setSelectedModel(modelOptions.find((option) => option.id === value) ?? modelOptions[0])
                    }
                  >
                    {modelOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.id} value={option.id}>
                        {option.label}
                        <span className="model-detail">{option.description}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    <Button
                      size="icon"
                      aria-label="Send prompt"
                      disabled={generation === "generating" || !prompt.trim()}
                      onClick={() => handleSend(prompt)}
                    >
                      <Send size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Send prompt</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          ) : null}

          <p className="sr-only" role="status">
            {generation === "generating"
              ? "EchoGPT is generating a reply."
              : generation === "error"
                ? "EchoGPT ran into an error generating a reply."
                : conversation.messages.length
                  ? "Reply ready."
                  : ""}
          </p>
        </section >
      </div >
    </>
  );
}
