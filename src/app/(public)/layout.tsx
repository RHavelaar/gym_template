import { GymShell } from "@/components/layout/gym-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <GymShell>{children}</GymShell>;
}
