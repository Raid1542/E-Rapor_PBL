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
  );
}