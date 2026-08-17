import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const NavLinks = () => (
    <>
      <Link href="/dashboard" className="block px-2 py-2 text-lg md:text-sm font-medium hover:text-primary md:inline-flex md:h-10 md:w-max md:items-center md:justify-center md:rounded-md md:bg-background md:px-4 md:py-2 md:transition-colors md:hover:bg-accent md:hover:text-accent-foreground md:focus:bg-accent md:focus:text-accent-foreground md:focus:outline-none md:disabled:pointer-events-none md:disabled:opacity-50 md:data-[active]:bg-accent/50 md:data-[state=open]:bg-accent/50">
        Dashboard
      </Link>
      <Link href="/agent" className="block px-2 py-2 text-lg md:text-sm font-medium hover:text-primary md:inline-flex md:h-10 md:w-max md:items-center md:justify-center md:rounded-md md:bg-background md:px-4 md:py-2 md:transition-colors md:hover:bg-accent md:hover:text-accent-foreground md:focus:bg-accent md:focus:text-accent-foreground md:focus:outline-none md:disabled:pointer-events-none md:disabled:opacity-50 md:data-[active]:bg-accent/50 md:data-[state=open]:bg-accent/50">
        Agent
      </Link>
      <Link href="/about" className="block px-2 py-2 text-lg md:text-sm font-medium hover:text-primary md:inline-flex md:h-10 md:w-max md:items-center md:justify-center md:rounded-md md:bg-background md:px-4 md:py-2 md:transition-colors md:hover:bg-accent md:hover:text-accent-foreground md:focus:bg-accent md:focus:text-accent-foreground md:focus:outline-none md:disabled:pointer-events-none md:disabled:opacity-50 md:data-[active]:bg-accent/50 md:data-[state=open]:bg-accent/50">
        About
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center mr-2">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="mr-2" />}>
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-3">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="relative h-6 w-6">
              <Image
                src="/logo/web/proexergy-mark-gradient-64.webp"
                alt="ProExergy Logo"
                fill
                className="dark:hidden object-contain"
              />
              <Image
                src="/logo/web/proexergy-mark-gradient-64.webp"
                alt="ProExergy Logo"
                fill
                className="hidden dark:block object-contain"
              />
            </div>
            <span className="font-bold sm:inline-block">
              ProExergy
            </span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/dashboard" className={navigationMenuTriggerStyle()}>
                  Dashboard
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/agent" className={navigationMenuTriggerStyle()}>
                  Agent
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" className={navigationMenuTriggerStyle()}>
                  About
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-4">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </nav>
        </div>
      </div>
    </header>
  );
}
