"use client";

import { Check, Copy, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type WriteMode = "compose" | "reply" | "grammar";

const writeModes: Array<{ id: WriteMode; label: string }> = [
  { id: "compose", label: "Compose" },
  { id: "reply", label: "Reply" },
  { id: "grammar", label: "Grammar" },
];

const formatOptions = ["General", "Email", "Blog post", "Social post"] as const;
const toneOptions = ["Neutral", "Friendly", "Professional", "Formal"] as const;
const lengthOptions = ["Short", "Medium", "Long"] as const;
const languageOptions = ["English", "Spanish", "French", "German"] as const;

interface WriteWorkspaceProps {
  onInsertToPrompt: (text: string) => void;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function demoWriteResult(mode: WriteMode, topic: string, format: string, tone: string, length: string, language: string): string {
  const toneLead: Record<string, string> = {
    Neutral: "Here is the draft.",
    Friendly: "Hi there — I hope this finds you well!",
    Professional: "This draft is ready for review.",
    Formal: "Please find the requested draft below.",
  };
  const lengthLine: Record<string, string> = {
    Short: "Keep it focused on the essentials.",
    Medium: "This stays concise while covering the key points.",
    Long: "This explores the topic in more depth.",
  };
  if (mode === "reply") {
    return `${toneLead[tone]}\n\n${capitalize(topic)} In the full version, I would reply directly to your message. This is a local demo — no writing model was called.`;
  }
  if (mode === "grammar") {
    return `${toneLead[tone]}\n\n${capitalize(topic)} This is a demo grammar pass — no corrections were actually applied yet.`;
  }
  return `${toneLead[tone]}\n\n${capitalize(topic)} is the focus here.\n\n${lengthLine[length]} In the full version, ${format.toLowerCase()} content would be drafted in ${language} with a ${tone.toLowerCase()} tone. This is a local demo — no writing model was called.`;
}

function ControlChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="chip-field">
      <legend className="write-section">{label}</legend>
      <div className="chip-group" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            key={option}
            role="radio"
            aria-checked={value === option}
            className={`control-chip${value === option ? " is-selected" : ""}`}
            onClick={() => onChange(option)}
          >
            {value === option ? <Check size={12} className="chip-check" aria-hidden="true" /> : null}
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function WriteWorkspace({ onInsertToPrompt }: WriteWorkspaceProps) {
  const [mode, setMode] = useState<WriteMode>("compose");
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<string>("General");
  const [tone, setTone] = useState<string>("Neutral");
  const [length, setLength] = useState<string>("Medium");
  const [language, setLanguage] = useState<string>("English");
  const [generation, setGeneration] = useState<"idle" | "generating" | "complete">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const generationTokenRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller && (result || generation === "generating")) scroller.scrollTop = scroller.scrollHeight;
  }, [result, generation]);

  const generate = () => {
    const text = topic.trim();
    if (!text || generation === "generating") return;
    const token = ++generationTokenRef.current;
    setGeneration("generating");
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      setResult(demoWriteResult(mode, text, format, tone, length, language));
      setGeneration("complete");
    }, 900);
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
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
    <div className="write-layout">
      <div
        className="write-tabs"
        role="tablist"
        aria-label="Writing mode"
      >
        {writeModes.map((writeMode) => (
          <button
            type="button"
            key={writeMode.id}
            role="tab"
            id={`write-tab-${writeMode.id}`}
            aria-selected={mode === writeMode.id}
            aria-controls="write-panel"
            className={`write-tab${mode === writeMode.id ? " is-active" : ""}`}
            onClick={() => setMode(writeMode.id)}
          >
            {writeMode.label}
          </button>
        ))}
      </div>

      <div
        className="write-scroll"
        id="write-panel"
        role="tabpanel"
        aria-labelledby={`write-tab-${mode}`}
        ref={scrollRef}
      >
        <div className="write-field">
          <label htmlFor="write-topic">
            {mode === "reply" ? "Message to reply to" : mode === "grammar" ? "Text to check" : "Topic"}
          </label>
          <textarea
            id="write-topic"
            rows={2}
            placeholder={mode === "reply" ? "Paste the message you want to answer..." : "Describe what you want to write..."}
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
        </div>

        <ControlChips label="Format" options={formatOptions} value={format} onChange={setFormat} />
        <ControlChips label="Tone" options={toneOptions} value={tone} onChange={setTone} />
        <ControlChips label="Length" options={lengthOptions} value={length} onChange={setLength} />
        <ControlChips label="Output language" options={languageOptions} value={language} onChange={setLanguage} />

        {generation === "generating" ? (
          <div className="result-panel" aria-live="polite">
            <div className="result-toolbar">
              <h3>Result</h3>
              <span className="demo-marker">Demo</span>
            </div>
            <p className="generating-text">
              <span className="typing-dots" aria-hidden="true"><span /><span /><span /></span>
              <span role="status">Generating…</span>
            </p>
          </div>
        ) : result ? (
          <div className="result-panel">
            <div className="result-toolbar">
              <h3>Result</h3>
              <span className="demo-marker">Demo</span>
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
                className="secondary-button"
                aria-label="Insert result into the chat prompt"
                onClick={() => onInsertToPrompt(result)}
              >
                Insert into Chat
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
            <p className="result-body">{result}</p>
          </div>
        ) : (
          <p className="write-hint">Enter a topic above and choose your settings, then press Generate.</p>
        )}
      </div>

      <div className="write-footer">
        <Button
          className="flex-1"
          disabled={!topic.trim() || generation === "generating"}
          onClick={generate}
        >
          {generation === "generating" ? "Generating…" : "Generate"}
        </Button>
      </div>

      <p className="sr-only" role="status">
        {generation === "generating"
          ? "Generating text."
          : result
            ? "Result ready."
            : ""}
      </p>
    </div>
  );
}