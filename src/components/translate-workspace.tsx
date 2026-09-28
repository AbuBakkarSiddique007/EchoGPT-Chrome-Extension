"use client";

import { ArrowUpDown, Check, ChevronDown, Copy, Languages, ScanText, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { humanLanguages } from "@/lib/languages";
import { demoModels } from "@/lib/models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AUTO = "Auto-detect";

const languages = [AUTO, ...humanLanguages] as const;

const demoSourceText =
  "EchoGPT brings a lightweight AI workspace to every webpage you visit. Ask questions about what you are reading, summarize long articles, and turn ideas into drafts — all without leaving the page.";

const demoSamples: Record<string, string> = {
  English: "Hello! This demo translation is generated locally. No translation model was called.",
  Spanish: "¡Hola! Esta traducción de demostración se genera localmente. No se ha llamado a ningún modelo de traducción.",
  French: "Bonjour ! Cette traduction de démonstration est générée localement. Aucun modèle de traduction n'a été appelé.",
  German: "Hallo! Diese Demo-Übersetzung wird lokal erzeugt. Es wurde kein Übersetzungsmodell aufgerufen.",
  Portuguese: "Olá! Esta tradução de demonstração é gerada localmente. Nenhum modelo de tradução foi chamado.",
  Italian: "Ciao! Questa traduzione demo viene generata localmente. Nessun modello di traduzione è stato chiamato.",
  Dutch: "Hallo! Deze demo-vertaling wordt lokaal gegenereerd. Er is geen vertaalmodel aangeroepen.",
  Russian: "Привет! Этот демо-перевод создаётся локально. Никакая модель перевода не вызывалась.",
  Japanese: "こんにちは。このデモ翻訳はローカルで生成されています。翻訳モデルは呼び出されていません。",
  Korean: "안녕하세요. 이 데모 번역은 로컬에서 생성되었습니다. 번역 모델이 호출되지 않았습니다.",
  "Chinese (Simplified)": "你好！此演示译文在本地生成，未调用任何翻译模型。",
  Arabic: "مرحبًا! هذه الترجمة التجريبية تُولَّد محليًا، ولم يتم استدعاء أي نموذج ترجمة.",
  Hindi: "नमस्ते! यह डेमो अनुवाद स्थानीय रूप से बनाया गया है। कोई अनुवाद मॉडल नहीं बुलाया गया।",
};

type GenerationState = "idle" | "generating" | "complete" | "error";

interface TranslateResult {
  from: string;
  to: string;
  text: string;
}

function languageCode(label: string): string {
  const codes: Record<string, string> = {
    "Auto-detect": "AUTO",
    English: "EN",
    Spanish: "ES",
    French: "FR",
    German: "DE",
    Portuguese: "PT",
    Italian: "IT",
    Dutch: "NL",
    Russian: "RU",
    Japanese: "JA",
    Korean: "KO",
    "Chinese (Simplified)": "ZH",
    Arabic: "AR",
    Hindi: "HI",
  };
  return codes[label] ?? "??";
}

interface TranslateWorkspaceProps {
  defaultTargetLang?: string;
  defaultModel?: string;
}

export function TranslateWorkspace({ defaultTargetLang = "English", defaultModel = "pro" }: TranslateWorkspaceProps) {
  const [sourceLang, setSourceLang] = useState<string>(AUTO);
  const [targetLang, setTargetLang] = useState<string>(defaultTargetLang);
  const [text, setText] = useState("");
  const [generation, setGeneration] = useState<GenerationState>("idle");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string>(defaultModel);
  const generationTokenRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller && (result || generation === "generating")) scroller.scrollTop = scroller.scrollHeight;
  }, [result, generation]);

  const resetOutput = () => {
    generationTokenRef.current += 1;
    setResult(null);
    setGeneration("idle");
    setCopied(false);
  };

  const swapLanguages = () => {
    resetOutput();
    if (sourceLang === AUTO) {
      setSourceLang(targetLang);
      setTargetLang("English");
    } else {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
  };

  const swapIntoTarget = () => {
    if (!result) return;
    const translatedText = result.text;
    resetOutput();
    if (sourceLang === AUTO) {
      setSourceLang(targetLang);
      setTargetLang("English");
    } else {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
    setText(translatedText);
  };

  const importSelected = () => {
    resetOutput();
    setText(demoSourceText);
  };

  const translate = () => {
    if (!text.trim() || generation === "generating") return;
    const token = ++generationTokenRef.current;
    if (sourceLang !== AUTO && sourceLang === targetLang) {
      setGeneration("error");
      return;
    }
    setGeneration("generating");
    window.setTimeout(() => {
      if (token !== generationTokenRef.current) return;
      const sample = demoSamples[targetLang] ?? demoSamples.English;
      setResult({
        from: sourceLang === AUTO ? `${targetLang} auto-detected` : sourceLang,
        to: targetLang,
        text: `${sample}\n\n(Your ${text.length} characters of source text would be translated here in the full product — this is a local demo, so no translation model was called.)`,
      });
      setGeneration("complete");
    }, 900);
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API is unavailable outside a secure context.
    }
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const canTranslate = text.trim().length > 0 && generation !== "generating";

  return (
    <div className="trans-layout">
      <div className="trans-langs" role="group" aria-label="Translation languages">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`trans-lang-pill${sourceLang === AUTO ? " is-auto" : ""}`}
              aria-label={`Source language: ${sourceLang}`}
            >
              <Languages size={13} aria-hidden="true" />
              <span className="trans-lang-name">{sourceLang}</span>
              <ChevronDown size={13} className="trans-lang-chevron" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuRadioGroup value={sourceLang} onValueChange={(value) => { setSourceLang(value); resetOutput(); }}>
              {languages.map((language) => (
                <DropdownMenuRadioItem key={language} value={language}>
                  {language}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          className="trans-swap"
          aria-label="Swap source and target languages"
          onClick={swapLanguages}
        >
          <ArrowUpDown size={14} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="trans-lang-pill trans-lang-target"
              aria-label={`Target language: ${targetLang}`}
            >
              <span className="trans-lang-name">{targetLang}</span>
              <ChevronDown size={13} className="trans-lang-chevron" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            <DropdownMenuRadioGroup value={targetLang} onValueChange={(value) => { setTargetLang(value); resetOutput(); }}>
              {languages.filter((language) => language !== AUTO).map((language) => (
                <DropdownMenuRadioItem key={language} value={language}>
                  {language}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="trans-scroll" ref={scrollRef}>
        <div className="write-field">
          <div className="trans-label-row">
            <label htmlFor="trans-text">Text to translate</label>
            <button type="button" className="trans-import" onClick={importSelected}>
              <ScanText size={13} aria-hidden="true" />
              Import from page
            </button>
          </div>
          <textarea
            id="trans-text"
            rows={4}
            placeholder="Paste text to translate, or import it from the current page…"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              resetOutput();
            }}
          />
          <div className="trans-tools">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="trans-model"
                  aria-label={`Translation model: ${demoModels.find((m) => m.id === model)?.label}`}
                >
                  <Sparkles size={14} aria-hidden="true" />
                  <span className="trans-model-name">{demoModels.find((m) => m.id === model)?.label}</span>
                  <ChevronDown size={13} className="trans-model-chevron" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top">
                <DropdownMenuLabel>Translation model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                  {demoModels.map((option) => (
                    <DropdownMenuRadioItem key={option.id} value={option.id}>
                      {option.label}
                      <span className="model-detail">{option.description}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="trans-meta">
              {text.trim() ? `${text.length} characters · ~${words} words` : "Paste text to begin"}
            </span>
          </div>
        </div>

        {generation === "generating" ? (
          <div className="result-panel" aria-live="polite">
            <div className="result-toolbar">
              <span className="trans-pair-badge">
                {languageCode(sourceLang)} → {languageCode(targetLang)}
              </span>
              <span className="demo-marker">Demo</span>
            </div>
            <p className="generating-text">
              <span className="typing-dots" aria-hidden="true"><span /><span /><span /></span>
              <span role="status">Translating…</span>
            </p>
          </div>
        ) : generation === "error" ? (
          <div className="result-panel" role="alert">
            <div className="result-toolbar">
              <span className="error-marker">Error</span>
              <span className="result-toolbar-spacer" />
              <button type="button" className="icon-action" aria-label="Dismiss error" onClick={resetOutput}>
                <Check size={13} />
              </button>
            </div>
            <p className="trans-error-body">
              Pick two different languages before translating — the source and target look the same.
            </p>
          </div>
        ) : result ? (
          <div className="result-panel">
            <div className="result-toolbar">
              <span className="trans-pair-badge">
                {languageCode(sourceLang)} → {languageCode(targetLang)}
              </span>
              <span className="demo-marker">Demo</span>
              <span className="result-toolbar-spacer" />
              <button
                type="button"
                className="icon-action"
                aria-label="Move translation to the input and swap languages"
                onClick={swapIntoTarget}
              >
                <ArrowUpDown size={13} />
              </button>
              <button
                type="button"
                className="icon-action"
                aria-label="Copy translation"
                onClick={() => copyResult()}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <p className="result-body">{result.text}</p>
          </div>
        ) : (
          <p className="write-hint">
            Pick a language pair, paste or import text, and press Translate for a demo result.
          </p>
        )}
      </div>

      <div className="trans-footer">
        <Button className="min-w-0 flex-1" disabled={!canTranslate} onClick={translate}>
          <Languages size={15} aria-hidden="true" />
          <span className="min-w-0 truncate">Translate to {targetLang}</span>
        </Button>
      </div>

      <p className="sr-only" role="status">
        {generation === "generating"
          ? "Translating."
          : generation === "error"
            ? "Translation error."
            : result
              ? "Translation ready."
              : ""}
      </p>
    </div>
  );
}