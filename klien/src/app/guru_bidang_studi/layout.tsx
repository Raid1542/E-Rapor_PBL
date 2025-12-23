import type { Metadata } from "next";
import GuruBidangStudiLayout from './components/Layout';

export const metadata: Metadata = {
    title: {
        template: "Guru Bidang Studi - %s",
        default: "Guru Bidang Studi",
    },
    description: "Input Nilai Siswa Berdasarkan mapel yang Diajarkan",
};


export default function GuruBidangStudiRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GuruBidangStudiLayout>{children}</GuruBidangStudiLayout>;
}