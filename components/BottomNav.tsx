"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CreditCard, FolderOpen, Settings } from "lucide-react";

const navItems = [
  { href: "/trip", icon: Home, label: "Home" },
  { href: "/trip/people", icon: Users, label: "People" },
  { href: "/trip/expenses", icon: CreditCard, label: "Spend" },
  { href: "/trip/categories", icon: FolderOpen, label: "Budget" },
  { href: "/trip/admin", icon: Settings, label: "Admin" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-[4px] border-border-brutal shadow-[0px_-4px_0px_rgba(0,0,0,1)] pb-safe">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/trip" && pathname.startsWith(item.href));
          
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 min-w-[56px] border-2 border-transparent ${
                isActive
                  ? "bg-neon-lime border-black shadow-[2px_2px_0px_black] scale-110 -translate-y-1"
                  : "hover:bg-gray-100"
              }`}
            >
              <IconComponent 
                size={24} 
                strokeWidth={isActive ? 3 : 2} 
                className={isActive ? "animate-pop text-black" : "text-black"} 
              />
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                isActive ? "text-black" : "text-text-dim"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
