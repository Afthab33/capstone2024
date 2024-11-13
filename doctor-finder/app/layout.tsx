import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import Navbar from "./components/navbar";
import { AuthProvider } from "./authcontext";
import { Toaster } from "react-hot-toast"           // DU ADDED

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
    <html lang="en">
      <body className={`${GeistSans.className}`}>
        <AuthProvider>
          <Navbar />
          <Toaster position="top-center"></Toaster>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
