'use client';

import React from 'react';
import { Home, Users, FileText, BookOpen, Award, User, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function ResponsiveSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [activeMenu, setActiveMenu] = React.useState('Dashboard');
  const [openDropdowns, setOpenDropdowns] = React.useState({
    pengguna: true,
    administrasi: false,
    rapor: false
  });

  // State untuk menyimpan URL logo sekolah
  const [logoUrl, setLogoUrl] = React.useState<string>('/images/LogoUA.jpg');
  
  // Ambil logo sekolah dari backend saat halaman dibuka
  React.useEffect(() => {
    let mounted = true;

    const fetchLogo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/admin/sekolah', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;
        const { data } = await res.json();
        if (data?.logo_path && mounted) {
          // tambahkan timestamp untuk menghindari cache lama
          setLogoUrl(`http://localhost:5000${data.logo_path}?t=${Date.now()}`);
        }
      } catch (err) {
        console.warn('Gagal memuat logo — pakai logo default.', err);
      }
    };

    fetchLogo();

    // Handle logo update event dengan CustomEvent
    const handleLogoUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { logoPath, timestamp } = customEvent.detail || {};
      
      if (logoPath) {
        // Update logo dengan timestamp dari event
        setLogoUrl(`http://localhost:5000${logoPath}?t=${timestamp || Date.now()}`);
      } else {
        // Fallback: fetch ulang jika tidak ada detail
        fetchLogo();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') fetchLogo();
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener('logoUpdated', handleLogoUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setOpenDropdowns({
        pengguna: false,
        administrasi: false,
        rapor: false
      });
    }
  };

  const toggleDropdown = (menu: string) => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setOpenDropdowns(prev => ({
      pengguna: menu === 'pengguna' ? !prev.pengguna : false,
      administrasi: menu === 'administrasi' ? !prev.administrasi : false,
      rapor: menu === 'rapor' ? !prev.rapor : false
    }));
  };

  const handleNavigation = (menuName: string, url: string) => {
    setActiveMenu(menuName);
    router.push(url);
  };

  const penggunaSubmenu = [
    { name: 'Data Guru', url: '/admin/data_guru' },
    { name: 'Data Admin', url: '/admin/data_admin' }
  ];

  const administrasiSubmenu = [
    { name: 'Data Sekolah', url: '/admin/data_sekolah' },
    { name: 'Data Tahun Ajaran', url: '/admin/data_tahun_ajaran' },
    { name: 'Data Siswa', url: '/admin/data_siswa' },
    { name: 'Data Kelas', url: '/admin/data_kelas' },
    { name: 'Data Mata Pelajaran', url: '/admin/data_mata_pelajaran' },
    { name: 'Data Pembelajaran', url: '/admin/data_pembelajaran' }
  ];

  const raporSubmenu = [
    { name: 'Unduh Rapor', url: '/admin/unduh_rapor' }
  ];

  const isPenggunaActive = penggunaSubmenu.some(item => activeMenu === item.name);
  const isAdministrasiActive = administrasiSubmenu.some(item => activeMenu === item.name);
  const isRaporActive = raporSubmenu.some(item => activeMenu === item.name);

  React.useEffect(() => {
    if (isPenggunaActive) {
      setOpenDropdowns(prev => ({ ...prev, pengguna: true }));
    }
    if (isAdministrasiActive) {
      setOpenDropdowns(prev => ({ ...prev, administrasi: true }));
    }
    if (isRaporActive) {
      setOpenDropdowns(prev => ({ ...prev, rapor: true }));
    }
  }, [isPenggunaActive, isAdministrasiActive, isRaporActive]);

  return (
    <div
      className={`flex flex-col h-screen bg-white shadow-lg transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'
        }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {isExpanded ? (
          <>
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Logo SDIT Ulil Albab"
                className="w-10 h-10 object-contain"
                key={logoUrl} // Force re-render saat URL berubah
              />
              <div>
                <h2 className="text-sm font-bold text-gray-900">SDIT Ulil Albab</h2>
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

      <div className="flex-1 overflow-y-auto p-4">
        <button
          onClick={() => handleNavigation('Dashboard', '/admin/dashboard')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${activeMenu === 'Dashboard'
              ? 'bg-orange-500 text-white'
              : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
          title={!isExpanded ? 'Dashboard' : ''}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="font-medium">Dashboard</span>}
        </button>

        {isExpanded && (
          <h3 className="text-xs font-semibold text-gray-500 mb-3 px-3 mt-4">MASTER DATA</h3>
        )}
        {!isExpanded && (
          <div className="border-t border-gray-300 my-4"></div>
        )}

        <div className="mb-2">
          <button
            onClick={() => toggleDropdown('pengguna')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isPenggunaActive
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
              }`}
            title={!isExpanded ? 'Pengguna' : ''}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="font-medium">Pengguna</span>}
            </div>
            {isExpanded && (
              openDropdowns.pengguna ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && openDropdowns.pengguna && (
            <div className="ml-6 mt-1 space-y-1">
              {penggunaSubmenu.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigation(item.name, item.url)}
                  className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-colors ${activeMenu === item.name
                      ? 'bg-orange-400 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-2">
          <button
            onClick={() => toggleDropdown('administrasi')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isAdministrasiActive
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
              }`}
            title={!isExpanded ? 'Administrasi' : ''}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="font-medium">Administrasi</span>}
            </div>
            {isExpanded && (
              openDropdowns.administrasi ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && openDropdowns.administrasi && (
            <div className="ml-6 mt-1 space-y-1">
              {administrasiSubmenu.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigation(item.name, item.url)}
                  className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-colors ${activeMenu === item.name
                      ? 'bg-orange-400 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => handleNavigation('Ekstrakurikuler', '/admin/ekstrakurikuler')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${activeMenu === 'Ekstrakurikuler'
              ? 'bg-orange-500 text-white'
              : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
          title={!isExpanded ? 'Ekstrakurikuler' : ''}
        >
          <Award className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="font-medium">Ekstrakurikuler</span>}
        </button>

        <div className="mb-2">
          <button
            onClick={() => toggleDropdown('rapor')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isRaporActive
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
              }`}
            title={!isExpanded ? 'Rapor' : ''}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="font-medium">Rapor</span>}
            </div>
            {isExpanded && (
              openDropdowns.rapor ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && openDropdowns.rapor && (
            <div className="ml-6 mt-1 space-y-1">
              {raporSubmenu.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigation(item.name, item.url)}
                  className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-colors ${activeMenu === item.name
                      ? 'bg-orange-400 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <h3 className="text-xs font-semibold text-gray-500 mb-3 px-3 mt-4">SAYA</h3>
        )}
        {!isExpanded && (
          <div className="border-t border-gray-300 my-4"></div>
        )}

        <button
          onClick={() => handleNavigation('Profil', '/admin/profil')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeMenu === 'Profil'
              ? 'bg-orange-500 text-white'
              : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
          title={!isExpanded ? 'Profil' : ''}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="font-medium">Profil</span>}
        </button>
      </div>

      <div className="p-4 border-t">
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-500">© 2025 E-Rapor</p>
              <p className="text-sm text-gray-500">SDIT Ulil Albab</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
          </div>
        )}
      </div>
    </div>
  );
}