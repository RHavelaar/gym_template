"use client";

import type { ReactNode } from "react";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SettingsPreviewBlock = {
  id: string;
  label: string;
  content: ReactNode;
};

export type SettingsEditorSection = {
  id: string;
  /** Desktop column header above the editor (aligns with preview label) */
  editorLabel?: string;
  previewLabel: string;
  editor: ReactNode;
  preview: ReactNode;
  /** Custom actions shown beside the preview label (replaces default Edit jump) */
  previewHeaderActions?: ReactNode;
  /** Vertical alignment of editor within its row on desktop */
  editorAlign?: "start" | "center";
  /** Keep preview pinned while scrolling the editor column (desktop) */
  previewSticky?: boolean;
  /** Match preview panel height to the editor card in the same row (desktop) */
  previewMatchEditor?: boolean;
};

export type StickyPreviewEditorBlock = {
  id: string;
  editorLabel: string;
  editor: ReactNode;
};

export type StickyPreviewLayout = {
  preview: ReactNode;
  previewHeader?: ReactNode;
  editorBlocks: StickyPreviewEditorBlock[];
};

type SettingsEditorShellProps = {
  title: string;
  description: string;
  /** Legacy: all editors in one column, all previews in another */
  form?: ReactNode;
  previews?: SettingsPreviewBlock[];
  /** Paired editor → preview blocks (used by media settings) */
  sections?: SettingsEditorSection[];
  /** Single sticky preview column with stacked editor blocks (brand settings) */
  stickyPreview?: StickyPreviewLayout;
  /** Content below page title, above sections */
  header?: ReactNode;
  footer?: ReactNode;
};

const handleJumpToEdit = (id: string) => {
  const target = document.getElementById(`edit-${id}`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.classList.add("ring-2", "ring-(--gym-accent)");
  window.setTimeout(() => {
    target.classList.remove("ring-2", "ring-(--gym-accent)");
  }, 1600);
};

const ColumnLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("min-h-8 text-xs font-semibold tracking-widest text-(--gym-muted) uppercase", className)}>
    {children}
  </p>
);

const PreviewPanel = ({
  id,
  label,
  children,
  showLabel = true,
}: {
  id: string;
  label: string;
  children: ReactNode;
  showLabel?: boolean;
}) => (
  <div className="flex min-w-0 flex-col lg:w-full">
    {showLabel ? (
      <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
        <ColumnLabel className="mb-0">{label}</ColumnLabel>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="lg:hidden"
          onClick={() => handleJumpToEdit(id)}
          aria-label={`Edit ${label}`}
        >
          <ArrowDownToLine size={14} aria-hidden />
          Edit
        </Button>
      </div>
    ) : null}
    <div
      id={`preview-${id}`}
      className="w-full scroll-mt-24 overflow-hidden rounded-xl border border-(--gym-border) bg-(--gym-bg) transition-shadow"
    >
      {children}
    </div>
  </div>
);

export const SettingsEditorShell = ({
  title,
  description,
  form,
  previews = [],
  sections,
  stickyPreview,
  header,
  footer,
}: SettingsEditorShellProps) => (
  <div className="mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8">
      <h1 className="text-3xl font-black uppercase">{title}</h1>
      <p className="mt-2 text-(--gym-muted)">{description}</p>
    </div>

    {header ? <div className="mb-8">{header}</div> : null}

    {stickyPreview ? (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="order-2 space-y-6 lg:order-1">
          {stickyPreview.editorBlocks.map((block) => (
            <div key={block.id} className="space-y-3">
              <ColumnLabel className="hidden lg:flex">{block.editorLabel}</ColumnLabel>
              {block.editor}
            </div>
          ))}
          {footer ? <div>{footer}</div> : null}
        </div>

        <div className="order-1 lg:sticky lg:top-20 lg:order-2 lg:self-start">
          {stickyPreview.previewHeader ? <div className="mb-3">{stickyPreview.previewHeader}</div> : null}
          <div className="overflow-hidden rounded-xl border border-(--gym-border) bg-(--gym-bg)">
            {stickyPreview.preview}
          </div>
        </div>
      </div>
    ) : sections ? (
      <div className="flex flex-col gap-y-12">
        {sections.map((section) => (
          <div key={section.id} className="grid grid-cols-1 gap-x-8 gap-y-3 lg:grid-cols-2 lg:grid-rows-[auto_auto]">
            <ColumnLabel className="order-1 hidden lg:order-none lg:col-start-1 lg:row-start-1 lg:flex lg:items-end">
              {section.editorLabel ?? "Settings"}
            </ColumnLabel>

            <div className="order-3 flex min-h-8 flex-wrap items-end justify-between gap-2 lg:order-none lg:col-start-2 lg:row-start-1">
              <ColumnLabel>{section.previewLabel}</ColumnLabel>
              {section.previewHeaderActions ? (
                <div className="flex flex-wrap items-center justify-end gap-2">{section.previewHeaderActions}</div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => handleJumpToEdit(section.id)}
                  aria-label={`Edit ${section.previewLabel}`}
                >
                  <ArrowDownToLine size={14} aria-hidden />
                  Edit
                </Button>
              )}
            </div>

            <div
              className={cn(
                "order-2 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2",
                section.editorAlign === "center" && "lg:self-center",
              )}
            >
              {section.editor}
            </div>

            <div
              className={cn(
                "order-4 min-h-0 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2",
                section.previewSticky !== false && "lg:sticky lg:top-20 lg:self-start",
                section.previewMatchEditor && "lg:self-stretch",
              )}
            >
              <div
                id={`preview-${section.id}`}
                className={cn(
                  "scroll-mt-24 overflow-hidden rounded-xl border border-(--gym-border) bg-(--gym-bg) transition-shadow",
                  section.previewMatchEditor ? "flex h-full min-h-0 items-center justify-center p-3 sm:p-4" : "w-full",
                )}
              >
                {section.preview}
              </div>
            </div>
          </div>
        ))}
        {footer ? <div>{footer}</div> : null}
      </div>
    ) : (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {form}
          {footer}
        </div>
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {previews.map((block) => (
            <PreviewPanel key={block.id} id={block.id} label={block.label}>
              {block.content}
            </PreviewPanel>
          ))}
        </div>
      </div>
    )}
  </div>
);
