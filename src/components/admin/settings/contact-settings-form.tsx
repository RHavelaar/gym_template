"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ContactPageSettings } from "@/config/types";
import { saveContactPageSettingsAction } from "@/app/actions/pages";
import { MarketingPagePreviewFrame } from "@/components/admin/settings/marketing-page-preview-frame";
import { SettingsEditorShell } from "@/components/admin/settings/settings-editor-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldLabelWithHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { CONTACT_PAGE_HELP } from "@/lib/page-help";
import { useAppAction } from "@/hooks/use-app-action";

type ContactSettingsFormProps = {
  initialPage: ContactPageSettings;
};

export const ContactSettingsForm = ({ initialPage }: ContactSettingsFormProps) => {
  const [draft, setDraft] = useState<ContactPageSettings>(initialPage);
  const { runAction, pending: saving } = useAppAction();

  const setPage = (patch: Partial<ContactPageSettings>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    await runAction(() => saveContactPageSettingsAction(draft), {
      successMessage: "Contact page saved.",
    });
  };

  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    setDraft((prev) => ({
      ...prev,
      faqItems: prev.faqItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleAddFaq = () => {
    if (draft.faqItems.length >= 8) return;
    setDraft((prev) => ({
      ...prev,
      faqItems: [...prev.faqItems, { question: "", answer: "" }],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      faqItems: prev.faqItems.filter((_, i) => i !== index),
    }));
  };

  return (
    <SettingsEditorShell
      title="Contact page"
      description="Headlines, form options, and FAQs for your public contact page. Hours and address are edited under Business info."
      stickyPreview={{
        preview: <MarketingPagePreviewFrame path="/contact" helperText={CONTACT_PAGE_HELP.generalEmailNote.hint} />,
        editorBlocks: [
          {
            id: "copy",
            editorLabel: "Page copy",
            editor: (
              <Card id="edit-copy" className="scroll-mt-24 space-y-5">
                <SettingSectionTitle title="Page copy" />
                <div>
                  <FieldLabelWithHint htmlFor="contact-headline" hint={CONTACT_PAGE_HELP.headline.hint}>
                    Headline
                  </FieldLabelWithHint>
                  <Input
                    id="contact-headline"
                    value={draft.headline}
                    onChange={(e) => setPage({ headline: e.target.value })}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-(--gym-muted)">{CONTACT_PAGE_HELP.headline.recommendation}</p>
                </div>
                <div>
                  <FieldLabelWithHint htmlFor="contact-subtitle" hint={CONTACT_PAGE_HELP.subtitle.hint}>
                    Subtitle
                  </FieldLabelWithHint>
                  <textarea
                    id="contact-subtitle"
                    value={draft.subtitle}
                    onChange={(e) => setPage({ subtitle: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <FieldLabelWithHint htmlFor="contact-meta" hint="Optional — used for search and social previews.">
                    SEO description
                  </FieldLabelWithHint>
                  <textarea
                    id="contact-meta"
                    value={draft.metaDescription}
                    onChange={(e) => setPage({ metaDescription: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                  />
                </div>
              </Card>
            ),
          },
          {
            id: "form",
            editorLabel: "Contact form",
            editor: (
              <Card id="edit-form" className="scroll-mt-24 space-y-5">
                <SettingSectionTitle title="Contact form" />
                <p className="text-xs text-(--gym-muted)">{CONTACT_PAGE_HELP.generalEmailNote.recommendation}</p>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.showForm}
                    onChange={(e) => setPage({ showForm: e.target.checked })}
                  />
                  Show contact form on page
                </label>
                {draft.showForm ? (
                  <>
                    <div>
                      <FieldLabelWithHint htmlFor="form-headline" hint={CONTACT_PAGE_HELP.formHeadline.hint}>
                        Form title
                      </FieldLabelWithHint>
                      <Input
                        id="form-headline"
                        value={draft.formHeadline}
                        onChange={(e) => setPage({ formHeadline: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor="form-subtitle" hint="Shown under the form title.">
                        Form helper text
                      </FieldLabelWithHint>
                      <textarea
                        id="form-subtitle"
                        value={draft.formSubtitle}
                        onChange={(e) => setPage({ formSubtitle: e.target.value })}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                      />
                    </div>
                  </>
                ) : null}
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.showDirectionsLink}
                    onChange={(e) => setPage({ showDirectionsLink: e.target.checked })}
                  />
                  Show Google Maps directions link
                </label>
                <p className="text-xs text-(--gym-muted)">{CONTACT_PAGE_HELP.showDirections.recommendation}</p>
              </Card>
            ),
          },
          {
            id: "faq",
            editorLabel: "FAQ",
            editor: (
              <Card id="edit-faq" className="scroll-mt-24 space-y-4">
                <SettingSectionTitle title="FAQ" />
                <p className="text-xs text-(--gym-muted)">{CONTACT_PAGE_HELP.faq.recommendation}</p>
                {draft.faqItems.map((item, index) => (
                  <div key={index} className="space-y-3 rounded-lg border border-(--gym-border) p-4">
                    <div className="flex justify-end">
                      <Button type="button" variant="secondary" size="sm" onClick={() => handleRemoveFaq(index)}>
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Remove
                      </Button>
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor={`faq-q-${index}`}>Question</FieldLabelWithHint>
                      <Input
                        id={`faq-q-${index}`}
                        value={item.question}
                        onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <FieldLabelWithHint htmlFor={`faq-a-${index}`}>Answer</FieldLabelWithHint>
                      <textarea
                        id={`faq-a-${index}`}
                        value={item.answer}
                        onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={handleAddFaq} disabled={draft.faqItems.length >= 8}>
                  <Plus className="mr-1 h-4 w-4" aria-hidden />
                  Add question
                </Button>
              </Card>
            ),
          },
        ],
      }}
      footer={
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save contact page"}
          </Button>
          <p className="self-center text-xs text-(--gym-muted)">
            Business hours, phone, and email:{" "}
            <a href="/admin/settings/business" className="text-(--gym-accent) hover:underline">
              Business info
            </a>
          </p>
        </div>
      }
    />
  );
};
