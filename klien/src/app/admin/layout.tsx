import "../globals.css"; 
import Layout from "@/app/admin/components/Layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}