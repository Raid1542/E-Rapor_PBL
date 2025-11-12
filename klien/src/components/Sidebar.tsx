<<<<<<< HEAD
'use client';

import React from 'react';
import { Home, Users, FileText, BookOpen, Award, User, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function ResponsiveSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [activeMenu, setActiveMenu] = React.useState('Data Admin');
  const [openDropdowns, setOpenDropdowns] = React.useState({
    pengguna: true,
    administrasi: false,
    rapor: false
  });

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

  const toggleDropdown = (menu) => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setOpenDropdowns(prev => ({
      pengguna: menu === 'pengguna' ? !prev.pengguna : false,
      administrasi: menu === 'administrasi' ? !prev.administrasi : false,
      rapor: menu === 'rapor' ? !prev.rapor : false
    }));
  };

  const handleNavigation = (menuName, url) => {
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
    { name: 'Data Pembelajaran', url: '/admin/data_pembelajaran' },
    { name: 'Data Ekstrakurikuler', url: '/admin/data_ekstrakurikuler' }
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
      className={`flex flex-col h-screen bg-white shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-center p-4 border-b">
        <button 
          onClick={toggleSidebar} 
          className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-orange-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <button
          onClick={() => handleNavigation('Dashboard', '/admin/dashboard')}
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
          <h3 className="text-xs font-semibold text-gray-500 mb-3 px-3 mt-4">MASTER DATA</h3>
        )}
        {!isExpanded && (
          <div className="border-t border-gray-300 my-4"></div>
        )}

        <div className="mb-2">
          <button
            onClick={() => toggleDropdown('pengguna')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isPenggunaActive
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
                  className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-colors ${
                    activeMenu === item.name 
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
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isAdministrasiActive
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
                  className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-colors ${
                    activeMenu === item.name 
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
          className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
            activeMenu === 'Ekstrakurikuler' 
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
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isRaporActive
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
                  className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-colors ${
                    activeMenu === item.name 
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
=======
import { Menu, Users, FileText, Home, BookOpen, Award, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SubMenuItem {
  id: string;
  label: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  hasDropdown?: boolean;
  submenu?: SubMenuItem[];
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeMenu, setActiveMenu }: SidebarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { 
      id: 'pengguna', 
      label: 'Pengguna', 
      icon: Users,
      hasDropdown: true,
      submenu: [
        { id: 'pengguna-guru', label: 'Data Guru' },
        { id: 'pengguna-siswa', label: 'Data Siswa' },
        { id: 'pengguna-admin', label: 'Data Admin' },
      ]
    },
    { 
      id: 'administrasi', 
      label: 'Administrasi', 
      icon: FileText,
      hasDropdown: true,
      submenu: [
        { id: 'administrasi-kelas', label: 'Data Kelas' },
        { id: 'administrasi-ekstrakurikuler', label: 'Data Ekstrakurikuler' },
      ]
    },
    { id: 'ekstrakurikuler', label: 'Ekstrakurikuler', icon: Award },
    { id: 'rapor', label: 'Rapor', icon: BookOpen },
  ];

  const toggleDropdown = (itemId: string) => {
    if (openDropdown === itemId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(itemId);
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.hasDropdown) {
      if (sidebarOpen) {
        toggleDropdown(item.id);
      } else {
        setSidebarOpen(true);
        setOpenDropdown(item.id);
      }
    } else {
      setActiveMenu(item.id);
    }
  };

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white text-black transition-all duration-300 flex flex-col font-sans`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white">
        <div className="flex justify-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-orange-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id || (item.submenu && item.submenu.some(sub => sub.id === activeMenu));
          const isDropdownOpen = openDropdown === item.id;
          
          return (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-black hover:bg-orange-100'
                } ${!sidebarOpen && 'justify-center'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.hasDropdown && (
                      isDropdownOpen ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {item.hasDropdown && isDropdownOpen && sidebarOpen && item.submenu && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveMenu(subItem.id)}
                      className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition ${
                        activeMenu === subItem.id
                          ? 'bg-orange-400 text-white'
                          : 'text-black hover:bg-orange-100'
                      }`}
                    >
                      <span className="ml-6">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {sidebarOpen && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">© 2025 E-Rapor</p>
          <p className="text-xs text-gray-400 text-center">SDIT Ulil Albab</p>
        </div>
      )}
    </aside>
>>>>>>> fb1ee09d5a28d4ca90c4cc80cf94f9984218d4ef
  );
}