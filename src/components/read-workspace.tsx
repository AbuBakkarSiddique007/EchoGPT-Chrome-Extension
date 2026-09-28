"use client";

import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  FileUp,
  Globe,
  Lightbulb,
  Link2,
  ListChecks,
  MessageCircleQuestion,
  RotateCcw,
  ScrollText,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";

type SourceType = "page" | "url" | "file";
type ReadMode = "summary" | "keypoints" | "explain" | "ask";

interface ReadResult {
  title: string;
  domain: string;
  timestamp: string;
  body: string;
}

const sourceTabs: Array<{ id: SourceType; label: string; icon: typeof Globe }> = [
  { id: "page", label: "Current page", icon: Globe },
  { id: "url", label: "URL", icon: Link2 },
  { id: "file", label: "File", icon: FileText },
];

const readModes: Array<{ id: ReadMode; label: string; icon: typeof ScrollText }> = [
  { id: "summary", label: "Summary", icon: ScrollText },
  { id: "keypoints", label: "Key points", icon: ListChecks },
  { id: "explain", label: "Explain", icon: Lightbulb },
  { id: "ask", label: "Ask", icon: MessageCircleQuestion },
];

const demoSource = {
  title: "State of the Web 2026",
  domain: "example.com",
};

const modeVerbs: Record<ReadMode, string> = {
  summary: "Summarize",
  keypoints: "Extract key points",
  explain: "Explain",
  ask: "Answer",
};

function hostFromUrl(raw: string): string {
  const match = raw.trim().match(/^(?:https?:\/\/)?([^/\s]+)/i);
  return match ? match[1] : raw.trim();
}

function demoReadResult(mode: ReadMode, title: string, domain: string): string {
  const lead = `Read of "${title}" (${domain}) is simulated.`;
  if (mode === "summary") {
    return `${lead}\n\nIn the full product, the summary would condense the page into a few focused sentences. For now this is a local demo placeholder — no reading model was called.`;
  }
  if (mode === "keypoints") {
    return `${lead}\n\nThe demo would list the most important takeaways:\n\n• Key claim one from the page\n• Key claim two from the page\n• Key claim three from the page\n\nNo reading model was called in this local demo.`;
  }
  if (mode === "explain") {
    return `${lead}\n\nThe explanation would unpack the page's core topic in plain language, define the concepts it assumes, and connect them to a wider context.\n\nThis is a demo placeholder — no reading model was called.`;
  }
  return `${lead}\n\nThe answer would draw on the page and chat context to reply to your question with references.\n\nThis is a demo placeholder — no reading model was called.`;
}

