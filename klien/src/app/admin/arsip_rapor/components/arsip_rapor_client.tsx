/**
 * Nama File: arsip_rapor_client.tsx
 * Fungsi: Komponen klien untuk mengelola arsip rapor oleh admin,
 *         mencakup pemilihan tahun ajaran, jenis penilaian (PTS/PAS), kelas,
 *         pengelolaan status (aktif/nonaktif/selesai), dan unduh dokumen rapor.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, AlertCircle, Play, Pause, Lock } from 'lucide-react';

interface TahunAjaran {
    id: number;
    tahun_ajaran: string;
    semester: 'Ganjil' | 'Genap';
    is_aktif: boolean;
    status_pts: 'nonaktif' | 'aktif' | 'selesai';
    status_pas: 'nonaktif' | 'aktif' | 'selesai';
}

interface Kelas {
    id_kelas: number;
    nama_kelas: string;
}

interface Siswa {
    id_siswa: number;
    nama: string;
    nis: string;
    nisn: string;
}

export default function ArsipRaporClient() {
    const API_BASE = 'http://localhost:5000/api';
    const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | null>(null);
    const [selectedJenisPenilaian, setSelectedJenisPenilaian] = useState<'PTS' | 'PAS' | null>(null);
    const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
    const [loadingTA, setLoadingTA] = useState(true);
    const [loadingKelas, setLoadingKelas] = useState(false);
    const [loadingSiswa, setLoadingSiswa] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // === Fetch Tahun Ajaran ===
    const fetchTahunAjaran = async () => {
        setLoadingTA(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Silakan login terlebih dahulu');
                return;
            }
            const res = await fetch(`${API_BASE}/admin/arsip-rapor/tahun-ajaran`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTahunAjaranList(
                    data.data.map((ta: any) => ({
                        id: ta.id_tahun_ajaran,
                        tahun_ajaran: ta.tahun_ajaran,
                        semester: ta.semester as 'Ganjil' | 'Genap',
                        is_aktif: ta.status === 'aktif',
                        status_pts: ta.status_pts,
                        status_pas: ta.status_pas,
                    }))
                );
            } else {
                throw new Error(data.message || 'Gagal memuat tahun ajaran');
            }
        } catch (err: any) {
            console.error('Error fetch tahun ajaran:', err);
            setError(err.message || 'Terjadi kesalahan saat memuat tahun ajaran');
        } finally {
            setLoadingTA(false);
        }
    };

    // === Fetch Kelas by Tahun Ajaran ===
    const fetchKelasByTA = async (tahunAjaranId: number) => {
        setLoadingKelas(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/admin/arsip-rapor/kelas?tahun_ajaran_id=${tahunAjaranId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setKelasList(data.data);
            } else {
                throw new Error(data.message || 'Gagal memuat kelas');
            }
        } catch (err: any) {
            console.error('Error fetch kelas:', err);
            setError(err.message || 'Terjadi kesalahan saat memuat kelas');
            setKelasList([]);
        } finally {
            setLoadingKelas(false);
        }
    };

    // === Fetch Siswa ===
    const fetchDaftarSiswa = async () => {
        if (!selectedTahunAjaran || !selectedKelas) {
            setSiswaList([]);
            setError('Silakan pilih Tahun Ajaran dan Kelas terlebih dahulu');
            return;
        }

        setLoadingSiswa(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${API_BASE}/admin/arsip-rapor/daftar-siswa/${selectedTahunAjaran}/${selectedKelas}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok && data.success) {
                setSiswaList(data.data);
            } else {
                throw new Error(data.message || 'Gagal memuat data siswa');
            }
        } catch (err: any) {
            console.error('Error fetch daftar siswa:', err);
            setError(err.message || 'Terjadi kesalahan saat memuat data siswa');
            setSiswaList([]);
        } finally {
            setLoadingSiswa(false);
        }
    };

    // === Handle Download Rapor ===
    const handleDownloadRapor = async (siswaId: number) => {
        const token = localStorage.getItem('token');
        if (!token || !selectedJenisPenilaian || !selectedTahunAjaran) {
            alert('Data tidak lengkap');
            return;
        }

        const ta = tahunAjaranList.find((t) => t.id === selectedTahunAjaran);
        if (!ta) return;

        try {
            const res = await fetch(
                `${API_BASE}/guru-kelas/generate-rapor/${siswaId}/${selectedJenisPenilaian}/${ta.semester}/${selectedTahunAjaran}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Gagal mengunduh rapor');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rapor_${selectedJenisPenilaian.toLowerCase()}_${ta.semester.toLowerCase()}_${siswaId}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error('Download error:', err);
            alert('Gagal mengunduh: ' + (err.message || 'Coba lagi nanti'));
        }
    };

    // === Atur Status Penilaian ===
    const handleUbahStatus = async (statusBaru: 'aktif' | 'nonaktif' | 'selesai') => {
        if (!selectedTahunAjaran || !selectedJenisPenilaian) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Silakan login terlebih dahulu');
            return;
        }

        setLoadingAction(true);
        try {
            const res = await fetch(`${API_BASE}/admin/atur-status-penilaian`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    jenis: selectedJenisPenilaian,
                    status: statusBaru,
                    tahun_ajaran_id: selectedTahunAjaran,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`Status berhasil diubah menjadi "${statusBaru}"`);
                fetchTahunAjaran();
            } else {
                throw new Error(data.message || 'Gagal mengubah status');
            }
        } catch (err: any) {
            console.error('Error ubah status:', err);
            alert('Gagal mengubah status: ' + (err.message || 'Coba lagi'));
        } finally {
            setLoadingAction(false);
        }
    };

    // === Arsipkan Rapor Permanen ===
    const handleArsipkanRapor = async () => {
        if (!selectedTahunAjaran || !selectedJenisPenilaian) {
            alert('Silakan pilih Tahun Ajaran dan Jenis Penilaian');
            return;
        }

        if (
            !window.confirm(
                `⚠️ PERHATIAN!\n\nAnda yakin ingin mengarsipkan dan mengunci ${selectedJenisPenilaian}?\n\n🔒 Setelah dikunci:\n- Guru TIDAK BISA mengedit nilai lagi\n- Status tidak bisa diubah kembali\n- Data akan permanen terkunci\n\nLanjutkan?`
            )
        ) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Silakan login terlebih dahulu');
            return;
        }

        setLoadingAction(true);
        try {
            const res = await fetch(`${API_BASE}/admin/arsipkan-rapor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    jenis: selectedJenisPenilaian,
                    semester: tahunAjaranList.find((t) => t.id === selectedTahunAjaran)?.semester || 'Ganjil',
                    tahun_ajaran_id: selectedTahunAjaran,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert('Rapor berhasil diarsipkan dan dikunci!');
                fetchTahunAjaran();
            } else {
                throw new Error(data.message || 'Gagal mengarsipkan rapor');
            }
        } catch (err: any) {
            console.error('Error arsipkan rapor:', err);
            alert('Gagal mengarsipkan rapor: ' + (err.message || 'Coba lagi.'));
        } finally {
            setLoadingAction(false);
        }
    };

    // === Effects ===
    useEffect(() => {
        fetchTahunAjaran();
    }, []);

    useEffect(() => {
        if (selectedTahunAjaran) {
            fetchKelasByTA(selectedTahunAjaran);
        } else {
            setKelasList([]);
            setSelectedKelas(null);
        }
    }, [selectedTahunAjaran]);

    useEffect(() => {
        if (selectedKelas) {
            fetchDaftarSiswa();
        } else {
            setSiswaList([]);
            setError(null);
        }
    }, [selectedKelas]);

    // === Helper: Status Display ===
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'aktif':
                return { text: 'Aktif', color: 'bg-green-100 text-green-800 border border-green-300' };
            case 'selesai':
                return { text: 'Terkunci', color: 'bg-gray-100 text-gray-700 border border-gray-300' };
            case 'nonaktif':
                return { text: 'Belum Dibuka', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' };
            default:
                return { text: 'Tidak Valid', color: 'bg-red-100 text-red-800 border border-red-300' };
        }
    };

    // === State UI ===
    const readyToPrint = selectedTahunAjaran && selectedJenisPenilaian && selectedKelas;
    const ta = tahunAjaranList.find((t) => t.id === selectedTahunAjaran);
    const statusSaatIni = selectedJenisPenilaian === 'PTS' ? ta?.status_pts : ta?.status_pas;

    return (
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Arsip Rapor</h1>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="space-y-4">
                        {/* Tahun Ajaran */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tahun Ajaran
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedTahunAjaran ?? ''}
                                    onChange={(e) => setSelectedTahunAjaran(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                    disabled={loadingTA}
                                >
                                    <option value="">-- Pilih Tahun Ajaran --</option>
                                    {tahunAjaranList
                                        .sort((a, b) => (b.is_aktif ? 1 : 0) - (a.is_aktif ? 1 : 0))
                                        .map((ta) => (
                                            <option key={ta.id} value={ta.id}>
                                                {ta.tahun_ajaran} {ta.semester}
                                                {ta.is_aktif ? ' (Aktif)' : ''}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            {loadingTA && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-600 mr-2"></div>
                                    Memuat...
                                </div>
                            )}
                        </div>

                        {/* Jenis Penilaian — Hanya tampil jika Tahun Ajaran sudah dipilih */}
                        {selectedTahunAjaran && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Penilaian
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedJenisPenilaian ?? ''}
                                        onChange={(e) => setSelectedJenisPenilaian(e.target.value as 'PTS' | 'PAS' | null)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        <option value="PTS">PTS (Penilaian Tengah Semester)</option>
                                        <option value="PAS">PAS (Penilaian Akhir Semester)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Kelas — Hanya tampil jika Jenis Penilaian sudah dipilih */}
                        {selectedJenisPenilaian && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kelas
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedKelas ?? ''}
                                        onChange={(e) => setSelectedKelas(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                        disabled={loadingKelas}
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {kelasList.map((kelas) => (
                                            <option key={kelas.id_kelas} value={kelas.id_kelas}>
                                                {kelas.nama_kelas}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {loadingKelas && (
                                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-600 mr-2"></div>
                                        Memuat...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        <AlertCircle size={18} />
                        <div>
                            <p className="text-sm font-medium">Terjadi Kesalahan</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tabel Data Siswa */}
                {readyToPrint ? (
                    loadingSiswa ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mb-3"></div>
                            <p className="text-gray-600">Memuat data arsip rapor...</p>
                        </div>
                    ) : siswaList.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-dashed border-gray-300">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Tidak ada data arsip rapor untuk filter ini.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Daftar Siswa {selectedJenisPenilaian} -{' '}
                                    {kelasList.find((k) => k.id_kelas === selectedKelas)?.nama_kelas}
                                </h2>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                <table className="w-full min-w-[500px] table-auto text-sm">
                                    <thead className="bg-gray-800 text-white">
                                        <tr>
                                            <th className="px-3 py-3 text-center font-semibold">No.</th>
                                            <th className="px-3 py-3 text-left font-semibold">Nama Siswa</th>
                                            <th className="px-3 py-3 text-center font-semibold">NIS</th>
                                            <th className="px-3 py-3 text-center font-semibold">NISN</th>
                                            <th className="px-3 py-3 text-center font-semibold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {siswaList.map((siswa, index) => (
                                            <tr
                                                key={siswa.id_siswa}
                                                className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                                            >
                                                <td className="px-3 py-3 text-center">{index + 1}</td>
                                                <td className="px-3 py-3 font-medium">{siswa.nama}</td>
                                                <td className="px-3 py-3 text-center">{siswa.nis}</td>
                                                <td className="px-3 py-3 text-center">{siswa.nisn}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() => handleDownloadRapor(siswa.id_siswa)}
                                                        className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1.5 rounded gap-1.5 min-w-[90px]"
                                                    >
                                                        <Download size={14} /> Unduh
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 p-4 bg-orange-100 rounded-lg text-sm text-orange-800">
                                <p className="font-medium mb-1.5">Catatan:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Rapor diunduh dalam format <strong>.docx</strong> (Microsoft Word)</li>
                                    <li>Buka dengan Microsoft Word untuk tampilan terbaik</li>
                                </ul>
                            </div>
                        </>
                    )
                ) : (
                    <div className="bg-orange-50 rounded-lg shadow-sm p-8 text-center border border-dashed border-orange-300">
                        <FileText className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                        <p className="text-orange-800">Pilih Filter untuk Menampilkan Arsip Rapor.</p>
                    </div>
                )}
            </div>
        </div>
    );
}