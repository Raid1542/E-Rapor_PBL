import { Metadata } from 'next';
import RekapanNilaiClient from './components/rekapan_nilai_client';

export const metadata: Metadata = {
    title: 'Rekapan Nilai',
};

export default function RekapanNilaiGuruKelasPage() {
    return <RekapanNilaiClient />;
}