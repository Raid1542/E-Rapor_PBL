import { Metadata } from 'next';
import AbsensiSiswaClient from './components/absensi_siswa_client';

export const metadata: Metadata = {
    title: 'Absensi Siswa',
};

export default function DataAbsensiPage() {
    return <AbsensiSiswaClient />;
}