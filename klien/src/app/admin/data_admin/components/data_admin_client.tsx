/**
 * Nama File: data_admin_client.tsx
 * Fungsi: Komponen klien untuk mengelola data admin,
 *         mencakup fitur tambah, edit, detail, pencarian, dan pagination.
 *         Menggunakan template UI dari data_guru_client.tsx.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

"use client";

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Eye, Pencil, X, Plus, Search } from 'lucide-react';

interface Admin {
    id: number;
    nama: string;
    email?: string;
    statusAdmin?: string;
    niy?: string;
    nuptk?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenisKelamin?: string;
    alamat?: string;
    no_telepon?: string;
    profileImage?: string | null;
}

interface FormDataType {
    nama: string;
    niy: string;
    nuptk: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenisKelamin: string;
    alamat: string;
    no_telepon: string;
    email: string;
    statusAdmin: string;
    confirmData: boolean;
}

const formatTanggalIndonesia = (dateStr?: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    const hari = date.getDate();
    const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ][date.getMonth()];
    const tahun = date.getFullYear();
    return `${hari} ${bulan} ${tahun}`;
};

export default function DataAdminClient() {
    const formatGender = (g?: string | null) => {
        if (!g) return '-';
        const s = String(g).trim().toLowerCase();
        if (s === 'laki-laki' || s === 'laki laki' || s === 'laki' || s === 'l') return 'Laki-laki';
        if (s === 'perempuan' || s === 'p' || s === 'perempuan') return 'Perempuan';
        if (s.includes('laki')) return 'Laki-laki';
        if (s.includes('peremp')) return 'Perempuan';
        return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
    };

    const formatDateInput = (dateString?: string) => {
        if (!dateString) return '';
        try {
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return '';
        }
    };

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase() || '')
            .join('');
    };

    // === State Utama ===
    const [adminList, setAdminList] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDetail, setShowDetail] = useState(false);
    const [showTambah, setShowTambah] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailClosing, setDetailClosing] = useState(false);

    // === Fetch Admin ===
    const fetchAdmin = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Silakan login terlebih dahulu');
                return;
            }
            const res = await fetch('http://localhost:5000/api/admin/admin', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                const list = Array.isArray(data.data)
                    ? data.data.map((a: any) => ({
                        id: a.id,
                        nama: a.nama_lengkap || a.nama,
                        email: a.email_sekolah || a.email,
                        statusAdmin: a.status || a.statusAdmin || 'aktif',
                        niy: a.niy,
                        nuptk: a.nuptk,
                        tempat_lahir: a.tempat_lahir || '',
                        tanggal_lahir: a.tanggal_lahir || '',
                        jenisKelamin: a.jenis_kelamin || '',
                        alamat: a.alamat,
                        no_telepon: a.no_telepon || '',
                        profileImage: a.profileImage || null,
                    }))
                    : [];
                setAdminList(list);
            } else {
                alert('Gagal memuat data admin: ' + (data.message || 'Error tidak diketahui'));
            }
        } catch (err) {
            console.error('Error fetch admin:', err);
            alert('Gagal terhubung ke server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmin();
    }, []);

    // === Form & Validasi ===
    const [formData, setFormData] = useState<FormDataType>({
        nama: '',
        niy: '',
        nuptk: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenisKelamin: '',
        alamat: '',
        no_telepon: '',
        email: '',
        statusAdmin: 'aktif',
        confirmData: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleDetail = (admin: Admin) => {
        setSelectedAdmin(admin);
        setShowDetail(true);
    };

    const handleEdit = (admin: Admin) => {
        setEditId(admin.id);
        setFormData({
            nama: admin.nama || '',
            email: admin.email || '',
            niy: admin.niy || '',
            nuptk: admin.nuptk || '',
            tempat_lahir: admin.tempat_lahir || '',
            tanggal_lahir: formatDateInput(admin.tanggal_lahir) || '',
            jenisKelamin: admin.jenisKelamin || 'Laki-laki',
            alamat: admin.alamat || '',
            no_telepon: admin.no_telepon || '',
            statusAdmin: admin.statusAdmin?.toLowerCase() === 'aktif' ? 'aktif' : 'nonaktif',
            confirmData: false,
        });
        setShowEdit(true);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = (isEdit: boolean): boolean => {
  const newErrors: Record<string, string> = {};

  // Nama dan email tetap wajib
  if (!formData.nama?.trim()) {
    newErrors.nama = 'Nama wajib diisi';
  }
  if (!formData.email?.trim()) {
    newErrors.email = 'Email wajib diisi';
  }
  if (!formData.niy?.trim()) {
    newErrors.niy = 'NIY wajib diisi';
  }
  if (!formData.nuptk?.trim()) {
    newErrors.nuptk = 'NUPTK wajib diisi';
  }

  // Status hanya wajib saat edit
  if (isEdit && (!formData.statusAdmin || formData.statusAdmin === '')) {
    newErrors.statusAdmin = 'Status admin wajib dipilih';
  }

  // Konfirmasi akhir tetap wajib
  if (!formData.confirmData) {
    newErrors.confirmData = 'Harap konfirmasi data sebelum melanjutkan';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

    const handleSubmitTambah = async () => {
        if (!validate(false)) return;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sesi login habis. Silakan login ulang.');
            return;
        }
        try {
            const res = await fetch('http://localhost:5000/api/admin/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nama_lengkap: formData.nama,
                    email_sekolah: formData.email,
                    niy: formData.niy,
                    nuptk: formData.nuptk,
                    tempat_lahir: formData.tempat_lahir,
                    tanggal_lahir: formData.tanggal_lahir,
                    jenis_kelamin: formData.jenisKelamin,
                    alamat: formData.alamat,
                    no_telepon: formData.no_telepon,
                }),
            });
            if (res.ok) {
                alert('Data admin berhasil ditambahkan');
                setShowTambah(false);
                fetchAdmin();
                handleReset();
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menambah data admin');
            }
        } catch (err) {
            alert('Gagal terhubung ke server');
        }
    };

    const handleSubmitEdit = async () => {
        const originalData = adminList.find((a) => a.id === editId);
        if (!originalData) return;

        if (!validate(true)) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sesi login habis.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/admin/admin/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nama_lengkap: formData.nama,
                    email_sekolah: formData.email,
                    status: formData.statusAdmin,
                    niy: formData.niy,
                    nuptk: formData.nuptk,
                    tempat_lahir: formData.tempat_lahir,
                    tanggal_lahir: formData.tanggal_lahir,
                    jenis_kelamin: formData.jenisKelamin,
                    alamat: formData.alamat,
                    no_telepon: formData.no_telepon,
                }),
            });

            if (res.ok) {
                alert('Data admin berhasil diperbarui');
                setShowEdit(false);
                setEditId(null);
                fetchAdmin();
                handleReset();
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal memperbarui data admin');
            }
        } catch (err) {
            alert('Gagal terhubung ke server');
        }
    };

    const handleReset = () => {
        setFormData({
            nama: '',
            niy: '',
            nuptk: '',
            tempat_lahir: '',
            tanggal_lahir: '',
            jenisKelamin: '',
            alamat: '',
            no_telepon: '',
            email: '',
            statusAdmin: 'aktif',
            confirmData: false,
        });
        setErrors({});
    };

    // === Filter & Pencarian ===
    const filteredAdmin = adminList.filter((admin) => {
        const query = searchQuery.toLowerCase().trim();
        return (
            !query ||
            admin.nama?.toLowerCase().includes(query) ||
            admin.email?.toLowerCase().includes(query) ||
            admin.niy?.includes(query) ||
            admin.nuptk?.includes(query) ||
            admin.tempat_lahir?.toLowerCase().includes(query) ||
            admin.no_telepon?.includes(query)
        );
    });

    const totalPages = Math.ceil(filteredAdmin.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAdmin = filteredAdmin.slice(startIndex, endIndex);

    const renderPagination = () => {
        const pages: ReactNode[] = [];
        const maxVisible = 5;
        if (currentPage > 1)
            pages.push(
                <button
                    key="prev"
                    onClick={() => setCurrentPage((c) => c - 1)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                    «
                </button>
            );
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            pages.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`px-3 py-1 border border-gray-300 rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                        }`}
                >
                    1
                </button>
            );
            if (currentPage > 3) pages.push(<span key="dots1" className="px-2 text-gray-600">...</span>);
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                    >
                        {i}
                    </button>
                );
            }
            if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 border border-gray-300 rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                        }`}
                >
                    {totalPages}
                </button>
            );
        }
        if (currentPage < totalPages)
            pages.push(
                <button
                    key="next"
                    onClick={() => setCurrentPage((c) => c + 1)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                    »
                </button>
            );
        return pages;
    };

    // === Render Form ===
    const renderForm = (isEdit: boolean) => (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Data Admin</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? 'Edit Data Admin' : 'Tambah Data Admin'}
                        </h2>
                        <button
                            onClick={() => {
                                isEdit ? setShowEdit(false) : setShowTambah(false);
                                handleReset();
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nama <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleInputChange}
                                placeholder="Masukkan nama lengkap"
                                className={`w-full border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
                            />
                            {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Akun <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="contoh@sekolah.sch.id"
                                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                NIY <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="niy"
                                value={formData.niy}
                                onChange={handleInputChange}
                                placeholder="Nomor Induk Yayasan"
                                className={`w-full border ${errors.niy ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
                            />
                            {errors.niy && <p className="text-red-500 text-xs mt-1">{errors.niy}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                NUPTK <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nuptk"
                                value={formData.nuptk}
                                onChange={handleInputChange}
                                placeholder="Nomor Unik Pendidik"
                                className={`w-full border ${errors.nuptk ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
                            />
                            {errors.nuptk && <p className="text-red-500 text-xs mt-1">{errors.nuptk}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tempat Lahir
                            </label>
                            <input
                                type="text"
                                name="tempat_lahir"
                                value={formData.tempat_lahir}
                                onChange={handleInputChange}
                                placeholder="Misal: Jakarta"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tanggal Lahir
                            </label>
                            <input
                                type="date"
                                name="tanggal_lahir"
                                value={formData.tanggal_lahir}
                                onChange={handleInputChange}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2.5`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Jenis Kelamin
                            </label>
                            <select
                                name="jenisKelamin"
                                value={formData.jenisKelamin}
                                onChange={handleInputChange}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2.5`}
                            >
                                <option value="">-- Pilih --</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Telepon
                            </label>
                            <input
                                type="tel"
                                name="no_telepon"
                                value={formData.no_telepon}
                                onChange={handleInputChange}
                                placeholder="misal: 081234567890"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
                            <textarea
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleInputChange}
                                placeholder="Masukkan alamat lengkap"
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                            ></textarea>
                        </div>

                        {isEdit && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Status Admin <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="statusAdmin"
                                    value={formData.statusAdmin}
                                    onChange={handleInputChange}
                                    className={`w-full border ${errors.statusAdmin ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
                                >
                                    <option value="">-- Pilih --</option>
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                                {errors.statusAdmin && <p className="text-red-500 text-xs mt-1">{errors.statusAdmin}</p>}
                            </div>
                        )}
                    </div>
                    <div className="mt-6">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="confirmData"
                                checked={formData.confirmData}
                                onChange={handleInputChange}
                                className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Saya yakin data yang diisi sudah benar</span>
                        </label>
                        {errors.confirmData && <p className="text-red-500 text-xs mt-1">{errors.confirmData}</p>}
                    </div>
                    <div className="mt-6 sm:mt-8">
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    isEdit ? setShowEdit(false) : setShowTambah(false);
                                    handleReset();
                                }}
                                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReset}
                                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium"
                            >
                                Reset
                            </button>
                            <button
                                onClick={isEdit ? handleSubmitEdit : handleSubmitTambah}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium"
                            >
                                {isEdit ? 'Update' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (showTambah) return renderForm(false);
    if (showEdit) return renderForm(true);

    return (
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Admin</h1>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    {/* Tombol Aksi */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <button
                            onClick={() => setShowTambah(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={20} /> Tambah Admin
                        </button>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="text-gray-700 text-sm">Tampilkan</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-gray-700 text-sm">data</span>
                            </div>
                            <div className="relative flex-1 min-w-[200px] sm:min-w-[240px] max-w-[400px]">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Pencarian"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full border border-gray-300 rounded pl-10 pr-10 py-2 text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setCurrentPage(1);
                                        }}
                                        className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {/* ❌ Tidak ada tombol Filter dan Import */}
                        </div>
                    </div>

                    {/* Tabel Data */}
                    <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
                        <table className="w-full min-w-[600px] table-auto text-sm">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Jenis Kelamin</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIY</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NUPTK</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Status</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : currentAdmin.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data admin
                                        </td>
                                    </tr>
                                ) : (
                                    currentAdmin.map((admin, index) => (
                                        <tr
                                            key={admin.id}
                                            className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                                        >
                                            <td className="px-4 py-3 text-center align-middle font-medium">{startIndex + index + 1}</td>
                                            <td className="px-4 py-3 align-middle font-medium">{admin.nama}</td>
                                            <td className="px-4 py-3 text-center align-middle">{formatGender(admin.jenisKelamin)}</td>
                                            <td className="px-4 py-3 text-center align-middle">{admin.niy || '-'}</td>
                                            <td className="px-4 py-3 text-center align-middle">{admin.nuptk || '-'}</td>
                                            <td className="px-4 py-3 text-center align-middle">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${admin.statusAdmin === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {admin.statusAdmin?.toUpperCase() || 'AKTIF'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                                                <div className="flex justify-center gap-1 sm:gap-2">
                                                    <button
                                                        onClick={() => handleDetail(admin)}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 text-xs sm:text-sm"
                                                    >
                                                        <Eye size={16} /> <span className="hidden sm:inline">Detail</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(admin)}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 text-xs sm:text-sm"
                                                    >
                                                        <Pencil size={16} /> <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
                        <div className="text-sm text-gray-600">
                            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredAdmin.length)} dari {filteredAdmin.length} data
                        </div>
                        <div className="flex gap-1 flex-wrap justify-center">{renderPagination()}</div>
                    </div>
                </div>
            </div>

            {/* Modal Detail */}
            {showDetail && selectedAdmin && (
                <div
                    className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${detailClosing ? 'opacity-0' : 'opacity-100'
                        } p-3 sm:p-4`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setDetailClosing(true);
                            setTimeout(() => {
                                setShowDetail(false);
                                setDetailClosing(false);
                            }, 200);
                        }
                    }}
                >
                    <div className="absolute inset-0 bg-gray-900/70"></div>
                    <div
                        className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${detailClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                            }`}
                    >
                        <div
                            className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10"
                        >
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Admin</h2>
                            <button
                                onClick={() => {
                                    setDetailClosing(true);
                                    setTimeout(() => {
                                        setShowDetail(false);
                                        setDetailClosing(false);
                                    }, 200);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            {/* Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3 flex-shrink-0 relative overflow-hidden">
                                    {selectedAdmin.profileImage ? (
                                        <img
                                            src={`http://localhost:5000${selectedAdmin.profileImage}`}
                                            alt="Foto Profil"
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span className="text-black text-xl font-semibold">
                                            {getInitials(selectedAdmin.nama || '??')}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center break-words">
                                    {selectedAdmin.nama}
                                </h3>
                            </div>

                            {/* Info Detail */}
                            <div className="space-y-2 sm:space-y-3">
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm col-span-1 sm:col-span-1">Status</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <div className="col-span-1 sm:col-span-2">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${selectedAdmin.statusAdmin === 'aktif'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-red-500 text-white'
                                                }`}
                                        >
                                            {selectedAdmin.statusAdmin?.toUpperCase() || 'AKTIF'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">NIY</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                                        {selectedAdmin.niy || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">NUPTK</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                                        {selectedAdmin.nuptk || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Jenis Kelamin</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2">
                                        {formatGender(selectedAdmin.jenisKelamin)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Tempat Lahir</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                                        {selectedAdmin.tempat_lahir || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Tanggal Lahir</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2">
                                        {formatTanggalIndonesia(selectedAdmin.tanggal_lahir)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Telepon</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                                        {selectedAdmin.no_telepon || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Alamat</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                                        {selectedAdmin.alamat || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Email</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                                        {selectedAdmin.email || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                                <button
                                    onClick={() => {
                                        setDetailClosing(true);
                                        setTimeout(() => {
                                            setShowDetail(false);
                                            setDetailClosing(false);
                                        }, 200);
                                    }}
                                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-xs sm:text-sm font-medium"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => {
                                        handleEdit(selectedAdmin);
                                        setDetailClosing(true);
                                        setTimeout(() => {
                                            setShowDetail(false);
                                            setDetailClosing(false);
                                        }, 200);
                                    }}
                                    className="px-4 sm:px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded transition text-xs sm:text-sm font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}