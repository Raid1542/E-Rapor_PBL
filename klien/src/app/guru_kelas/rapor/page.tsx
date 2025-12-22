'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';

interface Siswa {
    id: number;
    nama: string;
    nis: string;
    nisn: string;
}

export default function RaporGuruKelasPage() {
    useEffect(() => {
    document.title = "Data Rapor - E-Rapor";
  }, []);

    const [jenisPenilaian, setJenisPenilaian] = useState<'PTS' | 'PAS' | ''>('');
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [loading, setLoading] = useState(true);
    const [tahunAjaranInfo, setTahunAjaranInfo] = useState<{
        tahun_ajaran: string;
        semester: 'Ganjil' | 'Genap';
    } | null>(null);

    // === Ambil info tahun ajaran aktif (sekali saat load) ===
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
                        semester: ta.semester === 'genap' ? 'Genap' : 'Ganjil'
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

    // === Ambil daftar siswa saat jenis penilaian dipilih ===
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

    const handleGeneratePDF = async (siswaId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Silakan login terlebih dahulu');
            return;
        }

        try {
            const url = `http://localhost:5000/api/guru-kelas/rapor/generate?siswa_id=${siswaId}&jenis=${jenisPenilaian}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Gagal generate rapor');
            }

            const pdfBlob = await res.blob();
            const pdfUrl = URL.createObjectURL(pdfBlob);

            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `rapor_${siswaId}_${jenisPenilaian}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
            console.error('Error generate PDF:', err);
        }
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
                        onChange={(e) => setJenisPenilaian(e.target.value as 'PTS' | 'PAS')}
                        className="w-full md:w-72 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Pilih Jenis --</option>
                        <option value="PTS">PTS (Penilaian Tengah Semester)</option>
                        <option value="PAS">PAS (Penilaian Akhir Semester)</option>
                    </select>
                </div>

                {jenisPenilaian === '' ? (
                    <div className="mt-8 text-center py-10 bg-yellow-50 border border-dashed border-yellow-300 rounded-xl">
                        <p className="text-gray-700 text-lg font-medium max-w-md mx-auto">
                            Silakan pilih jenis penilaian (PTS/PAS) terlebih dahulu.
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
                                        <th className="px-4 py-3.5 text-center w-12">No.</th>
                                        <th className="px-4 py-3.5 text-center">Nama</th>
                                        <th className="px-4 py-3.5 text-center w-32">NIS</th>
                                        <th className="px-4 py-3.5 text-center w-40">Aksi</th>
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
                                                <button
                                                    onClick={() => handleGeneratePDF(siswa.id)}
                                                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition text-xs sm:text-sm gap-1.5 min-w-[100px]"
                                                >
                                                    <Download size={14} />
                                                    <span>Cetak Rapor</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Catatan Template */}
                        <div className="mt-6 p-4 bg-gray-100 rounded-xl text-sm text-gray-700">
                            <p className="font-medium mb-2">Catatan Template PDF:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    <strong>PTS</strong>: Format <em>Laporan Penilaian Tengah Semester</em>
                                </li>
                                <li>
                                    <strong>PAS Ganjil</strong>: Tanpa keterangan kenaikan kelas
                                </li>
                                <li>
                                    <strong>PAS Genap</strong>: Dengan keterangan <em>“Naik / Tidak Naik kelas”</em>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}