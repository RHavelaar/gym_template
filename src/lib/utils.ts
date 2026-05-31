import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatWeight = (value: number, unit = "lbs") => `${value.toLocaleString()} ${unit}`;

export const formatHeight = (inches: number | null) => {
  if (inches == null) return "—";
  const feet = Math.floor(inches / 12);
  const remainder = Math.round(inches % 12);
  return `${feet}'${remainder}"`;
};

export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);

export const formatRelativeDate = (date: string | Date) => {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return formatDate(target);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(target);
};
