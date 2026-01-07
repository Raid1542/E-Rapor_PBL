/**
 * Nama File: data_sekolah_client.tsx
 * Fungsi: Komponen client-side untuk mengelola data profil sekolah oleh admin.
 *         Memungkinkan pengeditan informasi dasar sekolah (nama, NPSN, alamat, dsb.)
 *         dan pengunggahan logo sekolah. Data disimpan ke backend melalui API PUT,
 *         sedangkan logo diupload via FormData ke endpoint khusus.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

'use client';

import { useState, useEffect } from 'react';

export default function DataSekolahPage() {

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        namaSekolah: '',
        npsn: '',
        nss: '',
        kodePos: '',
        telepon: '',
        alamat: '',
        email: '',
        website: '',
        kepalaSekolah: '',
        niyKepalaSekolah: '',
        confirmData: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);

    useEffect(() => {
        fetchSekolahData();
    }, []);

    const fetchSekolahData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Silakan login terlebih dahulu');
                return;
            }

            const res = await fetch('http://localhost:5000/api/admin/sekolah', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const response = await res.json();
                const s = response.data || response.sekolah || {};

                setFormData({
                    namaSekolah: s.nama_sekolah || '',
                    npsn: s.npsn || '',
                    nss: s.nss || '',
                    kodePos: s.kode_pos || '',
                    telepon: s.telepon || '',
                    alamat: s.alamat || '',
                    email: s.email || '',
                    website: s.website || '',
                    kepalaSekolah: s.kepala_sekolah || '',
                    niyKepalaSekolah: s.niy_kepala_sekolah || '',
                    confirmData: false
                });

                if (s.logo_path) {
                    const logoUrl = `http://localhost:5000${s.logo_path}`;
                    setLogoPreview(logoUrl);
                } else {
                    setLogoPreview(null);
                }
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal memuat data sekolah');
            }
        } catch (err) {
            console.error('❌ Error fetch sekolah:', err);
            alert('Gagal menghubungi server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Hanya file .jpg, .jpeg, atau .png yang diizinkan');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!formData.confirmData) {
            alert('Mohon centang konfirmasi data sebelum menyimpan');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/sekolah', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nama_sekolah: formData.namaSekolah,
                    npsn: formData.npsn,
                    nss: formData.nss,
                    alamat: formData.alamat,
                    kode_pos: formData.kodePos,
                    telepon: formData.telepon,
                    email: formData.email,
                    website: formData.website,
                    kepala_sekolah: formData.kepalaSekolah,
                    niy_kepala_sekolah: formData.niyKepalaSekolah
                })
            });

            if (res.ok) {
                alert('✅ Data sekolah berhasil disimpan!');
                window.dispatchEvent(new CustomEvent('schoolUpdated'));
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menyimpan data sekolah');
            }
        } catch (err) {
            console.error('Error simpan data:', err);
            alert('Gagal menghubungi server');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateLogo = async () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file) {
            alert('Pilih file logo terlebih dahulu');
            return;
        }

        setUploading(true);
        const formDataLogo = new FormData();
        formDataLogo.append('logo', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/admin/sekolah/logo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataLogo
            });

            const data = await res.json();

            if (res.ok && data.logoPath) {
                const logoUrl = `http://localhost:5000${data.logoPath}`;
                setLogoPreview(logoUrl);

                // Notifikasi ke komponen lain (misal sidebar)
                window.dispatchEvent(new CustomEvent('logoUpdated', { detail: { logoPath: data.logoPath } }));

                alert('✅ Logo berhasil diupdate!');

                // Reset file input
                setFileInputKey(prev => prev + 1);

                // Opsional: refresh data sekolah setelah 300ms
                setTimeout(fetchSekolahData, 300);
            } else {
                alert(data.message || 'Gagal mengupload logo');
            }
        } catch (err) {
            console.error('❌ Error upload logo:', err);
            alert('Gagal menghubungi server');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-3"></div>
                    <p className="text-gray-700">Memuat data sekolah...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Sekolah</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* === Bagian Kiri: Edit Data Sekolah === */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">Informasi Sekolah</h2>

                        <div className="space-y-5">
                            {[
                                { label: 'Nama Sekolah', name: 'namaSekolah', type: 'text' },
                                { label: 'NPSN', name: 'npsn', type: 'text' },
                                { label: 'NSS', name: 'nss', type: 'text' },
                                { label: 'Kode Pos', name: 'kodePos', type: 'text' },
                                { label: 'Telepon', name: 'telepon', type: 'text' },
                                { label: 'Email', name: 'email', type: 'email' },
                                { label: 'Website', name: 'website', type: 'text' },
                                { label: 'Kepala Sekolah', name: 'kepalaSekolah', type: 'text' },
                                { label: 'NIY Kepala Sekolah', name: 'niyKepalaSekolah', type: 'text' }
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name as keyof typeof formData] as string}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder={`Masukkan ${field.label.toLowerCase()}`}
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
                                <textarea
                                    name="alamat"
                                    value={formData.alamat}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Masukkan alamat lengkap"
                                />
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="confirmData"
                                    name="confirmData"
                                    checked={formData.confirmData}
                                    onChange={handleInputChange}
                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="confirmData" className="text-sm text-gray-700">
                                    Saya yakin sudah mengisikan data dengan benar
                                </label>
                            </div>

                            <div className="pt-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving || !formData.confirmData}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 border-t-2 border-white rounded-full animate-spin"></span>
                                            Menyimpan...
                                        </span>
                                    ) : (
                                        'Simpan Perubahan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* === Bagian Kanan: Edit Logo Sekolah === */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 h-fit">
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">Logo Sekolah</h2>

                        {/* Preview Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl w-48 h-48 flex items-center justify-center">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Preview Logo Sekolah"
                                        className="w-full h-full object-contain p-2"
                                        onError={() => setLogoPreview(null)}
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs">Belum ada logo</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload File */}
                        <div className="mb-5">
                            <input
                                key={fileInputKey}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleLogoChange}
                                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                            />
                            <p className="text-xs text-gray-500 mt-1 italic">Format: JPG, JPEG, PNG (maks. 2 MB)</p>
                        </div>

                        <button
                            onClick={handleUpdateLogo}
                            disabled={uploading || !logoPreview}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 border-t-2 border-white rounded-full animate-spin"></span>
                                    Mengupload...
                                </span>
                            ) : (
                                'Update Logo'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}