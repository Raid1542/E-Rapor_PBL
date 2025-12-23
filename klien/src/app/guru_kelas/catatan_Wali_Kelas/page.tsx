import { Metadata } from 'next';
import CatatanWaliKelasClient from './components/catatan_wali_kelas_client';

export const metadata: Metadata = {
    title: 'Catatan Wali Kelas',
};

export default function DataCatatanWaliKelasPage() {
    return <CatatanWaliKelasClient />;
}