import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noriuchi Log | ノリ打ち記録帳",
  description: "仲間と打ったパチ・スロのノリ打ち収支を美しく記録するダッシュボード",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute right-[-10%] top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[380px] w-[380px] rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
        </div>
        <div className="min-h-screen bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/90">
          {children}
        </div>
      </body>
    </html>
  );
}
