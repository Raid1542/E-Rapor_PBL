import { Metadata } from 'next';
import AturPenilaianClient from './components/atur_penilaian_client';

export const metadata: Metadata = {
    title: 'Atur Penilaian',
};

export default function AturPenilaianPage() {
    return <AturPenilaianClient />;
}