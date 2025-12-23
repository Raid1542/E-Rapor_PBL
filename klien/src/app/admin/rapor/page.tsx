import { Metadata } from 'next';
import RaporClient from './components/rapor_client';

export const metadata: Metadata = {
    title: 'Rapor',
};

export default function RaporPage() {
    return <RaporClient />;
}