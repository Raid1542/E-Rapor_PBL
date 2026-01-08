/**
 * Nama File: login_client.tsx
 * Fungsi: Komponen klien untuk halaman login E-Rapor.
 *         Menangani formulir login, validasi input, komunikasi API,
 *         dan navigasi berdasarkan role pengguna.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginClient() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email_sekolah: '',
        password: '',
        role: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State untuk data sekolah (nama dan logo)
    const [namaSekolah, setNamaSekolah] = useState('Sekolah');
    const [logoSekolah, setLogoSekolah] = useState<string | null>(null);
    const [logoError, setLogoError] = useState(false);

    // Ambil data publik sekolah saat komponen dimuat
    useEffect(() => {
        const fetchSekolah = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/sekolah/publik');
                if (res.ok) {
                    const data = await res.json();
                    setNamaSekolah(data.nama_sekolah || 'Sekolah');
                    if (data.logo_path) {
                        setLogoSekolah(`http://localhost:5000${data.logo_path}`);
                    }
                }
            } catch (err) {
                console.warn('Gagal memuat data sekolah publik');
            }
        };

        fetchSekolah();
    }, []);

    /**
     * Menangani submit formulir login.
     * Mengirim data ke API, menyimpan token dan data pengguna,
     * dan mengarahkan ke dashboard sesuai role.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { email_sekolah, password, role } = formData;

        if (!email_sekolah.trim() || !password || !role) {
            setError('Email, password, dan role wajib diisi');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email_sekolah: email_sekolah.trim(),
                    password,
                    role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login gagal');
                return;
            }

            // Simpan token dan data pengguna ke localStorage
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);

                // 🔑 Normalisasi data: nama_lengkap → name
                const normalizedUser = {
                    id: data.user.id,
                    name: data.user.nama_lengkap || '',
                    email: data.user.email_sekolah || '',
                    role: formData.role,
                    niy: data.user.niy || '',
                    nuptk: data.user.nuptk || '',
                    tempat_lahir: data.user.tempat_lahir || '',
                    tanggal_lahir: data.user.tanggal_lahir || '',
                    jenisKelamin: data.user.jenis_kelamin || '',
                    alamat: data.user.alamat || '',
                    no_telepon: data.user.no_telepon || '',
                    profileImage: data.user.profileImage || null,
                };

                localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
            }

            // Arahkan ke dashboard berdasarkan role
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else if (role === 'guru kelas') {
                router.push('/guru_kelas/dashboard');
            } else if (role === 'guru bidang studi') {
                router.push('/guru_bidang_studi/dashboard');
            }
        } catch (err) {
            console.error('💥 Error koneksi:', err);
            setError('Gagal terhubung ke server. Silakan coba lagi');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Menangani perubahan input form.
     * Memperbarui state formData sesuai input pengguna.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const trimmedValue = name === 'email_sekolah' ? value.trim() : value;
        setFormData((prev) => ({ ...prev, [name]: trimmedValue }));
    };

    return (
        <>
            <style>
                {`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        .bg-image {
          background-image: url('/images/bg-logo.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .glass-overlay {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}
            </style>

            <div className="min-h-screen relative bg-image">
                <div className="absolute inset-0 glass-overlay"></div>
                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-xl shadow-xl p-8">
                            {/* Logo Sekolah Dinamis */}
                            <div className="flex justify-center mb-6">
                                {logoSekolah && !logoError ? (
                                    <div className="transform hover:scale-105 transition-all duration-300">
                                        <img
                                            src={logoSekolah}
                                            alt={namaSekolah}
                                            className="w-32 h-32 object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-orange-700">
                                            {namaSekolah.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
                                    E-Rapor {namaSekolah}
                                </h1>
                            </div>

                            {/* Pesan Error */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form Login */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="flex items-center text-black text-sm font-medium mb-2.5">
                                        <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email_sekolah"
                                        value={formData.email_sekolah}
                                        onChange={handleChange}
                                        placeholder="Masukkan email Anda"
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-gray-800 bg-gray-50 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-black text-sm font-medium mb-2.5">
                                        <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Masukkan password Anda"
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-gray-800 bg-gray-50 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-black text-sm font-medium mb-2.5">
                                        <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-gray-800 bg-gray-50 cursor-pointer"
                                        required>
                                        <option value="">Pilih Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="guru kelas">Guru Kelas</option>
                                        <option value="guru bidang studi">Guru Bidang Studi</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 mt-8 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Loading...' : 'LOGIN'}
                                </button>
                            </form>

                            <div className="text-center mt-6">
                                <p className="text-xs text-black font-light drop-shadow">
                                    © 2025 {namaSekolah}. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}