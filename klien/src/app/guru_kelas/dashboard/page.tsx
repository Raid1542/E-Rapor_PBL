'use client';
import React, { useState } from 'react';
import { Menu, FileText, Home, BookOpen, ChevronDown, ChevronRight, User } from 'lucide-react';

const DashboardGuruKelas: React.FC = () => {
  const [isKelolaDataOpen, setIsKelolaDataOpen] = useState(true);
  const [isRaporOpen, setIsRaporOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header Utama */}
      <header className="bg-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4">
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaUjdEk8uRdpG57QkpEEt_CRQgPJPPRPNN882SdKR7G4yM-1n1fzUfGN8MH0DYpjkXark&usqp=CAU" 
            alt="Logo SD IT Ulil Albab" 
            className="h-8 w-auto" 
          />
          <h1 className="text-xl font-bold text-gray-800">E-Raport SDIT Ulil Albab</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Nama User</span>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-300 flex flex-col shadow-md transition-all duration-300">
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-4">
                {/* Dashboard */}
                <li className="flex items-center">
                  <Home className="w-5 h-5 text-gray-600 mr-3" />
                  <a href="#" className="text-gray-700 hover:text-[#F78319] transition-colors duration-200">Dashboard</a>
                </li>

                {/* Kelola Data */}
                <li>
                  <button
                    onClick={() => setIsKelolaDataOpen(!isKelolaDataOpen)}
                    className="flex items-center w-full text-left text-gray-700 hover:text-[#F78319] transition-colors duration-200"
                  >
                    <FileText className="w-5 h-5 text-gray-600 mr-3" />
                    Kelola Data
                    <ChevronDown className={`ml-auto h-5 w-5 text-gray-500 transition-transform duration-300 ${isKelolaDataOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isKelolaDataOpen && (
                    <ul className="pl-7 space-y-2 mt-2 text-gray-600 animate-fadeIn">
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <a href="#" className="hover:text-[#F78319] transition-colors duration-200">Data Siswa</a>
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <a href="#" className="hover:text-[#F78319] transition-colors duration-200">Absensi</a>
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <a href="#" className="hover:text-[#F78319] transition-colors duration-200">Catatan Walas</a>
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <a href="#" className="hover:text-[#F78319] transition-colors duration-200">Kokurikuler</a>
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <a href="#" className="hover:text-[#F78319] transition-colors duration-200">Input Nilai</a>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Rapor */}
                <li>
                  <button
                    onClick={() => setIsRaporOpen(!isRaporOpen)}
                    className="flex items-center w-full text-left text-gray-700 hover:text-[#F78319] transition-colors duration-200"
                  >
                    <BookOpen className="w-5 h-5 text-gray-600 mr-3" />
                    Rapor
                    <ChevronDown className={`ml-auto h-5 w-5 text-gray-500 transition-transform duration-300 ${isRaporOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isRaporOpen && (
                    <ul className="pl-7 space-y-2 mt-2 text-gray-600 animate-fadeIn">
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <a href="#" className="hover:text-[#F78319] transition-colors duration-200">Cetak Rapor</a>
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <a href="#" className="hover:text-[#F78319] transition-colors duration-200">Lihat Rapor</a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-6 bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
          {/* Banner Selamat Datang */}
          <div className="mb-6 rounded-xl bg-[#F78319] p-6 text-white shadow-md flex items-center space-x-4">
            <User className="w-8 h-8 text-white bg-orange-600 rounded-full p-1" />
            <div>
              <h2 className="text-2xl font-bold">Selamat Datang, Guru Kelas! 👋</h2>
              <p className="text-sm">Anda login sebagai Wali Kelas. Kelola sistem E-Rapor dengan mudah.</p>
            </div>
          </div>

          {/* Cards - 3 Fitur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Data Siswa */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h3 className="text-xl font-bold text-black mb-4">Data Siswa</h3>
              <a href="#" className="text-[#F78319] text-sm hover:underline flex items-center justify-center">
                Lihat detail <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            {/* Card Cetak Rapor */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h3 className="text-xl font-bold text-black mb-4">Cetak Rapor</h3>
              <a href="#" className="text-[#F78319] text-sm hover:underline flex items-center justify-center">
                Lihat detail <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            {/* Card Profil */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h3 className="text-xl font-bold text-black mb-4">Profil</h3>
              <a href="#" className="text-[#F78319] text-sm hover:underline flex items-center justify-center">
                Lihat detail <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </main>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardGuruKelas;