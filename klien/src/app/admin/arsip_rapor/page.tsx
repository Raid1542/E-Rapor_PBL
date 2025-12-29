import { Metadata } from 'next';
import ArsipRaporClient from './components/arsip_rapor_client';

export const metadata: Metadata = {
    title: 'Arsip Rapor',
};

export default function ArsipRaporPage() {
    return <ArsipRaporClient />;
}