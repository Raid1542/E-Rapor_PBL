/**
 * Nama File: data_siswa_client.tsx
 * Fungsi: Komponen client-side untuk menampilkan daftar dan detail data siswa
 *         yang diajar oleh guru kelas. Menyediakan fitur pencarian dan modal
 *         detail informasi siswa, termasuk NIS, NISN, tanggal lahir, jenis kelamin, dan fase.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Muhammad Auriel Almayda - NIM: 331240193
 * Tanggal: 15 September 2025
 */


'use client';

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Eye, Search, X } from 'lucide-react';

interface Siswa {
    id: number;
    nis: string;
    nisn: string;
    nama: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin: string;
    status?: string;
    kelas: string;
    fase?: string;
}

const formatTanggalIndo = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const formatJenisKelamin = (jk: string): string => {
    if (!jk) return '-';
    const s = jk.trim().toLowerCase();
    if (s === 'l' || s === 'laki-laki' || s.includes('laki')) return 'Laki-laki';
    if (s === 'p' || s === 'perempuan' || s.includes('peremp')) return 'Perempuan';
    return jk;
};

export default function DataSiswaPage() {

    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [filteredSiswa, setFilteredSiswa] = useState<Siswa[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [kelasNama, setKelasNama] = useState<string>('Kelas Anda');
    const [detailClosing, setDetailClosing] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const closeDetail = () => {
        setDetailClosing(true);
        setTimeout(() => {
            setShowDetail(false);
            setDetailClosing(false);
            setSelectedSiswa(null);
        }, 200);
    };

    useEffect(() => {
        const fetchSiswa = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Silakan login terlebih dahulu');
                    return;
                }

                const res = await fetch('http://localhost:5000/api/guru-kelas/siswa', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        const siswa = data.data || [];
                        setSiswaList(siswa);
                        setFilteredSiswa(siswa);
                        if (siswa.length > 0) {
                            setKelasNama(siswa[0].kelas || 'Kelas Anda');
                        }
                    } else {
                        alert(data.message || 'Gagal memuat data siswa');
                    }
                } else {
                    const error = await res.json();
                    alert(error.message || 'Gagal memuat data siswa');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Gagal terhubung ke server');
            } finally {
                setLoading(false);
            }
        };

        fetchSiswa();
    }, []);

    // Filter berdasarkan pencarian
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredSiswa(siswaList);
        } else {
            const q = searchQuery.toLowerCase().trim();
            const filtered = siswaList.filter(s =>
                s.nama.toLowerCase().includes(q) ||
                s.nis.includes(q) ||
                s.nisn.includes(q)
            );
            setFilteredSiswa(filtered);
        }
        setCurrentPage(1); // Reset ke halaman 1 saat pencarian
    }, [searchQuery, siswaList]);

    const handleDetail = (siswa: Siswa) => {
        setSelectedSiswa(siswa);
        setShowDetail(true);
    };

    const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSiswa = filteredSiswa.slice(startIndex, endIndex);

    const renderPagination = () => {
        const pages: ReactNode[] = [];
        const maxVisible = 5;
        if (currentPage > 1) pages.push(<button key="prev" onClick={() => setCurrentPage(c => c - 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">«</button>);
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{i}</button>);
            }
        } else {
            pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>1</button>);
            if (currentPage > 3) pages.push(<span key="dots1" className="px-2 text-gray-600">...</span>);
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{i}</button>);
            }
            if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
            pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{totalPages}</button>);
        }
        if (currentPage < totalPages) pages.push(<button key="next" onClick={() => setCurrentPage(c => c + 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">»</button>);
        return pages;
    };

    return (
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Siswa</h1>

                {/* Header Informasi Kelas */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Kelas: {kelasNama}</h2>
                            <p className="text-sm text-gray-600">Menampilkan siswa yang terdata di kelas ini.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            {/* Tampilkan per halaman */}
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
                            {/* Pencarian */}
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
                        </div>
                    </div>
                </div>

                {/* Tabel Siswa */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[600px] table-auto text-sm">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIS</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NISN</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Jenis Kelamin</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Memuat data...</td>
                                </tr>
                            ) : currentSiswa.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        {searchQuery ? 'Tidak ada siswa yang cocok.' : 'Belum ada siswa di kelas ini.'}
                                    </td>
                                </tr>
                            ) : (
                                currentSiswa.map((siswa, index) => (
                                    <tr
                                        key={siswa.id}
                                        className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                                    >
                                        <td className="px-4 py-3 text-center align-middle font-medium">{startIndex + index + 1}</td>
                                        <td className="px-4 py-3 text-center align-middle font-medium">{siswa.nama}</td>
                                        <td className="px-4 py-3 text-center align-middle">{siswa.nis}</td>
                                        <td className="px-4 py-3 text-center align-middle">{siswa.nisn}</td>
                                        <td className="px-4 py-3 text-center align-middle">
                                            {formatJenisKelamin(siswa.jenis_kelamin)}
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleDetail(siswa)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
                                                >
                                                    <Eye size={16} />
                                                    <span className="hidden sm:inline">Detail</span>
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
                        Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredSiswa.length)} dari{' '}
                        {filteredSiswa.length} data
                    </div>
                    <div className="flex gap-1 flex-wrap justify-center">
                        {renderPagination()}
                    </div>
                </div>
            </div>

            {/* Modal Detail dengan Animasi */}
            {showDetail && selectedSiswa && (
                <div
                    className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${detailClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeDetail();
                    }}
                >
                    <div className="absolute inset-0 bg-gray-900/70"></div>
                    <div
                        className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${detailClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    >
                        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Siswa</h2>
                            <button
                                onClick={closeDetail}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Tutup"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col items-center mb-10">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center break-words">
                                    {selectedSiswa.nama}
                                </h3>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Kelas</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-2">{selectedSiswa.kelas}</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">NIS</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-2">{selectedSiswa.nis}</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">NISN</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-2">{selectedSiswa.nisn}</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Tempat Lahir</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-2">{selectedSiswa.tempat_lahir || '-'}</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Tanggal Lahir</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-2">{formatTanggalIndo(selectedSiswa.tanggal_lahir)}</span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Jenis Kelamin</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-2">
                                        {formatJenisKelamin(selectedSiswa.jenis_kelamin)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                    <span className="font-semibold text-xs sm:text-sm">Fase</span>
                                    <span className="text-xs sm:text-sm">:</span>
                                    <span className="text-xs sm:text-sm col-span-2">{selectedSiswa.fase || '-'}</span>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closeDetail}
                                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-xs sm:text-sm font-medium"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}