'use client';

import { useState, useEffect, ReactNode, useMemo } from 'react';
import { Pencil, X, Search, Award } from 'lucide-react';

interface KokurikulerData {
    mutabaah_nilai: number | null;
    mutabaah_grade: string | null;
    mutabaah_deskripsi: string | null;

    bpi_nilai: number | null;
    bpi_grade: string | null;
    bpi_deskripsi: string | null;

    literasi_nilai: number | null;
    literasi_grade: string | null;
    literasi_deskripsi: string | null;

    judul_proyek_nilai: number | null;
    judul_proyek_grade: string | null;
    judul_proyek_deskripsi: string | null;
    nama_judul_proyek: string | null;
}

interface SiswaKokurikuler {
    id: number;
    nama: string;
    nis: string;
    nisn: string;
    kokurikuler: KokurikulerData;
}

// Mapping ID aspek kokurikuler dari database
const ASPEK_ID = {
    mutabaah: 1,
    literasi: 2,
    bpi: 3,
    proyek: 4,
};

export default function DataKokurikulerPage() {

    const [siswaList, setSiswaList] = useState<SiswaKokurikuler[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDetail, setShowDetail] = useState(false);
    const [isDetailClosing, setIsDetailClosing] = useState(false); // ← tambahan untuk animasi
    const [detailId, setDetailId] = useState<number | null>(null);
    const [detailData, setDetailData] = useState<KokurikulerData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [kelasNama, setKelasNama] = useState<string>('Kelas Anda');
    const [semester, setSemester] = useState<string>('');
    const [kelasId, setKelasId] = useState<number | null>(null);
    const [tahunAjaranId, setTahunAjaranId] = useState<number | null>(null);
    const [gradeConfig, setGradeConfig] = useState<any[]>([]);

    // Fetch data kokurikuler siswa
    const fetchKokurikuler = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Silakan login terlebih dahulu');
                window.location.href = '/login';
                return;
            }

            const res = await fetch(`http://localhost:5000/api/guru-kelas/kokurikuler`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setSiswaList(data.data || []);
                    setKelasNama(data.kelas || 'Kelas Anda');
                    setSemester(data.semester || '');
                    setKelasId(data.kelasId || null);
                    setTahunAjaranId(data.tahunAjaranId || null);
                } else {
                    alert(data.message || 'Gagal memuat data kokurikuler');
                }
            } else {
                const error = await res.json();
                alert(error.message || 'Gagal memuat data kokurikuler');
            }
        } catch (err) {
            console.error('Error fetch kokurikuler:', err);
            alert('Gagal terhubung ke server');
        } finally {
            setLoading(false);
        }
    };

    // Fetch konfigurasi grade dari "Atur Penilaian"
    const fetchGradeConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/guru-kelas/atur-penilaian/kategori-kokurikuler', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setGradeConfig(data.data);
                }
            }
        } catch (err) {
            console.error('Gagal ambil konfigurasi grade:', err);
        }
    };

    // Hitung grade & deskripsi berdasarkan nilai dan id_aspek
    const getGradeByNilai = (nilai: number | null, aspekId: number) => {
        if (nilai === null) return { grade: null, deskripsi: null };

        const configForAspek = gradeConfig.filter((c) => c.id_aspek_kokurikuler === aspekId);
        for (const c of configForAspek) {
            if (nilai >= c.min_nilai && nilai <= c.max_nilai) {
                return { grade: c.grade, deskripsi: c.deskripsi };
            }
        }
        // Jika tidak cocok (seharusnya tidak terjadi)
        return { grade: null, deskripsi: null };
    };

    useEffect(() => {
        fetchKokurikuler();
        fetchGradeConfig();
    }, []);

    const handleDetail = (siswa: SiswaKokurikuler) => {
        setDetailId(siswa.id);
        setDetailData({ ...siswa.kokurikuler });
        setShowDetail(true);
        setIsDetailClosing(false); // reset animasi
    };

    const closeDetail = () => {
        setIsDetailClosing(true);
    };

    const handleSave = async (siswaId: number) => {
        if (!detailData) return;

        const originalSiswa = siswaList.find((s) => s.id === siswaId);
        if (!originalSiswa) {
            alert('Data siswa tidak ditemukan');
            closeDetail();
            return;
        }

        const hasChanges =
            detailData.mutabaah_nilai !== originalSiswa.kokurikuler.mutabaah_nilai ||
            detailData.bpi_nilai !== originalSiswa.kokurikuler.bpi_nilai ||
            detailData.literasi_nilai !== originalSiswa.kokurikuler.literasi_nilai ||
            detailData.judul_proyek_nilai !== originalSiswa.kokurikuler.judul_proyek_nilai ||
            detailData.nama_judul_proyek !== originalSiswa.kokurikuler.nama_judul_proyek;

        if (!hasChanges) {
            alert('Tidak ada perubahan data. Data tidak disimpan.');
            closeDetail();
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesi login habis.');
                return;
            }

            const res = await fetch(`http://localhost:5000/api/guru-kelas/kokurikuler/${siswaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mutabaah_nilai: detailData.mutabaah_nilai,
                    bpi_nilai: detailData.bpi_nilai,
                    literasi_nilai: detailData.literasi_nilai,
                    judul_proyek_nilai: detailData.judul_proyek_nilai,
                    nama_judul_proyek: detailData.nama_judul_proyek,
                    kelasId,
                    tahunAjaranId,
                    semester,
                }),
            });

            if (res.ok) {
                alert('Data kokurikuler berhasil disimpan');
                await fetchKokurikuler();
                closeDetail();
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menyimpan data kokurikuler');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Gagal terhubung ke server');
        }
    };

    const handleFieldChange = (field: keyof KokurikulerData, value: string) => {
        if (!detailData) return;

        if (field.endsWith('_nilai')) {
            const numValue = value === '' ? null : Number(value);
            if (value === '' || (numValue !== null && !isNaN(numValue) && numValue >= 0 && numValue <= 100)) {
                setDetailData((prev) => ({ ...prev!, [field]: numValue }));

                let aspekId: number | null = null;
                if (field === 'mutabaah_nilai') aspekId = ASPEK_ID.mutabaah;
                else if (field === 'bpi_nilai') aspekId = ASPEK_ID.bpi;
                else if (field === 'literasi_nilai') aspekId = ASPEK_ID.literasi;
                else if (field === 'judul_proyek_nilai') aspekId = ASPEK_ID.proyek;

                if (aspekId !== null) {
                    const { grade, deskripsi } = getGradeByNilai(numValue, aspekId);
                    const gradeField = field.replace('_nilai', '_grade') as keyof KokurikulerData;
                    const descField = field.replace('_nilai', '_deskripsi') as keyof KokurikulerData;
                    setDetailData((prev) => ({
                        ...prev!,
                        [gradeField]: grade,
                        [descField]: deskripsi,
                    }));
                }
            }
        } else if (field === 'nama_judul_proyek') {
            setDetailData((prev) => ({ ...prev!, [field]: value }));
        }
    };

    const filteredSiswa = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return siswaList.filter((siswa) => {
            return (
                !query ||
                siswa.nama.toLowerCase().includes(query) ||
                siswa.nis.includes(query) ||
                siswa.nisn.includes(query)
            );
        });
    }, [siswaList, searchQuery]);

    const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSiswa = filteredSiswa.slice(startIndex, endIndex);

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
                        key={`page-${i}`}
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
                    key="page-1"
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
                        key={`page-${i}`}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                    >
                        {i}
                    </button>
                );
            }
            if (currentPage < totalPages - 2)
                pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
            pages.push(
                <button
                    key={`page-${totalPages}`}
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

    return (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
                    Nilai Kokurikuler Siswa
                </h1>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Kelas: {kelasNama}</h2>
                            <p className="text-sm text-gray-600">
                                Silakan isi dan perbarui nilai kokurikuler siswa.
                            </p>
                        </div>
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
                        </div>
                    </div>
                </div>

                {/* Tabel Kokurikuler */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[600px] table-auto text-sm">
                        <thead>
                            <tr className="bg-gray-800 text-white">
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">No.</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">Nama</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">NIS</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">NISN</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">Mutaba’ah</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">BPI</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">Literasi</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">Judul Proyek</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3 text-center font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 sm:py-8 text-center text-gray-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : currentSiswa.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 sm:py-8 text-center text-gray-500">
                                        Belum ada siswa di kelas ini.
                                    </td>
                                </tr>
                            ) : (
                                currentSiswa.map((siswa, index) => (
                                    <tr
                                        key={siswa.id}
                                        className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                            } hover:bg-blue-50 transition`}
                                    >
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle font-medium">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle font-medium text-sm sm:text-base">
                                            {siswa.nama}
                                        </td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle text-sm">{siswa.nis}</td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle text-sm">{siswa.nisn}</td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle">
                                            {siswa.kokurikuler.mutabaah_nilai != null ? (
                                                <span className="font-medium">{siswa.kokurikuler.mutabaah_nilai}</span>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle">
                                            {siswa.kokurikuler.bpi_nilai != null ? (
                                                <span className="font-medium">{siswa.kokurikuler.bpi_nilai}</span>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle">
                                            {siswa.kokurikuler.literasi_nilai != null ? (
                                                <span className="font-medium">{siswa.kokurikuler.literasi_nilai}</span>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle">
                                            {siswa.kokurikuler.nama_judul_proyek ? (
                                                <span className="text-sm">{siswa.kokurikuler.nama_judul_proyek}</span>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 sm:px-4 sm:py-3 text-center align-middle whitespace-nowrap">
                                            <button
                                                onClick={() => handleDetail(siswa)}
                                                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1 rounded flex items-center justify-center gap-1 transition text-xs"
                                            >
                                                <Pencil size={14} />
                                                <span className="hidden sm:inline">Detail</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-sm">
                    <div className="text-gray-600">
                        Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredSiswa.length)} dari{' '}
                        {filteredSiswa.length} data
                    </div>
                    <div className="flex gap-1 flex-wrap justify-center">{renderPagination()}</div>
                </div>
            </div>

            {/* Modal Detail dengan Animasi */}
            {showDetail && detailData && (
                <div
                    className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${
                        isDetailClosing ? 'opacity-0' : 'opacity-100'
                    } p-3 sm:p-4`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeDetail();
                    }}
                    onTransitionEnd={() => {
                        if (isDetailClosing) {
                            setShowDetail(false);
                            setIsDetailClosing(false);
                            setDetailId(null);
                            setDetailData(null);
                        }
                    }}
                >
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div
                        className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${
                            isDetailClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}
                    >
                        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Nilai Kokurikuler</h2>
                            <button
                                onClick={closeDetail}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Tutup modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Mutaba’ah */}
                            <div className="border rounded-lg p-3">
                                <h3 className="font-semibold text-sm mb-2">Mutaba’ah Yaumiyah</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Nilai (0–100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={detailData.mutabaah_nilai ?? ''}
                                            onChange={(e) => handleFieldChange('mutabaah_nilai', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Grade</label>
                                        <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm">
                                            {detailData.mutabaah_grade ? (
                                                <div className="flex items-center">
                                                    <Award size={14} className="text-yellow-500 mr-1" />
                                                    <span className="font-bold">{detailData.mutabaah_grade}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-600 mb-1">Deskripsi</label>
                                    <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm whitespace-pre-wrap break-words min-h-[60px]">
                                        {detailData.mutabaah_deskripsi || <span className="text-gray-400">–</span>}
                                    </div>
                                </div>
                            </div>

                            {/* BPI */}
                            <div className="border rounded-lg p-3">
                                <h3 className="font-semibold text-sm mb-2">Mentoring BPI</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={detailData.bpi_nilai ?? ''}
                                            onChange={(e) => handleFieldChange('bpi_nilai', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm">
                                            {detailData.bpi_grade ? (
                                                <div className="flex items-center">
                                                    <Award size={14} className="text-yellow-500 mr-1" />
                                                    <span className="font-bold">{detailData.bpi_grade}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-600 mb-1">Deskripsi</label>
                                    <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm whitespace-pre-wrap break-words min-h-[60px]">
                                        {detailData.bpi_deskripsi || <span className="text-gray-400">–</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Literasi */}
                            <div className="border rounded-lg p-3">
                                <h3 className="font-semibold text-sm mb-2">Literasi</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={detailData.literasi_nilai ?? ''}
                                            onChange={(e) => handleFieldChange('literasi_nilai', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm">
                                            {detailData.literasi_grade ? (
                                                <div className="flex items-center">
                                                    <Award size={14} className="text-yellow-500 mr-1" />
                                                    <span className="font-bold">{detailData.literasi_grade}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-600 mb-1">Deskripsi</label>
                                    <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm whitespace-pre-wrap break-words min-h-[60px]">
                                        {detailData.literasi_deskripsi || <span className="text-gray-400">–</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Judul Proyek */}
                            <div className="border rounded-lg p-3">
                                <h3 className="font-semibold text-sm mb-2">Judul Proyek</h3>
                                <div className="mb-3">
                                    <label className="block text-xs text-gray-600 mb-1">Nama Kegiatan Proyek</label>
                                    <input
                                        type="text"
                                        value={detailData.nama_judul_proyek ?? ''}
                                        onChange={(e) =>
                                            setDetailData((prev) => ({ ...prev!, nama_judul_proyek: e.target.value }))
                                        }
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Contoh: Kebersihan Lingkungan"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Nilai (0–100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={detailData.judul_proyek_nilai ?? ''}
                                            onChange={(e) => handleFieldChange('judul_proyek_nilai', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Grade</label>
                                        <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm">
                                            {detailData.judul_proyek_grade ? (
                                                <div className="flex items-center">
                                                    <Award size={14} className="text-yellow-500 mr-1" />
                                                    <span className="font-bold">{detailData.judul_proyek_grade}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">–</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-600 mb-1">Deskripsi</label>
                                    <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm whitespace-pre-wrap break-words min-h-[60px]">
                                        {detailData.judul_proyek_deskripsi || <span className="text-gray-400">–</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Simpan */}
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={closeDetail}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-sm font-medium"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => detailId && handleSave(detailId)}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition text-sm font-medium"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}