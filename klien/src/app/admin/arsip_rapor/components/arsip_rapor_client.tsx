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
import {
    FileText,
    Download,
    AlertCircle,
    Play,
    Pause,
    Lock,
    X,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

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
            const res = await apiFetch(`${API_BASE}/admin/arsip-rapor/tahun-ajaran`);
            if (!res.ok) throw new Error('Gagal mengambil data tahun ajaran');
            const data = await res.json();
            if (!data?.success || !Array.isArray(data.data)) {
                console.warn('Respons tahun ajaran tidak valid:', data);
                setTahunAjaranList([]);
                return;
            }
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
            const res = await apiFetch(`${API_BASE}/admin/arsip-rapor/kelas?tahun_ajaran_id=${tahunAjaranId}`);
            if (!res.ok) throw new Error('Gagal memuat kelas');
            const data = await res.json();
            if (!data?.success || !Array.isArray(data.data)) {
                setKelasList([]);
                throw new Error('Respons kelas tidak valid');
            }
            setKelasList(data.data);
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
            const res = await apiFetch(
                `${API_BASE}/admin/arsip-rapor/daftar-siswa/${selectedTahunAjaran}/${selectedKelas}`
            );
            if (!res.ok) throw new Error('Gagal memuat data siswa');
            const data = await res.json();
            if (!data?.success || !Array.isArray(data.data)) {
                setSiswaList([]);
                throw new Error('Respons siswa tidak valid');
            }
            setSiswaList(data.data);
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
        if (!selectedJenisPenilaian || !selectedTahunAjaran) {
            alert('Data tidak lengkap');
            return;
        }

        const ta = tahunAjaranList.find((t) => t.id === selectedTahunAjaran);
        if (!ta) return;

        try {
            const res = await fetch(
                `${API_BASE}/guru-kelas/generate-rapor/${siswaId}/${selectedJenisPenilaian}/${ta.semester}/${selectedTahunAjaran}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                alert('⚠️ Sesi Anda telah berakhir. Silakan login kembali.');
                window.location.href = '/login';
                return;
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Gagal mengunduh rapor');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rapor_${selectedJenisPenilaian.toLowerCase()}_${ta.semester.toLowerCase()}.docx`;
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

        setLoadingAction(true);
        try {
            const res = await apiFetch(`${API_BASE}/admin/atur-status-penilaian`, {
                method: 'POST',
                body: JSON.stringify({
                    jenis: selectedJenisPenilaian,
                    status: statusBaru,
                    tahun_ajaran_id: selectedTahunAjaran,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Gagal mengubah status');
            }

            const data = await res.json();
            if (data.success) {
                alert(`Status berhasil diubah menjadi "${statusBaru}"`);
                fetchTahunAjaran();
            } else {
                throw new Error(data.message || 'Operasi gagal');
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

        const ta = tahunAjaranList.find((t) => t.id === selectedTahunAjaran);
        if (!ta) return;

        if (
            !window.confirm(
                `⚠️ PERHATIAN!\n\nAnda yakin ingin mengarsipkan dan mengunci ${selectedJenisPenilaian}?\n\n🔒 Setelah dikunci:\n- Guru TIDAK BISA mengedit nilai lagi\n- Status tidak bisa diubah kembali\n- Data akan permanen terkunci\n\nLanjutkan?`
            )
        ) {
            return;
        }

        setLoadingAction(true);
        try {
            const res = await apiFetch(`${API_BASE}/admin/arsipkan-rapor`, {
                method: 'POST',
                body: JSON.stringify({
                    jenis: selectedJenisPenilaian,
                    semester: ta.semester,
                    tahun_ajaran_id: selectedTahunAjaran,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Gagal mengarsipkan rapor');
            }

            const data = await res.json();
            if (data.success) {
                alert('Rapor berhasil diarsipkan dan dikunci!');
                fetchTahunAjaran();
            } else {
                throw new Error(data.message || 'Operasi arsip gagal');
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
                                    onChange={(e) =>
                                        setSelectedTahunAjaran(e.target.value ? Number(e.target.value) : null)
                                    }
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

                        {/* Jenis Penilaian */}
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

                        {/* Kelas */}
                        {selectedJenisPenilaian && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kelas
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedKelas ?? ''}
                                        onChange={(e) =>
                                            setSelectedKelas(e.target.value ? Number(e.target.value) : null)
                                        }
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

                {/* === PANEL KONTROL STATUS === */}
                {selectedTahunAjaran && selectedJenisPenilaian && ta && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            Kontrol Status {selectedJenisPenilaian}
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Status Saat Ini:</p>
                            <span
                                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusDisplay(statusSaatIni || 'nonaktif').color
                                    }`}
                            >
                                {getStatusDisplay(statusSaatIni || 'nonaktif').text}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-4">
                            {statusSaatIni !== 'aktif' && statusSaatIni !== 'selesai' && (
                                <button
                                    onClick={() => handleUbahStatus('aktif')}
                                    disabled={loadingAction}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md disabled:opacity-50"
                                >
                                    <Play size={14} /> Aktifkan {selectedJenisPenilaian}
                                </button>
                            )}

                            {statusSaatIni === 'aktif' && (
                                <button
                                    onClick={() => handleUbahStatus('nonaktif')}
                                    disabled={loadingAction}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-md disabled:opacity-50"
                                >
                                    <Pause size={14} /> Nonaktifkan
                                </button>
                            )}

                            {statusSaatIni === 'aktif' && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('⚠️ Apakah Anda yakin ingin menyelesaikan penilaian ini?\n\nSetelah diselesaikan, status bisa diubah kembali ke "Aktif" jika diperlukan.')) {
                                            handleUbahStatus('selesai');
                                        }
                                    }}
                                    disabled={loadingAction}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-700 text-white text-sm rounded-md disabled:opacity-50"
                                >
                                    <AlertCircle size={14} /> Selesaikan
                                </button>
                            )}
                        </div>

                        {statusSaatIni === 'selesai' && (
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleArsipkanRapor}
                                    disabled={loadingAction}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
                                >
                                    <Lock size={16} />
                                    Arsipkan & Kunci Permanen
                                </button>
                                <p className="mt-2 text-xs text-gray-600">
                                    Setelah dikunci, nilai tidak bisa diubah lagi oleh guru.
                                </p>
                            </div>
                        )}
                    </div>
                )}

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