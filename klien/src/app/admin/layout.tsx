import type { Metadata } from "next";
import "../globals.css";
import Layout from "@/app/admin/components/Layout"; // ⬅️ penting!

export const metadata: Metadata = {
  title: "E-Rapor SDIT Ulil Albab Batam",
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
