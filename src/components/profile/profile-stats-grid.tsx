import Link from "next/link";
import { Lock, Scale, Settings } from "lucide-react";
import { formatDate, formatHeight, formatWeight } from "@/lib/utils";
import {
  getMeasurementEntries,
  MEASUREMENT_SECTIONS,
  profileToMeasurementSnapshot,
  type MeasurementFieldKey,
} from "@/lib/measurements";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Profile, ProfileVisibility } from "@/types/database";

type ProfileStatsGridProps = {
  profile: Profile;
};

const visibilityConfig: Record<ProfileVisibility, { label: string; icon: typeof Lock; className: string }> = {
  private: {
    label: "Only you",
    icon: Lock,
    className: "border-neutral-600/50 bg-neutral-800/50 text-neutral-300",
  },
  trainer: {
    label: "You + trainer",
    icon: Lock,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  },
  public: {
    label: "Visible to gym",
    icon: Lock,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
};

export const ProfileStatsGrid = ({ profile }: ProfileStatsGridProps) => {
  const snapshot = profileToMeasurementSnapshot(profile);
  const entries = getMeasurementEntries(snapshot);
  const visibility = visibilityConfig[profile.visibility];
  const VisibilityIcon = visibility.icon;

  const heroStats = [
    profile.bodyweight_lbs != null
      ? { label: "Weight", value: formatWeight(profile.bodyweight_lbs), key: "weight" }
      : null,
    profile.height_in != null ? { label: "Height", value: formatHeight(profile.height_in), key: "height" } : null,
    profile.body_fat_pct != null ? { label: "Body fat", value: `${profile.body_fat_pct}%`, key: "bodyfat" } : null,
  ].filter(Boolean) as { label: string; value: string; key: string }[];

  const sections = MEASUREMENT_SECTIONS.map((section) => ({
    ...section,
    entries: entries.filter((entry) => section.fields.some((field) => field.key === entry.key)),
  })).filter((section) => section.entries.length > 0);

  if (entries.length === 0) {
    return (
      <Card className="overflow-hidden border-dashed p-0">
        <div className="flex flex-col items-center px-6 py-10 text-center sm:py-12">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--gym-primary)/15 text-(--gym-primary)"
            aria-hidden
          >
            <Scale className="h-7 w-7" strokeWidth={2} />
          </div>
          <CardTitle className="text-lg sm:text-xl">No stats yet</CardTitle>
          <CardDescription className="mt-2 max-w-sm text-base leading-relaxed">
            Log your first check-in below. You can start with just weight and height — add more anytime.
          </CardDescription>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${visibility.className}`}
        >
          <VisibilityIcon className="h-3.5 w-3.5" aria-hidden />
          {visibility.label}
        </span>
        <span className="text-xs text-(--gym-muted) sm:text-sm">Last updated {formatDate(profile.updated_at)}</span>
      </div>

      {heroStats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-2xl border border-(--gym-border) bg-linear-to-br from-(--gym-surface) to-black/40 p-4 sm:p-5"
            >
              <p className="text-xs font-medium text-(--gym-muted) sm:text-sm">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {sections.map((section) => (
        <div key={section.id}>
          <h3 className="mb-2.5 text-sm font-semibold text-neutral-300">{section.title}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {section.entries.map((stat) => (
              <Card key={stat.key as MeasurementFieldKey} className="p-3.5 sm:p-4">
                <CardDescription className="text-xs font-medium tracking-normal normal-case">
                  {stat.label}
                </CardDescription>
                <CardTitle className="mt-0.5 text-lg sm:text-xl">{stat.value}</CardTitle>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

type ProfileHeaderProps = {
  profile: Profile;
};

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => (
  <header className="relative overflow-hidden rounded-2xl border border-(--gym-border) bg-linear-to-br from-(--gym-surface) via-(--gym-surface) to-black/60 p-5 sm:p-7">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-(--gym-primary) text-2xl font-bold text-white shadow-(--gym-primary)/20 shadow-lg sm:h-18 sm:w-18 sm:text-3xl"
          aria-hidden
        >
          {profile.display_name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-medium text-(--gym-accent)">Your profile</p>
          <h1 className="mt-0.5 text-2xl leading-tight font-bold text-white sm:text-3xl">{profile.display_name}</h1>
          <p className="mt-1.5 text-sm text-(--gym-muted)">Member since {formatDate(profile.created_at)}</p>
          {profile.bio ? (
            <p className="mt-3 text-sm leading-relaxed text-neutral-200 sm:text-base">{profile.bio}</p>
          ) : null}
        </div>
      </div>
      <Link
        href="/user-profile"
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-(--gym-border) bg-black/30 px-4 text-sm font-semibold text-white transition hover:border-(--gym-accent)/40 hover:bg-black/50 sm:w-auto"
      >
        <Settings className="h-4 w-4 text-(--gym-muted)" aria-hidden />
        Account &amp; password
      </Link>
    </div>
  </header>
);
