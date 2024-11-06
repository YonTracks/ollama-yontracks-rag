import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import React from "react";

import Navbar from "@/components/shared/Navbar";
export const metadata: Metadata = {
  title: "ollama next prototyping / experimental",
  description:
    "ollama llama testing/prototyping project for a NextJS application that interacts with an Ollama API",
  authors: [{ name: "Clinton Renton", url: "https://github.com/YonTracks" }],
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class">
      <section>
        <nav className="pb-16">
          <Navbar />
        </nav>
        {children}
      </section>
    </ThemeProvider>
  );
}
