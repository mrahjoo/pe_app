import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard Overview" },
  { href: "/dashboard/thermodynamics", label: "Thermodynamics Home" },
  { href: "/dashboard/thermodynamics/fluid-info", label: "Fluid Database & Info" },
  { href: "/dashboard/thermodynamics/state-calculator", label: "State-Point Calculator" },
  { href: "/dashboard/thermodynamics/superheat-subcooling", label: "Superheat/Subcooling" },
  { href: "/dashboard/thermodynamics/glide", label: "Temperature Glide" },
];

export default function ThermodynamicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 mx-auto px-4 py-8">
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
        <div className="h-full py-6 pr-6 lg:py-8">
          <h4 className="mb-4 text-sm font-semibold tracking-tight">Thermodynamics (REFPROP)</h4>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={buttonVariants({ variant: "ghost", className: "justify-start w-full" })}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex w-full flex-col overflow-hidden py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
