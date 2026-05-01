export function parsePerformanceSymbol(input: string): string | null {
  const m = input.match(/performance of\s+([A-Za-z.]{1,10})\s+stock/i) || input.match(/\b([A-Z]{1,5})\b\s+stock/i);
  return m?.[1]?.toUpperCase() || null;
}

export function buildDirectReply(summary: string, followUp?: string): string {
  const cleanSummary = summary.trim();
  if (!followUp) return cleanSummary;
  return `${cleanSummary}\n\nFollow-up (optional): ${followUp.trim()}`;
}

export function detectIntent(input: string): 'stock' | 'coding' | 'planning' | 'general' {
  const q = input.toLowerCase();
  if (/stock|ticker|market|price|performance/.test(q)) return 'stock';
  if (/bug|debug|refactor|test|code|typescript|react|api/.test(q)) return 'coding';
  if (/plan|roadmap|milestone|strategy|spec/.test(q)) return 'planning';
  return 'general';
}

export function buildIntentReply(intent: ReturnType<typeof detectIntent>): string {
  if (intent === 'coding') return buildDirectReply('I can help immediately with code changes, debugging, and implementation steps.', 'Share the file or error, and I will propose exact edits.');
  if (intent === 'planning') return buildDirectReply('I can produce a clear project plan with milestones and acceptance criteria.', 'If you want, I will generate the full step-by-step roadmap now.');
  if (intent === 'stock') return buildDirectReply('I can fetch market details and summarize performance clearly.', 'Tell me the symbol and timeframe, and I will return the key numbers.');
  return buildDirectReply('Understood. I will respond directly and keep follow-up questions minimal.', 'Ask your next command and I will execute in this style.');
}
