import { Metadata } from 'next';
import DashboardClient from './components/dashboard_client';

export const metadata: Metadata = {
  title: 'Dashboard', 
};

export default function AdminDashboardPage() {
  return <DashboardClient />;
}