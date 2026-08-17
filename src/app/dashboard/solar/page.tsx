import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SolarPage() {
  const tools = [
    {
      title: "Solar Position",
      description: "Calculate solar zenith, azimuth, elevation, and apparent angles for a given location and datetime.",
      href: "/dashboard/solar/position",
    },
    {
      title: "Solar Noon",
      description: "Calculate solar noon (transit) time and the offset from clock noon.",
      href: "/dashboard/solar/noon",
    },
    {
      title: "Sunrise & Sunset",
      description: "Calculate sunrise, sunset, and day length for a given location and date.",
      href: "/dashboard/solar/sunrise-sunset",
    },
    {
      title: "Sun Path",
      description: "Calculate sun path over a time range (batch version of solar position).",
      href: "/dashboard/solar/path",
    },
    {
      title: "Declination & EoT",
      description: "Get solar declination and equation of time for a given date or day-of-year.",
      href: "/dashboard/solar/declination-eot",
    },
    {
      title: "Surface Irradiance",
      description: "Calculate clear-sky direct, diffuse, and global irradiance on a horizontal or tilted surface.",
      href: "/dashboard/solar/irradiance",
    },
    {
      title: "Clear-Sky Model",
      description: "Calculate clear-sky irradiance with explicit model choice (Ineichen, Haurwitz, Simplified Solis).",
      href: "/dashboard/solar/clear-sky-model",
    },
    {
      title: "Incidence Angle",
      description: "Calculate the angle between the sun's direct beam and the normal to a tilted/oriented surface.",
      href: "/dashboard/solar/incidence-angle",
    },
    {
      title: "Shading Angle",
      description: "Calculate shading mask/cutoff angle from overhangs, fins, or adjacent obstructions.",
      href: "/dashboard/solar/shading-angle",
    },
    {
      title: "Window Heat Gain",
      description: "End-to-end solar heat gain through a window (POA irradiance + shading + SHGC).",
      href: "/dashboard/solar/heat-gain-window",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Solar Position & Irradiance Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Explore our suite of high-performance solar calculators powered by pvlib-python (NREL SPA algorithm).
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
