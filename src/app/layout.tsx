import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/ThemeProvider";
import ForestBackground from "@/components/ForestBackground";
import Header from "@/components/Header";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";
import LerpScroll from "@/components/LerpScroll";
import Chatbot from "@/components/Chatbot/Chatbot";

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
          <LoadingScreen>
            <ForestBackground />
            <CustomCursor />
            <Header />
            <LerpScroll>
              {children}
            </LerpScroll>
            <Chatbot />
          </LoadingScreen>
        </Providers>
      </body>
    </html>
  );
}