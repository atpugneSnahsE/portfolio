import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Eshan Sengupta",
  description:
    "Machine Learning Engineer, Researcher, and AI Systems Developer",
  icons: {
    icon: "/header.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}