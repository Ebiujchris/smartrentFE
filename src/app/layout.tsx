import type { Metadata } from "next";
import "./globals.css";
import ApiProvider from "@/components/providers/ApiProvider";

export const metadata: Metadata = {
  title: "SmartRentUG - Property Management Made Simple",
  description: "Manage rentals, tenants, and payments with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ApiProvider>
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}
