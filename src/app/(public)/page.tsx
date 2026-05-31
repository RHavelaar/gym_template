import { SectionRenderer } from "@/components/homepage/section-renderer";
import { getResolvedGymConfig, getResolvedHomepageSections } from "@/lib/gym-config-resolver";

export default async function HomePage() {
  const [config, sections] = await Promise.all([getResolvedGymConfig(), getResolvedHomepageSections()]);

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} config={config} />
      ))}
    </>
  );
}
