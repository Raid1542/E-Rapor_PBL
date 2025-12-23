import { Metadata } from 'next';
import DataMapelClient from './components/data_mata_pelajaran_client';

export const metadata: Metadata = {
  title: 'Data Mata Pelajaran', 
};

export default function DataMataPelajaranPage() {
  return <DataMapelClient />;
}