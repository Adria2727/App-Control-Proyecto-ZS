import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AssistantChat from "@/components/AssistantChat";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Control Zero Stock",
  description: "Control de producció i inventari — Bumbba & Sunbba",
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/inventari", label: "Inventari" },
  { href: "/productes", label: "Productes" },
  { href: "/alertes", label: "Alertes" },
  { href: "/marges", label: "Marges" },
  { href: "/finances", label: "Finances" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ca" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <header className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
            <Link href="/" className="font-bold text-lg tracking-tight">
              Zero<span className="text-[var(--bumbba)]">Stock</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 rounded-md hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <AssistantChat />
      </body>
    </html>
  );
}
