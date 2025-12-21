import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manager Pro",
  description: "Manage daily worker attendance, wages, and sites.",
  manifest: "/manifest.json",
  icons: {
    icon: "/hook.png",
    shortcut: "/hook.png",
    apple: "/hook.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/hook.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/hook.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/hook.png?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn("font-body antialiased bg-background text-foreground")}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
