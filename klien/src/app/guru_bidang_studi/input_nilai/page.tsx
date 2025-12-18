'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Pencil, Eye, Search, X } from 'lucide-react';

// ====== TYPES ======
interface Mapel {
    mata_pelajaran_id: number;
    nama_mapel: string;
    jenis: 'wajib' | 'pilihan';
    bisa_input: boolean;
}

interface Kelas {
    kelas_id: number;
    nama_kelas: string;
}

interface NilaiSiswa {
    id: number;
    nama: string;
    nis: string;
    nisn: string;
    nilai_rapor: number;
    deskripsi: string;
    nilai: Record<number, number | null>;
}

interface Komponen {
    id_komponen: number;
    nama_komponen: string;
}

// ====== MAIN COMPONENT ======
export default function DataInputNilaiGuruBidangStudiPage() {
    // ====== STATE ======
    const [mapelList, setMapelList] = useState<Mapel[]>([]);
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [selectedMapelId, setSelectedMapelId] = useState<number | null>(null);
    const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
    const [siswaList, setSiswaList] = useState<NilaiSiswa[]>([]);
    const [filteredSiswa, setFilteredSiswa] = useState<NilaiSiswa[]>([]);
    const [komponenList, setKomponenList] = useState<Komponen[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMapel, setLoadingMapel] = useState(true);
    const [loadingKelas, setLoadingKelas] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [kelasNama, setKelasNama] = useState<string>('');
    const [editingSiswa, setEditingSiswa] = useState<NilaiSiswa | null>(null);
    const [editingNilai, setEditingNilai] = useState<Record<number, number | null>>({});
    const [showDetail, setShowDetail] = useState(false);
    const [detailSiswa, setDetailSiswa] = useState<NilaiSiswa | null>(null);
    const [detailClosing, setDetailClosing] = useState(false);
    const [saving, setSaving] = useState(false);

    // ====== FETCH MAPEL & KELAS ======
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token tidak ditemukan');
                return;
            }

            try {
                setLoadingMapel(true);
                setLoadingKelas(true);

                // Ambil daftar mata pelajaran
                const resMapel = await fetch('http://localhost:5000/api/guru-bidang-studi/atur-penilaian/mapel', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resMapel.ok) {
                    const dataMapel = await resMapel.json();
                    setMapelList(dataMapel.data || []);
                }

                // Ambil daftar kelas
                const resKelas = await fetch('http://localhost:5000/api/guru-bidang-studi/atur-penilaian/kelas', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resKelas.ok) {
                    const dataKelas = await resKelas.json();
                    setKelasList(dataKelas.data || []);
                }
            } catch (err) {
                console.error('Error fetch mapel/kelas:', err);
                alert('Gagal memuat data awal');
            } finally {
                setLoadingMapel(false);
                setLoadingKelas(false);
            }
        };

        fetchData();
    }, []);

    // ====== FETCH NILAI SAAT MAPEL & KELAS DIPILIH ======
    useEffect(() => {
        if (selectedMapelId === null || selectedKelasId === null) {
            setSiswaList([]);
            setFilteredSiswa([]);
            setKomponenList([]);
            setKelasNama('');
            return;
        }

        const fetchNilai = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Token tidak ditemukan');

                const res = await fetch(
                    `http://localhost:5000/api/guru-bidang-studi/nilai/${selectedMapelId}/${selectedKelasId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!res.ok) throw new Error('Gagal mengambil data nilai');

                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Operasi gagal');

                setSiswaList(data.siswaList || []);
                setFilteredSiswa(data.siswaList || []);
                setKomponenList(data.komponen || []);
                setKelasNama(data.kelas || '');
            } catch (err) {
                console.error('Error fetch nilai:', err);
                alert('Gagal memuat data nilai');
            } finally {
                setLoading(false);
            }
        };

        fetchNilai();
    }, [selectedMapelId, selectedKelasId]);

    // ====== FILTER SISWA ======
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
    }, [searchQuery, siswaList]);

    // ====== SIMPAN NILAI ======
    const simpanNilai = async () => {
    if (!editingSiswa || !selectedMapelId || !selectedKelasId) return;

    setSaving(true);
    try {
        const token = localStorage.getItem('token');
        const promises = [];

        for (const [komponenId, nilai] of Object.entries(editingNilai)) {
            if (nilai !== null) {
                const promise = fetch('http://localhost:5000/api/guru-bidang-studi/nilai', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        siswa_id: editingSiswa.id,
                        mapel_id: selectedMapelId,
                        komponen_id: Number(komponenId),
                        nilai: nilai
                    })
                });
                promises.push(promise);
            }
        }

        const responses = await Promise.all(promises);
        const allSuccess = responses.every(res => res.ok);
        if (!allSuccess) {
            throw new Error('Salah satu nilai gagal disimpan');
        }

        const res = await fetch(
            `http://localhost:5000/api/guru-bidang-studi/nilai/${selectedMapelId}/${selectedKelasId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.ok) {
            const data = await res.json();
            setSiswaList(data.siswaList || []);
            setFilteredSiswa(data.siswaList || []);
        }

        setEditingSiswa(null);
        alert('Nilai berhasil disimpan');
    } catch (err) {
        console.error('Error simpan nilai:', err);
        alert('Gagal menyimpan nilai. Silakan coba lagi.');
    } finally {
        setSaving(false);
    }
};

    const handleDetail = (siswa: NilaiSiswa) => {
        setDetailSiswa(siswa);
        setShowDetail(true);
    };

    // ====== PAGINATION ======
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(filteredSiswa.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSiswa = filteredSiswa.slice(startIndex, endIndex);

    const renderPagination = () => {
        const pages: ReactNode[] = [];
        const maxVisible = 5;
        if (currentPage > 1) {
            pages.push(<button key="prev" onClick={() => setCurrentPage(c => Math.max(1, c - 1))} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">«</button>);
        }
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>{i}</button>);
            }
        } else {
            pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>1</button>);
            if (currentPage > 3) pages.push(<span key="dots1" className="px-2 text-gray-600">...</span>);
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>{i}</button>);
            }
            if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
            pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>{totalPages}</button>);
        }
        if (currentPage < totalPages) {
            pages.push(<button key="next" onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">»</button>);
        }
        return pages;
    };

    // ====== RENDER ======
    return (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Input Nilai Siswa</h1>

                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                    {/* Dropdown Mapel & Kelas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Mata Pelajaran
                            </label>
                            {loadingMapel ? (
                                <div className="text-gray-500">Memuat...</div>
                            ) : (
                                <select
                                    value={selectedMapelId ?? ''}
                                    onChange={(e) => setSelectedMapelId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                    {mapelList.map((mapel) => (
                                        <option key={mapel.mata_pelajaran_id} value={mapel.mata_pelajaran_id}>
                                            {mapel.nama_mapel} ({mapel.jenis})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Kelas
                            </label>
                            {loadingKelas ? (
                                <div className="text-gray-500">Memuat...</div>
                            ) : (
                                <select
                                    value={selectedKelasId ?? ''}
                                    onChange={(e) => setSelectedKelasId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {kelasList.map((kelas) => (
                                        <option key={kelas.kelas_id} value={kelas.kelas_id}>
                                            {kelas.nama_kelas}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Tampilan Utama */}
                    {selectedMapelId && selectedKelasId ? (
                        <>
                            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
                                <div className="text-sm text-gray-600 flex flex-wrap items-center gap-1">
                                    <span className="font-medium">Kelas:</span>
                                    <span>{kelasNama}</span>
                                    <span>•</span>
                                    <span className="text-green-600 font-medium">Anda dapat mengedit nilai</span>
                                </div>

                                <div className="relative w-full sm:w-64">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari siswa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full border border-gray-300 rounded pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tabel Nilai */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
                                <table className="w-full min-w-full table-auto text-sm">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                                            <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[140px]">Nama</th>
                                            <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[100px]">NIS</th>
                                            <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[120px]">NISN</th>
                                            {komponenList.map(k => (
                                                <th key={k.id_komponen} className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[60px]">
                                                    {k.nama_komponen}
                                                </th>
                                            ))}
                                            <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[90px]">Nilai Rapor</th>
                                            <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[140px]">Deskripsi</th>
                                            <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[100px]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-500">Memuat data...</td></tr>
                                        ) : currentSiswa.length === 0 ? (
                                            <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-500">Tidak ada data siswa</td></tr>
                                        ) : (
                                            currentSiswa.map((siswa, index) => (
                                                <tr key={siswa.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                                    <td className="px-3 py-3 text-center align-middle font-medium">{startIndex + index + 1}</td>
                                                    <td className="px-3 py-3 text-center align-middle font-medium truncate" title={siswa.nama}>{siswa.nama}</td>
                                                    <td className="px-3 py-3 text-center align-middle truncate" title={siswa.nis}>{siswa.nis}</td>
                                                    <td className="px-3 py-3 text-center align-middle truncate" title={siswa.nisn}>{siswa.nisn}</td>
                                                    {komponenList.map(k => (
                                                        <td key={`${siswa.id}-${k.id_komponen}`} className="px-3 py-3 text-center align-middle font-medium">
                                                            {siswa.nilai[k.id_komponen] !== null && siswa.nilai[k.id_komponen] !== undefined ? siswa.nilai[k.id_komponen] : '-'}
                                                        </td>
                                                    ))}
                                                    <td className="px-3 py-3 text-center align-middle font-medium">{siswa.nilai_rapor}</td>
                                                    <td className="px-3 py-3 text-center align-middle truncate max-w-[150px]" title={siswa.deskripsi}>
                                                        {siswa.deskripsi}
                                                    </td>
                                                    <td className="px-3 py-3 text-center align-middle whitespace-nowrap">
                                                        <div className="flex justify-center gap-1">
                                                            <button
                                                                onClick={() => handleDetail(siswa)}
                                                                className="bg-green-400 hover:bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                                                            >
                                                                <Eye size={14} />
                                                                Lihat
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingSiswa(siswa);
                                                                    setEditingNilai({ ...siswa.nilai });
                                                                }}
                                                                className="px-2 py-1 rounded flex items-center gap-1 text-xs bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                                                            >
                                                                <Pencil size={14} />
                                                                Edit
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
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredSiswa.length)} dari {filteredSiswa.length} data
                                </div>
                                <div className="flex gap-1 flex-wrap justify-center sm:justify-end">
                                    {renderPagination()}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mt-6 sm:mt-8 text-center py-6 sm:py-8 bg-yellow-50 border border-dashed border-yellow-300 rounded-lg">
                            <p className="text-gray-700 text-base sm:text-lg font-medium">
                                Silakan pilih Mata Pelajaran dan Kelas terlebih dahulu.
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Edit */}
                {editingSiswa && (
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${detailClosing ? 'opacity-0' : 'opacity-100'} p-2 sm:p-4`}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setDetailClosing(true);
                                setTimeout(() => {
                                    setEditingSiswa(null);
                                    setDetailClosing(false);
                                }, 200);
                            }
                        }}
                    >
                        <div className="absolute inset-0 bg-gray-900/70"></div>
                        <div
                            className={`relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${detailClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        >
                            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Nilai: {editingSiswa.nama}</h2>
                                <button
                                    onClick={() => {
                                        setDetailClosing(true);
                                        setTimeout(() => {
                                            setEditingSiswa(null);
                                            setDetailClosing(false);
                                        }, 200);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    {komponenList.map(k => (
                                        <div key={k.id_komponen} className="flex items-center gap-2">
                                            <label className="w-20 sm:w-24 font-medium">{k.nama_komponen}:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={editingNilai[k.id_komponen] ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                    setEditingNilai(prev => ({ ...prev, [k.id_komponen]: val }));
                                                }}
                                                className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi:</label>
                                    <div className="p-2 bg-gray-100 rounded border border-gray-300 text-sm min-h-[60px]">
                                        {editingSiswa?.deskripsi || 'Belum ada deskripsi'}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setDetailClosing(true);
                                            setTimeout(() => {
                                                setEditingSiswa(null);
                                                setDetailClosing(false);
                                            }, 200);
                                        }}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={simpanNilai}
                                        disabled={saving}
                                        className={`px-4 py-2 rounded ${saving
                                            ? 'bg-blue-300 cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                    >
                                        {saving ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Detail */}
                {showDetail && detailSiswa && (
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${detailClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
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
                            className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${detailClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        >
                            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Siswa</h2>
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
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm min-w-[80px]">Nama</span>
                                        <span className="text-sm">:</span>
                                        <span className="text-sm flex-1 break-words">{detailSiswa.nama}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm min-w-[80px]">NIS</span>
                                        <span className="text-sm">:</span>
                                        <span className="text-sm flex-1 break-words">{detailSiswa.nis}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm min-w-[80px]">NISN</span>
                                        <span className="text-sm">:</span>
                                        <span className="text-sm flex-1 break-words">{detailSiswa.nisn}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm min-w-[80px]">Nilai Rapor</span>
                                        <span className="text-sm">:</span>
                                        <span className="text-sm font-medium">{detailSiswa.nilai_rapor}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm min-w-[80px]">Deskripsi</span>
                                        <span className="text-sm">:</span>
                                        <span className="text-sm flex-1 break-words">{detailSiswa.deskripsi}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold text-sm mb-3">Nilai Komponen:</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {komponenList.map(k => (
                                            <div key={k.id_komponen} className="bg-gray-50 rounded px-3 py-2">
                                                <div className="text-xs font-medium text-gray-600">{k.nama_komponen}</div>
                                                <div className="text-sm font-bold mt-1">
                                                    {detailSiswa.nilai[k.id_komponen] !== null && detailSiswa.nilai[k.id_komponen] !== undefined
                                                        ? detailSiswa.nilai[k.id_komponen]
                                                        : '-'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:gap-3">
                                    <button
                                        onClick={() => {
                                            setDetailClosing(true);
                                            setTimeout(() => {
                                                setShowDetail(false);
                                                setDetailClosing(false);
                                            }, 200);
                                        }}
                                        className="px-4 sm:px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-sm font-medium"
                                    >
                                        Tutup
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingSiswa(detailSiswa);
                                            setEditingNilai({ ...detailSiswa.nilai });
                                            setDetailClosing(true);
                                            setTimeout(() => {
                                                setShowDetail(false);
                                                setDetailClosing(false);
                                            }, 200);
                                        }}
                                        className="px-4 sm:px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded transition text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}