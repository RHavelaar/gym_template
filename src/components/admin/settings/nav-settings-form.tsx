"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import type { GymConfig, HomepageSection } from "@/config/types";
import { updateSiteMenuAction } from "@/app/actions/content";
import { SettingsEditorShell } from "@/components/admin/settings/settings-editor-shell";
import { SiteMenuPreviewPanel } from "@/components/admin/settings/site-menu-preview-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabelWithHint, InfoHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { useAppAction } from "@/hooks/use-app-action";
import {
  buildFeaturesFromSiteMenu,
  buildNavFromSiteMenu,
  getCatalogEntriesByPlacement,
  getCatalogEntryById,
  MAX_EXTERNAL_LINKS,
  mergeSiteMenuState,
  type SiteMenuExternalLink,
  type SiteMenuState,
} from "@/lib/nav-catalog";
import { EXTERNAL_LINK_HELP, SITE_MENU_PAGE_HELP, SITE_MENU_SECTIONS } from "@/lib/nav-help";

type NavSettingsFormProps = {
  initialConfig: GymConfig;
  homepageSections: HomepageSection[];
};

const emptyExternalLink = (): SiteMenuExternalLink => ({
  label: "",
  href: "",
});

const SiteMenuPageRow = ({
  pageId,
  enabled,
  label,
  onToggle,
  onLabelChange,
  toggleDisabled = false,
  showLabelField = true,
}: {
  pageId: string;
  enabled: boolean;
  label: string;
  onToggle: (enabled: boolean) => void;
  onLabelChange: (label: string) => void;
  toggleDisabled?: boolean;
  showLabelField?: boolean;
}) => {
  const help = SITE_MENU_PAGE_HELP[pageId];
  const entry = getCatalogEntryById(pageId);
  const displayName = help?.label.replace(" label", "") ?? entry?.defaultLabel ?? pageId;

  return (
    <div className="rounded-lg border border-(--gym-border) p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          disabled={toggleDisabled}
          onChange={(event) => onToggle(event.target.checked)}
          className="mt-1"
          aria-describedby={`site-menu-rec-${pageId}`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="font-medium">{displayName}</span>
            {help ? <InfoHint content={help.hint} label={`About ${displayName}`} /> : null}
          </span>
          {help ? (
            <p id={`site-menu-rec-${pageId}`} className="mt-1 text-xs text-(--gym-muted)">
              <span className="text-neutral-400">Recommended:</span> {help.recommendation}
            </p>
          ) : null}
        </span>
      </label>

      {showLabelField && enabled ? (
        <div className="mt-3 border-t border-(--gym-border)/60 pt-3">
          <FieldLabelWithHint
            htmlFor={`site-menu-label-${pageId}`}
            hint={help?.hint ?? "Menu text visitors will see."}
            hintLabel={`About ${displayName} label`}
          >
            {help?.label ?? "Menu label"}
          </FieldLabelWithHint>
          <Input
            id={`site-menu-label-${pageId}`}
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            className="mt-2"
          />
          {help ? (
            <p className="mt-1 text-xs text-(--gym-muted)">
              <span className="text-neutral-400">Recommended:</span> {help.recommendation}
            </p>
          ) : null}
        </div>
      ) : null}

      {toggleDisabled ? <p className="mt-2 text-xs text-(--gym-muted)">Your homepage is always in the menu.</p> : null}
    </div>
  );
};

export const NavSettingsForm = ({ initialConfig, homepageSections }: NavSettingsFormProps) => {
  const initialState = useMemo(() => mergeSiteMenuState(initialConfig), [initialConfig]);
  const [draft, setDraft] = useState<SiteMenuState>(initialState);
  const draftConfig = useMemo(() => {
    const builtNav = buildNavFromSiteMenu(draft);
    const features = buildFeaturesFromSiteMenu(draft, initialConfig.features);
    return {
      ...initialConfig,
      nav: { ...initialConfig.nav, ...builtNav },
      features,
    };
  }, [draft, initialConfig]);
  const { runAction, pending: saving } = useAppAction();

  const updatePage = (id: string, patch: Partial<{ enabled: boolean; label: string }>) => {
    setDraft((current) => ({
      ...current,
      pages: current.pages.map((page) => (page.id === id ? { ...page, ...patch } : page)),
    }));
  };

  const handleExternalChange = (index: number, field: keyof SiteMenuExternalLink, value: string) => {
    setDraft((current) => ({
      ...current,
      externalLinks: current.externalLinks.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    }));
  };

  const handleAddExternal = () => {
    if (draft.externalLinks.length >= MAX_EXTERNAL_LINKS) return;
    setDraft((current) => ({
      ...current,
      externalLinks: [...current.externalLinks, emptyExternalLink()],
    }));
  };

  const handleRemoveExternal = (index: number) => {
    setDraft((current) => ({
      ...current,
      externalLinks: current.externalLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const payload = {
      ...draft,
      externalLinks: draft.externalLinks.filter((link) => link.label.trim().length > 0 && link.href.trim().length > 0),
    };
    await runAction(() => updateSiteMenuAction(payload), {
      successMessage: "Site menu saved.",
    });
  };

  const publicPages = getCatalogEntriesByPlacement("publicHeader");
  const memberHeaderPages = getCatalogEntriesByPlacement("memberHeader");
  const accountMenuPages = getCatalogEntriesByPlacement("accountMenu");
  const modulePages = getCatalogEntriesByPlacement("moduleOnly");

  const getPageState = (id: string) => draft.pages.find((page) => page.id === id)!;

  return (
    <SettingsEditorShell
      title="Site menu"
      description="Choose which pages appear in your menus, rename link labels, and add optional external links. The live preview shows your real homepage header with unsaved menu changes."
      stickyPreview={{
        preview: (
          <SiteMenuPreviewPanel baseConfig={initialConfig} previewConfig={draftConfig} sections={homepageSections} />
        ),
        editorBlocks: [
          {
            id: "public-menu",
            editorLabel: "Public menu",
            editor: (
              <Card id="edit-public-menu" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={SITE_MENU_SECTIONS.public.title}
                  hint={SITE_MENU_SECTIONS.public.hint}
                  description={SITE_MENU_SECTIONS.public.description}
                />
                {publicPages.map((entry) => {
                  const page = getPageState(entry.id);
                  return (
                    <SiteMenuPageRow
                      key={entry.id}
                      pageId={entry.id}
                      enabled={page.enabled}
                      label={page.label}
                      toggleDisabled={!entry.canDisable}
                      onToggle={(enabled) => updatePage(entry.id, { enabled })}
                      onLabelChange={(label) => updatePage(entry.id, { label })}
                    />
                  );
                })}
              </Card>
            ),
          },
          {
            id: "external-links",
            editorLabel: "External links",
            editor: (
              <Card id="edit-external-links" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={SITE_MENU_SECTIONS.external.title}
                  hint={SITE_MENU_SECTIONS.external.hint}
                  description={SITE_MENU_SECTIONS.external.description}
                />
                {draft.externalLinks.length === 0 ? (
                  <p className="text-sm text-(--gym-muted)">
                    No external links yet. Add one for booking, social, or directions.
                  </p>
                ) : null}
                {draft.externalLinks.map((link, index) => (
                  <div key={`external-${index}`} className="space-y-3 rounded-lg border border-(--gym-border) p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <ExternalLink className="h-4 w-4 text-(--gym-accent)" aria-hidden />
                        External link {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExternal(index)}
                        aria-label={`Remove external link ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                    <div>
                      <FieldLabelWithHint
                        htmlFor={`external-label-${index}`}
                        hint={EXTERNAL_LINK_HELP.label.hint}
                        hintLabel="About link label"
                      >
                        {EXTERNAL_LINK_HELP.label.label}
                      </FieldLabelWithHint>
                      <Input
                        id={`external-label-${index}`}
                        value={link.label}
                        onChange={(event) => handleExternalChange(index, "label", event.target.value)}
                        className="mt-2"
                        placeholder="Book a class"
                      />
                      <p className="mt-1 text-xs text-(--gym-muted)">
                        <span className="text-neutral-400">Recommended:</span> {EXTERNAL_LINK_HELP.label.recommendation}
                      </p>
                    </div>
                    <div>
                      <FieldLabelWithHint
                        htmlFor={`external-href-${index}`}
                        hint={EXTERNAL_LINK_HELP.href.hint}
                        hintLabel="About website address"
                      >
                        {EXTERNAL_LINK_HELP.href.label}
                      </FieldLabelWithHint>
                      <Input
                        id={`external-href-${index}`}
                        value={link.href}
                        onChange={(event) => handleExternalChange(index, "href", event.target.value)}
                        className="mt-2"
                        placeholder="https://example.com/book"
                        inputMode="url"
                      />
                      <p className="mt-1 text-xs text-(--gym-muted)">
                        Opens an outside website in a new tab. <span className="text-neutral-400">Recommended:</span>{" "}
                        {EXTERNAL_LINK_HELP.href.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddExternal}
                  disabled={draft.externalLinks.length >= MAX_EXTERNAL_LINKS}
                >
                  <Plus className="mr-1 h-4 w-4" aria-hidden />
                  Add external link
                </Button>
              </Card>
            ),
          },
          {
            id: "member-header",
            editorLabel: SITE_MENU_SECTIONS.memberHeader.title,
            editor: (
              <Card id="edit-member-header" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={SITE_MENU_SECTIONS.memberHeader.title}
                  hint={SITE_MENU_SECTIONS.memberHeader.hint}
                  description={SITE_MENU_SECTIONS.memberHeader.description}
                />
                {memberHeaderPages.map((entry) => {
                  const page = getPageState(entry.id);
                  return (
                    <SiteMenuPageRow
                      key={entry.id}
                      pageId={entry.id}
                      enabled={page.enabled}
                      label={page.label}
                      onToggle={(enabled) => updatePage(entry.id, { enabled })}
                      onLabelChange={(label) => updatePage(entry.id, { label })}
                    />
                  );
                })}
              </Card>
            ),
          },
          {
            id: "account-menu",
            editorLabel: SITE_MENU_SECTIONS.accountMenu.title,
            editor: (
              <Card id="edit-account-menu" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={SITE_MENU_SECTIONS.accountMenu.title}
                  hint={SITE_MENU_SECTIONS.accountMenu.hint}
                  description={SITE_MENU_SECTIONS.accountMenu.description}
                />
                {accountMenuPages.map((entry) => {
                  const page = getPageState(entry.id);
                  return (
                    <SiteMenuPageRow
                      key={entry.id}
                      pageId={entry.id}
                      enabled={page.enabled}
                      label={page.label}
                      onToggle={(enabled) => updatePage(entry.id, { enabled })}
                      onLabelChange={(label) => updatePage(entry.id, { label })}
                    />
                  );
                })}
              </Card>
            ),
          },
          {
            id: "modules",
            editorLabel: "Other gym modules",
            editor: (
              <Card id="edit-modules" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={SITE_MENU_SECTIONS.modules.title}
                  hint={SITE_MENU_SECTIONS.modules.hint}
                  description={SITE_MENU_SECTIONS.modules.description}
                />
                {modulePages.map((entry) => {
                  const page = getPageState(entry.id);
                  return (
                    <SiteMenuPageRow
                      key={entry.id}
                      pageId={entry.id}
                      enabled={page.enabled}
                      label={page.label}
                      showLabelField={false}
                      onToggle={(enabled) => updatePage(entry.id, { enabled })}
                      onLabelChange={(label) => updatePage(entry.id, { label })}
                    />
                  );
                })}
              </Card>
            ),
          },
        ],
      }}
      footer={
        <>
          <div className="rounded-lg border border-(--gym-border) bg-black/30 p-4 text-sm text-(--gym-muted)">
            {SITE_MENU_SECTIONS.staffNote}
          </div>
          <Button type="button" size="lg" className="w-full" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    />
  );
};
