import Link from "next/link";
import Image from "next/image";
import type { GymConfig } from "@/config/types";
import { brandToCssVars } from "@/config";

type AuthPageShellProps = {
  config: GymConfig;
  children: React.ReactNode;
};

export const AuthPageShell = ({ config, children }: AuthPageShellProps) => (
  <div className="flex min-h-screen flex-col bg-(--gym-bg) text-white lg:flex-row" style={brandToCssVars(config)}>
    <div className="relative flex flex-1 flex-col justify-between overflow-hidden px-6 py-10 lg:px-12 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${config.images.hero})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-black via-black/90 to-(--gym-primary)/20"
        aria-hidden
      />

      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gym-accent)"
          aria-label={`${config.name} home`}
        >
          <Image src={config.logoUrl} alt="" width={40} height={40} className="h-10 w-10" />
          <span className="text-2xl font-black tracking-tight uppercase">{config.name}</span>
        </Link>
      </div>

      <div className="relative z-10 mt-10 lg:mt-0">
        <p className="text-sm font-semibold tracking-widest text-(--gym-accent) uppercase">Member access</p>
        <h1 className="mt-3 max-w-md text-3xl leading-tight font-black uppercase lg:text-4xl">{config.tagline}</h1>
        <p className="mt-4 max-w-md text-(--gym-muted)">{config.description}</p>
      </div>

      <div className="relative z-10 mt-8 lg:mt-0">
        <Link href="/" className="text-sm text-(--gym-muted) underline-offset-4 hover:text-white hover:underline">
          Back to site
        </Link>
      </div>
    </div>

    <div className="flex flex-1 items-center justify-center px-4 py-10 lg:px-8 lg:py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  </div>
);
