"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { listGymAssetsAction } from "@/app/actions/content";
import type { GymAsset } from "@/lib/demo-media-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MediaLibraryPanelProps = {
  selectedUrl?: string;
  onSelect: (url: string) => void;
};

export const MediaLibraryPanel = ({ selectedUrl, onSelect }: MediaLibraryPanelProps) => {
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState<GymAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssets = useCallback(async (query: string) => {
    setLoading(true);
    setError("");
    try {
      const results = await listGymAssetsAction(query || undefined);
      setAssets(results);
    } catch {
      setError("Could not load your media library.");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAssets(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, loadAssets]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--gym-muted)"
          size={16}
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search uploaded images…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search uploaded images"
        />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-(--gym-muted)">Loading library…</p>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-400">{error}</p>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-(--gym-muted)">
          <FolderOpen size={32} aria-hidden />
          <p className="text-sm">{search ? "No images match your search." : "No uploaded images yet."}</p>
        </div>
      ) : (
        <ul className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {assets.map((asset) => (
            <li key={asset.path}>
              <button
                type="button"
                onClick={() => onSelect(asset.url)}
                className={cn(
                  "w-full overflow-hidden rounded-lg border text-left transition hover:border-(--gym-accent)",
                  selectedUrl === asset.url
                    ? "border-(--gym-accent) ring-2 ring-(--gym-accent)/40"
                    : "border-(--gym-border)",
                )}
              >
                <div className="aspect-square bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.displayName} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-xs font-medium text-white">{asset.displayName}</p>
                  <p className="truncate text-[10px] tracking-wide text-(--gym-muted) uppercase">{asset.folder}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
