import { Metadata } from 'next';
import DataSekolahClient from './components/data_sekolah_client';

export const metadata: Metadata = {
  title: 'Data Sekolah', 
};

export default function DataSekolahPage() {
  return <DataSekolahClient />;
}