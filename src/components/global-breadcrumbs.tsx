"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function GlobalBreadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter((segment) => segment !== "");
  
  return (
    <div className="border-b bg-muted/40">
      <div className="container px-4 py-3 md:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              
              // Format segment text (e.g. "unit-converter" -> "Unit Converter")
              const title = segment
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase());

              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <Link href={href} className="transition-colors hover:text-foreground">
                        {title}
                      </Link>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
