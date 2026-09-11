"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Overview" },
    { href: "/meter", label: "Live Meter" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--fg)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-contrast)] font-extrabold text-xs">
              FoX
            </span>
            <span className="font-semibold tracking-tight text-base">FoX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-[var(--surface-raised)] text-[var(--fg)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/signin">
            <Button variant="ghost" showArrow={false} className="text-xs px-3 py-1.5">
              Sign In
            </Button>
          </Link>
          <Link href="/signin">
            <Button variant="primary" className="text-xs">
              Start test
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
