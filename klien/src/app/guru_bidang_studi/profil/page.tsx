import { Metadata } from 'next';
import ProfilClient from './components/profil_client';

export const metadata: Metadata = {
    title: 'Profil',
};

export default function DataInputNilaiPage() {
    return <ProfilClient />;
}