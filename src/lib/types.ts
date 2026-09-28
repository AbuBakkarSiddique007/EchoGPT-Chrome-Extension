export type ThemePreference = "light" | "dark";

export type ToolId =
  | "chat"
  | "write"
  | "read"
  | "translate"
  | "image"
  | "video"
  | "compare"
  | "mcp";

export type MessageRole = "user" | "assistant";

export type MessageStatus = "complete" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export interface ModelOption {
  id: string;
  label: string;
  description: string;
}

export interface PageContext {
  title: string;
  domain: string;
}

export interface QuickAction {
  id: string;
  label: string;
  tool: ToolId;
}

export type GenerationState =
  | "idle"
  | "typing"
  | "generating"
  | "completed"
  | "error"
  | "rate-limited";

export type ConnectorStatus = "connected" | "disconnected" | "error";

export interface Connector {
  id: string;
  name: string;
  description: string;
  url: string;
  status: ConnectorStatus;
  tools: string[];
  lastChecked: string;
}