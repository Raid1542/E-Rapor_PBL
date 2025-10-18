// app/dashboard/page.tsx
'use client';

import Sidebar from './Sidebar';
import DashboardCard from './DashboardCard';
import './dashboard.css';

export default function DashboardPage() {
  const handleDetailClick = (label: string) => {
    console.log(`Detail clicked for: ${label}`);
  };

  const dashboardData = [
    { number: 62, label: 'Data Guru' },
    { number: 700, label: 'Data Siswa' },
    { number: 2, label: 'Data Admin' },
    { number: 6, label: 'Data Kelas' },
    { number: 13, label: 'Data Mapel' },
    { number: 14, label: 'Data Ekstrakurikuler' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header dengan logo kecil */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo">
            <img 
              src="/LogoUA.jpg" 
              alt="Logo SD IT ULIL ALBAB" 
              className="logo-image"
              onError={(e) => {
                // Fallback jika logo tidak ada
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#FFA844"/>
                      <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">L</text>
                    </svg>
                  `;
                }
              }}
            />
          </div>
          <h1 className="header-title">E-Raport SD IT ULIL ALBAB</h1>
        </div>
        <div className="header-right">
          <span className="user-name">Liaa</span>
          <div className="user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <h1 className="section-title">Dashboard</h1>
          <div className="dashboard-grid">
            {dashboardData.map((item, index) => (
              <DashboardCard
                key={index}
                number={item.number}
                label={item.label}
                onDetailClick={() => handleDetailClick(item.label)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}