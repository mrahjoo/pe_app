import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Cog, ShieldCheck, Leaf, Globe, Code } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        
        <div className="relative mx-auto max-w-5xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white">
            One Brain. Any Body.
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            ProExergy turns HVAC and climate engineering into an API-first intelligence layer — replacing fragmented, brand-biased tools with a single physics-based reasoning engine.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section className="px-6 py-16 md:py-24 bg-white dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
                The Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Founded on a simple frustration.</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                ProExergy Tech Solutions, S.L. realized that HVAC engineers spend disproportionate time on repetitive calculations using brand-biased selection tools. These tools stop working the moment a project moves from design to procurement, fabrication, commissioning, or troubleshooting.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                Design-phase software and operational monitoring platforms don't talk to each other, so knowledge gets rebuilt at every single lifecycle stage. We're here to change that.
              </p>
            </div>
            <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden border bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center p-8">
               {/* Decorative Element representing the story/fragmentation */}
               <div className="grid grid-cols-2 gap-4 w-full opacity-60">
                 <div className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-700/50 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                 <div className="h-24 rounded-lg bg-zinc-300 dark:bg-zinc-600/50 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                 <div className="h-24 rounded-lg bg-zinc-300 dark:bg-zinc-600/50 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                 <div className="h-24 rounded-lg bg-primary/20 animate-pulse" style={{ animationDelay: '450ms' }}></div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* The Mission - DPFICMTR */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Mission</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Build the mathematical and scientific intelligence once, then deploy it across every phase of an asset's life. Starting in HVAC/MEP, expanding to data-centre cooling, industrial refrigeration, and beyond.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Design", "Procurement", "Fabrication", "Installation",
              "Commissioning", "Maintenance", "Troubleshooting", "Retrofitting"
            ].map((phase, i) => (
              <Card key={phase} className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors group">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{phase}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What we've built so far */}
      <section className="px-6 py-16 md:py-24 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-zinc-950 to-zinc-950"></div>
        <div className="mx-auto max-w-5xl relative z-10 space-y-12">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">What we've built so far</h2>
            <p className="text-lg text-zinc-400">
              A growing family of stateless calculation APIs, all sharing one calling convention so any tool built on one API works like every other.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-100 hover:bg-zinc-800/80 transition-colors">
              <CardHeader>
                <BrainCircuit className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl text-zinc-100">Psychrometrics</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400">
                State and process analysis engine for precise moist-air thermodynamic calculations.
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-100 hover:bg-zinc-800/80 transition-colors">
              <CardHeader>
                <Cog className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl text-zinc-100">Thermodynamics</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400">
                NIST REFPROP-backed fluid and refrigerant properties for complex cycle modeling.
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900/50 border-zinc-800 text-zinc-100 hover:bg-zinc-800/80 transition-colors">
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl text-zinc-100">Thermal Comfort</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400">
                Human thermal-comfort modeling including PMV/PPD, UTCI, and SET standards.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Values & Recognition */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl grid md:grid-cols-12 gap-12">
          
          <div className="md:col-span-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Values</h2>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Technical Impact</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Driving innovation through applied AI and deep thermal-energy expertise.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Environmental Commitment</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Aligned with EU sustainability goals and energy-efficiency mandates to build a greener future.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Market Transformation</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">Democratizing advanced engineering tools that used to be locked inside large enterprise silos.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
             <Card className="h-full bg-zinc-50 dark:bg-zinc-900 border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-xl">Supported By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  ProExergy has been welcomed into leading startup programs, validating our AI-driven approach to engineering intelligence.
                </p>
                <div className="space-y-4">
                  <div className="h-12 border rounded-md flex items-center justify-center font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950">
                    Microsoft for Startups
                  </div>
                  <div className="h-12 border rounded-md flex items-center justify-center font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950">
                    AWS Startups
                  </div>
                  <div className="h-12 border rounded-md flex items-center justify-center font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-950">
                    Google for Startups
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>
    </div>
  );
}
