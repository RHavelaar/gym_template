"use client";

import { useCallback, useState } from "react";
import { Download, FileImage, FileText } from "lucide-react";
import { Document, Page, Text, View, StyleSheet, pdf, Image } from "@react-pdf/renderer";
import type { GymConfig } from "@/config/types";
import { BRAND_EXPORT_HELP } from "@/lib/brand-help";
import { brandKitFileName, buildBrandKitData, type BrandKitData } from "@/lib/brand-kit-data";
import { SettingSectionTitle } from "@/components/ui/info-hint";
import { Button } from "@/components/ui/button";

type BrandKitExportPanelProps = {
  config: GymConfig;
};

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#555", marginBottom: 20 },
  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 6, alignItems: "center" },
  swatch: { width: 24, height: 24, marginRight: 8, borderRadius: 2 },
  colorLabel: { width: 90, fontWeight: "bold" },
  colorValue: { flex: 1, color: "#444" },
  scaleRow: { flexDirection: "row", marginBottom: 4 },
  scaleLabel: { width: 40 },
});

const BrandKitPdfDocument = ({ data }: { data: BrandKitData }) => (
  <Document title={`${data.name} Brand Kit`}>
    <Page size="A4" style={pdfStyles.page}>
      {data.logoUrl ? (
        // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image
        <Image src={data.logoUrl} style={{ width: 64, height: 64, marginBottom: 12 }} />
      ) : null}
      <Text style={pdfStyles.title}>{data.name}</Text>
      <Text style={pdfStyles.subtitle}>{data.tagline}</Text>
      <Text style={{ color: "#888", marginBottom: 16 }}>Exported {data.exportedAt}</Text>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Colors</Text>
        {data.colors.map((color) => (
          <View key={color.label} style={pdfStyles.row}>
            <View style={[pdfStyles.swatch, { backgroundColor: color.hex }]} />
            <Text style={pdfStyles.colorLabel}>{color.label}</Text>
            <Text style={pdfStyles.colorValue}>
              {color.hex} · {color.rgb}
            </Text>
          </View>
        ))}
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Typography</Text>
        <Text>Heading: {data.typography.heading}</Text>
        <Text>Body: {data.typography.body}</Text>
        <Text>Mono: {data.typography.mono}</Text>
        <Text>Fallback: {data.typography.fallback}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Type scale</Text>
        {data.typography.scale.map((row) => (
          <View key={row.label} style={pdfStyles.scaleRow}>
            <Text style={pdfStyles.scaleLabel}>{row.label}</Text>
            <Text>{row.value}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const drawBrandKitCanvas = async (canvas: HTMLCanvasElement, data: BrandKitData, logoUrl: string | null) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = 1200;
  const height = 1700;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px system-ui, sans-serif";
  ctx.fillText(data.name, 60, 80);

  ctx.fillStyle = "#a3a3a3";
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText(data.tagline, 60, 120);

  ctx.fillStyle = "#737373";
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillText(`Brand kit · ${data.exportedAt}`, 60, 155);

  if (logoUrl) {
    try {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("logo"));
        img.src = logoUrl;
      });
      ctx.drawImage(img, width - 160, 40, 100, 100);
    } catch {
      /* skip logo if CORS blocks */
    }
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillText("Colors", 60, 220);

  let y = 260;
  for (const color of data.colors) {
    ctx.fillStyle = color.hex;
    ctx.fillRect(60, y - 20, 40, 40);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(60, y - 20, 40, 40);

    ctx.fillStyle = "#e5e5e5";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(color.label, 120, y);

    ctx.fillStyle = "#a3a3a3";
    ctx.font = "16px monospace";
    ctx.fillText(`${color.hex}  ·  ${color.rgb}`, 120, y + 22);
    y += 56;
  }

  y += 20;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillText("Typography", 60, y);
  y += 40;

  ctx.fillStyle = "#d4d4d4";
  ctx.font = "18px system-ui, sans-serif";
  const typoLines = [
    `Heading: ${data.typography.heading}`,
    `Body: ${data.typography.body}`,
    `Mono: ${data.typography.mono}`,
    `Fallback: ${data.typography.fallback}`,
  ];
  for (const line of typoLines) {
    ctx.fillText(line, 60, y);
    y += 28;
  }

  y += 16;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillText("Type scale", 60, y);
  y += 32;

  ctx.fillStyle = "#a3a3a3";
  for (const row of data.typography.scale) {
    ctx.font = "16px monospace";
    ctx.fillText(`${row.label}: ${row.value}`, 60, y);
    y += 24;
  }
};

export const BrandKitExportPanel = ({ config }: BrandKitExportPanelProps) => {
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const data = buildBrandKitData(config);

  const handlePngExport = useCallback(async () => {
    setBusy("png");
    try {
      const canvas = document.createElement("canvas");
      await drawBrandKitCanvas(canvas, data, config.logoUrl || null);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = brandKitFileName(config.name, "png");
      link.click();
    } finally {
      setBusy(null);
    }
  }, [config.logoUrl, config.name, data]);

  const handlePdfExport = useCallback(async () => {
    setBusy("pdf");
    try {
      const blob = await pdf(<BrandKitPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = brandKitFileName(config.name, "pdf");
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }, [config.name, data]);

  return (
    <div className="space-y-4">
      <SettingSectionTitle
        title="Download brand kit"
        size="lg"
        hint={BRAND_EXPORT_HELP.description}
        description="Share with designers, print shops, or marketing partners. Includes logo reference, full color palette with HEX and RGB, typography, and type scale."
      />

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void handlePngExport()}>
          <FileImage size={16} aria-hidden />
          {busy === "png" ? "Generating…" : "Download PNG"}
        </Button>
        <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void handlePdfExport()}>
          <FileText size={16} aria-hidden />
          {busy === "pdf" ? "Generating…" : "Download PDF"}
        </Button>
      </div>

      <p className="text-xs text-(--gym-muted)">
        <Download size={12} className="mr-1 inline" aria-hidden />
        {BRAND_EXPORT_HELP.png} {BRAND_EXPORT_HELP.pdf}
      </p>
    </div>
  );
};
