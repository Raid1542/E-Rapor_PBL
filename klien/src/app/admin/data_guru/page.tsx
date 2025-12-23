import { Metadata } from 'next';
import DataGuruClient from './components/data_guru_client';

export const metadata: Metadata = {
  title: 'Data Guru', 
};

export default function DataGuruPage() {
  return <DataGuruClient />;
}