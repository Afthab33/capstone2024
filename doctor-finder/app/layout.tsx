import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import Navbar from "./components/navbar";
import { AuthProvider } from "./authcontext";
import { Toaster as HotToaster } from "react-hot-toast"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes";            // Dark/Light Mode

export const metadata: Metadata = {
  title: "Doctor Finder",
  description: "Find a doctor near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <HotToaster position="top-center" />
            <ShadcnToaster />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
