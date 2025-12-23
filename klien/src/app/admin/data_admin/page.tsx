import { Metadata } from 'next';
import DataAdminClient from './components/data_admin_client';

export const metadata: Metadata = {
  title: 'Data Admin', 
};

export default function DataAdminPage() {
  return <DataAdminClient />;
}