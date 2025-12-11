'use client';

import { useState } from 'react';
import { Home, Users, FileText, BookOpen, Award, Menu, ChevronRight, ChevronDown, UserCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
    user: {
        class?: string;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);
    const [openDropdowns, setOpenDropdowns] = useState({
        kelolaData: false,
        rapor: false
    });

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const toggleDropdown = (menu: string) => {
        if (!isExpanded) setIsExpanded(true);
        setOpenDropdowns(prev => ({
            kelolaData: menu === 'kelolaData' ? !prev.kelolaData : false,
            rapor: menu === 'rapor' ? !prev.rapor : false
        }));
    };

    const handleNavigation = (url: string) => router.push(url);

    const kelolaDataSubmenu = [
        { name: 'Data Siswa', url: '/guru_kelas/data-siswa' },
        { name: 'Absensi', url: '/guru_kelas/absensi' },
        { name: 'Catatan Wali Kelas', url: '/guru_kelas/catatan-wali' },
        { name: 'Ekstrakurikuler', url: '/guru_kelas/ekstrakurikuler' }
    ];

    const raporSubmenu = [
        { name: 'Lihat Rapor', url: '/guru_kelas/lihat-rapor' },
        { name: 'Cetak Rapor', url: '/guru_kelas/cetak-rapor' }
    ];

    const isKelolaDataActive = kelolaDataSubmenu.some(item => item.url === pathname);
    const isRaporActive = raporSubmenu.some(item => item.url === pathname);

    return (
        <div className={`flex flex-col h-screen bg-white shadow-lg transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-between p-4 border-b">
                {isExpanded ? (
                    <>
                        <div className="flex items-center gap-3">
                            <img src="/images/LogoUA.jpg" alt="Logo" className="w-10 h-10 object-contain" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">SDIT Ulil Albab</h2>
                                <p className="text-xs text-gray-500">E-Rapor</p>
                            </div>
                        </div>
                        <button onClick={toggleSidebar} className="p-2 hover:bg-orange-50 rounded-lg">
                            <Menu className="w-5 h-5 text-orange-500" />
                        </button>
                    </>
                ) : (
                    <button onClick={toggleSidebar} className="p-2 hover:bg-orange-50 rounded-lg mx-auto">
                        <Menu className="w-6 h-6 text-orange-500" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <button
                    onClick={() => handleNavigation('/guru_kelas/dashboard')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 ${pathname === '/guru_kelas/dashboard' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'}`}
                >
                    <Home className="w-5 h-5" />
                    {isExpanded && <span>Dashboard</span>}
                </button>

                {isExpanded && <h3 className="text-xs font-semibold text-gray-500 mb-3 mt-4 px-3">MENU UTAMA</h3>}

                <div className="mb-2">
                    <button
                        onClick={() => toggleDropdown('kelolaData')}
                        className={`w-full flex justify-between items-center p-3 rounded-lg ${isKelolaDataActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            {isExpanded && <span>Kelola Data</span>}
                        </div>
                        {isExpanded && (openDropdowns.kelolaData ? <ChevronDown /> : <ChevronRight />)}
                    </button>
                    {isExpanded && openDropdowns.kelolaData && (
                        <div className="ml-6 mt-1 space-y-1">
                            {kelolaDataSubmenu.map(item => (
                                <button
                                    key={item.url}
                                    onClick={() => handleNavigation(item.url)}
                                    className={`w-full text-left p-2 pl-4 rounded text-sm ${pathname === item.url ? 'bg-orange-400 text-white' : 'hover:bg-orange-50'}`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <button
                        onClick={() => toggleDropdown('rapor')}
                        className={`w-full flex justify-between items-center p-3 rounded-lg ${isRaporActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5" />
                            {isExpanded && <span>Rapor</span>}
                        </div>
                        {isExpanded && (openDropdowns.rapor ? <ChevronDown /> : <ChevronRight />)}
                    </button>
                    {isExpanded && openDropdowns.rapor && (
                        <div className="ml-6 mt-1 space-y-1">
                            {raporSubmenu.map(item => (
                                <button
                                    key={item.url}
                                    onClick={() => handleNavigation(item.url)}
                                    className={`w-full text-left p-2 pl-4 rounded text-sm ${pathname === item.url ? 'bg-orange-400 text-white' : 'hover:bg-orange-50'}`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t">
                {isExpanded && (
                    <p className="text-xs text-gray-500">© 2025 E-Rapor</p>
                )}
            </div>
        </div>
    );
}