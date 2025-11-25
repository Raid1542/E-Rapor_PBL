"use client";

import { useEffect, useState } from 'react';
import { ChevronRight, Users, UserCircle, Award, School, BookOpen } from 'lucide-react';
import { UserData } from '@/lib/types';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Cek apakah user sudah login
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (userData) {
      const parsedUser: UserData = JSON.parse(userData);
      
      if (parsedUser.role !== 'admin') {
        alert('Anda tidak memiliki akses ke halaman ini');
        window.location.href = '/login';
        return;
      }
      
      setUser(parsedUser);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <>
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Selamat Datang, {user.nama_lengkap || 'Admin'}! 👋
        </h2>
        <p className="text-orange-100">
          Anda login sebagai Administrator. Kelola sistem E-Rapor dengan mudah.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Data Guru */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Data Guru</p>
              <p className="text-3xl font-bold text-gray-900">32</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
            <span className="text-sm font-medium">Lihat detail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Data Siswa */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Data Siswa</p>
              <p className="text-3xl font-bold text-gray-900">245</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
            <span className="text-sm font-medium">Lihat detail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Data Admin */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Data Admin</p>
              <p className="text-3xl font-bold text-gray-900">5</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <UserCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
            <span className="text-sm font-medium">Lihat detail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Data Ekstrakurikuler */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Data Ekstrakurikuler</p>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
            <span className="text-sm font-medium">Lihat detail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Data Kelas */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Data Kelas</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <School className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
            <span className="text-sm font-medium">Lihat detail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Data Mata Pelajaran */}
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Data Mata Pelajaran</p>
              <p className="text-3xl font-bold text-gray-900">15</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition">
            <span className="text-sm font-medium">Lihat detail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}