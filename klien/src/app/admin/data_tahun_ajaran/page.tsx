import { Metadata } from 'next';
import DataTahunAjaranClient from './components/data_tahun_ajaran_client';

export const metadata: Metadata = {
  title: 'Data Tahun Ajaran', 
};

export default function DataTahunAjaranPage() {
  return <DataTahunAjaranClient />;
}