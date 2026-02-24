import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

/**
 * Application metadata – shown in browser tabs and search results.
 */
export const metadata: Metadata = {
  title: "English Sentence Parser",
  description:
    "Parse English sentences into grammatical components: Subject, Verb, Object, Tense, Voice, and Phrases.",
};

/**
 * Root layout wraps every page with the HeroUI provider and global styles.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
