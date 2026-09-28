"use client";

import {
  ArrowUp,
  Check,
  Copy,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { Button } from "@/components/ui/button";

const compareModels = [
  { id: "fast", label: "EchoGPT Fast", description: "Speedy, everyday answers", tone: "fast" },
  { id: "pro", label: "EchoGPT Pro", description: "Deeper, more careful reasoning", tone: "pro" },
  { id: "mini", label: "EchoGPT Mini", description: "Lightweight, low-latency replies", tone: "mini" },
] as const;

const sampleQuestions = [
  "Explain how browser extensions can access page context",
  "Draft a short launch announcement for a demo AI tool",
  "Summarize the trade-offs of local-first apps",
];

const MIN_MODELS = 2;

interface Answer {
  modelId: string;
  label: string;
  tone: string;
  text: string;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function demoAnswer(modelId: string, question: string): string {
  const stem = capitalize(question.replace(/[.?!]+$/, ""));
  if (modelId === "pro") {
    return `${stem}\n\nConsidering the main trade-offs, the stronger answer weighs structure, clarity, and context before committing. A careful model would break this down step by step, stay precise, and flag assumptions.\n\nThis is a local demo answer — no model was actually called.`;
  }
  if (modelId === "fast") {
    return `${stem}\n\nQuick take: get the core idea out first, add one concrete example, then stop. Speed means less polish and more signal.\n\nDemo reply — no model was actually called.`;
  }
  return `${stem}\n\nTL;DR answer. Short and functional, with the essentials kept and the details trimmed.\n\nDemo reply — no model was actually called.`;
}

export function CompareWorkspace() {
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<string[]>(["pro", "fast"]);
  const [generation, setGeneration] = useState<"idle" | "generating" | "complete">("idle");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, "up" | "down">>({});
  const [followUp, setFollowUp] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const generationTokenRef = useRef(0);
  const winnerRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const followUpRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller && (generation === "generating" || answers.length > 0)) scroller.scrollTop = scroller.scrollHeight;
  }, [generation, answers]);

  const toggleModel = (id: string) => {
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : previous.length >= 3 ? previous : [...previous, id],
    );
    setAnswers([]);
    setWinnerId(null);
    setFollowUp("");
  };

  const runCompare = () => {
    if (selected.length < MIN_MODELS || !question.trim() || generation === "generating") return;
    const token = ++generationTokenRef.current;
    setGeneration("generating");
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      const chosen = compareModels.filter((model) => selected.includes(model.id));
      const ranked = chosen
        .map((model) => ({
          modelId: model.id,
          label: model.label,
          tone: model.tone,
          text: demoAnswer(model.id, question),
        }))
        .sort((a, b) => b.label.localeCompare(a.label));
      setAnswers(ranked);
      setWinnerId(chosen[winnerRef.current % chosen.length].id);
      winnerRef.current += 1;
      setLiked({});
      setGeneration("complete");
    }, 900);
  };

  const askFollowUp = () => {
    const text = followUp.trim();
    if (!text || generation === "generating") return;
    setQuestion(text);
    setFollowUp("");
    followUpRef.current?.blur();
    const token = ++generationTokenRef.current;
    setGeneration("generating");
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      const chosen = compareModels.filter((model) => selected.includes(model.id));
      const ranked = chosen.map((model) => ({
        modelId: model.id,
        label: model.label,
        tone: model.tone,
        text: demoAnswer(model.id, text),
      }));
      setAnswers(ranked);
      setWinnerId(chosen[winnerRef.current % chosen.length].id);
      winnerRef.current += 1;
      setLiked({});
      setGeneration("complete");
    }, 900);
  };

  const toggleLike = (id: string) => {
    setLiked((previous) => {
      const current = previous[id];
      const next: Record<string, "up" | "down"> = { ...previous };
      if (current === "up") delete next[id];
      else if (current === "down") next[id] = "up";
      else next[id] = "up";
      return next;
    });
  };

  const toggleDislike = (id: string) => {
    setLiked((previous) => {
      const current = previous[id];
      const next: Record<string, "up" | "down"> = { ...previous };
      if (current === "down") delete next[id];
      else if (current === "up") next[id] = "down";
      else next[id] = "down";
      return next;
    });
  };

  const copyAnswer = async (id: string) => {
    const answer = answers.find((item) => item.modelId === id);
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer.text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      // Clipboard API is unavailable outside a secure context.
    }
  };

  const winner = answers.find((answer) => answer.modelId === winnerId);
  const canCompare = selected.length >= MIN_MODELS && question.trim().length > 0 && generation !== "generating";

  return (
    <div className="comp-layout">
      <div className="comp-scroll" ref={scrollRef}>
        <div className="write-field">
          <label htmlFor="comp-question">Your question</label>
          <textarea
            id="comp-question"
            rows={3}
            placeholder="One question, asked of every model at once…"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setAnswers([]);
              setWinnerId(null);
              setFollowUp("");
            }}
          />
          <div className="studio-starters" role="group" aria-label="Sample questions">
            {sampleQuestions.map((sample) => (
              <button
                type="button"
                key={sample}
                className="prompt-chip"
                onClick={() => {
                  setQuestion(sample);
                  setAnswers([]);
                  setWinnerId(null);
                  setFollowUp("");
                }}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="chip-field">
          <legend className="comp-models-label">
            <span>Models</span>
            <span className="comp-count">
              {selected.length} selected
            </span>
          </legend>
          <div className="comp-models" role="group" aria-label="Models to compare">
            {compareModels.map((model) => {
              const active = selected.includes(model.id);
              return (
                <button
                  type="button"
                  key={model.id}
                  role="checkbox"
                  aria-checked={active}
                  className={`comp-model-chip tone-${model.tone}${active ? " is-selected" : ""}`}
                  onClick={() => toggleModel(model.id)}
                >
                  <span className="model-dot" aria-hidden="true" />
                  <span className="comp-model-name">{model.label}</span>
                  {active ? <Check size={12} className="comp-model-check" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        {generation === "generating" ? (
          <div className="result-panel" aria-live="polite">
            <div className="result-toolbar">
              <h3>Calling models</h3>
              <span className="demo-marker">Demo</span>
            </div>
            <p className="generating-text">
              <span className="typing-dots" aria-hidden="true"><span /><span /><span /></span>
              <span role="status">Asking {selected.length} models…</span>
            </p>
          </div>
        ) : winner ? (
          <div className="comp-arena">
            <div className={`comp-verdict tone-${winner.tone}`}>
              <span className="comp-verdict-icon" aria-hidden="true"><Trophy size={15} /></span>
              <span className="comp-verdict-body">
                {winner.label} came out ahead on this round
                <span className="comp-verdict-note">Demo ranking — no models were actually called.</span>
              </span>
            </div>

            <ul className="comp-blocks" aria-label="Model answers">
              {answers.map((answer, index) => (
                <li
                  key={answer.modelId}
                  className={`comp-block tone-${answer.tone}${answer.modelId === winnerId ? " is-winner" : ""}`}
                  style={{ animationDelay: `${index * 110}ms` }}
                >
                  <div className="comp-block-head">
                    <span className="model-dot" aria-hidden="true" />
                    <span className="comp-block-name">{answer.label}</span>
                    {answer.modelId === winnerId ? (
                      <span className="comp-badge">Winner</span>
                    ) : (
                      <span className="demo-marker">Demo</span>
                    )}
                    <span className="result-toolbar-spacer" />
                    <button
                      type="button"
                      className={`icon-action${liked[answer.modelId] === "up" ? " is-liked" : ""}`}
                      aria-label={`Like ${answer.label} answer`}
                      onClick={() => toggleLike(answer.modelId)}
                    >
                      <ThumbsUp size={13} />
                    </button>
                    <button
                      type="button"
                      className={`icon-action${liked[answer.modelId] === "down" ? " is-disliked" : ""}`}
                      aria-label={`Dislike ${answer.label} answer`}
                      onClick={() => toggleDislike(answer.modelId)}
                    >
                      <ThumbsDown size={13} />
                    </button>
                    <button
                      type="button"
                      className="icon-action"
                      aria-label={`Copy ${answer.label} answer`}
                      onClick={() => copyAnswer(answer.modelId)}
                    >
                      {copiedId === answer.modelId ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="result-body">{answer.text}</p>
                </li>
              ))}
            </ul>

            <div className="comp-followup">
              <label htmlFor="comp-followup" className="sr-only">Ask a follow-up question</label>
              <input
                ref={followUpRef}
                id="comp-followup"
                type="text"
                placeholder="Ask a follow-up…"
                value={followUp}
                onChange={(event) => setFollowUp(event.target.value)}
                onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") askFollowUp();
                }}
              />
              <Button
                size="icon"
                aria-label="Ask follow-up"
                disabled={!followUp.trim()}
                onClick={askFollowUp}
              >
                <ArrowUp size={14} />
              </Button>
            </div>
          </div>
        ) : (
          <p className="write-hint">Pick two or more models, ask one question, and compare their demo answers side by side.</p>
        )}
      </div>

      <div className="comp-footer">
        <Button className="min-w-0 flex-1" disabled={!canCompare} onClick={runCompare}>
          <Sparkles size={15} aria-hidden="true" />
          <span className="min-w-0 truncate">Compare answers of {selected.length} models</span>
        </Button>
      </div>

      <p className="sr-only" role="status">
        {winner
          ? "Comparison ready."
          : generation === "generating"
            ? "Asking the selected models."
            : ""}
      </p>
    </div>
  );
}