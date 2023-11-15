import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import Providers from "@/components/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FootySage",
  description: "Football/Soccer History Chatbot",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <Providers>
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    </Providers>
    </ClerkProvider>
  );
}
