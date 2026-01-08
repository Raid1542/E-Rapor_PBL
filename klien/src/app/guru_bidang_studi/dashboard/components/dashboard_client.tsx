/**
 * Nama File: dashboard_client.tsx
 * Fungsi: Komponen klien untuk menampilkan dashboard guru bidang studi,
 *         mencakup data profil, tahun ajaran aktif, dan ringkasan mata pelajaran yang diampu.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 dan Syahrul Ramadhan - NIM: 3312301093
 * Tanggal: 15 September 2025
 */

"use client";

import { useEffect, useState } from 'react';
import { Book, Calendar, School, Users } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

interface UserData {
    id: string;
    nama_lengkap: string;
    email_sekolah: string;
    role: string;
}

interface MapelItem {
    nama: string;
    total_kelas: number;
    total_siswa: number;
}

interface DashboardData {
    tahun_ajaran: string;
    semester: string;
    mata_pelajaran_list: MapelItem[];
}

export default function DashboardClient() {
    const [user, setUser] = useState<UserData | null>(null);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Ambil data user hanya untuk tampilan (proteksi login sudah di Layout.tsx)
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                const parsedUser: UserData = JSON.parse(userData);
                setUser(parsedUser);
            } catch (e) {
                console.warn('Invalid user data in localStorage');
            }
        }

        const fetchDashboard = async () => {
            try {
                const res = await apiFetch('http://localhost:5000/api/guru-bidang-studi/dashboard');
                const result = await res.json();
                if (res.ok && result.success && result.data) {
                    setDashboard(result.data);
                } else {
                    console.error('Respons API tidak valid:', result);
                }
            } catch (err) {
                console.error('Error memuat dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

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

    if (!user || !dashboard || dashboard.mata_pelajaran_list.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="bg-orange-50 text-orange-700 px-4 py-3 rounded-lg inline-block">
                    Anda belum ditugaskan mengajar mata pelajaran apapun di tahun ajaran ini.
                </div>
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
                    Anda login sebagai <strong>Guru Bidang Studi</strong>. Silakan input nilai siswa berdasarkan mata pelajaran yang diampu.
                </p>
            </div>

            {/* Flexbox for better control */}
            <div className="flex flex-wrap gap-6">
                {/* Card: Tahun Ajaran */}
                <div className="bg-white rounded-xl shadow p-6 flex items-start space-x-4 w-full md:w-[30%] min-w-[280px]">
                    <div className="bg-orange-100 p-3 rounded-lg">
                        <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tahun Ajaran</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-gray-900">{dashboard.tahun_ajaran}</span>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                {dashboard.semester}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cards Per Mata Pelajaran */}
                {dashboard.mata_pelajaran_list.map((mapel, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow hover:shadow-md transition-all duration-200 p-6 w-full md:w-[30%] min-w-[280px]"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <Book className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-1">{mapel.nama}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{mapel.total_siswa}</h3>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                        {mapel.total_kelas} Kelas
                                    </span>
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                        {mapel.total_siswa} Siswa
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}