'use client';

import { useState, useEffect } from 'react';
import { Home, Users, FileText, User, Menu, LogOut, UserCircle, ChevronDown, ChevronRight, ClipboardList, MessageSquare, Trophy, PenTool, Award, Eye, Printer } from 'lucide-react';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  class?: string;
}

export default function GuruDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    kelolaData: false,
    rapor: false
  });

  useEffect(() => {
    // Simulasi data user untuk demo
    const mockUser: UserData = {
      id: '1',
      name: 'Budi Santoso',
      email: 'budi.santoso@sditulilalbab.sch.id',
      role: 'guru',
      class: 'X-A'
    };
    
    setUser(mockUser);
    setLoading(false);

    // Kode untuk koneksi login (uncomment saat implementasi):
    /*
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (userData) {
      const parsedUser: UserData = JSON.parse(userData);
      
      if (parsedUser.role !== 'guru') {
        alert('Anda tidak memiliki akses ke halaman ini');
        window.location.href = '/login';
        return;
      }
      
      setUser(parsedUser);
    }
    
    setLoading(false);
    */
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Saat sidebar dibuka, buka dropdown yang aktif
      if (kelolaDataSubmenu.some(item => item.name === activeMenu)) {
        setOpenDropdowns(prev => ({ ...prev, kelolaData: true }));
      }
      if (raporSubmenu.some(item => item.name === activeMenu)) {
        setOpenDropdowns(prev => ({ ...prev, rapor: true }));
      }
    } else {
      // Saat sidebar ditutup, tutup semua dropdown
      setOpenDropdowns({ kelolaData: false, rapor: false });
    }
  };

  const toggleDropdown = (menu: string) => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setOpenDropdowns(prev => ({
      kelolaData: menu === 'kelolaData' ? !prev.kelolaData : false,
      rapor: menu === 'rapor' ? !prev.rapor : false
    }));
  };

  const handleNavigation = (menuName: string, url?: string) => {
    setActiveMenu(menuName);
    console.log(`Navigating to: ${menuName}`, url);
    // Implementasi routing sesuai kebutuhan
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
    setProfileOpen(false);
    console.log('Logout');
    // Redirect ke login
  };

  // Submenu definitions
  const kelolaDataSubmenu = [
    { name: 'Data Siswa', icon: Users, url: '/guru/data-siswa' },
    { name: 'Absensi', icon: ClipboardList, url: '/guru/absensi' },
    { name: 'Catatan Wali Kelas', icon: MessageSquare, url: '/guru/catatan-wali' },
    { name: 'Kokurikuler', icon: Trophy, url: '/guru/kokurikuler' },
    { name: 'Input Nilai', icon: PenTool, url: '/guru/input-nilai' },
    { name: 'Ekstrakurikuler', icon: Award, url: '/guru/ekstrakurikuler' }
  ];

  const raporSubmenu = [
    { name: 'Lihat Rapor', icon: Eye, url: '/guru/lihat-rapor' },
    { name: 'Cetak Rapor', icon: Printer, url: '/guru/cetak-rapor' }
  ];

  // Check if submenu items are active
  const isKelolaDataActive = kelolaDataSubmenu.some(item => activeMenu === item.name);
  const isRaporActive = raporSubmenu.some(item => activeMenu === item.name);

  // Auto-open dropdown when submenu is active
  useEffect(() => {
    if (isKelolaDataActive) {
      setOpenDropdowns(prev => ({ ...prev, kelolaData: true }));
    }
    if (isRaporActive) {
      setOpenDropdowns(prev => ({ ...prev, rapor: true }));
    }
  }, [isKelolaDataActive, isRaporActive]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`flex flex-col bg-white shadow-lg transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-center p-4 border-b">
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-orange-500" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Dashboard */}
          <button
            onClick={() => handleNavigation('Dashboard', '/guru/dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
              activeMenu === 'Dashboard' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
            title={!isExpanded ? 'Dashboard' : ''}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium">Dashboard</span>}
          </button>

          {isExpanded && (
            <h3 className="text-xs font-semibold text-gray-500 mb-3 px-3 mt-4">MENU UTAMA</h3>
          )}
          {!isExpanded && (
            <div className="border-t border-gray-300 my-4"></div>
          )}

          {/* Kelola Data dengan Submenu */}
          <div className="mb-2">
            <button
              onClick={() => toggleDropdown('kelolaData')}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                isKelolaDataActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
              }`}
              title={!isExpanded ? 'Kelola Data' : ''}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="font-medium">Kelola Data</span>}
              </div>
              {isExpanded && (
                openDropdowns.kelolaData ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isExpanded && openDropdowns.kelolaData && (
              <div className="ml-6 mt-1 space-y-1">
                {kelolaDataSubmenu.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigation(item.name, item.url)}
                      className={`w-full flex items-center gap-2 text-left p-2 pl-4 rounded-lg text-sm transition-colors ${
                        activeMenu === item.name 
                          ? 'bg-orange-400 text-white' 
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rapor dengan Submenu */}
          <div className="mb-2">
            <button
              onClick={() => toggleDropdown('rapor')}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                isRaporActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
              }`}
              title={!isExpanded ? 'Rapor' : ''}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span className="font-medium">Rapor</span>}
              </div>
              {isExpanded && (
                openDropdowns.rapor ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isExpanded && openDropdowns.rapor && (
              <div className="ml-6 mt-1 space-y-1">
                {raporSubmenu.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigation(item.name, item.url)}
                      className={`w-full flex items-center gap-2 text-left p-2 pl-4 rounded-lg text-sm transition-colors ${
                        activeMenu === item.name 
                          ? 'bg-orange-400 text-white' 
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isExpanded && (
            <h3 className="text-xs font-semibold text-gray-500 mb-3 px-3 mt-4">AKUN</h3>
          )}
          {!isExpanded && (
            <div className="border-t border-gray-300 my-4"></div>
          )}
          
          {/* Profil */}
          <button
            onClick={() => handleNavigation('Profil', '/guru/profil')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeMenu === 'Profil' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
            title={!isExpanded ? 'Profil' : ''}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium">Profil</span>}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-500">© 2025 E-Rapor</p>
                <p className="text-sm text-gray-500">SDIT Ulil Albab</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center"></div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src="/images/LogoUA.jpg"
                  alt="Logo SDIT Ulil Albab"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    E-Rapor SDIT Ulil Albab
                  </h1>
                  <p className="text-sm text-gray-500">
                    Dashboard Guru Kelas {user.class}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Guru Kelas {user.class}</p>
                  </div>
                  <UserCircle className="w-8 h-8 text-gray-600" />
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          GURU
                        </span>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Kelas {user.class}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          handleNavigation('Profil', '/guru/profil');
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profil Saya</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">
              Selamat Datang, {user.name}! 👋
            </h2>
            <p className="text-orange-100">
              Anda login sebagai Guru Kelas {user.class}. Kelola data siswa dan rapor dengan mudah.
            </p>
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card Kelola Data */}
            <div 
              onClick={() => toggleDropdown('kelolaData')}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kelola Data</p>
                  <p className="text-3xl font-bold text-gray-900">6</p>
                  <p className="text-xs text-gray-500 mt-1">Menu tersedia</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
                <span className="text-sm font-medium">Kelola data kelas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card Rapor */}
            <div 
              onClick={() => toggleDropdown('rapor')}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rapor</p>
                  <p className="text-3xl font-bold text-gray-900">32</p>
                  <p className="text-xs text-gray-500 mt-1">Rapor tersedia</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
                <span className="text-sm font-medium">Lihat & cetak rapor</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card Profil */}
            <div 
              onClick={() => handleNavigation('Profil', '/guru/profil')}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer transform hover:-translate-y-1 duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Profil</p>
                  <p className="text-lg font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <UserCircle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
                <span className="text-sm font-medium">Lihat & edit profil</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Kelas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm text-gray-600">Kelas</p>
                <p className="text-xl font-bold text-gray-900">{user.class}</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm text-gray-600">Jumlah Siswa</p>
                <p className="text-xl font-bold text-gray-900">32 Siswa</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm text-gray-600">Tahun Ajaran</p>
                <p className="text-xl font-bold text-gray-900">2024/2025</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}