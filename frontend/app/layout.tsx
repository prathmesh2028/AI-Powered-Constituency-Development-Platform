import type { Metadata } from "next";
import "@/styles/globals.css";
import { ClientLayout } from "@/components/shared/ClientLayout";

export const metadata: Metadata = {
  title: "CivicPrioritize - AI Constituency Development Platform",
  description:
    "An AI-powered municipal dashboard helping local representatives prioritize citizen development suggestions using Google Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-mesh min-h-screen bg-slate-950 text-slate-100 selection:bg-primary-500/30 selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

