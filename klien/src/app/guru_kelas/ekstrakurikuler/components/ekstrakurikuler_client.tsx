/**
 * Nama File: ekstrakurikuler_client.tsx
 * Fungsi: Komponen client-side untuk mengelola ekstrakurikuler siswa oleh guru kelas.
 *         Memungkinkan melihat, menambah, dan mengedit hingga 3 ekstrakurikuler per siswa,
 *         lengkap dengan deskripsi aktivitas. Data diambil dan disimpan ke backend API.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Muhammad Auriel Almayda - NIM: 3312401093
 * Tanggal: 15 September 2025
 */


'use client';

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Eye, Pencil, X, Search } from 'lucide-react';

// Tipe data
interface EkskulItem {
    id: number;
    nama: string;
    deskripsi: string;
}

interface SiswaEkskul {
    id: number;
    nama: string;
    nis: string;
    nisn: string;
    jenis_kelamin: string;
    ekskul: EkskulItem[];
    jumlah_ekskul: number;
}

interface EkskulOption {
    id_ekskul: number;
    nama_ekskul: string;
}

export default function DataEkstrakurikulerPage() {

    const [siswaList, setSiswaList] = useState<SiswaEkskul[]>([]);
    const [filteredSiswa, setFilteredSiswa] = useState<SiswaEkskul[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [viewSiswa, setViewSiswa] = useState<SiswaEkskul | null>(null);
    const [editData, setEditData] = useState<{ ekskulList: { ekskul_id: number; deskripsi: string; }[] }>({
        ekskulList: []
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [kelasNama, setKelasNama] = useState<string>('Kelas Anda');
    const [editClosing, setEditClosing] = useState(false);
    const [viewClosing, setViewClosing] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [daftarEkskul, setDaftarEkskul] = useState<EkskulOption[]>([]);

    // Tutup modal edit
    const closeEdit = () => {
        setEditClosing(true);
        setTimeout(() => {
            setShowEdit(false);
            setEditClosing(false);
            setEditId(null);
        }, 200);
    };

    // Tutup modal view
    const closeView = () => {
        setViewClosing(true);
        setTimeout(() => {
            setShowView(false);
            setViewClosing(false);
            setViewSiswa(null);
        }, 200);
    };

    // Fetch data
    useEffect(() => {
        const fetchEkskul = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Silakan login terlebih dahulu');
                    return;
                }

                const res = await fetch('http://localhost:5000/api/guru-kelas/ekskul', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setSiswaList(data.data || []);
                        setFilteredSiswa(data.data || []);
                        setDaftarEkskul(data.daftar_ekskul || []);
                        setKelasNama(data.kelas || 'Kelas Anda');
                    } else {
                        alert(data.message || 'Gagal memuat data ekstrakurikuler');
                    }
                } else {
                    const error = await res.json();
                    alert(error.message || 'Gagal memuat data ekstrakurikuler');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Gagal terhubung ke server');
            } finally {
                setLoading(false);
            }
        };

        fetchEkskul();
    }, []);

    // Filter pencarian
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
        setCurrentPage(1);
    }, [searchQuery, siswaList]);

    // Buka modal edit
    const handleEdit = (siswa: SiswaEkskul) => {
        const ekskulList = siswa.ekskul.map(e => ({
            ekskul_id: e.id,
            deskripsi: e.deskripsi
        }));
        while (ekskulList.length < 3) {
            ekskulList.push({ ekskul_id: 0, deskripsi: '' });
        }
        setEditId(siswa.id);
        setEditData({ ekskulList });
        setShowEdit(true);
    };

    // Buka modal view
    const handleView = (siswa: SiswaEkskul) => {
        setViewSiswa(siswa);
        setShowView(true);
    };

    // Simpan perubahan
    const handleSave = async () => {
        if (!editId) return;

        const validEkskul = editData.ekskulList.filter(item => item.ekskul_id > 0);

        if (validEkskul.length > 3) {
            alert('Maksimal 3 ekstrakurikuler per siswa');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesi login habis.');
                return;
            }

            const res = await fetch(`http://localhost:5000/api/guru-kelas/ekskul/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ekskulList: validEkskul })
            });

            if (res.ok) {
                alert('Data ekstrakurikuler berhasil disimpan');
                closeEdit();
                const updatedSiswa = siswaList.map(s =>
                    s.id === editId
                        ? {
                            ...s, ekskul: validEkskul.map(e => ({
                                id: e.ekskul_id,
                                nama: daftarEkskul.find(d => d.id_ekskul === e.ekskul_id)?.nama_ekskul || '—',
                                deskripsi: e.deskripsi
                            }))
                        }
                        : s
                );
                setSiswaList(updatedSiswa);
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menyimpan data ekstrakurikuler');
            }
        } catch (err) {
            alert('Gagal terhubung ke server');
        }
    };

    // Ubah input di modal edit
    const handleEkskulChange = (index: number, field: 'ekskul_id' | 'deskripsi', value: string | number) => {
        const newEkskulList = [...editData.ekskulList];
        newEkskulList[index] = { ...newEkskulList[index], [field]: value };
        setEditData({ ekskulList: newEkskulList });
    };

    const handleRemove = (index: number) => {
        const newEkskulList = [...editData.ekskulList];
        newEkskulList[index] = { ekskul_id: 0, deskripsi: '' };
        setEditData({ ekskulList: newEkskulList });
    };

    // Pagination
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Ekstrakurikuler Siswa</h1>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Kelas: {kelasNama}</h2>
                            <p className="text-sm text-gray-600">Kelola ekstrakurikuler siswa (maksimal 3 per siswa).</p>
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

                {/* Tabel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto text-sm">
                        <thead>
                            <tr>
                                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIS</th>
                                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NISN</th>
                                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Ekstrakurikuler</th>
                                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
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
                                        <td className="px-3 py-3 text-center align-middle font-medium">{startIndex + index + 1}</td>
                                        <td className="px-3 py-3 text-center align-middle font-medium">{siswa.nama}</td>
                                        <td className="px-3 py-3 text-center align-middle">{siswa.nis}</td>
                                        <td className="px-3 py-3 text-center align-middle">{siswa.nisn}</td>
                                        <td className="px-3 py-3 text-center align-middle">
                                            {siswa.ekskul.length === 0 ? (
                                                <span className="text-gray-400">Belum isi</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {siswa.ekskul.map((e, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded max-w-[120px] truncate cursor-help"
                                                            title={e.deskripsi || 'Tidak ada deskripsi'}
                                                        >
                                                            {e.nama}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-center align-middle">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(siswa)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded flex items-center justify-center gap-1 transition text-xs sm:text-sm min-w-[64px]"
                                                    title="Lihat deskripsi"
                                                >
                                                    <Eye size={14} />
                                                    <span className="hidden sm:inline">Detail</span>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(siswa)}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1.5 rounded flex items-center justify-center gap-1 transition text-xs sm:text-sm min-w-[64px]"
                                                >
                                                    <Pencil size={14} />
                                                    <span className="hidden sm:inline">Edit</span>
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

            {/* Modal View (Lihat Deskripsi) */}
{showView && viewSiswa && (
  <div
    className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${viewClosing ? 'opacity-0' : 'opacity-100'} p-4`}
    onClick={(e) => e.target === e.currentTarget && setViewClosing(true)}
    onTransitionEnd={() => {
      if (viewClosing) {
        setShowView(false);
        setViewClosing(false);
      }
    }}
  >
    <div className="absolute inset-0 bg-gray-900/70"></div>
    <div
      className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${viewClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Detail Ekstrakurikuler</h2>
        <button onClick={() => setViewClosing(true)} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <div className="p-6">
        {/* Info Siswa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <span className="font-medium text-gray-700">Nama:</span>
            <span className="ml-2">{viewSiswa.nama}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">NIS:</span>
            <span className="ml-2">{viewSiswa.nis}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">NISN:</span>
            <span className="ml-2">{viewSiswa.nisn}</span>
          </div>
        </div>

        {/* Daftar Ekstrakurikuler */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Eksrakurikuler yang Diikuti:</h3>
          {viewSiswa.ekskul.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum mengikuti ekstrakurikuler</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {viewSiswa.ekskul.map((e, i) => (
                <div key={i} className="bg-green-50 p-4 rounded border">
                  <div className="font-medium text-green-800">{e.nama}</div>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words">
                    {e.deskripsi || 'Tidak ada deskripsi'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Tutup */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setViewClosing(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
)}

            {/* Modal Edit */}
            {showEdit && editId !== null && (
                <div
                    className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${editClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeEdit();
                    }}
                >
                    <div className="absolute inset-0 bg-gray-900/70"></div>
                    <div
                        className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${editClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    >
                        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Ekstrakurikuler</h2>
                            <button
                                onClick={closeEdit}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Tutup"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            {editData.ekskulList.map((item, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <select
                                        value={item.ekskul_id}
                                        onChange={(e) => handleEkskulChange(idx, 'ekskul_id', Number(e.target.value))}
                                        className="border border-gray-300 rounded px-2 py-1 flex-1 text-sm"
                                    >
                                        <option value={0}>Pilih Ekstrakurikuler</option>
                                        {daftarEkskul.map(opt => (
                                            <option key={opt.id_ekskul} value={opt.id_ekskul}>
                                                {opt.nama_ekskul}
                                            </option>
                                        ))}
                                    </select>
                                    <textarea
                                        value={item.deskripsi}
                                        onChange={(e) => handleEkskulChange(idx, 'deskripsi', e.target.value)}
                                        placeholder="Deskripsi aktivitas..."
                                        className="border border-gray-300 rounded px-2 py-1 flex-1 text-sm"
                                        rows={2}
                                    />
                                    {item.ekskul_id > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(idx)}
                                            className="text-red-500 hover:text-red-700 flex items-center"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={closeEdit}
                                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-xs sm:text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 sm:px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition text-xs sm:text-sm font-medium"
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