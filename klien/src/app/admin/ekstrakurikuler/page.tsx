import { Metadata } from 'next';
import DataEkstrakurikulerClient from './components/ekstrakurikuler_client';

export const metadata: Metadata = {
  title: 'Ekstrakurikuler', 
};

export default function DataEkstrakurikulerPage() {
  return <DataEkstrakurikulerClient />;
}