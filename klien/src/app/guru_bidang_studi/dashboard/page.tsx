// app/guru_bidang_studi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Waves } from 'lucide-react';

export default function GuruBidangStudiDashboard() {
  const [user, setUser] = useState<any>(null);
  const [kelasYangDiajar, setKelasYangDiajar] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');
      
      if (!token || !storedUser) return;

      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        const res = await fetch('http://localhost:5000/api/guru-bidang-studi/kelas-yang-diajar', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const result = await res.json();
          setKelasYangDiajar(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard ', err);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Ambil semua mata pelajaran untuk header
  const allSubjects = kelasYangDiajar.map(k => k.nama_mapel).filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Selamat Datang */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2"> 
          Selamat datang, {user?.nama_lengkap || 'Guru'}! 👋
        </h1>
        <p className="mt-2 opacity-90 text-orange-100">
          Anda login sebagai Guru Bidang Studi. Silakan input nilai siswa.
        </p>
        <p className="mt-2 opacity-90 text-orange-100">
          Guru Pengampu: 
          {allSubjects.length > 0 ? (
            allSubjects.join(', ')
          ) : (
            'Belum ada mata pelajaran'
          )}
        </p>
      </div>

      {/* Daftar Kelas yang Diajar — STATIS */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Kelas yang Diajarkan</h2>

        {kelasYangDiajar.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kelasYangDiajar.map((kelas) => (
              <div
                key={kelas.pembelajaran_id} 
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{kelas.nama_kelas}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Fase {kelas.fase} • {kelas.nama_mapel}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {kelas.kurikulum}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
            Belum ada kelas yang diajar.
          </div>
        )}
      </div>
    </div>
  );
}