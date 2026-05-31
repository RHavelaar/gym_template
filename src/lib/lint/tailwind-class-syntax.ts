export type TailwindClassViolation = {
  ruleId: string;
  line: number;
  column: number;
  excerpt: string;
  message: string;
};

type RegexRule = {
  id: string;
  pattern: RegExp;
  message: string | ((match: RegExpExecArray) => string);
};

const regexMessage = (rule: RegexRule, match: RegExpExecArray): string =>
  typeof rule.message === "function" ? rule.message(match) : rule.message;

const REGEX_RULES: RegexRule[] = [
  {
    id: "legacy-css-var-brackets",
    pattern: /\[var\((--[^)]+)\)\]/g,
    message: "Use Tailwind v4 canonical CSS variable syntax: utility-(--token) instead of utility-[var(--token)].",
  },
  {
    id: "legacy-has-checked-variant",
    pattern: /has-\[:checked\]/g,
    message: "Use the has-checked: variant instead of has-[:checked]:.",
  },
  {
    id: "legacy-gradient-direction",
    pattern: /bg-gradient-to-(t|tr|r|br|b|bl|l|tl)/g,
    message: (match) => `Use bg-linear-to-${match[1]} instead of deprecated bg-gradient-to-${match[1]} (Tailwind v4).`,
  },
  {
    id: "legacy-aspect-ratio-brackets",
    pattern: /aspect-\[(\d+)\/(\d+)\]/g,
    message: (match) => {
      if (match[1] === "16" && match[2] === "9") {
        return "Use aspect-video instead of aspect-[16/9].";
      }

      return `Use aspect-${match[1]}/${match[2]} instead of aspect-[${match[1]}/${match[2]}].`;
    },
  },
  {
    id: "legacy-aspect-video-fraction",
    pattern: /aspect-16\/9/g,
    message: "Use aspect-video instead of aspect-16/9.",
  },
  {
    id: "legacy-z-index-brackets",
    pattern: /z-\[(\d+)\]/g,
    message: (match) => `Use z-${match[1]} instead of z-[${match[1]}].`,
  },
  {
    id: "legacy-flex-grow-brackets",
    pattern: /flex-\[(\d+(?:\.\d+)?)\]/g,
    message: (match) => {
      const value = match[1] ?? "";
      if (value === "1") {
        return "Use flex-1 instead of flex-[1].";
      }

      return `Use flex-${value} instead of flex-[${value}].`;
    },
  },
  {
    id: "legacy-viewport-brackets",
    pattern: /(min-h|max-h|h|min-w|max-w|w)-\[(\d+)vh\]/g,
    message: (match) => `Use ${match[1]}-${match[2]}vh instead of ${match[0]}.`,
  },
  {
    id: "legacy-border-width-brackets",
    pattern: /border-\[(\d+)px\]/g,
    message: (match) => `Use border-${match[1]} instead of border-[${match[1]}px].`,
  },
];

const SPACING_SCALE_UTILITIES = [
  "min-w",
  "max-w",
  "min-h",
  "max-h",
  "w",
  "h",
  "size",
  "rounded",
  "rounded-t",
  "rounded-r",
  "rounded-b",
  "rounded-l",
  "rounded-tl",
  "rounded-tr",
  "rounded-bl",
  "rounded-br",
] as const;

const spacingScaleToken = (value: number, unit: "rem" | "px"): number | null => {
  const token = unit === "rem" ? value / 0.25 : value / 4;
  return Number.isInteger(token) && token > 0 ? token : null;
};

const findSpacingBracketViolations = (line: string, lineNumber: number, filePath: string): TailwindClassViolation[] => {
  const violations: TailwindClassViolation[] = [];
  const sortedUtilities = [...SPACING_SCALE_UTILITIES].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(?:${sortedUtilities.join("|")})-\\[(\\d+(?:\\.\\d+)?)(rem|px)\\]`, "g");
  let match = pattern.exec(line);

  while (match) {
    const utility = match[0].slice(0, match[0].indexOf("-["));
    const value = Number.parseFloat(match[1] ?? "");
    const unit = match[2] as "rem" | "px";
    const token = spacingScaleToken(value, unit);

    if (token !== null) {
      violations.push({
        ruleId: "legacy-spacing-brackets",
        line: lineNumber,
        column: match.index + 1,
        excerpt: line.trim(),
        message: `${filePath}:${lineNumber}:${match.index + 1} — Use ${utility}-${token} instead of ${match[0]}.`,
      });
    }

    match = pattern.exec(line);
  }

  return violations;
};

export const findTailwindClassViolations = (content: string, filePath = "unknown"): TailwindClassViolation[] => {
  const lines = content.split("\n");
  const violations: TailwindClassViolation[] = [];

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;

    for (const rule of REGEX_RULES) {
      rule.pattern.lastIndex = 0;
      let match = rule.pattern.exec(line);

      while (match) {
        const message = regexMessage(rule, match);
        if (message) {
          violations.push({
            ruleId: rule.id,
            line: lineNumber,
            column: match.index + 1,
            excerpt: line.trim(),
            message: `${filePath}:${lineNumber}:${match.index + 1} — ${message}`,
          });
        }
        match = rule.pattern.exec(line);
      }
    }

    violations.push(...findSpacingBracketViolations(line, lineNumber, filePath));
  }

  return violations;
};
