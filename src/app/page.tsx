import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Activity, Cpu, CloudLightning } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center relative overflow-hidden bg-background">
      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,var(--pe-navy-light)_0%,transparent_50%)] opacity-20 blur-3xl mix-blend-screen pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="z-10 flex flex-1 w-full max-w-4xl flex-col items-center justify-center py-24 px-6 text-center">
        
        {/* Subtle top badge */}
        <div className="mb-8 inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-pe-orange mr-2 animate-pulse" />
          ProExergy Platform
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          The Physics Engine for{" "}
          <span className="text-transparent bg-clip-text bg-[image:var(--pe-gradient)]">
            HVAC Intelligence
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Physics-based HVAC intelligence for smarter building performance. ProExergy helps HVAC professionals model, analyze, optimize, and improve system performance.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className={buttonVariants({ size: "lg", className: "h-14 px-8 text-base bg-pe-navy hover:bg-pe-navy-light text-white border-0" })}>
            Launch Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          
          <a href="https://proexergy.com" target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg", className: "h-14 px-8 text-base bg-background/50 backdrop-blur-md border-border hover:bg-muted" })}>
            Visit ProExergy.com
            <ExternalLink className="ml-2 h-5 w-5 text-muted-foreground" />
          </a>
        </div>

        {/* Feature Icons */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-border/50 w-full max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pe-navy/10 text-pe-navy dark:bg-pe-navy/20 dark:text-pe-navy-light mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Thermodynamics</h3>
            <p className="text-sm text-muted-foreground mt-2">Precise refrigerant & fluid properties.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pe-orange/10 text-pe-orange dark:bg-pe-orange/20 dark:text-pe-orange-light mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Psychrometrics</h3>
            <p className="text-sm text-muted-foreground mt-2">State-point air property analysis.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary mb-4">
              <CloudLightning className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">API-First</h3>
            <p className="text-sm text-muted-foreground mt-2">Built for integration at any scale.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
