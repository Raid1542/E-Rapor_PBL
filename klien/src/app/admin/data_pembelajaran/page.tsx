import { Metadata } from 'next';
import DataPembelajaranClient from './components/data_pembelajaran_client';

export const metadata: Metadata = {
  title: 'Data Pembelajaran', 
};

export default function DataPembelajaranPage() {
  return <DataPembelajaranClient />;
}