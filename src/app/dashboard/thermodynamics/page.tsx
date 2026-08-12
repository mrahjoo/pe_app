import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ThermodynamicsPage() {
  const tools = [
    {
      title: "Fluid Database & Info",
      description: "Searchable database of pure fluids and mixtures with critical points, safety classes, GWP, and ODP.",
      href: "/dashboard/thermodynamics/fluid-info",
    },
    {
      title: "State-Point Calculator",
      description: "Calculate full thermodynamic state (density, enthalpy, entropy) from any two known properties.",
      href: "/dashboard/thermodynamics/state-calculator",
    },
    {
      title: "Superheat / Subcooling Calculator",
      description: "Determine the degrees of superheat or subcooling based on actual line temperature and pressure.",
      href: "/dashboard/thermodynamics/superheat-subcooling",
    },
    {
      title: "Temperature Glide Calculator",
      description: "Calculate the temperature glide (difference between dew and bubble point) for zeotropic refrigerant blends.",
      href: "/dashboard/thermodynamics/glide",
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thermodynamics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Explore fluid properties and refrigerant cycle tools powered by NIST REFPROP.
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
