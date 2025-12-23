import { Metadata } from 'next';
import InputNilaiClient from './components/input_nilai_client';

export const metadata: Metadata = {
    title: 'Input Nilai',
};

export default function DataInputNilaiPage() {
    return <InputNilaiClient />;
}