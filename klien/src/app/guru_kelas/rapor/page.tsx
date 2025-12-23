import { Metadata } from 'next';
import RaporGuruKelasClient from './components/rapor_client';

export const metadata: Metadata = {
    title: 'Rapor',
};

export default function RaporGuruKelasPage() {
    return <RaporGuruKelasClient />;
}