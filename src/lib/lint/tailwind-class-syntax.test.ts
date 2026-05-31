import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findTailwindClassViolations } from "./tailwind-class-syntax";

const SOURCE_ROOT = path.join(process.cwd(), "src");
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);

const shouldScanSourceFile = (filePath: string): boolean => {
  const relativePath = path.relative(SOURCE_ROOT, filePath).replaceAll("\\", "/");
  if (relativePath.endsWith(".test.ts")) return false;
  if (relativePath.startsWith("lib/lint/")) return false;
  return true;
};

const collectSourceFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(fullPath)));
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name)) && shouldScanSourceFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
};

describe("findTailwindClassViolations", () => {
  it("flags legacy bracket CSS variable utilities", () => {
    const legacyClass = ["text-[var(", "--gym-muted", ")]"].join("");
    const violations = findTailwindClassViolations(`<p className="${legacyClass}">`, "example.tsx");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.ruleId).toBe("legacy-css-var-brackets");
  });

  it("flags legacy has-[:checked] variants", () => {
    const violations = findTailwindClassViolations('className="has-[:checked]:border-(--gym-primary)"', "example.tsx");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.ruleId).toBe("legacy-has-checked-variant");
  });

  it("flags deprecated bg-gradient-to-* utilities", () => {
    const violations = findTailwindClassViolations('className="bg-gradient-to-br from-black"', "example.tsx");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.ruleId).toBe("legacy-gradient-direction");
    expect(violations[0]?.message).toContain("bg-linear-to-br");
  });

  it("flags bracket aspect ratios with whole-number fractions", () => {
    const violations = findTailwindClassViolations('className="aspect-[4/3] sm:aspect-[16/9]"', "example.tsx");

    expect(violations).toHaveLength(2);
    expect(violations.every((violation) => violation.ruleId === "legacy-aspect-ratio-brackets")).toBe(true);
  });

  it("allows decimal aspect ratios in brackets", () => {
    const violations = findTailwindClassViolations('className="aspect-[1.91/1]"', "example.tsx");

    expect(violations).toEqual([]);
  });

  it("flags integer device aspect ratios in brackets", () => {
    const violations = findTailwindClassViolations('className="aspect-[430/932]"', "example.tsx");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.message).toContain("aspect-430/932");
  });

  it("flags aspect-16/9 in favor of aspect-video", () => {
    const violations = findTailwindClassViolations('className="aspect-16/9 sm:aspect-16/9"', "example.tsx");

    expect(violations).toHaveLength(2);
    expect(violations.every((violation) => violation.ruleId === "legacy-aspect-video-fraction")).toBe(true);
  });

  it("flags z-index and flex bracket shortcuts", () => {
    const violations = findTailwindClassViolations('className="z-[100] flex-[1]"', "example.tsx");

    expect(violations).toHaveLength(2);
    expect(violations.map((violation) => violation.ruleId)).toEqual([
      "legacy-z-index-brackets",
      "legacy-flex-grow-brackets",
    ]);
  });

  it("flags decimal flex-grow bracket syntax", () => {
    const violations = findTailwindClassViolations('className="flex-[1.1]"', "example.tsx");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.message).toContain("flex-1.1");
  });

  it("flags spacing-scale sizes written as rem or px brackets", () => {
    const violations = findTailwindClassViolations('className="min-w-[3rem] min-w-[480px]"', "example.tsx");

    expect(violations).toHaveLength(2);
    expect(violations.every((violation) => violation.ruleId === "legacy-spacing-brackets")).toBe(true);
    expect(violations[0]?.message).toContain("min-w-12");
    expect(violations[1]?.message).toContain("min-w-120");
  });

  it("flags viewport height and width bracket syntax", () => {
    const violations = findTailwindClassViolations('className="h-[80vh] max-h-[90vh]"', "example.tsx");

    expect(violations).toHaveLength(2);
    expect(violations.every((violation) => violation.ruleId === "legacy-viewport-brackets")).toBe(true);
    expect(violations[0]?.message).toContain("h-80vh");
    expect(violations[1]?.message).toContain("max-h-90vh");
  });

  it("flags border width bracket syntax", () => {
    const violations = findTailwindClassViolations('className="border-[3px] border-neutral-700"', "example.tsx");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.ruleId).toBe("legacy-border-width-brackets");
    expect(violations[0]?.message).toContain("border-3");
  });

  it("flags rounded utilities on the spacing scale", () => {
    const violations = findTailwindClassViolations('className="rounded-[1.75rem] rounded-b-[2rem]"', "example.tsx");

    expect(violations).toHaveLength(2);
    expect(violations.every((violation) => violation.ruleId === "legacy-spacing-brackets")).toBe(true);
  });

  it("allows arbitrary min() viewport sizes", () => {
    const violations = findTailwindClassViolations('className="max-h-[min(420px,50vh)]"', "example.tsx");

    expect(violations).toEqual([]);
  });

  it("accepts canonical Tailwind v4 theme utilities", () => {
    const violations = findTailwindClassViolations(
      'className="border-(--gym-border) text-(--gym-muted) has-checked:bg-(--gym-primary)/5"',
      "example.tsx",
    );

    expect(violations).toEqual([]);
  });
});

describe("tailwind class syntax (repo-wide)", () => {
  it("uses canonical Tailwind v4 CSS variable syntax across src/", async () => {
    const files = await collectSourceFiles(SOURCE_ROOT);
    const violations = (
      await Promise.all(
        files.map(async (filePath) => {
          const content = await readFile(filePath, "utf8");
          return findTailwindClassViolations(content, path.relative(process.cwd(), filePath));
        }),
      )
    ).flat();

    expect(violations).toEqual([]);
  });
});
