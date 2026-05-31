import Image from "next/image";
import { cn } from "@/lib/utils";
import { SPOTTER } from "@/lib/spotter";

type SpotterMarkProps = {
  size?: number;
  className?: string;
};

export const SpotterMark = ({ size = 20, className }: SpotterMarkProps) => (
  <Image
    src={SPOTTER.iconSrc}
    alt={SPOTTER.iconAlt}
    width={size}
    height={size}
    className={cn("shrink-0 rounded-full", className)}
    aria-hidden
  />
);
