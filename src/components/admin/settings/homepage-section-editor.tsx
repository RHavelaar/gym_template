"use client";

import Link from "next/link";
import { useState } from "react";
import { DEFAULT_SECTION_PROPS, type GymConfig, type HomepageSection, type HomepageSectionType } from "@/config/types";
import { saveHomepageSectionsAction } from "@/app/actions/content";
import { SettingsEditorShell } from "@/components/admin/settings/settings-editor-shell";
import { HomepagePreview } from "@/components/admin/settings/content-preview";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppAction } from "@/hooks/use-app-action";

type HomepageSectionEditorProps = {
  initialConfig: GymConfig;
  initialSections: HomepageSection[];
};

const SECTION_TYPES: HomepageSectionType[] = [
  "hero",
  "cta",
  "hours",
  "location",
  "membership",
  "gallery",
  "announcements",
];

const createSection = (type: HomepageSectionType, order: number): HomepageSection =>
  ({
    id: `${type}-${Date.now()}`,
    type,
    enabled: true,
    order,
    props: { ...DEFAULT_SECTION_PROPS[type] },
  }) as HomepageSection;

const SectionPropsForm = ({
  section,
  onChange,
}: {
  section: HomepageSection;
  onChange: (section: HomepageSection) => void;
}) => {
  const updateProp = (key: string, value: string | string[]) => {
    onChange({
      ...section,
      props: { ...section.props, [key]: value },
    } as HomepageSection);
  };

  switch (section.type) {
    case "hero":
      return (
        <div className="mt-3 rounded-lg border border-(--gym-border) bg-black/20 p-4">
          <p className="text-sm text-neutral-300">
            Hero copy, buttons, layout, overlay, and colors are managed on the media settings page.
          </p>
          <Link
            href="/admin/settings/media"
            className="mt-3 inline-flex text-sm font-semibold text-(--gym-accent) underline-offset-2 hover:underline"
          >
            Edit hero on Media settings →
          </Link>
        </div>
      );
    case "cta":
      return (
        <div className="mt-3 space-y-2">
          <div>
            <Label htmlFor={`${section.id}-title`}>Title</Label>
            <Input
              id={`${section.id}-title`}
              value={(section.props as { title: string }).title}
              onChange={(e) => updateProp("title", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${section.id}-body`}>Body</Label>
            <textarea
              id={`${section.id}-body`}
              rows={3}
              className="w-full rounded-lg border border-(--gym-border) bg-(--gym-surface) px-3 py-2 text-white"
              value={(section.props as { body: string }).body}
              onChange={(e) => updateProp("body", e.target.value)}
            />
          </div>
        </div>
      );
    case "membership":
      return (
        <div className="mt-3 space-y-2">
          {(
            [
              ["title", "Section title"],
              ["ctaLabel", "Button label"],
              ["ctaHref", "Button link"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`${section.id}-${key}`}>{label}</Label>
              <Input
                id={`${section.id}-${key}`}
                value={(section.props as Record<string, string>)[key] ?? ""}
                onChange={(e) => updateProp(key, e.target.value)}
              />
            </div>
          ))}
          <p className="text-xs text-(--gym-muted)">Membership description comes from Business info settings.</p>
        </div>
      );
    case "gallery":
      return (
        <div className="mt-3 space-y-2">
          <div>
            <Label htmlFor={`${section.id}-title`}>Section title</Label>
            <Input
              id={`${section.id}-title`}
              value={(section.props as { title: string }).title}
              onChange={(e) => updateProp("title", e.target.value)}
            />
          </div>
          <p className="text-xs text-(--gym-muted)">
            Gallery photos and slideshow options are managed in Images &amp; media settings.
          </p>
        </div>
      );
    case "announcements": {
      const items = (section.props as { items: string[] }).items;
      return (
        <div className="mt-3 space-y-2">
          <div>
            <Label htmlFor={`${section.id}-title`}>Title</Label>
            <Input
              id={`${section.id}-title`}
              value={(section.props as { title: string }).title}
              onChange={(e) => updateProp("title", e.target.value)}
            />
          </div>
          {items.map((item, index) => (
            <div key={`${section.id}-item-${index}`}>
              <Label htmlFor={`${section.id}-item-${index}`}>Item {index + 1}</Label>
              <Input
                id={`${section.id}-item-${index}`}
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = e.target.value;
                  updateProp("items", next);
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => updateProp("items", [...items, "New announcement"])}
          >
            Add item
          </Button>
        </div>
      );
    }
    default:
      return (
        <div className="mt-3">
          <Label htmlFor={`${section.id}-title`}>Section title</Label>
          <Input
            id={`${section.id}-title`}
            value={(section.props as { title: string }).title}
            onChange={(e) => updateProp("title", e.target.value)}
          />
          {section.type === "hours" || section.type === "location" ? (
            <p className="mt-1 text-xs text-(--gym-muted)">Content comes from Business info settings.</p>
          ) : null}
        </div>
      );
  }
};

export const HomepageSectionEditor = ({ initialConfig, initialSections }: HomepageSectionEditorProps) => {
  const [config] = useState(initialConfig);
  const [sections, setSections] = useState([...initialSections].sort((a, b) => a.order - b.order));
  const [expandedId, setExpandedId] = useState<string | null>(sections[0]?.id ?? null);
  const { runAction, pending: saving } = useAppAction();

  const handleToggle = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= sections.length) return;
    const copy = [...sections];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setSections(copy.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleRemove = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleAdd = (type: HomepageSectionType) => {
    const section = createSection(type, sections.length + 1);
    setSections((prev) => [...prev, section]);
    setExpandedId(section.id);
  };

  const handleSave = async () => {
    await runAction(() => saveHomepageSectionsAction(sections), {
      successMessage: "Homepage saved.",
    });
  };

  return (
    <SettingsEditorShell
      title="Homepage sections"
      description="Add, remove, reorder, and edit homepage content blocks."
      previews={[
        {
          id: "homepage",
          label: "Full homepage preview",
          content: <HomepagePreview config={config} sections={sections} highlightSectionId={expandedId ?? undefined} />,
        },
      ]}
      form={
        <>
          <Card className="space-y-2">
            <p className="text-sm font-semibold">Add section</p>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="capitalize"
                  onClick={() => handleAdd(type)}
                >
                  + {type}
                </Button>
              ))}
            </div>
          </Card>

          {sections.map((section, index) => (
            <Card key={section.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="capitalize">{section.type}</CardTitle>
                  <p className="text-sm text-(--gym-muted)">{section.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Move section up"
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Move section down"
                    disabled={index === sections.length - 1}
                    onClick={() => handleMove(index, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant={section.enabled ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleToggle(section.id)}
                  >
                    {section.enabled ? "Visible" : "Hidden"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                  >
                    {expandedId === section.id ? "Collapse" : "Edit"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(section.id)}>
                    Remove
                  </Button>
                </div>
              </div>
              {expandedId === section.id ? (
                <SectionPropsForm
                  section={section}
                  onChange={(updated) => setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))}
                />
              ) : null}
            </Card>
          ))}

          <Button type="button" size="lg" className="w-full" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save homepage"}
          </Button>
        </>
      }
    />
  );
};
