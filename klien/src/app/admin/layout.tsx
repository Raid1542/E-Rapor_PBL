import type { Metadata } from "next";
import "../globals.css"; 
import Layout from "@/app/admin/components/Layout";

export const metadata: Metadata = {
  title: {
    template: "Admin - %s", 
    default: "Admin",       
  },
  description: "Panel administrasi sistem E-Rapor sekolah",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}