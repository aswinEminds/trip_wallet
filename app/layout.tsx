import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trip Wallet — Rain Raiders",
  description:
    "Plan it. Spend it. Track it. Settle it. A trip money tracker by Rain Raiders 🌧️⚡",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0f14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-[family-name:var(--font-display)] antialiased`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
