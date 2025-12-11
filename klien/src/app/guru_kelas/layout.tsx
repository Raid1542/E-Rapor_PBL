import GuruKelasLayout from './components/Layout';

export default function GuruKelasRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GuruKelasLayout>{children}</GuruKelasLayout>;
}