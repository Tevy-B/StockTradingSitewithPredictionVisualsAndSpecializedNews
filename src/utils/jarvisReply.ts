export function parsePerformanceSymbol(input: string): string | null {
  const m = input.match(/performance of\s+([A-Za-z.]{1,10})\s+stock/i) || input.match(/\b([A-Z]{1,5})\b\s+stock/i);
  return m?.[1]?.toUpperCase() || null;
}

export function buildDirectReply(summary: string, followUp?: string): string {
  const cleanSummary = summary.trim();
  if (!followUp) return cleanSummary;
  return `${cleanSummary}\n\nFollow-up (optional): ${followUp.trim()}`;
}
