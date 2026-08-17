import type { Metadata } from "next";
import { Host_Grotesk, Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import { Navbar } from "@/components/navbar";
import { GlobalBreadcrumbs } from "@/components/global-breadcrumbs";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ProExergy | The Physics Engine for HVAC Intelligence",
    template: "%s | ProExergy",
  },
  description:
    "Physics-based HVAC intelligence for smarter building performance. ProExergy helps HVAC professionals model, analyze, optimize, and improve system performance.",
  keywords: [
    "HVAC intelligence",
    "HVAC intelligence platform",
    "HVAC optimization",
    "HVAC analytics",
    "HVAC system optimization",
    "HVAC performance analytics",
    "building HVAC optimization",
    "HVAC energy optimization",
    "HVAC system modeling",
    "HVAC performance monitoring",
    "building systems intelligence",
    "HVAC engineering software",
    "ProExergy",
    "ProExergy HVAC",
    "ProExergy HVAC intelligence",
  ],
  openGraph: {
    title: {
      default: "ProExergy | The Physics Engine for HVAC Intelligence",
      template: "%s | ProExergy",
    },
    description:
      "Physics-based HVAC intelligence for smarter building performance. ProExergy helps HVAC professionals model, analyze, optimize, and improve system performance.",
    siteName: "ProExergy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProExergy | The Physics Engine for HVAC Intelligence",
    description:
      "Physics-based HVAC intelligence for smarter building performance. ProExergy helps HVAC professionals model, analyze, optimize, and improve system performance.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={{ theme: shadcn }}>
          <Navbar />
          <GlobalBreadcrumbs />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
