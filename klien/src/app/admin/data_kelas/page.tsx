import { Metadata } from 'next';
import DataKelasClient from './components/data_kelas_client';

export const metadata: Metadata = {
  title: 'Data Kelas', 
};

export default function DataKelasPage() {
  return <DataKelasClient />;
}