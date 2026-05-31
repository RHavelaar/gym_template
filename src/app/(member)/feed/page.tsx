import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import { requireFeatureEnabled } from "@/lib/feature-guards";
import { FeedPost } from "@/components/social/feed-post";
import { demoPosts, demoProfiles } from "@/lib/demo-data";

export const metadata = { title: "Gym Feed" };

export default async function FeedPage() {
  await requireFeatureEnabled("socialFeed");
  const config = await getResolvedGymConfig();
  const posts = [...demoPosts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase">{config.labels.feed}</h1>
      <p className="mt-2 text-(--gym-muted)">Share wins, PRs, and progress. Pump up your crew.</p>
      <div className="mt-8 space-y-4">
        {posts.map((post) => {
          const author = demoProfiles.find((p) => p.id === post.profile_id);
          return <FeedPost key={post.id} post={post} authorName={author?.display_name ?? "Member"} />;
        })}
      </div>
    </div>
  );
}
