'use client';

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Eye, Pencil, X, Search } from 'lucide-react';

interface SiswaAbsensi {
    id: number;
    nama: string;
    nis: string;
    nisn: string;
    jumlah_sakit: number;
    jumlah_izin: number;
    jumlah_alpha: number;
    sudah_diinput: boolean; // ← penanda apakah data sudah pernah disimpan
}

export default function DataAbsensiPage() {
    const [siswaList, setSiswaList] = useState<SiswaAbsensi[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDetail, setShowDetail] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<{
        jumlah_sakit: number;
        jumlah_izin: number;
        jumlah_alpha: number;
    }>({ jumlah_sakit: 0, jumlah_izin: 0, jumlah_alpha: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [kelasNama, setKelasNama] = useState<string>('Kelas Anda');
    const [detailClosing, setDetailClosing] = useState(false);

    const [originalData, setOriginalData] = useState<{
        jumlah_sakit: number;
        jumlah_izin: number;
        jumlah_alpha: number;
    } | null>(null);

    useEffect(() => {
        const fetchAbsensi = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Silakan login terlebih dahulu');
                    return;
                }

                const res = await fetch('http://localhost:5000/api/guru-kelas/absensi', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setSiswaList(data.data || []);
                        setKelasNama(data.kelas || 'Kelas Anda');
                    } else {
                        alert(data.message || 'Gagal memuat data absensi');
                    }
                } else {
                    const error = await res.json();
                    alert(error.message || 'Gagal memuat data absensi');
                }
            } catch (err) {
                console.error('Error fetch absensi:', err);
                alert('Gagal terhubung ke server');
            } finally {
                setLoading(false);
            }
        };

        fetchAbsensi();
    }, []);

    const handleEdit = (siswa: SiswaAbsensi) => {
        setEditingId(siswa.id);
        const data = {
            jumlah_sakit: siswa.jumlah_sakit,
            jumlah_izin: siswa.jumlah_izin,
            jumlah_alpha: siswa.jumlah_alpha
        };
        setEditData(data);
        setOriginalData(data);
    };

    const handleSave = async (siswaId: number) => {
        if (!originalData) {
            alert('Data asli tidak ditemukan.');
            return;
        }

        const hasChanges =
            editData.jumlah_sakit !== originalData.jumlah_sakit ||
            editData.jumlah_izin !== originalData.jumlah_izin ||
            editData.jumlah_alpha !== originalData.jumlah_alpha;

        if (!hasChanges) {
            alert('Tidak ada perubahan yang dilakukan.');
            setEditingId(null);
            setShowDetail(false);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesi login habis.');
                return;
            }

            const res = await fetch(`http://localhost:5000/api/guru-kelas/absensi/${siswaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });

            if (res.ok) {
                alert('Data absensi berhasil disimpan');
                setEditingId(null);
                // Refresh data
                const updatedSiswa = siswaList.map(s =>
                    s.id === siswaId
                        ? { ...s, ...editData, sudah_diinput: true }
                        : s
                );
                setSiswaList(updatedSiswa);
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menyimpan data absensi');
            }
        } catch (err) {
            alert('Gagal terhubung ke server');
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const filteredSiswa = siswaList.filter((siswa) => {
        const query = searchQuery.toLowerCase().trim();
        return !query ||
            siswa.nama.toLowerCase().includes(query) ||
            siswa.nis.includes(query) ||
            siswa.nisn.includes(query);
    });

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

    const closeDetail = () => {
        setDetailClosing(true);
        setTimeout(() => {
            setShowDetail(false);
            setDetailClosing(false);
            setEditingId(null);
            setOriginalData(null);
        }, 200);
    };

    const handleDetail = (siswa: SiswaAbsensi) => {
        setEditingId(siswa.id);
        const data = {
            jumlah_sakit: siswa.jumlah_sakit,
            jumlah_izin: siswa.jumlah_izin,
            jumlah_alpha: siswa.jumlah_alpha
        };
        setEditData(data);
        setOriginalData(data);
        setShowDetail(true);
    };

    return (
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Absensi Siswa</h1>

                {/* Header Informasi Kelas */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Kelas: {kelasNama}</h2>
                            <p className="text-sm text-gray-600">Isi jumlah absensi untuk setiap siswa.</p>
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
                                    placeholder="Pencarian" value={searchQuery}
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

                {/* Tabel Absensi */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[600px] table-auto text-sm">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIS</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NISN</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Sakit</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Izin</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Alpha</th>
                                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Memuat data...</td>
                                </tr>
                            ) : currentSiswa.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        Belum ada siswa di kelas ini.
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
                                            {siswa.sudah_diinput ? siswa.jumlah_sakit : <span className="text-gray-400">–</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle">
                                            {siswa.sudah_diinput ? siswa.jumlah_izin : <span className="text-gray-400">–</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle">
                                            {siswa.sudah_diinput ? siswa.jumlah_alpha : <span className="text-gray-400">–</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                                            {editingId === siswa.id ? (
                                                <button
                                                    onClick={() => handleSave(siswa.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
                                                >
                                                    <Pencil size={16} />
                                                    <span className="hidden sm:inline">Simpan</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(siswa)}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
                                                >
                                                    <Pencil size={16} />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                            )}
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

            {/* Modal Detail */}
            {showDetail && editingId !== null && (
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
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Absensi</h2>
                            <button
                                onClick={closeDetail}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Tutup modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            {(() => {
                                const siswa = siswaList.find(s => s.id === editingId);
                                if (!siswa) return null;
                                const sudah = siswa.sudah_diinput;
                                return (
                                    <>
                                        <div className="flex flex-col items-center mb-4">
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                                                <svg className="w-12 h-12 sm:w-20 sm:h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center break-words">
                                                {siswa.nama}
                                            </h3>
                                        </div>

                                        {/* Status Indikator */}
                                        <div className={`text-center mb-4 px-3 py-2 rounded-lg ${sudah ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            <span className="font-medium">
                                                {sudah ? '✅ Data absensi sudah diinput' : '⚠️ Belum diinput — harap simpan data'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                                <span className="font-semibold text-xs sm:text-sm">NIS</span>
                                                <span className="text-xs sm:text-sm">:</span>
                                                <span className="text-xs sm:text-sm col-span-2">{siswa.nis}</span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                                <span className="font-semibold text-xs sm:text-sm">NISN</span>
                                                <span className="text-xs sm:text-sm">:</span>
                                                <span className="text-xs sm:text-sm col-span-2">{siswa.nisn}</span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                                <span className="font-semibold text-xs sm:text-sm">Sakit</span>
                                                <span className="text-xs sm:text-sm">:</span>
                                                <span className="text-xs sm:text-sm col-span-2">
                                                    <input
                                                        type="number"
                                                        name="jumlah_sakit"
                                                        value={editData.jumlah_sakit}
                                                        onChange={handleChange}
                                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                                <span className="font-semibold text-xs sm:text-sm">Izin</span>
                                                <span className="text-xs sm:text-sm">:</span>
                                                <span className="text-xs sm:text-sm col-span-2">
                                                    <input
                                                        type="number"
                                                        name="jumlah_izin"
                                                        value={editData.jumlah_izin}
                                                        onChange={handleChange}
                                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                                                    />
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                                                <span className="font-semibold text-xs sm:text-sm">Alpha</span>
                                                <span className="text-xs sm:text-sm">:</span>
                                                <span className="text-xs sm:text-sm col-span-2">
                                                    <input
                                                        type="number"
                                                        name="jumlah_alpha"
                                                        value={editData.jumlah_alpha}
                                                        onChange={handleChange}
                                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex justify-end gap-2">
                                            <button
                                                onClick={closeDetail}
                                                className="px-4 sm:px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-xs sm:text-sm font-medium"
                                            >
                                                Tutup
                                            </button>
                                            <button
                                                onClick={() => handleSave(editingId)}
                                                className="px-4 sm:px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition text-xs sm:text-sm font-medium"
                                            >
                                                Simpan
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}