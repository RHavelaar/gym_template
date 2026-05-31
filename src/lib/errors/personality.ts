import { getErrorDomain, type ErrorDomain } from "./codes";

const DOMAIN_EMOJI: Record<ErrorDomain, string[]> = {
  AUTH: ["🔐", "🚪", "🪪"],
  CMS: ["📝", "🖥️", "📋"],
  VAL: ["✋", "📏", "🎯"],
  DB: ["💾", "🗄️", "📊"],
  NET: ["📡", "📶", "🛜"],
  PR: ["🏋️", "💪", "🏆"],
  PROFILE: ["🧍", "📐", "🎽"],
  MEDIA: ["🖼️", "📸", "🎞️"],
  SYS: ["💪", "😤", "🏃", "🤷"],
};

const QUIPS = [
  "We dropped the bar on this one.",
  "Not your rep count — our bug.",
  "The plates slipped — not your fault.",
  "It is what it is. We logged it.",
  "Bad lift on our side. Your form is fine.",
  "Rest day for this feature — we are on it.",
  "Missed the lockout — we will rerack and fix it.",
  "Spotter failed you. We are grabbing the bar.",
];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getErrorPersonality = (code: string): { emoji: string; quip: string } => {
  const domain = getErrorDomain(code);
  const emojis = DOMAIN_EMOJI[domain] ?? DOMAIN_EMOJI.SYS;
  const hash = hashString(code);
  return {
    emoji: emojis[hash % emojis.length] ?? "💪",
    quip: QUIPS[hash % QUIPS.length] ?? QUIPS[0]!,
  };
};
