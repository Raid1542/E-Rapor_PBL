import { Metadata } from 'next';
import GuruKelasDashboardClient from './components/dashboard_client';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default function GuruKelasDashboard() {
    return <GuruKelasDashboardClient />;
}