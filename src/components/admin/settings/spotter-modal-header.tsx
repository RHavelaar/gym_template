import type { ReactNode } from "react";
import { SpotterMark } from "@/components/admin/settings/spotter-mark";

type SpotterModalHeaderProps = {
  title: string;
  titleId?: string;
  children?: ReactNode;
};

export const SpotterModalHeader = ({ title, titleId, children }: SpotterModalHeaderProps) => (
  <div className="flex items-start gap-3">
    <SpotterMark size={36} className="mt-0.5 ring-1 ring-(--gym-border)" />
    <div className="min-w-0 flex-1">
      <h2 id={titleId} className="text-lg font-bold text-white">
        {title}
      </h2>
      {children}
    </div>
  </div>
);
