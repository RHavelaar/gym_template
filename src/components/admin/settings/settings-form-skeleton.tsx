export const SettingsFormSkeleton = () => (
  <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
    <div className="mb-8 h-10 w-64 rounded bg-(--gym-surface)" />
    <div className="mb-2 h-4 w-96 max-w-full rounded bg-(--gym-surface)" />
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="h-48 rounded-xl bg-(--gym-surface)" />
        <div className="h-48 rounded-xl bg-(--gym-surface)" />
      </div>
      <div className="h-96 rounded-xl bg-(--gym-surface)" />
    </div>
  </div>
);
