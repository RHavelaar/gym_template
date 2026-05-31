import type {
  ContactPageSettings,
  GymConfig,
  GymPricingPlan,
  HomepageSection,
  PricingPageSettings,
} from "@/config/types";

type DemoContentOverride = {
  config: Partial<GymConfig>;
  sections: HomepageSection[] | null;
  contactPage: ContactPageSettings | null;
  pricingPage: PricingPageSettings | null;
  pricingPlans: GymPricingPlan[] | null;
};

let demoContentOverride: DemoContentOverride | null = null;

export const getDemoContentOverride = (): DemoContentOverride | null => demoContentOverride;

export const setDemoContentOverride = (override: Partial<DemoContentOverride>) => {
  demoContentOverride = {
    config: override.config ?? demoContentOverride?.config ?? {},
    sections: override.sections ?? demoContentOverride?.sections ?? null,
    contactPage: override.contactPage ?? demoContentOverride?.contactPage ?? null,
    pricingPage: override.pricingPage ?? demoContentOverride?.pricingPage ?? null,
    pricingPlans: override.pricingPlans ?? demoContentOverride?.pricingPlans ?? null,
  };
};

export const updateDemoConfig = (partial: Partial<GymConfig>) => {
  demoContentOverride = {
    config: { ...demoContentOverride?.config, ...partial },
    sections: demoContentOverride?.sections ?? null,
    contactPage: demoContentOverride?.contactPage ?? null,
    pricingPage: demoContentOverride?.pricingPage ?? null,
    pricingPlans: demoContentOverride?.pricingPlans ?? null,
  };
};

export const updateDemoSections = (sections: HomepageSection[]) => {
  demoContentOverride = {
    config: demoContentOverride?.config ?? {},
    sections,
    contactPage: demoContentOverride?.contactPage ?? null,
    pricingPage: demoContentOverride?.pricingPage ?? null,
    pricingPlans: demoContentOverride?.pricingPlans ?? null,
  };
};

export const updateDemoContactPage = (settings: ContactPageSettings) => {
  demoContentOverride = {
    config: demoContentOverride?.config ?? {},
    sections: demoContentOverride?.sections ?? null,
    contactPage: settings,
    pricingPage: demoContentOverride?.pricingPage ?? null,
    pricingPlans: demoContentOverride?.pricingPlans ?? null,
  };
};

export const updateDemoPricingPage = (settings: PricingPageSettings) => {
  demoContentOverride = {
    config: demoContentOverride?.config ?? {},
    sections: demoContentOverride?.sections ?? null,
    contactPage: demoContentOverride?.contactPage ?? null,
    pricingPage: settings,
    pricingPlans: demoContentOverride?.pricingPlans ?? null,
  };
};

export const updateDemoPricingPlans = (plans: GymPricingPlan[]) => {
  demoContentOverride = {
    config: demoContentOverride?.config ?? {},
    sections: demoContentOverride?.sections ?? null,
    contactPage: demoContentOverride?.contactPage ?? null,
    pricingPage: demoContentOverride?.pricingPage ?? null,
    pricingPlans: plans,
  };
};