export function ReadWorkspace() {
  const [sourceType, setSourceType] = useState<SourceType>("page");
  const [urlInput, setUrlInput] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [mode, setMode] = useState<ReadMode>("summary");
  const [question, setQuestion] = useState("");
  const [generation, setGeneration] = useState<"idle" | "generating" | "complete">("idle");
  const [result, setResult] = useState<ReadResult | null>(null);
  const [copied, setCopied] = useState(false);
  const generationTokenRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller && (result || generation === "generating")) scroller.scrollTop = scroller.scrollHeight;
  }, [result, generation]);

  const canGenerate =
    generation !== "generating" &&
    (sourceType === "page" || (sourceType === "url" && urlInput.trim().length > 0) || (sourceType === "file" && file !== null)) &&
    (mode !== "ask" || question.trim().length > 0);

  const sourceLabel = (() => {
    if (sourceType === "page") return { title: demoSource.title, domain: demoSource.domain };
    if (sourceType === "url") return { title: urlInput.trim(), domain: hostFromUrl(urlInput) };
    return { title: file?.name ?? "Untitled file", domain: "Local file" };
  })();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (picked) {
      setFile({ name: picked.name, size: picked.size });
      setResult(null);
    }
  };

  const generate = () => {
    if (!canGenerate) return;
    const token = ++generationTokenRef.current;
    const clock = new Date();
    const stamp = clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setGeneration("generating");
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      const { title, domain } = sourceLabel;
      setResult({ title, domain, timestamp: stamp, body: demoReadResult(mode, title, domain) });
      setGeneration("complete");
    }, 900);
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${result.title}\n${result.domain} · ${result.timestamp}\n\n${result.body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API is unavailable outside a secure context.
    }
  };

  const clearResult = () => {
    generationTokenRef.current += 1;
    setResult(null);
    setGeneration("idle");
  };

  return (
    <div className="read-layout">
      <div className="read-sources" role="tablist" aria-label="Reading source">
        {sourceTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              type="button"
              role="tab"
              key={tab.id}
              id={`read-source-${tab.id}`}
              aria-selected={sourceType === tab.id}
              aria-controls="read-source-panel"
              className={`read-source-tab${sourceType === tab.id ? " is-active" : ""}`}
              onClick={() => {
                setSourceType(tab.id);
                setResult(null);
              }}
            >
              <Icon size={13} className="read-source-tab-icon" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="read-scroll" id="read-source-panel" role="tabpanel" aria-labelledby={`read-source-${sourceType}`} ref={scrollRef}>
        {sourceType === "page" ? (
          <div className="read-source-card">
            <span className="read-source-icon" aria-hidden="true"><Globe size={17} /></span>
            <span className="read-source-meta">
              <span className="read-source-title">{demoSource.title}</span>
              <span className="read-source-line">{demoSource.domain} · Open in this tab</span>
            </span>
            <span className="read-tag">Page</span>
          </div>
        ) : null}

        {sourceType === "url" ? (
          <div className="write-field">
            <label htmlFor="read-url">Link to read</label>
            <div className="read-url-row">
              <input
                id="read-url"
                type="url"
                className="url-input"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(event) => {
                  setUrlInput(event.target.value);
                  setResult(null);
                }}
              />
              {urlInput.trim() ? (
                <Button variant="outline" size="icon" className="read-url-go" aria-label="Use this URL as the reading source">
                  <ArrowUpRight size={15} />
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {sourceType === "url" && urlInput.trim() ? (
          <div className="read-source-card">
            <span className="read-source-icon" aria-hidden="true"><Link2 size={16} /></span>
            <span className="read-source-meta">
              <span className="read-source-title">{urlInput.trim()}</span>
              <span className="read-source-line">{hostFromUrl(urlInput)} · Typed URL</span>
            </span>
            <span className="read-tag">URL</span>
          </div>
        ) : null}

        {sourceType === "file" ? (
          file ? (
            <div className="read-source-card">
              <span className="read-source-icon" aria-hidden="true"><FileText size={16} /></span>
              <span className="read-source-meta">
                <span className="read-source-title">{file.name}</span>
                <span className="read-source-line">
                  {(file.size / 1024).toFixed(1)} KB · Ready to read (demo)
                </span>
              </span>
              <button type="button" className="read-tag read-tag-button" onClick={() => fileInputRef.current?.click()}>
                Change
              </button>
            </div>
          ) : (
            <>
              <button type="button" className="drop-zone" onClick={() => fileInputRef.current?.click()}>
                <FileUp size={20} className="drop-zone-icon" aria-hidden="true" />
                <span className="drop-title">Drop a file here or browse</span>
                <span className="drop-note">Supported: PDF, DOCX, TXT, Markdown, HTML</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".pdf,.docx,.txt,.md,.html"
                onChange={handleFileChange}
              />
            </>
          )
        ) : null}

        <fieldset className="chip-field">
          <legend className="write-section">Reading mode</legend>
          <div className="chip-group" role="radiogroup" aria-label="Reading mode">
            {readModes.map((readMode) => {
              const Icon = readMode.icon;
              return (
                <button
                  type="button"
                  key={readMode.id}
                  role="radio"
                  aria-checked={mode === readMode.id}
                  className={`control-chip read-mode-chip${mode === readMode.id ? " is-selected" : ""}`}
                  onClick={() => setMode(readMode.id)}
                >
                  {mode === readMode.id ? <Check size={12} className="chip-check" aria-hidden="true" /> : null}
                  <Icon size={12} aria-hidden="true" />
                  {readMode.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {mode === "ask" ? (
          <div className="write-field">
            <label htmlFor="read-question">Your question</label>
            <textarea
              id="read-question"
              rows={2}
              placeholder="Ask anything about this source…"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setResult(null);
              }}
            />
          </div>
        ) : null}

        {generation === "generating" ? (
          <div className="result-panel" aria-live="polite">
            <div className="result-toolbar">
              <h3>Reading</h3>
              <span className="demo-marker">Demo</span>
            </div>
            <p className="generating-text">
              <span className="typing-dots" aria-hidden="true"><span /><span /><span /></span>
              <span role="status">Reading the source…</span>
            </p>
          </div>
        ) : result ? (
          <div className="result-panel">
            <div className="read-result-head">
              <span className="read-result-tile" aria-hidden="true">
                {sourceType === "file" ? <FileText size={14} /> : sourceType === "url" ? <Link2 size={14} /> : <Globe size={14} />}
              </span>
              <span className="read-source-meta">
                <span className="read-result-title">{result.title}</span>
                <span className="read-source-line">{result.domain} · {result.timestamp}</span>
              </span>
              <span className="demo-marker">Demo</span>
            </div>
            <p className="result-body">{result.body}</p>
            <div className="result-toolbar">
              <span className="result-toolbar-spacer" />
              <button
                type="button"
                className="icon-action"
                aria-label="Copy result"
                onClick={() => copyResult()}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <button
                type="button"
                className="icon-action"
                aria-label="Regenerate result"
                onClick={generate}
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                className="icon-action"
                aria-label="Clear result"
                onClick={clearResult}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ) : (
          <p className="write-hint">
            {sourceType === "page"
              ? "Read the open page, a pasted link, or a local file, then pick a reading mode and generate a result."
              : sourceType === "url"
                ? "Paste a link above, choose a reading mode, and generate a result."
                : "Add a supported file, choose a reading mode, and generate a result."}
          </p>
        )}
      </div>

      <div className="read-footer">
        <Button className="flex-1" disabled={!canGenerate} onClick={generate}>
          {generation === "generating" ? "Reading…" : `${modeVerbs[mode]} · ${sourceType === "page" ? "Current page" : sourceType === "url" ? "URL" : "File"}`}
        </Button>
      </div>

      <p className="sr-only" role="status">
        {generation === "generating"
          ? "Reading the source."
          : result
            ? "Result ready."
            : ""}
      </p>
    </div>
  );
}