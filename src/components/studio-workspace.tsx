"use client";

import {
  Check,
  ChevronDown,
  Copy,
  ImageIcon,
  Play,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

type StudioKind = "image" | "video";

interface RatioOption {
  id: string;
  glyph: { w: number; h: number };
}

const ratioOptions: RatioOption[] = [
  { id: "1:1", glyph: { w: 16, h: 16 } },
  { id: "16:9", glyph: { w: 22, h: 13 } },
  { id: "9:16", glyph: { w: 13, h: 22 } },
  { id: "3:4", glyph: { w: 15, h: 20 } },
  { id: "21:9", glyph: { w: 24, h: 11 } },
];

const imageModels = [
  { id: "ultra", label: "EchoGPT Ultra", description: "Highest detail renders" },
  { id: "vision", label: "EchoGPT Vision", description: "Balanced quality and speed" },
  { id: "mini", label: "EchoGPT Mini", description: "Fast draft previews" },
] as const;

const videoModels = [
  { id: "cinema", label: "EchoGPT Cinema", description: "Cinematic motion and light" },
  { id: "motion", label: "EchoGPT Motion", description: "Smooth, reliable clips" },
  { id: "mini", label: "EchoGPT Mini", description: "Fast draft previews" },
] as const;

const countOptions = [1, 2, 4] as const;
const durationOptions = [5, 10, 15] as const;

const starterPrompts: Record<StudioKind, string[]> = {
  image: [
    "Minimal pastel landscape with floating geometric shapes at golden hour",
    "Product shot of a matte violet smartwatch on stone, soft studio light",
    "Abstract fluid waves in deep violet and lavender, ultra-detailed",
  ],
  video: [
    "Slow cinematic drone shot over a misty coastline at dawn",
    "Macro shot of glowing particles swirling in dark studio space",
    "Smooth orbit around a glossy geometric sculpture, soft reflections",
  ],
};

const surprisePrompts: Record<StudioKind, string> = {
  image: "Expressive portrait lit in violet neon rim light, film grain, editorial style",
  video: "Fast-paced montage of city lights at night, smooth motion, moody teal grade",
};

function ratioAspect(ratio: string): number {
  const [w, h] = ratio.split(":").map(Number);
  return w && h ? w / h : 1;
}

interface GeneratedItem {
  id: number;
  kind: StudioKind;
  prompt: string;
  ratio: string;
  modelLabel: string;
  size: number;
}

export function StudioWorkspace({ kind }: { kind: StudioKind }) {
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState<string>("1:1");
  const [model, setModel] = useState<string>(kind === "image" ? "ultra" : "cinema");
  const [count, setCount] = useState<number>(1);
  const [duration, setDuration] = useState<number>(5);
  const [generation, setGeneration] = useState<"idle" | "generating" | "complete">("idle");
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const generationTokenRef = useRef(0);
  const seqRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const modelList = kind === "image" ? imageModels : videoModels;
  const currentModel = modelList.find((option) => option.id === model) ?? modelList[0];
  const creditCount = kind === "image" ? count : Math.max(1, Math.ceil(duration / 5));

  const resetOutput = () => {
    generationTokenRef.current += 1;
    setGeneration("idle");
    setCopiedId(null);
  };

  const applyPrompt = (text: string) => {
    setPrompt(text);
    resetOutput();
    requestAnimationFrame(() => promptRef.current?.focus());
  };

  const generate = () => {
    if (!prompt.trim() || generation === "generating") return;
    const token = ++generationTokenRef.current;
    setGeneration("generating");
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      const item: GeneratedItem = {
        id: ++seqRef.current,
        kind,
        prompt: prompt.trim(),
        ratio,
        modelLabel: currentModel.label,
        size: kind === "image" ? count : duration,
      };
      setHistory((previous) => [item, ...previous]);
      setGeneration("complete");
    }, 900);
  };

  const copyPrompt = async (id: number) => {
    const item = history.find((entry) => entry.id === id);
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      // Clipboard API is unavailable outside a secure context.
    }
  };

  const removeItem = (id: number) => {
    resetOutput();
    setHistory((previous) => previous.filter((entry) => entry.id !== id));
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller && (generation === "generating" || history.length > 0)) scroller.scrollTop = scroller.scrollHeight;
  }, [generation, history]);

  const canGenerate = prompt.trim().length > 0 && generation !== "generating";

  return (
    <div className="studio-layout">
      <div className="studio-scroll" ref={scrollRef}>
        <div className="write-field">
          <div className="studio-label-row">
            <label htmlFor="studio-prompt">Prompt</label>
            <button type="button" className="trans-import" onClick={() => applyPrompt(surprisePrompts[kind])}>
              <Sparkles size={13} aria-hidden="true" />
              Surprise me
            </button>
          </div>
          <textarea
            id="studio-prompt"
            ref={promptRef}
            rows={3}
            placeholder={`Describe the ${kind} you want to create…`}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              resetOutput();
            }}
          />
          <div className="studio-starters" role="group" aria-label="Prompt ideas">
            {starterPrompts[kind].map((idea) => (
              <button type="button" key={idea} className="prompt-chip" onClick={() => applyPrompt(idea)}>
                {idea}
              </button>
            ))}
          </div>
        </div>

        <div className="studio-controls">
          <fieldset className="chip-field">
            <legend className="write-section">Aspect ratio</legend>
            <div className="ratio-group" role="radiogroup" aria-label="Aspect ratio">
              {ratioOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  role="radio"
                  aria-checked={ratio === option.id}
                  className={`ratio-chip${ratio === option.id ? " is-selected" : ""}`}
                  onClick={() => setRatio(option.id)}
                >
                  <span
                    className="ratio-box"
                    style={{ width: option.glyph.w, height: option.glyph.h }}
                    aria-hidden="true"
                  />
                  {option.id}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="studio-row">
            <div className="write-field">
              <label>{kind === "image" ? "Model" : "Style"}</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="trans-model studio-model" aria-label={`${kind === "image" ? "Model" : "Style"}: ${currentModel.label}`}>
                    <WandSparkles size={14} aria-hidden="true" />
                    <span className="trans-model-name">{currentModel.label}</span>
                    <ChevronDown size={13} className="trans-model-chevron" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top">
                  <DropdownMenuLabel>{kind === "image" ? "Generation model" : "Motion style"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                    {modelList.map((option) => (
                      <DropdownMenuRadioItem key={option.id} value={option.id}>
                        {option.label}
                        <span className="model-detail">{option.description}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="write-field">
              <label>{kind === "image" ? "Count" : "Duration"}</label>
              <div className="count-group" role="radiogroup" aria-label={kind === "image" ? "Number of images" : "Clip duration"}>
                {(kind === "image" ? countOptions : durationOptions).map((value) => (
                  <button
                    type="button"
                    key={value}
                    role="radio"
                    aria-checked={kind === "image" ? count === value : duration === value}
                    className={`count-chip${(kind === "image" ? count : duration) === value ? " is-selected" : ""}`}
                    onClick={() => (kind === "image" ? setCount(value) : setDuration(value))}
                  >
                    {kind === "image" ? value : `${value}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {generation === "generating" ? (
          <div className="result-panel" aria-live="polite">
            <div className="result-toolbar">
              <h3>Queued</h3>
              <span className="demo-marker">Demo</span>
            </div>
            <p className="generating-text">
              <span className="typing-dots" aria-hidden="true"><span /><span /><span /></span>
              <span role="status">
                Rendering {ratio} {kind === "image" ? `preview${count > 1 ? "s" : ""}` : `clip (${duration}s)`}…
              </span>
            </p>
          </div>
        ) : null}

        <div className="studio-history" aria-label={`${kind} creation history`}>
          <div className="studio-history-head">
            <h3>History</h3>
            <span className="history-count">{history.length} {history.length === 1 ? "creation" : "creations"}</span>
          </div>
          {history.length === 0 ? (
            <div className="history-empty">
              <ImageIcon size={18} aria-hidden="true" />
              <p>Your {kind === "image" ? "images" : "clips"} will appear here after you generate them.</p>
            </div>
          ) : (
            <ul className="history-list">
              {history.map((item, index) => (
                <li key={item.id} className="studio-history-item">
                  <div
                    className={`demo-art${index === 0 ? " is-new" : ""}`}
                    style={{ aspectRatio: ratioAspect(item.ratio) }}
                  >
                    <span className="demo-art-glyph" aria-hidden="true">
                      {item.kind === "video" ? <Play size={26} /> : <ImageIcon size={26} />}
                    </span>
                    <span className="demo-art-badge">Demo</span>
                    {item.kind === "video" ? (
                      <span className="demo-art-duration">{item.ratio}</span>
                    ) : null}
                  </div>
                  <div className="studio-history-meta">
                    <div className="studio-history-title">{item.prompt}</div>
                    <div className="studio-history-line">
                      {item.ratio} · {item.modelLabel} · {item.kind === "image" ? `×${item.size}` : `${item.size}s clip`}
                    </div>
                  </div>
                  <div className="result-toolbar">
                    <button
                      type="button"
                      className="icon-action"
                      aria-label="Copy prompt"
                      onClick={() => copyPrompt(item.id)}
                    >
                      {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <button
                      type="button"
                      className="icon-action"
                      aria-label="Remove from history"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="studio-footer">
        <p className="studio-note">
          ≈ {creditCount} credit{creditCount === 1 ? "" : "s"} · EchoGPT Pro plan — generation is simulated.
        </p>
        <Button className="min-w-0 flex-1" disabled={!canGenerate} onClick={generate}>
          {generation === "generating" ? "Rendering…" : `Create ${kind === "image" ? "image" : "clip"}`}
          <WandSparkles size={15} aria-hidden="true" />
        </Button>
      </div>

      <p className="sr-only" role="status">
        {generation === "generating"
          ? "Creating your preview."
          : history.length
            ? "Preview ready."
            : ""}
      </p>
    </div>
  );
}