import { Metadata } from 'next';
import LoginClient from './components/login_client';

export const metadata: Metadata = {
    title: 'E-Rapor - Login',
};

export default function LoginPage() {
    return <LoginClient />;
}