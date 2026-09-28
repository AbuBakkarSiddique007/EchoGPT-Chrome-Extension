export const translateLanguages = [
  "Auto-detect",
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Dutch",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese (Simplified)",
  "Arabic",
  "Hindi",
] as const;

export const humanLanguages = translateLanguages.filter((label) => label !== "Auto-detect");