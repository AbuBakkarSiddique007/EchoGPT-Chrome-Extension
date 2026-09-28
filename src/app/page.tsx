"use client";

import {
  ArrowUp,
  BookOpen,
  ChevronDown,
  FilePenLine,
  Image,
  Languages,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Send,
  Settings2,
  Sparkles,
  SquarePen,
  Video,
  WandSparkles,
  X,
} from "lucide-react";
import { useState } from "react";

const capabilities = [
  { label: "Chat", description: "Ask about this page", icon: Sparkles },
  { label: "Write", description: "Draft and refine text", icon: FilePenLine },
  { label: "Read", description: "Summarize a source", icon: BookOpen },
  { label: "Translate", description: "Translate selected text", icon: Languages },
  { label: "Image", description: "Create visuals", icon: Image },
  { label: "Video", description: "Create motion", icon: Video },
];

const suggestions = [
  { label: "Summarize this page", icon: BookOpen },
  { label: "Explain it in simple terms", icon: WandSparkles },
];

export default function Home() {
  return (
    <main className="extension-shell">
      <ExtensionContent />
    </main>
  );
}

function ExtensionContent() {
  const [activeCapability, setActiveCapability] = useState("Chat");
  const [prompt, setPrompt] = useState("");

  return (
    <>
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">e</span>
          <span>EchoGPT</span>
        </div>
        <div className="topbar-actions">
          <span className="prototype-badge">Demo</span>
          <button className="icon-button" type="button" aria-label="Open settings">
            <Settings2 size={16} />
          </button>
        </div>
      </header>

      <div className="workspace-layout">
        <nav className="capability-rail" aria-label="Capabilities">
          {capabilities.map((capability) => (
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
          <button className="rail-item rail-item-muted" type="button" aria-label="More capabilities">
            <MoreHorizontal className="rail-icon" size={17} aria-hidden="true" />
            <span>More</span>
          </button>
          <div className="rail-spacer" />
          <button className="rail-item rail-item-muted" type="button" aria-label="Collapse navigation">
            <PanelLeft className="rail-icon" size={17} aria-hidden="true" />
            <span>Hide</span>
          </button>
        </nav>

        <section className="workspace" aria-labelledby="workspace-title">
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
              <button className="icon-button" type="button" aria-label="Open chat history"><SquarePen size={16} /></button>
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
                <button className="attach-button" type="button" aria-label="Attach a file">+</button>
                <button className="send-button" type="button" aria-label="Send prompt"><Send size={15} /></button>
              </div>
            </div>
          </div>
        </section >
      </div >
    </>
  );
}
