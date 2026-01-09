/**
 * Nama File: data_tahun_ajaran_client.tsx
 * Fungsi: Komponen client-side untuk mengelola data tahun ajaran oleh admin.
 *         Menyediakan fitur CRUD (Create, Read, Update) untuk periode akademik,
 *         termasuk pengaturan semester (Ganjil/Genap), tanggal pembagian rapor PTS/PAS,
 *         dan status (aktif/nonaktif). Hanya tahun ajaran nonaktif yang dapat diubah statusnya,
 *         sedangkan tahun ajaran aktif dapat diedit tetapi tidak dihapus.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

interface TahunAjaran {
    id_tahun_ajaran: number;
    tahun_ajaran: string;
    semester: 'Ganjil' | 'Genap';
    tanggal_pembagian_pts: string | null;
    tanggal_pembagian_pas: string | null;
    status: 'aktif' | 'nonaktif';
}

const formatTanggalIndonesia = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    const cleanDate = dateStr.split(' ')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        return '-';
    }
    const [year, month, day] = cleanDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return '-';

    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
    const tanggal = date.getDate();
    const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ][date.getMonth()];
    const tahun = date.getFullYear();
    return `${hari}, ${tanggal} ${bulan} ${tahun}`;
};

export default function DataTahunAjaranPage() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTambah, setShowTambah] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [formData, setFormData] = useState({
        tahun1: '',
        tahun2: '',
        semester: 'Ganjil' as 'Ganjil' | 'Genap',
        tanggal_pembagian_pts: '',
        tanggal_pembagian_pas: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchTahunAjaran = async () => {
        try {
            const res = await apiFetch(`${API_URL}/api/admin/tahun-ajaran`);
            const data = await res.json();
            if (res.ok && data.success) {
                setTahunAjaranList(data.data);
            } else {
                alert('Gagal memuat data tahun ajaran: ' + (data.message || 'Error tidak diketahui'));
            }
        } catch (err) {
            console.error('Error fetch tahun ajaran:', err);
            // Jika status 401 → apiFetch sudah redirect ke /login
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTahunAjaran();
    }, [API_URL]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.tahun1 || !formData.tahun2) {
            newErrors.tahun = 'Tahun ajaran wajib diisi';
        }
        if (!formData.semester) {
            newErrors.semester = 'Semester wajib dipilih';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitTambah = async () => {
        if (!validate()) return;

        try {
            const res = await apiFetch(`${API_URL}/api/admin/tahun-ajaran`, {
                method: "POST",
                body: JSON.stringify({
                    tahun1: formData.tahun1,
                    tahun2: formData.tahun2,
                    semester: formData.semester,
                    tanggal_pembagian_pts: formData.tanggal_pembagian_pts || null,
                    tanggal_pembagian_pas: formData.tanggal_pembagian_pas
                })
            });

            if (res.ok) {
                alert("Tahun ajaran berhasil ditambahkan");
                setShowTambah(false);
                setFormData({
                    tahun1: '2024',
                    tahun2: '2025',
                    semester: 'Ganjil',
                    tanggal_pembagian_pts: '',
                    tanggal_pembagian_pas: ''
                });
                fetchTahunAjaran();
            } else {
                const err = await res.json();
                alert(err.message || "Gagal menambah tahun ajaran");
            }
        } catch (err) {
            console.error('Error tambah tahun ajaran:', err);
            // Jika sesi habis, apiFetch sudah redirect
        }
    };

    const handleEdit = (item: TahunAjaran) => {
        const [thn1, thn2] = item.tahun_ajaran.split('/');
        setEditId(item.id_tahun_ajaran);
        setFormData({
            tahun1: thn1 || '2024',
            tahun2: thn2 || '2025',
            semester: item.semester,
            tanggal_pembagian_pts: item.tanggal_pembagian_pts || '',
            tanggal_pembagian_pas: item.tanggal_pembagian_pas || ''
        });
        setShowEdit(true);
    };

    const handleSubmitEdit = async () => {
        if (!validate()) return;
        if (editId === null) return;

        try {
            const res = await apiFetch(`${API_URL}/api/admin/tahun-ajaran/${editId}`, {
                method: "PUT",
                body: JSON.stringify({
                    tahun1: formData.tahun1,
                    tahun2: formData.tahun2,
                    semester: formData.semester,
                    tanggal_pembagian_pts: formData.tanggal_pembagian_pts || null,
                    tanggal_pembagian_pas: formData.tanggal_pembagian_pas
                })
            });

            if (res.ok) {
                alert("Data tahun ajaran berhasil diperbarui");
                setShowEdit(false);
                setEditId(null);
                fetchTahunAjaran();
            } else {
                const err = await res.json();
                alert(err.message || "Gagal memperbarui data");
            }
        } catch (err) {
            console.error('Error edit tahun ajaran:', err);
        }
    };

    const handleReset = () => {
        if (showEdit && editId) {
            const item = tahunAjaranList.find(t => t.id_tahun_ajaran === editId);
            if (item) {
                const [thn1, thn2] = item.tahun_ajaran.split('/');
                setFormData({
                    tahun1: thn1 || '2024',
                    tahun2: thn2 || '2025',
                    semester: item.semester,
                    tanggal_pembagian_pts: item.tanggal_pembagian_pts || '',
                    tanggal_pembagian_pas: item.tanggal_pembagian_pas || ''
                });
            }
        } else {
            setFormData({
                tahun1: '2024',
                tahun2: '2025',
                semester: 'Ganjil',
                tanggal_pembagian_pts: '',
                tanggal_pembagian_pas: ''
            });
        }
    };

    // Sorting & Pagination
    const sortedData = [...tahunAjaranList].sort((a, b) => {
        if (a.status === b.status) {
            return b.id_tahun_ajaran - a.id_tahun_ajaran;
        }
        return a.status === 'aktif' ? -1 : 1;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = sortedData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const renderPagination = () => {
        const pages = [];
        const maxVisible = 5;
        if (currentPage > 1) pages.push(<button key="prev" onClick={() => setCurrentPage(c => c - 1)} className="px-3 py-1 border rounded">«</button>);
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border rounded ${currentPage === i ? 'bg-blue-500 text-white' : ''}`}>{i}</button>);
        } else {
            pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : ''}`}>1</button>);
            if (currentPage > 3) pages.push(<span className="px-2">...</span>);
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border rounded ${currentPage === i ? 'bg-blue-500 text-white' : ''}`}>{i}</button>);
            if (currentPage < totalPages - 2) pages.push(<span className="px-2">...</span>);
            pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : ''}`}>{totalPages}</button>);
        }
        if (currentPage < totalPages) pages.push(<button key="next" onClick={() => setCurrentPage(c => c + 1)} className="px-3 py-1 border rounded">»</button>);
        return pages;
    };

    const renderForm = (isEdit: boolean) => (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Data Tahun Ajaran</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
                        </h2>
                        <button
                            onClick={() => isEdit ? setShowEdit(false) : setShowTambah(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tahun Ajaran <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    name="tahun1"
                                    value={formData.tahun1}
                                    onChange={handleInputChange}
                                    className="w-24 border border-gray-300 rounded px-3 py-2 "
                                    placeholder="2024"
                                />
                                <span className="text-xl font-bold">/</span>
                                <input
                                    type="text"
                                    name="tahun2"
                                    value={formData.tahun2}
                                    onChange={handleInputChange}
                                    className="w-24 border border-gray-300 rounded px-3 py-2 "
                                    placeholder="2025"
                                />
                            </div>
                            {errors.tahun && <p className="text-red-500 text-xs mt-1">{errors.tahun}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Semester <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 "
                            >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                            {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tanggal Pembagian PTS
                            </label>
                            <input
                                type="date"
                                name="tanggal_pembagian_pts"
                                value={formData.tanggal_pembagian_pts}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 "
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tanggal Pembagian PAS
                            </label>
                            <input
                                type="date"
                                name="tanggal_pembagian_pas"
                                value={formData.tanggal_pembagian_pas}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 "
                            />
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8">
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <button
                                onClick={() => isEdit ? setShowEdit(false) : setShowTambah(false)}
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Tahun Ajaran</h1>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="text-sm text-gray-600">
                            Menampilkan {startIndex + 1} - {Math.min(endIndex, sortedData.length)} dari {sortedData.length} data
                        </div>
                        <button
                            onClick={() => setShowTambah(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Plus size={20} />
                            Tambah Tahun Ajaran
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
                        <table className="w-full min-w-[600px] table-auto text-sm">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Tahun Ajaran</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Semester</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Pembagian Rapor PTS</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Pembagian Rapor PAS</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Status</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Memuat data...</td></tr>
                                ) : currentData.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada data tahun ajaran</td></tr>
                                ) : (
                                    currentData.map((item, index) => (
                                        <tr key={item.id_tahun_ajaran} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                            <td className="px-4 py-3 text-center font-medium">{startIndex + index + 1}</td>
                                            <td className="px-4 py-3 text-center font-medium">{item.tahun_ajaran}</td>
                                            <td className="px-4 py-3 text-center">{item.semester}</td>
                                            <td className="px-4 py-3 text-center">{formatTanggalIndonesia(item.tanggal_pembagian_pts)}</td>
                                            <td className="px-4 py-3 text-center">{formatTanggalIndonesia(item.tanggal_pembagian_pas)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {item.status === 'aktif' ? (
                                                    <div className="flex justify-center">
                                                        <button onClick={() => handleEdit(item)} className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 text-xs sm:text-sm">
                                                            <Pencil size={14} /><span className="hidden sm:inline">Edit</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
                            <div className="text-sm text-gray-600">
                                Menampilkan {startIndex + 1} - {Math.min(endIndex, sortedData.length)} dari {sortedData.length} data
                            </div>
                            <div className="flex gap-1">{renderPagination()}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}