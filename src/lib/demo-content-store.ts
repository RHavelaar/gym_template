import type { GymConfig, HomepageSection } from "@/config/types";

type DemoContentOverride = {
  config: Partial<GymConfig>;
  sections: HomepageSection[] | null;
};

let demoContentOverride: DemoContentOverride | null = null;

export const getDemoContentOverride = (): DemoContentOverride | null => demoContentOverride;

export const setDemoContentOverride = (override: DemoContentOverride) => {
  demoContentOverride = override;
};

export const updateDemoConfig = (partial: Partial<GymConfig>) => {
  demoContentOverride = {
    config: { ...demoContentOverride?.config, ...partial },
    sections: demoContentOverride?.sections ?? null,
  };
};

export const updateDemoSections = (sections: HomepageSection[]) => {
  demoContentOverride = {
    config: demoContentOverride?.config ?? {},
    sections,
  };
};
