import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const CelebrationHost = dynamic(() => import("@/components/celebration/CelebrationHost"));

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "The Communication Protocol",
  description: "30-Day Learning Challenge",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Preconnect to Supabase for faster image loading */}
        <link rel="preconnect" href="https://rqmxrmhgimjjuubahqka.supabase.co" />
        <link rel="dns-prefetch" href="https://rqmxrmhgimjjuubahqka.supabase.co" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;t==='dark'||(!t&&d)?document.documentElement.classList.add('dark'):document.documentElement.classList.remove('dark')}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <CelebrationHost />
      </body>
    </html>
  );
}
