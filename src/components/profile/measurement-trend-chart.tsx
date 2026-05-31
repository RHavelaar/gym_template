import { cn } from "@/lib/utils";

type MeasurementTrendChartProps = {
  points: { date: string; value: number }[];
  goal?: number;
  className?: string;
  accentClassName?: string;
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 120;
const PAD = { top: 12, right: 8, bottom: 24, left: 8 };

export const MeasurementTrendChart = ({
  points,
  goal,
  className,
  accentClassName = "text-(--gym-primary)",
}: MeasurementTrendChartProps) => {
  if (points.length === 0) {
    return (
      <div
        className={cn(
          "flex h-30 items-center justify-center rounded-lg bg-black/20 text-xs text-(--gym-muted)",
          className,
        )}
      >
        Log more check-ins to see your trend
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const allValues = goal != null ? [...values, goal] : values;
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const innerW = CHART_WIDTH - PAD.left - PAD.right;
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const toX = (index: number) => PAD.left + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);

  const toY = (value: number) => PAD.top + innerH - ((value - min) / range) * innerH;

  const linePoints = points.map((p, i) => `${toX(i)},${toY(p.value)}`).join(" ");

  const goalY = goal != null ? toY(goal) : null;

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className={cn("h-30 w-full", className)}
      role="img"
      aria-label="Measurement trend chart"
    >
      {goalY != null && (
        <line
          x1={PAD.left}
          y1={goalY}
          x2={CHART_WIDTH - PAD.right}
          y2={goalY}
          className="stroke-(--gym-accent)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      )}

      {points.length > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          className={cn("stroke-current", accentClassName)}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {points.map((p, i) => (
        <circle
          key={p.date}
          cx={toX(i)}
          cy={toY(p.value)}
          r={points.length === 1 ? 5 : 4}
          className={cn("fill-current", accentClassName)}
        />
      ))}

      <text x={PAD.left} y={CHART_HEIGHT - 4} className="fill-(--gym-muted) text-[9px]">
        Start
      </text>
      <text x={CHART_WIDTH - PAD.right} y={CHART_HEIGHT - 4} textAnchor="end" className="fill-(--gym-muted) text-[9px]">
        Now
      </text>

      {goalY != null && (
        <text
          x={CHART_WIDTH - PAD.right}
          y={goalY - 4}
          textAnchor="end"
          className="fill-(--gym-accent) text-[9px] font-medium"
        >
          Goal
        </text>
      )}
    </svg>
  );
};
