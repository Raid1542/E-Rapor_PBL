// app/dashboard/Sidebar.tsx
'use client';

import { useState } from 'react';

// Define SubMenuItem first
interface SubMenuItem {
  id: string;
  label: string;
}

// Then use it in MenuItem
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
}

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      id: 'pengguna',
      label: 'Pengguna',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      hasSubmenu: true,
      submenu: [
        { id: 'data-guru', label: 'Data Guru' },
        { id: 'data-siswa', label: 'Data Siswa' },
        { id: 'data-admin', label: 'Data Admin' },
      ],
    },
    {
      id: 'administrasi',
      label: 'Administrasi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      hasSubmenu: true,
    },
    {
      id: 'ekstrakurikuler',
      label: 'Ekstrakurikuler',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ),
      hasSubmenu: true,
    },
    {
      id: 'rapor',
      label: 'Rapor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      hasSubmenu: true,
    },
  ];

  const handleMenuClick = (menuId: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      if (openSubmenu === menuId) {
        setOpenSubmenu(null);
      } else {
        setOpenSubmenu(menuId);
      }
    } else {
      setActiveMenu(menuId);
      setOpenSubmenu(null);
    }
  };

  const handleSubmenuClick = (submenuId: string) => {
    setActiveMenu(submenuId);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Admin</h2>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.id} className="sidebar-item">
            <a
              className={`sidebar-link ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id, item.hasSubmenu || false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
              {item.hasSubmenu && (
                <span className={`sidebar-arrow ${openSubmenu === item.id ? 'rotate' : ''}`}>
                  ›
                </span>
              )}
            </a>
            
            {item.hasSubmenu && item.submenu && openSubmenu === item.id && (
              <ul className="sidebar-submenu">
                {item.submenu.map((subItem) => (
                  <li key={subItem.id} className="sidebar-submenu-item">
                    <a
                      className={`sidebar-submenu-link ${activeMenu === subItem.id ? 'active' : ''}`}
                      onClick={() => handleSubmenuClick(subItem.id)}
                    >
                      {subItem.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}