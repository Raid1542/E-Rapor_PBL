import type { Metadata } from "next";
import GuruKelasLayout from './components/Layout';

export const metadata: Metadata = {
    title: {
        template: "Guru Kelas - %s",
        default: "Guru Kelas",
    },
    description: "Kelola Data Siswa Berdasarkan Kelas",
};

export default function GuruKelasRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GuruKelasLayout>{children}</GuruKelasLayout>;
}