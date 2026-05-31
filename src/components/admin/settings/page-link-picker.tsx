"use client";

import { useMemo, useState } from "react";
import type { GymConfig } from "@/config/types";
import { filterLinkablePages, getLinkablePages } from "@/lib/linkable-pages";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PageLinkPickerProps = {
  id: string;
  label: string;
  value: string;
  config: GymConfig;
  onChange: (href: string) => void;
};

export const PageLinkPicker = ({ id, label, value, config, onChange }: PageLinkPickerProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const pages = useMemo(() => getLinkablePages(config), [config]);
  const filtered = useMemo(() => filterLinkablePages(pages, query), [pages, query]);

  const handleSelect = (href: string) => {
    onChange(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-href`}>{label}</Label>
      <Input
        id={`${id}-href`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/sign-up"
        aria-describedby={`${id}-page-list`}
      />
      <div className="relative">
        <Input
          id={`${id}-search`}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search pages…"
          aria-controls={`${id}-page-list`}
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default"
              aria-label="Close page list"
              onClick={() => setOpen(false)}
            />
            <ul
              id={`${id}-page-list`}
              role="listbox"
              className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-(--gym-border) bg-(--gym-surface) py-1 shadow-lg"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-(--gym-muted)">No matching pages</li>
              ) : (
                filtered.map((page) => (
                  <li key={page.href}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={page.href === value}
                      className={cn(
                        "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-white/5",
                        page.href === value && "bg-white/10",
                      )}
                      onClick={() => handleSelect(page.href)}
                    >
                      <span className="font-medium text-white">{page.label}</span>
                      <span className="text-xs text-(--gym-muted)">{page.href}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
};
