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
import { FileText, Download, AlertCircle, Archive, Play, Pause, Lock } from 'lucide-react';

// Interfaces sesuai respons backend
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
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

    // === Fetch Tahun Ajaran (dengan status PTS/PAS) ===
    const fetchTahunAjaran = async () => {
        setLoadingTA(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/admin/arsip-rapor/tahun-ajaran`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const list = data.data.map((ta: any) => ({
                    id: ta.id_tahun_ajaran,
                    tahun_ajaran: ta.tahun_ajaran,
                    semester: ta.semester as 'Ganjil' | 'Genap',
                    is_aktif: ta.status === 'aktif',
                    status_pts: ta.status_pts,
                    status_pas: ta.status_pas,
                }));
                setTahunAjaranList(list);
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

    // === Ambil kelas berdasarkan tahun ajaran ===
    const fetchKelasByTA = async (tahunAjaranId: number) => {
        setLoadingKelas(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/admin/arsip-rapor/kelas?tahun_ajaran_id=${tahunAjaranId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

    // === Ambil daftar siswa ===
    const fetchDaftarSiswa = async () => {
        if (!selectedTahunAjaran || !selectedKelas) {
            setSiswaList([]);
            setError('Silakan pilih Tahun Ajaran dan Kelas terlebih dahulu');
            return;
        }

        setLoadingSiswa(true);
        setError(null);
        try {
            const res = await fetch(
                `${API_BASE}/admin/arsip-rapor/daftar-siswa/${selectedTahunAjaran}/${selectedKelas}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
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

    // === Arsipkan Rapor (ubah status jadi 'selesai') ===
    const handleArsipkanRapor = async () => {
        if (!selectedTahunAjaran || !selectedJenisPenilaian) {
            alert('Silakan pilih Tahun Ajaran dan Jenis Penilaian');
            return;
        }

        const ta = tahunAjaranList.find((t) => t.id === selectedTahunAjaran);
        if (!ta) return;

        setLoadingAction(true);
        try {
            const res = await fetch(`${API_BASE}/admin/arsipkan-rapor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    jenis: selectedJenisPenilaian,
                    semester: ta.semester,
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

    // === Atur Status Penilaian Manual (aktif / nonaktif) ===
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

    // === Fungsi download ===
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

    const readyToPrint = selectedTahunAjaran && selectedJenisPenilaian && selectedKelas;
    const ta = tahunAjaranList.find((t) => t.id === selectedTahunAjaran);
    const statusSaatIni = selectedJenisPenilaian === 'PTS' ? ta?.status_pts : ta?.status_pas;

    // Status display helper
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'aktif':
                return { text: 'Aktif', color: 'bg-green-100 text-green-800' };
            case 'selesai':
                return { text: 'Terkunci', color: 'bg-gray-200 text-gray-700' };
            case 'nonaktif':
                return { text: 'Belum Dibuka', color: 'bg-yellow-100 text-yellow-800' };
            default:
                return { text: 'Tidak Valid', color: 'bg-red-100 text-red-800' };
        }
    };

    return (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Arsip Rapor</h1>

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Tahun Ajaran */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Ajaran</label>
                            <select
                                value={selectedTahunAjaran ?? ''}
                                onChange={(e) =>
                                    setSelectedTahunAjaran(e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                        {/* Jenis Penilaian */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Penilaian</label>
                            <select
                                value={selectedJenisPenilaian ?? ''}
                                onChange={(e) => setSelectedJenisPenilaian(e.target.value as 'PTS' | 'PAS' | null)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                disabled={!selectedTahunAjaran}
                            >
                                <option value="">-- Pilih Jenis --</option>
                                <option value="PTS">PTS (Penilaian Tengah Semester)</option>
                                <option value="PAS">PAS (Penilaian Akhir Semester)</option>
                            </select>
                        </div>

                        {/* Kelas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                            <select
                                value={selectedKelas ?? ''}
                                onChange={(e) =>
                                    setSelectedKelas(e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                disabled={!selectedJenisPenilaian || loadingKelas}
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {kelasList.map((kelas) => (
                                    <option key={kelas.id_kelas} value={kelas.id_kelas}>
                                        {kelas.nama_kelas}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* PANEL KONTROL STATUS */}
                    {selectedTahunAjaran && selectedJenisPenilaian && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Status Display */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">Status Saat Ini:</span>
                                    <span
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusDisplay(statusSaatIni || 'nonaktif').color
                                            }`}
                                    >
                                        {getStatusDisplay(statusSaatIni || 'nonaktif').text}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {statusSaatIni !== 'aktif' && (
                                        <button
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        `Yakin ingin mengaktifkan ${selectedJenisPenilaian}?\n\nGuru akan bisa mengedit nilai.`
                                                    )
                                                ) {
                                                    handleUbahStatus('aktif');
                                                }
                                            }}
                                            disabled={loadingAction}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${loadingAction
                                                    ? 'bg-green-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 shadow-sm'
                                                }`}
                                        >
                                            <Play size={16} />
                                            Aktifkan
                                        </button>
                                    )}

                                    {statusSaatIni === 'aktif' && (
                                        <button
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        `Yakin ingin menonaktifkan ${selectedJenisPenilaian}?\n\nGuru tidak akan bisa mengedit nilai sementara.`
                                                    )
                                                ) {
                                                    handleUbahStatus('nonaktif');
                                                }
                                            }}
                                            disabled={loadingAction}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${loadingAction
                                                    ? 'bg-yellow-400 cursor-not-allowed'
                                                    : 'bg-yellow-600 hover:bg-yellow-700 shadow-sm'
                                                }`}
                                        >
                                            <Pause size={16} />
                                            Nonaktifkan
                                        </button>
                                    )}

                                    {statusSaatIni === 'aktif' && (
                                        <button
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        `⚠️ PERHATIAN!\n\nAnda yakin ingin mengarsipkan dan mengunci ${selectedJenisPenilaian}?\n\n🔒 Setelah dikunci:\n- Guru TIDAK BISA mengedit nilai lagi\n- Status tidak bisa diubah kembali\n- Data akan permanen terkunci\n\nLanjutkan?`
                                                    )
                                                ) {
                                                    handleArsipkanRapor();
                                                }
                                            }}
                                            disabled={loadingAction}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${loadingAction
                                                    ? 'bg-red-400 cursor-not-allowed'
                                                    : 'bg-red-600 hover:bg-red-700 shadow-sm'
                                                }`}
                                        >
                                            <Lock size={16} />
                                            Arsipkan & Kunci
                                        </button>
                                    )}

                                    {statusSaatIni === 'selesai' && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                            <Lock size={16} />
                                            <span className="font-medium">Data Terkunci Permanen</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-xs text-orange-800">
                                    <strong>Info:</strong>
                                    {statusSaatIni === 'nonaktif' &&
                                        ' Penilaian belum dibuka. Guru tidak bisa input nilai.'}
                                    {statusSaatIni === 'aktif' &&
                                        ' Penilaian sedang aktif. Guru bisa input/edit nilai.'}
                                    {statusSaatIni === 'selesai' &&
                                        ' Penilaian sudah ditutup dan dikunci. Data tidak bisa diubah.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Data Siswa */}
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
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
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
                                                className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    } hover:bg-blue-50 transition-colors`}
                                            >
                                                <td className="px-3 py-3 text-center">{index + 1}</td>
                                                <td className="px-3 py-3 font-medium text-gray-800">{siswa.nama}</td>
                                                <td className="px-3 py-3 text-center text-gray-700">{siswa.nis}</td>
                                                <td className="px-3 py-3 text-center text-gray-700">{siswa.nisn}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() => handleDownloadRapor(siswa.id_siswa)}
                                                        className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2.5 py-1.5 rounded-md transition gap-1.5 min-w-[90px]"
                                                    >
                                                        <Download size={14} />
                                                        <span>Unduh</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
                                <p className="font-medium mb-1.5">Catatan:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Rapor diunduh dalam format <strong>.docx</strong> (Microsoft Word)</li>
                                    <li>Buka dengan Microsoft Word untuk tampilan terbaik</li>
                                    <li>PAS Semester Genap mencantumkan status kenaikan kelas</li>
                                </ul>
                            </div>
                        </>
                    )
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-dashed border-gray-300">
                        <FileText className="w-14 h-14 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Silakan pilih filter untuk menampilkan arsip rapor.</p>
                    </div>
                )}
            </div>
        </div>
    );
}