import { GymShell } from "@/components/layout/gym-shell";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <GymShell>{children}</GymShell>;
}
