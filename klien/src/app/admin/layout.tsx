import type { Metadata } from "next";
import "../globals.css";
import Layout from "@/app/admin/components/Layout"; // ⬅️ penting!

export const metadata: Metadata = {
  title: "E-Rapor Admin",
  description: "Dashboard Admin E-Rapor",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}