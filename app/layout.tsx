import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AssistantChat from "@/components/AssistantChat";
import LogoutButton from "@/components/LogoutButton";
import AlertNavDot from "@/components/AlertNavDot";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Control Financer Projecte ZS",
  description: "Control de producció i inventari — Bumbba & Sunbba",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Control Financer Projecte ZS",
  },
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/finances", label: "Finances" },
  { href: "/inventari", label: "Inventari" },
  { href: "/marges", label: "Marges" },
  { href: "/productes", label: "Productes" },
  { href: "/alertes", label: "Alertes" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ca" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#d97706" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full">
        <header className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
            <Link href="/" className="font-bold text-lg tracking-tight">
              Control Financer <span className="text-[var(--bumbba)]">ZS</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 rounded-md hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {n.label}
                  {n.href === "/alertes" && <AlertNavDot />}
                </Link>
              ))}
            </nav>
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <AssistantChat />
      </body>
    </html>
  );
}
