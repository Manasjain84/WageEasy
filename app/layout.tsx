import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";

export const metadata: Metadata = {
  title: "WageEasy - Factory Attendance & Payroll",
  description:
    "Clean, fast, high-contrast factory worker attendance and payroll management application.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
