'use client';
import { useState, useEffect } from 'react';
import { Search, Upload, X } from 'lucide-react';

// Tipe data siswa dalam rekapan nilai
interface SiswaRekapan {
    id: number;
    nama: string;
    nis: string;
    nilaiMapel: Record<string, number | null>; // key: kode_mapel
    rataRata: number | null;
    ranking: number | null;
}

export default function RekapanNilaiGuruKelasPage() {
    const [siswaList, setSiswaList] = useState<SiswaRekapan[]>([]);
    const [mapelList, setMapelList] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch data rekapan nilai
    const fetchRekapanNilai = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Silakan login terlebih dahulu');
                return;
            }

            const res = await fetch("http://localhost:5000/api/guru-kelas/rekapan-nilai", {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok && data.siswa && data.mapel_list) {
                const siswa: SiswaRekapan[] = data.siswa.map((s: any) => ({
                    id: s.id_siswa,
                    nama: s.nama,
                    nis: s.nis,
                    nilaiMapel: s.nilai_mapel || {},
                    rataRata: s.rata_rata != null ? parseFloat(s.rata_rata.toFixed(2)) : null,
                    ranking: s.ranking || null,
                }));
                const mapel: string[] = data.mapel_list;

                setSiswaList(siswa);
                setMapelList(mapel);
            } else {
                alert('Gagal memuat rekapan nilai: ' + (data.message || 'Error tidak dikenal'));
            }
        } catch (err) {
            console.error('Error fetch rekapan:', err);
            alert('Gagal terhubung ke server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRekapanNilai();
    }, []);

    // Filter berdasarkan pencarian DAN urutkan berdasarkan ranking
    const filteredSiswa = siswaList
        .filter((siswa) => {
            const q = searchQuery.toLowerCase().trim();
            return !q || siswa.nama.toLowerCase().includes(q) || siswa.nis.includes(q);
        })
        .sort((a, b) => {
            if (a.ranking === null && b.ranking === null) return 0;
            if (a.ranking === null) return 1;
            if (b.ranking === null) return -1;
            return a.ranking - b.ranking;
        });

    // Ekspor Excel
    const handleExportExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch("http://localhost:5000/api/guru-kelas/rekapan-nilai/export-excel", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal ekspor');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rekapan_nilai_kelas_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert('Gagal mengunduh file Excel');
        }
    };

    return (
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Rekapan Nilai Rapor</h1>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    {/* Tombol Aksi & Pencarian */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <button
                            onClick={handleExportExcel}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Upload size={20} /> Ekspor Excel
                        </button>

                        {/* Pencarian */}
                        <div className="relative flex-1 min-w-[200px] sm:min-w-[240px] max-w-[400px]">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Pencarian"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded pl-10 pr-10 py-2 text-sm"
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

                    {/* Tabel Rekapan Nilai */}
                    <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
                        <table className="w-full min-w-[600px] table-auto text-sm">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No</th>
                                    <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIS</th>
                                    {mapelList.map((kodeMapel) => (
                                        <th
                                            key={kodeMapel}
                                            className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold min-w-[60px]"
                                        >
                                            {kodeMapel}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Rata-rata</th>
                                    <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Ranking</th>
                                    {/* ❌ KOLOM "AKSI" DIHAPUS */}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5 + mapelList.length} className="px-4 py-8 text-center text-gray-500">
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : filteredSiswa.length === 0 ? (
                                    <tr>
                                        <td colSpan={5 + mapelList.length} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data siswa
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSiswa.map((siswa, index) => (
                                        <tr
                                            key={siswa.id}
                                            className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                                        >
                                            <td className="px-4 py-3 text-center align-middle">{index + 1}</td>
                                            <td className="px-4 py-3 align-middle font-medium">{siswa.nama}</td>
                                            <td className="px-4 py-3 text-center align-middle">{siswa.nis}</td>
                                            {mapelList.map((kodeMapel) => (
                                                <td key={kodeMapel} className="px-3 py-3 text-center align-middle">
                                                    {siswa.nilaiMapel[kodeMapel] !== null && siswa.nilaiMapel[kodeMapel] !== undefined
                                                        ? Math.floor(siswa.nilaiMapel[kodeMapel]!)
                                                        : '-'}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center align-middle font-medium">
                                                {siswa.rataRata !== null ? siswa.rataRata.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center align-middle">
                                                {siswa.ranking ? `${siswa.ranking}` : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}