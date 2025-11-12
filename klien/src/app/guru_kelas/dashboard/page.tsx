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