import { Metadata } from 'next';
import DataInputNilaiClient from './components/input_nilai';

export const metadata: Metadata = {
    title: 'Input Nilai',
};

export default function DataInputNilaiPage() {
    return <DataInputNilaiClient />;
}