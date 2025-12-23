'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye } from 'lucide-react';

interface Siswa {
    id: number;
    nama: string;
    nis: string;
    nisn: string;
}

export default function RaporGuruKelasPage() {

    const [jenisPenilaian, setJenisPenilaian] = useState<string>('');
    const [activeReportType, setActiveReportType] = useState<string | null>(null); // ← TAMBAHAN
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [loading, setLoading] = useState(true);
    const [tahunAjaranInfo, setTahunAjaranInfo] = useState<{
        tahun_ajaran: string;
        semester: 'Ganjil' | 'Genap';
    } | null>(null);

    const getOptionsBySemester = () => {
        if (!tahunAjaranInfo) return [];
        const { semester } = tahunAjaranInfo;
        return [
            { value: `PTS-${semester.toLowerCase()}`, label: `Penilaian Tengah Semester (${semester})` },
            { value: `PAS-${semester.toLowerCase()}`, label: `Penilaian Akhir Semester (${semester})` }
        ];
    };

    // Ambil tahun ajaran aktif
    useEffect(() => {
        const fetchTahunAjaranAktif = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Silakan login terlebih dahulu');
                    return;
                }
                const res = await fetch("http://localhost:5000/api/guru-kelas/tahun-ajaran/aktif", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    const ta = data.data;
                    setTahunAjaranInfo({
                        tahun_ajaran: ta.tahun_ajaran,
                        semester: ta.semester === 'Genap' ? 'Genap' : 'Ganjil'
                    });
                } else {
                    alert('Gagal mengambil tahun ajaran aktif');
                }
            } catch (err) {
                console.error('Gagal ambil tahun ajaran aktif:', err);
                alert('Gagal terhubung ke server');
            }
        };
        fetchTahunAjaranAktif();
    }, []);

    // Reset activeReportType saat ganti jenisPenilaian
    useEffect(() => {
        setActiveReportType(null);
    }, [jenisPenilaian]);

    // Ambil daftar siswa
    useEffect(() => {
        if (!jenisPenilaian || !tahunAjaranInfo) return;
        const fetchSiswa = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Silakan login terlebih dahulu');
                    return;
                }
                const res = await fetch("http://localhost:5000/api/guru-kelas/siswa", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setSiswaList(data.data);
                } else {
                    alert('Gagal memuat data siswa');
                }
            } catch (err) {
                console.error('Error fetch siswa:', err);
                alert('Gagal terhubung ke server');
            } finally {
                setLoading(false);
            }
        };
        setLoading(true);
        fetchSiswa();
    }, [jenisPenilaian, tahunAjaranInfo]);


    // ← TAMBAHAN: FUNGSI AKTIFKAN LAPORAN
    const handleActivateReport = () => {
        if (!jenisPenilaian) {
            alert('Pilih jenis penilaian terlebih dahulu!');
            return;
        }

        const userConfirmed = window.confirm(
            `Anda yakin ingin mengaktifkan:\n"${getOptionsBySemester().find(opt => opt.value === jenisPenilaian)?.label}"?\n\nData yang Anda kelola akan mengacu pada laporan ini.`
        );

        if (userConfirmed) {
            setActiveReportType(jenisPenilaian);
        }
    };

    // TOMBOL "DOWNLOAD" → UNDUH FILE
    const handleDownloadRapor = (siswaId: number) => {
        // ← OPSIONAL: Anda bisa izinkan unduh meski belum aktif, atau blokir
        // Di sini saya IZINKAN unduh, karena unduh tidak mengubah data
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Silakan login terlebih dahulu');
            return;
        }
        const [jenis, semester] = jenisPenilaian.split('-');
        const url = `http://localhost:5000/api/guru-kelas/generate-rapor/${siswaId}/${jenis}/${semester}?view=false&token=${encodeURIComponent(token)}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapor_${jenis}_${semester}_${siswaId}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Cetak Rapor</h1>

                {/* Info Tahun Ajaran Aktif */}
                {tahunAjaranInfo && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm sm:text-base font-medium">
                            Tahun Ajaran Aktif: <span className="font-bold">{tahunAjaranInfo.tahun_ajaran}</span> | Semester: <span className="font-bold">{tahunAjaranInfo.semester}</span>
                        </p>
                    </div>
                )}

                {/* Dropdown Jenis Penilaian */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Penilaian
                    </label>
                    <select
                        value={jenisPenilaian}
                        onChange={(e) => setJenisPenilaian(e.target.value)}
                        className="w-full md:w-72 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Pilih Jenis --</option>
                        {tahunAjaranInfo &&
                            getOptionsBySemester().map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                    </select>
                </div>

                {/* ← TAMBAHAN: Tombol Aktifkan & Status */}
                {jenisPenilaian && (
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleActivateReport}
                            className={`px-4 py-2 rounded-lg font-medium text-sm ${
                                activeReportType === jenisPenilaian
                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {activeReportType === jenisPenilaian
                                ? 'Laporan Aktif ✅'
                                : 'Aktifkan Edit Laporan Ini'}
                        </button>
                        {activeReportType === jenisPenilaian && (
                            <span className="text-xs text-green-700 font-medium">
                                🔒 Sistem sedang menggunakan: {getOptionsBySemester().find(opt => opt.value === jenisPenilaian)?.label}
                            </span>
                        )}
                    </div>
                )}

                {jenisPenilaian === '' ? (
                    <div className="mt-8 text-center py-10 bg-yellow-50 border border-dashed border-yellow-300 rounded-xl">
                        <p className="text-gray-700 text-lg font-medium max-w-md mx-auto">
                            Silakan pilih jenis penilaian terlebih dahulu.
                        </p>
                    </div>
                ) : loading ? (
                    <div className="mt-8 text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mb-3"></div>
                        <p className="text-gray-600">Memuat daftar siswa...</p>
                    </div>
                ) : siswaList.length === 0 ? (
                    <div className="mt-8 text-center py-10 bg-gray-100 rounded-xl">
                        <p className="text-gray-700">Tidak ada siswa di kelas Anda.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Daftar Siswa — {jenisPenilaian}
                            </h2>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="w-full min-w-[500px] sm:min-w-[600px] table-auto text-sm">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th className="px-4 py-3.5 text-center">No.</th>
                                        <th className="px-4 py-3.5 text-center">Nama</th>
                                        <th className="px-4 py-3.5 text-center">NIS</th>
                                        <th className="px-4 py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {siswaList.map((siswa, index) => (
                                        <tr
                                            key={siswa.id}
                                            className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                                        >
                                            <td className="px-4 py-3.5 text-center font-medium">{index + 1}</td>
                                            <td className="px-4 py-3.5 font-medium text-gray-800">{siswa.nama}</td>
                                            <td className="px-4 py-3.5 text-center text-gray-700">{siswa.nis}</td>
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleDownloadRapor(siswa.id)}
                                                        className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded-lg transition text-xs sm:text-sm gap-1 min-w-[100px]"
                                                    >
                                                        <Download size={14} />
                                                        <span>Unduh (.docx)</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 p-4 bg-gray-100 rounded-xl text-sm text-gray-700">
                            <p className="font-medium mb-2">Catatan:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Rapor diunduh dalam format <strong>.docx</strong> (Microsoft Word)</li>
                                <li>Buka dengan Microsoft Word untuk tampilan terbaik</li>
                                <li>PAS Semester Genap mencantumkan status kenaikan kelas</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}