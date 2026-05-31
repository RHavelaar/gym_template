"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/config/types";
import { cn } from "@/lib/utils";

type NavDropdownProps = {
  label: string;
  items: NavItem[];
  onNavigate?: () => void;
  className?: string;
};

export const NavDropdown = ({ label, items, onNavigate, className }: NavDropdownProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleToggle = () => setOpen((value) => !value);

  const handleNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-300 transition hover:text-white"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={handleToggle}
      >
        {label}
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`${label} menu`}
          className="absolute top-[calc(100%+0.5rem)] left-0 z-50 min-w-52 rounded-xl border border-(--gym-border) bg-(--gym-surface) py-2 shadow-xl shadow-black/40"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-white/10 hover:text-white"
              onClick={handleNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
};
