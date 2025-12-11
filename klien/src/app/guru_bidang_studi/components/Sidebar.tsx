'use client';

import { useState, useEffect } from 'react';
import {
    Home,
    Edit,
    Menu,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
    user: {
        id: number;
        nama_lengkap: string;
        email_sekolah: string;
        role: string;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);

    // ✅ State untuk logo dan nama sekolah
    const [logoUrl, setLogoUrl] = useState<string>('/images/LogoUA.jpg');
    const [schoolName, setSchoolName] = useState<string>('SDIT Ulil Albab');

    // ✅ Fetch data sekolah
    const fetchSchoolData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('http://localhost:5000/api/sekolah', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const { data } = await res.json();
                if (data) {
                    if (data.logo_path) {
                        setLogoUrl(`http://localhost:5000${data.logo_path}?t=${Date.now()}`);
                    }
                    if (data.nama_sekolah) {
                        setSchoolName(data.nama_sekolah);
                    }
                }
            }
        } catch (err) {
            console.warn('Gagal fetch data sekolah di sidebar guru bidang studi', err);
        }
    };

    // ✅ Setup event listener
    useEffect(() => {
        fetchSchoolData();

        const handleLogoUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            const logoPath = customEvent.detail?.logoPath;
            if (logoPath) {
                setLogoUrl(`http://localhost:5000${logoPath}?t=${Date.now()}`);
            } else {
                fetchSchoolData();
            }
        };

        const handleSchoolUpdate = () => {
            fetchSchoolData();
        };

        window.addEventListener('logoUpdated', handleLogoUpdate);
        window.addEventListener('schoolUpdated', handleSchoolUpdate);

        return () => {
            window.removeEventListener('logoUpdated', handleLogoUpdate);
            window.removeEventListener('schoolUpdated', handleSchoolUpdate);
        };
    }, []);

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const handleNavigation = (url: string) => router.push(url);

    // ✅ Hanya 2 menu: Dashboard + Input Nilai
    const mainMenu = [
        {
            name: 'Dashboard',
            url: '/guru_bidang_studi/dashboard',
            icon: Home,
        },
        {
            name: 'Input Nilai',
            url: '/guru_bidang_studi/input_nilai',
            icon: Edit,
        },
    ];

    // Active state
    const isActive = (url: string) => pathname === url;

    return (
        <div
            className={`flex flex-col h-screen bg-white shadow-lg transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'
                }`}
        >
            {/* Logo & Nama Sekolah */}
            <div className="flex items-center justify-between p-4 border-b">
                {isExpanded ? (
                    <>
                        <div className="flex items-center gap-3">
                            <img
                                src={logoUrl}
                                alt="Logo Sekolah"
                                className="w-10 h-10 object-contain"
                                onError={() => setLogoUrl('/images/LogoUA.jpg')}
                            />
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">{schoolName}</h2>
                                <p className="text-xs text-gray-500">E-Rapor</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5 text-orange-500" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors mx-auto"
                    >
                        <Menu className="w-6 h-6 text-orange-500" />
                    </button>
                )}
            </div>

            {/* Menu Utama — hanya 2 item */}
            <div className="flex-1 overflow-y-auto p-4">
                {mainMenu.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleNavigation(item.url)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${isActive(item.url)
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
                                }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {isExpanded && <span className="font-medium">{item.name}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
                {isExpanded && (
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">© 2025 E-Rapor</p>
                            <p className="text-sm text-gray-500">{schoolName}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}