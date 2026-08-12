import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ThermalComfortPage() {
  const tools = [
    {
      title: "ASHRAE 55 PMV/PPD Checker",
      description: "Evaluate indoor occupant comfort using Predicted Mean Vote (PMV) and Predicted Percentage of Dissatisfied (PPD).",
      href: "/dashboard/thermal-comfort/pmv-ppd",
    },
    {
      title: "Standard Effective Temperature (SET)",
      description: "Calculate the equivalent temperature combining air, radiant, humidity, and air speed effects.",
      href: "/dashboard/thermal-comfort/set",
    },
    {
      title: "Outdoor UTCI Calculator",
      description: "Calculate the Universal Thermal Climate Index (UTCI) to assess outdoor heat stress risk.",
      href: "/dashboard/thermal-comfort/utci",
    },
    {
      title: "NIOSH Work Capacity",
      description: "Calculate US occupational safety heat-stress limits and recommended work capacity.",
      href: "/dashboard/thermal-comfort/niosh",
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thermal Comfort Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Human physiological response models (PMV/PPD, UTCI, Heat Stress) powered by pe_comfort.
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
