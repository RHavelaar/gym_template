"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { BusinessFieldVisibility, BusinessHoursVisibility, GymBusinessInfo, GymConfig } from "@/config/types";
import { updateBusinessAction } from "@/app/actions/content";
import { BusinessSettingsPreview } from "@/components/admin/settings/business-settings-preview";
import { SettingsEditorShell } from "@/components/admin/settings/settings-editor-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabelWithHint, InfoHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { BUSINESS_SECTION_HELP, BUSINESS_VISIBILITY_LABELS } from "@/lib/business-help";
import {
  BUSINESS_LINK_PRESETS,
  MAX_CUSTOM_BUSINESS_LINKS,
  createEmptyCustomLink,
  normalizeBusinessInfo,
} from "@/lib/business-info";
import { useAppAction } from "@/hooks/use-app-action";

type BusinessSettingsFormProps = {
  initialConfig: GymConfig;
};

type VisibilityToggleProps = {
  id: string;
  values: Record<string, boolean>;
  labels: Record<string, string>;
  onChange: (key: string, value: boolean) => void;
};

const VisibilityToggles = ({ id, values, labels, onChange }: VisibilityToggleProps) => (
  <fieldset className="mt-3 space-y-2 border-t border-(--gym-border)/60 pt-3">
    <legend className="text-xs font-medium text-(--gym-muted)">{BUSINESS_SECTION_HELP.visibility.title}</legend>
    <p className="text-xs text-(--gym-muted)">{BUSINESS_SECTION_HELP.visibility.hint}</p>
    <div className="flex flex-wrap gap-4">
      {Object.entries(labels).map(([key, label]) => (
        <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values[key] ?? false}
            onChange={(event) => onChange(key, event.target.checked)}
            aria-describedby={`${id}-vis-rec`}
          />
          {label}
        </label>
      ))}
    </div>
    <p id={`${id}-vis-rec`} className="text-xs text-(--gym-muted)">
      <span className="text-neutral-400">Recommended:</span> {BUSINESS_SECTION_HELP.visibility.recommendation}
    </p>
  </fieldset>
);

const fieldVisibilityLabels = {
  showInFooter: BUSINESS_VISIBILITY_LABELS.footer,
  showOnContactPage: BUSINESS_VISIBILITY_LABELS.contactPage,
  showOnHomepageLocation: BUSINESS_VISIBILITY_LABELS.homepageLocation,
};

const hoursVisibilityLabels = {
  showInFooter: BUSINESS_VISIBILITY_LABELS.footer,
  showOnContactPage: BUSINESS_VISIBILITY_LABELS.contactPage,
  showOnHomepageHours: BUSINESS_VISIBILITY_LABELS.homepageHours,
};

const emailVisibilityLabels = {
  showInFooter: BUSINESS_VISIBILITY_LABELS.footer,
  showOnContactPage: BUSINESS_VISIBILITY_LABELS.contactPage,
  showOnHomepageLocation: BUSINESS_VISIBILITY_LABELS.homepageLocation,
};

