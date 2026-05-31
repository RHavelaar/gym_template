import { describe, expect, it } from "vitest";
import {
  getStableAcceptedFieldKeys,
  pruneAcceptedOnFieldEdit,
  recordAcceptedField,
} from "@/lib/brand-review/accepted-fields";
import type { GymConfig } from "@/config/types";
import { DEFAULT_BRAND_SEO, DEFAULT_BRAND_TYPOGRAPHY } from "@/config/types";

const baseDraft = (): GymConfig =>
  ({
    slug: "test-gym",
    name: "Iron Asylum",
    tagline: "Train hard",
    description: "Hardcore gym in Austin for serious lifters.",
    logoUrl: "/logo.png",
    theme: {
      primary: "#000",
      primaryForeground: "#fff",
      accent: "#f00",
      accentForeground: "#fff",
      background: "#000",
      surface: "#111",
      surfaceBorder: "#333",
      muted: "#888",
      danger: "#f00",
    },
    typography: DEFAULT_BRAND_TYPOGRAPHY,
    seo: { ...DEFAULT_BRAND_SEO, metaTitle: "", metaDescription: "" },
    labels: {},
    features: {},
    nav: { public: [], member: [], account: [], admin: [] },
    business: {} as GymConfig["business"],
    images: { hero: "" },
    homepageSections: [],
  }) as unknown as GymConfig;

describe("accepted-fields", () => {
  it("prunes edited field and downstream invalidations", () => {
    const accepted = [
      { fieldKey: "description" as const, value: "New desc", acceptedAt: 1 },
      { fieldKey: "metaDescription" as const, value: "Meta", acceptedAt: 1 },
    ];
    const next = pruneAcceptedOnFieldEdit(accepted, "name");
    expect(next).toHaveLength(2);
    const afterDesc = pruneAcceptedOnFieldEdit(accepted, "description");
    expect(afterDesc.find((a) => a.fieldKey === "description")).toBeUndefined();
    expect(afterDesc.find((a) => a.fieldKey === "metaDescription")).toBeUndefined();
  });

  it("returns stable accepted when draft value matches", () => {
    const draft = baseDraft();
    draft.description = "Applied copy";
    const keys = getStableAcceptedFieldKeys(draft, [
      { fieldKey: "description", value: "Applied copy", acceptedAt: 1 },
      { fieldKey: "tagline", value: "Old tagline", acceptedAt: 1 },
    ]);
    expect(keys).toEqual(["description"]);
  });

  it("records accepted field replacing prior entry", () => {
    const next = recordAcceptedField([{ fieldKey: "tagline", value: "A", acceptedAt: 1 }], "tagline", "B");
    expect(next).toHaveLength(1);
    expect(next[0]?.value).toBe("B");
  });
});
