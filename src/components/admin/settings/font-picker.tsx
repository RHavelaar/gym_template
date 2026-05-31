"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { BrandTypography } from "@/config/types";
import { buildFontFamilyCss } from "@/lib/brand-settings";
import { buildGoogleFontsUrl, filterGoogleFonts, type GoogleFontCategory } from "@/lib/google-fonts-catalog";
import { FieldLabelWithHint } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FontPickerProps = {
  id: string;
  label: string;
  hint: string;
  recommendation: string;
  usedFor?: string;
  value: string;
  category?: GoogleFontCategory;
  customFonts: BrandTypography["customFonts"];
  typography: BrandTypography;
  onChange: (value: string) => void;
};

const CATEGORY_FILTERS: { value: GoogleFontCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sans", label: "Sans" },
  { value: "display", label: "Display" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

const resolveDisplayName = (value: string, customFonts: BrandTypography["customFonts"]) => {
  if (value.startsWith("custom:")) {
    const id = value.slice("custom:".length);
    return customFonts.find((f) => f.id === id)?.name ?? "Custom font";
  }
  return value || "Select a font";
};

const googleFontRefCounts = new Map<string, number>();

const useGoogleFontPreview = (family: string | null) => {
  useEffect(() => {
    if (!family || family.startsWith("custom:")) return;

    const linkId = `font-preview-${family.replace(/\s+/g, "-")}`;
    const count = googleFontRefCounts.get(family) ?? 0;
    googleFontRefCounts.set(family, count + 1);

    if (count === 0) {
      const url = buildGoogleFontsUrl([family]);
      if (url && !document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
      }
    }

    return () => {
      const next = (googleFontRefCounts.get(family) ?? 1) - 1;
      if (next <= 0) {
        googleFontRefCounts.delete(family);
        document.getElementById(linkId)?.remove();
      } else {
        googleFontRefCounts.set(family, next);
      }
    };
  }, [family]);
};

export const FontPicker = ({
  id,
  label,
  hint,
  recommendation,
  usedFor,
  value,
  category,
  customFonts,
  typography,
  onChange,
}: FontPickerProps) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<GoogleFontCategory | "all">(category ?? "all");

  const effectiveCategory = category ?? (categoryFilter === "all" ? undefined : categoryFilter);
  const fonts = useMemo(() => filterGoogleFonts(query, effectiveCategory), [query, effectiveCategory]);

  const previewFamily = buildFontFamilyCss(value, typography);
  useGoogleFontPreview(value.startsWith("custom:") ? null : value);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="space-y-3 rounded-lg border border-(--gym-border) bg-black/20 p-4">
      <FieldLabelWithHint htmlFor={id} hint={hint} hintLabel={`About ${label}`}>
        {label}
      </FieldLabelWithHint>
      {usedFor ? (
        <p className="text-xs text-(--gym-muted)">
          <span className="text-neutral-400">Shows on:</span> {usedFor}
        </p>
      ) : null}
      <p className="text-xs text-(--gym-muted)">
        <span className="text-neutral-400">Recommended:</span> {recommendation}
      </p>

      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2.5 text-left text-sm text-white transition hover:border-(--gym-accent)/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gym-accent)"
        >
          <span style={{ fontFamily: previewFamily }} className="truncate font-medium">
            {resolveDisplayName(value, customFonts)}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-(--gym-muted) transition", open && "rotate-180")}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-(--gym-border) bg-(--gym-surface) shadow-xl shadow-black/50"
            role="presentation"
          >
            <div className="border-b border-(--gym-border) p-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-(--gym-muted)"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Google Fonts…"
                  className="h-8 pl-8 text-sm"
                  aria-label={`Search ${label}`}
                  autoFocus
                />
              </div>
              {!category ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {CATEGORY_FILTERS.map(({ value: filterValue, label: filterLabel }) => (
                    <button
                      key={filterValue}
                      type="button"
                      onClick={() => setCategoryFilter(filterValue)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition",
                        categoryFilter === filterValue
                          ? "bg-(--gym-accent) text-(--gym-accent-fg)"
                          : "bg-white/5 text-(--gym-muted) hover:bg-white/10",
                      )}
                    >
                      {filterLabel}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <ul id={listboxId} role="listbox" aria-label={label} className="max-h-52 overflow-y-auto py-1">
              {customFonts.map((font) => {
                const ref = `custom:${font.id}`;
                const selected = value === ref;
                return (
                  <li key={font.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelect(ref)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/5",
                        selected && "bg-(--gym-accent)/10",
                      )}
                    >
                      <span style={{ fontFamily: `"${font.name}", sans-serif` }}>Custom: {font.name}</span>
                      {selected ? <Check className="h-3.5 w-3.5 text-(--gym-accent)" /> : null}
                    </button>
                  </li>
                );
              })}
              {fonts.map((font) => {
                const selected = value === font.family;
                return (
                  <FontListOption
                    key={font.family}
                    family={font.family}
                    selected={selected}
                    onSelect={() => handleSelect(font.family)}
                  />
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-dashed border-(--gym-border) bg-black/30 p-4" aria-live="polite">
        <p className="text-[10px] font-semibold tracking-widest text-(--gym-muted) uppercase">Live preview</p>
        <p style={{ fontFamily: previewFamily }} className="mt-2 text-2xl leading-tight font-black uppercase">
          {resolveDisplayName(value, customFonts)}
        </p>
        <p style={{ fontFamily: previewFamily }} className="mt-1 text-sm text-neutral-300">
          Train hard. Track PRs. Show up for your crew — this is how body text will look.
        </p>
      </div>
    </div>
  );
};

const FontListOption = ({
  family,
  selected,
  onSelect,
}: {
  family: string;
  selected: boolean;
  onSelect: () => void;
}) => {
  useGoogleFontPreview(family);

  return (
    <li role="presentation">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/5",
          selected && "bg-(--gym-accent)/10",
        )}
      >
        <span style={{ fontFamily: `"${family}", sans-serif` }}>{family}</span>
        {selected ? <Check className="h-3.5 w-3.5 shrink-0 text-(--gym-accent)" /> : null}
      </button>
    </li>
  );
};
