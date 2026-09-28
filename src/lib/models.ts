export const demoModels = [
  { id: "fast", label: "EchoGPT Fast", description: "Speedy, everyday answers" },
  { id: "pro", label: "EchoGPT Pro", description: "Deeper, more careful reasoning" },
  { id: "mini", label: "EchoGPT Mini", description: "Lightweight, low-latency replies" },
] as const;

export type ModelId = (typeof demoModels)[number]["id"];