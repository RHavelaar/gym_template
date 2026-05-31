import type { NextConfig } from "next";

/** Hostname only — Next.js allowedDevOrigins rejects full URLs. */
const parseDevOriginHost = (value: string | undefined) => {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  try {
    return trimmed.includes("://")
      ? new URL(trimmed).hostname
      : trimmed.replace(/^https?:\/\//, "").split("/")[0] || null;
  } catch {
    return null;
  }
};

const allowedDevOrigins = [
  parseDevOriginHost(process.env.NGROK_STATIC_DOMAIN),
  ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",") ?? [])
    .map((origin) => parseDevOriginHost(origin))
    .filter(Boolean),
].filter((origin, index, list): origin is string => Boolean(origin && list.indexOf(origin) === index));

const parseSupabaseHostname = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const supabaseHostname = parseSupabaseHostname();

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  experimental: {
    serverActions: {
      // Gallery video uploads allow up to 50 MB (see MAX_GALLERY_VIDEO_BYTES).
      bodySizeLimit: "52mb",
    },
    // proxy.ts runs on admin uploads; default is 10 MB.
    proxyClientMaxBodySize: "52mb",
  },
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseHostname ? [{ protocol: "https" as const, hostname: supabaseHostname }] : []),
    ],
  },
};

export default nextConfig;
