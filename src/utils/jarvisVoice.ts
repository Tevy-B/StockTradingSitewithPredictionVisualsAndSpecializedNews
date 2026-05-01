export const DEFAULT_PAUSE_MS = 1100;

export type VoiceLike = { name: string; lang: string };

export function pickHumanLikeVoice<T extends VoiceLike>(voices: T[], preferredName?: string): T | null {
  if (!voices.length) return null;
  if (preferredName) {
    const exact = voices.find((v) => v.name === preferredName);
    if (exact) return exact;
  }
  const preferredNames = ['Microsoft Aria', 'Google US English', 'Samantha', 'Jenny', 'Siri'];
  const preferred = voices.find((v) => preferredNames.some((name) => v.name.includes(name)));
  if (preferred) return preferred;
  return voices.find((v) => v.lang.toLowerCase().startsWith('en-us')) || voices[0];
}
