import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function PsychrometricsPage() {
  const tools = [
    {
      title: "Single-Point State Calculator",
      description: "Calculate full psychrometric state from dry bulb and one other known property.",
      href: "/dashboard/psychrometrics/state-calculator",
    },
    {
      title: "Vapor Pressure Deficit (VPD)",
      description: "Specialized calculator for VPD, highly useful for agriculture and grow-room HVAC.",
      href: "/dashboard/psychrometrics/vpd",
    },
    {
      title: "Psychrometric Process Classifier",
      description: "Compare two states to classify the HVAC process, find SHR, and direction.",
      href: "/dashboard/psychrometrics/process",
    },
    {
      title: "Cooling Coil Load & Dew Point",
      description: "Determine total, sensible, and latent loads across a cooling coil.",
      href: "/dashboard/psychrometrics/cooling-coil",
    },
    {
      title: "Economizer Decision Tool",
      description: "Evaluate outdoor air against return air to assess free-cooling potential.",
      href: "/dashboard/psychrometrics/economizer",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Psychrometrics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Explore our suite of high-performance psychrometric calculators powered by PsychroLib v3.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="block group">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
