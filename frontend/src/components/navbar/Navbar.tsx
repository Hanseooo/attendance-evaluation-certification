import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/events" },
    { name: "Feedback", href: "/feedback" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <a href="/home" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              <span className="font-thin text-sm">The</span> Podium
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex  md:space-x-2">
          <NavigationMenu>
            <NavigationMenuList className="space-x-1">
              {navItems.map((item) => (
                user?.role == "participant" && <NavigationMenuItem key={item.name}>
                  <a
                    href={item.href}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    {item.name}
                  </a>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          
          <Button onClick={logout} variant="ghost" className="ml-2 mt-0.5">
            Logout
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t md:hidden flex flex-col">
          <div className="container flex flex-col items-end space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <Button onClick={logout} variant="ghost" className="w-full justify-end px-3">
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}