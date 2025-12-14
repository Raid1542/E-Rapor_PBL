import GuruBidangStudiLayout from './components/Layout';

export default function GuruBidangStudiRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GuruBidangStudiLayout>{children}</GuruBidangStudiLayout>;
}