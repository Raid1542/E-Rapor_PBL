import type { Metadata } from "next";
import "../globals.css";
import Layout from "@/components/Layout"; // ⬅️ penting!

export const metadata: Metadata = {
  title: "E-Rapor Admin",
  description: "Dashboard Admin E-Rapor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
 <Layout>{children}</Layout>
      </body>
    </html>
  );
}
