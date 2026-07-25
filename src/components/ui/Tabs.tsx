"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface TabItem {
  label: string;
  href: string;
}

export function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-border overflow-x-auto">
      <nav className="flex gap-1 min-w-max px-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {item.label}
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
