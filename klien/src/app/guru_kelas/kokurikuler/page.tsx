import { Metadata } from 'next';
import KokurikulerClient from './components/kokurikuler_client';

export const metadata: Metadata = {
    title: 'Kokurikuler',
};

export default function DataKokurikulerPage() {
    return <KokurikulerClient />;
}