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
        {/* Add more dashboard sections here in the future */}
      </div>
    </div>
  );
}
