import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardHome() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/psychrometrics" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="group-hover:text-primary transition-colors">Psychrometrics</CardTitle>
              <CardDescription>
                Access a suite of high-performance B2B calculators for HVAC processes, cooling loads, and state evaluations.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/thermodynamics" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="group-hover:text-primary transition-colors">Thermodynamics (REFPROP)</CardTitle>
              <CardDescription>
                Equation-of-state fluid properties, refrigerant cycle tools, and substance databases powered by NIST REFPROP.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/thermal-comfort" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="group-hover:text-primary transition-colors">Thermal Comfort</CardTitle>
              <CardDescription>
                Human physiological response models (PMV/PPD, UTCI, Heat Stress) for occupational safety and building performance.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/unit-converter" className="block group">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="group-hover:text-primary transition-colors">Unit Converter</CardTitle>
              <CardDescription>
                Quickly convert between engineering units across dozens of categories with full formula transparency.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
