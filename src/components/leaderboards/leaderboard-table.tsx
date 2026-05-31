import { formatDate, formatWeight } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type LeaderboardRow = {
  rank: number;
  profileName: string;
  targetName: string;
  value: number;
  unit: string;
  bodyweight: number | null;
  division: string;
  date: string;
};

type LeaderboardTableProps = {
  rows: LeaderboardRow[];
};

export const LeaderboardTable = ({ rows }: LeaderboardTableProps) => {
  if (!rows.length) {
    return (
      <p className="rounded-xl border border-dashed border-(--gym-border) p-8 text-center text-(--gym-muted)">
        No records yet. Be the first to log a PR.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-(--gym-border)">
      <table className="w-full min-w-120 text-left text-sm">
        <thead className="bg-black/50 text-xs tracking-wide text-(--gym-muted) uppercase">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Athlete</th>
            <th className="px-4 py-3">Lift / Machine</th>
            <th className="px-4 py-3">PR</th>
            <th className="hidden px-4 py-3 sm:table-cell">Division</th>
            <th className="hidden px-4 py-3 md:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.rank}-${row.profileName}-${row.targetName}`}
              className="border-t border-(--gym-border) hover:bg-white/5"
            >
              <td className="px-4 py-4 font-bold text-(--gym-accent)">{row.rank}</td>
              <td className="px-4 py-4 font-semibold">{row.profileName}</td>
              <td className="px-4 py-4">{row.targetName}</td>
              <td className="px-4 py-4 text-lg font-bold">{formatWeight(row.value, row.unit)}</td>
              <td className="hidden px-4 py-4 sm:table-cell">
                <Badge>{row.division}</Badge>
              </td>
              <td className="hidden px-4 py-4 text-(--gym-muted) md:table-cell">{formatDate(row.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