export const BusinessSettingsForm = ({ initialConfig }: BusinessSettingsFormProps) => {
  const initialBusiness = useMemo(
    () => normalizeBusinessInfo(initialConfig.business, initialConfig.business),
    [initialConfig.business],
  );
  const [draft, setDraft] = useState<GymBusinessInfo>(initialBusiness);
  const draftConfig = useMemo(() => ({ ...initialConfig, business: draft }), [initialConfig, draft]);
  const { runAction, pending: saving } = useAppAction();

  const customLinks = draft.links.filter((link) => link.kind === "custom");
  const presetLinks = draft.links.filter((link) => link.kind !== "custom");

  const setBusiness = (patch: Partial<GymBusinessInfo>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const setVisibility = <K extends keyof GymBusinessInfo["visibility"]>(
    key: K,
    patch: Partial<GymBusinessInfo["visibility"][K]>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, [key]: { ...prev.visibility[key], ...patch } },
    }));
  };

  const handleHourChange = (index: number, field: "day" | "open" | "close", value: string) => {
    const hours = draft.hours.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    setBusiness({ hours });
  };

  const handleAddHour = () => {
    setBusiness({
      hours: [...draft.hours, { day: "New day", open: "9:00 AM", close: "5:00 PM" }],
    });
  };

  const handleRemoveHour = (index: number) => {
    if (draft.hours.length <= 1) return;
    setBusiness({ hours: draft.hours.filter((_, i) => i !== index) });
  };

  const handlePresetLinkChange = (
    kind: (typeof BUSINESS_LINK_PRESETS)[number]["kind"],
    patch: Partial<(typeof draft.links)[number]>,
  ) => {
    setBusiness({
      links: draft.links.map((link) => (link.kind === kind ? { ...link, ...patch } : link)),
    });
  };

  const handleCustomLinkChange = (id: string, patch: Partial<(typeof draft.links)[number]>) => {
    setBusiness({
      links: draft.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    });
  };

  const handleAddCustomLink = () => {
    if (customLinks.length >= MAX_CUSTOM_BUSINESS_LINKS) return;
    setBusiness({ links: [...draft.links, createEmptyCustomLink()] });
  };

  const handleRemoveCustomLink = (id: string) => {
    setBusiness({ links: draft.links.filter((link) => link.id !== id) });
  };

  const handleSave = async () => {
    const normalized = normalizeBusinessInfo(draft, draft);
    await runAction(() => updateBusinessAction(normalized), {
      successMessage: "Business info saved.",
    });
    setDraft(normalized);
  };

  return (
    <SettingsEditorShell
      title="Business info"
      description="Hours, contact details, social links, and what appears on your contact page, footer, and homepage."
      stickyPreview={{
        preview: <BusinessSettingsPreview config={draftConfig} />,
        editorBlocks: [
          {
            id: "hours",
            editorLabel: BUSINESS_SECTION_HELP.hours.title,
            editor: (
              <Card id="edit-hours" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={BUSINESS_SECTION_HELP.hours.title}
                  hint={BUSINESS_SECTION_HELP.hours.hint}
                  description={BUSINESS_SECTION_HELP.hours.recommendation}
                />
                {draft.hours.map((row, index) => (
                  <div key={`hour-${index}`} className="grid gap-2 sm:grid-cols-4">
                    <div>
                      <FieldLabelWithHint htmlFor={`hour-day-${index}`} hint="Day or range, e.g. Mon–Fri">
                        Day
                      </FieldLabelWithHint>
                      <Input
                        id={`hour-day-${index}`}
                        value={row.day}
                        onChange={(e) => handleHourChange(index, "day", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor={`hour-open-${index}`} hint="Opening time">
                        Opens
                      </FieldLabelWithHint>
                      <Input
                        id={`hour-open-${index}`}
                        value={row.open}
                        onChange={(e) => handleHourChange(index, "open", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor={`hour-close-${index}`} hint="Closing time">
                        Closes
                      </FieldLabelWithHint>
                      <Input
                        id={`hour-close-${index}`}
                        value={row.close}
                        onChange={(e) => handleHourChange(index, "close", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHour(index)}
                        disabled={draft.hours.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={handleAddHour}>
                  Add hours row
                </Button>
                <VisibilityToggles
                  id="hours-vis"
                  values={draft.visibility.hours as unknown as Record<string, boolean>}
                  labels={hoursVisibilityLabels}
                  onChange={(key, value) =>
                    setVisibility("hours", { [key]: value } as Partial<BusinessHoursVisibility>)
                  }
                />
              </Card>
            ),
          },
          {
            id: "address",
            editorLabel: BUSINESS_SECTION_HELP.address.title,
            editor: (
              <Card id="edit-address" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={BUSINESS_SECTION_HELP.address.title}
                  hint={BUSINESS_SECTION_HELP.address.hint}
                  description={BUSINESS_SECTION_HELP.address.recommendation}
                />
                <div>
                  <FieldLabelWithHint htmlFor="address-line1" hint="Street number and road name">
                    Street address
                  </FieldLabelWithHint>
                  <Input
                    id="address-line1"
                    value={draft.address.line1}
                    onChange={(e) => setBusiness({ address: { ...draft.address, line1: e.target.value } })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <FieldLabelWithHint htmlFor="address-line2" hint="Suite, unit, or building — optional">
                    Address line 2
                  </FieldLabelWithHint>
                  <Input
                    id="address-line2"
                    value={draft.address.line2 ?? ""}
                    onChange={(e) => setBusiness({ address: { ...draft.address, line2: e.target.value } })}
                    className="mt-1"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <FieldLabelWithHint htmlFor="city" hint="City name">
                      City
                    </FieldLabelWithHint>
                    <Input
                      id="city"
                      value={draft.address.city}
                      onChange={(e) => setBusiness({ address: { ...draft.address, city: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <FieldLabelWithHint htmlFor="state" hint="State or province abbreviation">
                      State
                    </FieldLabelWithHint>
                    <Input
                      id="state"
                      value={draft.address.state}
                      onChange={(e) => setBusiness({ address: { ...draft.address, state: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <FieldLabelWithHint htmlFor="zip" hint="Postal or ZIP code">
                      ZIP
                    </FieldLabelWithHint>
                    <Input
                      id="zip"
                      value={draft.address.zip}
                      onChange={(e) => setBusiness({ address: { ...draft.address, zip: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <VisibilityToggles
                  id="address-vis"
                  values={draft.visibility.address as unknown as Record<string, boolean>}
                  labels={fieldVisibilityLabels}
                  onChange={(key, value) =>
                    setVisibility("address", { [key]: value } as Partial<BusinessFieldVisibility>)
                  }
                />
              </Card>
            ),
          },
          {
            id: "contact",
            editorLabel: "Phone & email",
            editor: (
              <Card id="edit-contact" className="scroll-mt-24 space-y-6 transition-shadow">
                <div className="space-y-4">
                  <SettingSectionTitle
                    title={BUSINESS_SECTION_HELP.phone.title}
                    hint={BUSINESS_SECTION_HELP.phone.hint}
                    description={BUSINESS_SECTION_HELP.phone.recommendation}
                  />
                  <Input
                    id="phone"
                    aria-label="Phone number"
                    value={draft.contactPhone}
                    onChange={(e) => setBusiness({ contactPhone: e.target.value })}
                  />
                  <VisibilityToggles
                    id="phone-vis"
                    values={draft.visibility.phone as unknown as Record<string, boolean>}
                    labels={fieldVisibilityLabels}
                    onChange={(key, value) =>
                      setVisibility("phone", { [key]: value } as Partial<BusinessFieldVisibility>)
                    }
                  />
                </div>

                <div className="space-y-4 border-t border-(--gym-border)/60 pt-4">
                  <SettingSectionTitle
                    title={BUSINESS_SECTION_HELP.generalEmail.title}
                    hint={BUSINESS_SECTION_HELP.generalEmail.hint}
                    description={BUSINESS_SECTION_HELP.generalEmail.recommendation}
                  />
                  <Input
                    id="general-email"
                    type="email"
                    autoComplete="email"
                    value={draft.generalEmail}
                    onChange={(e) => setBusiness({ generalEmail: e.target.value })}
                  />
                  <VisibilityToggles
                    id="email-vis"
                    values={draft.visibility.generalEmail as unknown as Record<string, boolean>}
                    labels={emailVisibilityLabels}
                    onChange={(key, value) =>
                      setVisibility("generalEmail", { [key]: value } as Partial<BusinessFieldVisibility>)
                    }
                  />
                </div>

                <div className="space-y-3 border-t border-(--gym-border)/60 pt-4">
                  <div className="flex items-start gap-2">
                    <SettingSectionTitle
                      title={BUSINESS_SECTION_HELP.helpEmail.title}
                      hint={BUSINESS_SECTION_HELP.helpEmail.hint}
                      description={BUSINESS_SECTION_HELP.helpEmail.recommendation}
                    />
                    <InfoHint
                      content="This address powers the Get help link when something goes wrong. It is not shown on your public site unless you also add it as general email."
                      label="About help email"
                    />
                  </div>
                  <Input
                    id="help-email"
                    type="email"
                    autoComplete="email"
                    value={draft.helpEmail}
                    onChange={(e) => setBusiness({ helpEmail: e.target.value })}
                    required
                  />
                </div>
              </Card>
            ),
          },
          {
            id: "social",
            editorLabel: BUSINESS_SECTION_HELP.social.title,
            editor: (
              <Card id="edit-social" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={BUSINESS_SECTION_HELP.social.title}
                  hint={BUSINESS_SECTION_HELP.social.hint}
                  description={BUSINESS_SECTION_HELP.social.recommendation}
                />
                {BUSINESS_LINK_PRESETS.map((preset) => {
                  const link = presetLinks.find((item) => item.kind === preset.kind);
                  if (!link) return null;
                  return (
                    <div key={preset.kind} className="rounded-lg border border-(--gym-border) p-4">
                      <FieldLabelWithHint htmlFor={`link-${preset.kind}`} hint={preset.placeholder}>
                        {preset.label}
                      </FieldLabelWithHint>
                      <Input
                        id={`link-${preset.kind}`}
                        type="url"
                        inputMode="url"
                        placeholder={preset.placeholder}
                        value={link.url}
                        onChange={(e) => handlePresetLinkChange(preset.kind, { url: e.target.value })}
                        className="mt-2"
                      />
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={link.showInFooter}
                            onChange={(e) => handlePresetLinkChange(preset.kind, { showInFooter: e.target.checked })}
                          />
                          {BUSINESS_VISIBILITY_LABELS.footer}
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={link.showOnContactPage}
                            onChange={(e) =>
                              handlePresetLinkChange(preset.kind, { showOnContactPage: e.target.checked })
                            }
                          />
                          {BUSINESS_VISIBILITY_LABELS.contactPage}
                        </label>
                      </div>
                    </div>
                  );
                })}

                {customLinks.map((link) => (
                  <div key={link.id} className="rounded-lg border border-(--gym-border) p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Custom link</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveCustomLink(link.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Remove custom link</span>
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <FieldLabelWithHint htmlFor={`custom-label-${link.id}`} hint="Text visitors see for the link">
                          Label
                        </FieldLabelWithHint>
                        <Input
                          id={`custom-label-${link.id}`}
                          value={link.label}
                          onChange={(e) => handleCustomLinkChange(link.id, { label: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <FieldLabelWithHint htmlFor={`custom-url-${link.id}`} hint="Must start with https://">
                          URL
                        </FieldLabelWithHint>
                        <Input
                          id={`custom-url-${link.id}`}
                          type="url"
                          value={link.url}
                          onChange={(e) => handleCustomLinkChange(link.id, { url: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={link.showInFooter}
                          onChange={(e) => handleCustomLinkChange(link.id, { showInFooter: e.target.checked })}
                        />
                        {BUSINESS_VISIBILITY_LABELS.footer}
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={link.showOnContactPage}
                          onChange={(e) => handleCustomLinkChange(link.id, { showOnContactPage: e.target.checked })}
                        />
                        {BUSINESS_VISIBILITY_LABELS.contactPage}
                      </label>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCustomLink}
                  disabled={customLinks.length >= MAX_CUSTOM_BUSINESS_LINKS}
                >
                  <Plus className="mr-1 h-4 w-4" aria-hidden />
                  Add custom link
                </Button>
              </Card>
            ),
          },
          {
            id: "membership",
            editorLabel: BUSINESS_SECTION_HELP.membership.title,
            editor: (
              <Card id="edit-membership" className="scroll-mt-24 space-y-4 transition-shadow">
                <SettingSectionTitle
                  title={BUSINESS_SECTION_HELP.membership.title}
                  hint={BUSINESS_SECTION_HELP.membership.hint}
                  description={BUSINESS_SECTION_HELP.membership.recommendation}
                />
                <textarea
                  id="membership"
                  rows={4}
                  className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                  value={draft.membershipBlurb}
                  onChange={(e) => setBusiness({ membershipBlurb: e.target.value })}
                  aria-label="Membership blurb"
                />
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.visibility.membershipBlurb.showOnHomepage}
                    onChange={(e) => setVisibility("membershipBlurb", { showOnHomepage: e.target.checked })}
                  />
                  {BUSINESS_VISIBILITY_LABELS.homepageMembership}
                </label>
              </Card>
            ),
          },
        ],
      }}
      footer={
        <Button type="button" size="lg" className="w-full max-w-xl" disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save business info"}
        </Button>
      }
    />
  );
};
