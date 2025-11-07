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
=======
"use client";

import { useEffect, useState } from 'react';
import { Users, FileText, BookOpen, ClipboardList, LogOut } from 'lucide-react';

export default function GuruKelasDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'guru_kelas') {
        alert('Anda tidak memiliki akses ke halaman ini');
        window.location.href = '/login';
        return;
      }
      
      setUser(parsedUser);
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/images/LogoUA.jpg"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Guru Kelas
                </h1>
                <p className="text-sm text-gray-500">E-Rapor SDIT Ulil Albab</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || user.email || 'Guru'}
                </p>
                <p className="text-xs text-gray-500">Guru Kelas</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Selamat Datang, {user.name || 'Guru'}! 👋
          </h2>
          <p className="text-green-100">
            Kelola kelas dan siswa Anda dengan mudah.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Siswa di Kelas</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mata Pelajaran</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rapor Selesai</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Data Siswa
                </h3>
                <p className="text-sm text-gray-600">
                  Lihat dan kelola data siswa di kelas Anda
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Input Nilai
                </h3>
                <p className="text-sm text-gray-600">
                  Input dan update nilai siswa
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Lihat Rapor
                </h3>
                <p className="text-sm text-gray-600">
                  Lihat dan cetak rapor siswa
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Absensi
                </h3>
                <p className="text-sm text-gray-600">
                  Kelola absensi siswa harian
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Kelas */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informasi Kelas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Kelas</p>
              <p className="text-lg font-semibold text-gray-900">5A</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tahun Ajaran</p>
              <p className="text-lg font-semibold text-gray-900">2024/2025</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Semester</p>
              <p className="text-lg font-semibold text-gray-900">Genap</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jumlah Siswa</p>
              <p className="text-lg font-semibold text-gray-900">28 Siswa</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}