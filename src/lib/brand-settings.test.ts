import { describe, expect, it } from "vitest";
import { getGymConfig } from "@/config";
import { applySitePreviewOverrides } from "@/lib/brand-settings";

describe("applySitePreviewOverrides", () => {
  it("merges nav and feature overrides onto a base config", () => {
    const base = getGymConfig();
    const result = applySitePreviewOverrides(base, {
      nav: {
        ...base.nav,
        public: [{ label: "Home", href: "/" }],
        member: [],
      },
      features: { ...base.features, leaderboards: false },
    });

    expect(result.nav.public).toHaveLength(1);
    expect(result.nav.member).toHaveLength(0);
    expect(result.features.leaderboards).toBe(false);
  });

  it("returns the same config when no overrides are provided", () => {
    const base = getGymConfig();
    expect(applySitePreviewOverrides(base)).toBe(base);
    expect(applySitePreviewOverrides(base, {})).toBe(base);
  });
});
