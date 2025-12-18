"use client";

import { useEffect, useState } from 'react';
import { Users, User, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  nama_lengkap: string;
  email_sekolah: string;
  role: string;
}

// ✅ Perbarui: tambahkan semester sebagai field terpisah
interface KelasInfo {
  kelas: string;
  jumlah_siswa: number;
  tahun_ajaran: string;
  semester: string; // ✅ Ini kunci utamanya!
}

export default function GuruKelasDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [kelasInfo, setKelasInfo] = useState<KelasInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser: UserData = JSON.parse(userData);

      if (parsedUser.role !== 'guru kelas') {
        alert('Anda tidak memiliki akses ke halaman ini');
        router.push('/login');
        return;
      }

      setUser(parsedUser);

      const fetchKelasInfo = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/guru-kelas/kelas', {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              // ✅ Sekarang TypeScript tahu bahwa data[0] punya .semester
              setKelasInfo(data[0]);
            }
          }
        } catch (err) {
          console.error('Gagal memuat data kelas:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchKelasInfo();
    } catch (e) {
      console.error('Error parsing user ', e);
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user || !kelasInfo) {
    return (
      <div className="p-6 text-center text-gray-600">
        Anda belum ditugaskan sebagai guru kelas di tahun ajaran ini.
      </div>
    );
  }

  return (
    <>
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Selamat Datang, {user.nama_lengkap || 'Guru'}! 👋
        </h2>
        <p className="text-orange-100">
          Anda login sebagai <strong>Guru Kelas</strong>. Silakan kelola siswa Anda.
        </p>
      </div>

      {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
  {/* 1. Data Siswa */}
  <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between max-w-[320px] w-full md:w-auto">
    <div>
      <p className="text-sm text-gray-600 mb-1">Data Siswa</p>
      <p className="text-3xl font-bold text-gray-900">{kelasInfo.jumlah_siswa}</p>
    </div>
    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-lg">
      <Users className="w-6 h-6 text-orange-600" />
    </div>
  </div>

  {/* 2. Kelas Anda */}
  <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between max-w-[320px] w-full md:w-auto">
    <div>
      <p className="text-sm text-gray-600 mb-1">Kelas Anda</p>
      <p className="text-3xl font-bold text-gray-900">{kelasInfo.kelas}</p>
    </div>
    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-lg">
      <User className="w-6 h-6 text-orange-600" />
    </div>
  </div>

  {/* 3. Tahun Ajaran + Semester (Semester di Bawah) */}
  <div className="bg-white rounded-xl shadow p-6 flex items-start gap-4 max-w-[350px] w-full md:w-auto">
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-600 mb-1">Tahun Ajaran</p>
      <p className="text-3xl font-bold text-gray-900 truncate">
        {kelasInfo.tahun_ajaran}
      </p>
      <span className="mt-2 inline-block text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
        {kelasInfo.semester}
      </span>
    </div>
    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-lg">
      <Calendar className="w-6 h-6 text-orange-600" />
    </div>
  </div>
</div>
    </>
  );
}