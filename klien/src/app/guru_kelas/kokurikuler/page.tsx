'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Pencil, X, Search } from 'lucide-react';

// Struktur data sesuai kebutuhan PTS dan PAS
interface KokurikulerData {
  // Untuk PAS
  mutabaah?: string;
  bpi?: string;
  literasi?: string;
  judul_proyek?: string;
  deskripsi_proyek?: string;
  // Untuk PTS
  mutabaah_nilai_angka?: number | null;
  mutabaah_grade?: 'A' | 'B' | 'C' | 'D' | null;
}

interface SiswaKokurikuler {
  id: number;
  nama: string;
  nis: string;
  nisn: string;
  kokurikuler: KokurikulerData;
}

export default function DataKokurikulerPage() {
  const [siswaList, setSiswaList] = useState<SiswaKokurikuler[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<KokurikulerData>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [kelasNama, setKelasNama] = useState<string>('Kelas Anda');
  const [detailClosing, setDetailClosing] = useState(false);
  const [semester, setSemester] = useState<string>('');
  const [jenisPenilaian, setJenisPenilaian] = useState<'pts' | 'pas'>('pas');

  useEffect(() => {
    const fetchKokurikuler = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Silakan login terlebih dahulu');
          return;
        }

        const res = await fetch(`http://localhost:5000/api/guru-kelas/kokurikuler/${jenisPenilaian}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSiswaList(data.data || []);
            setKelasNama(data.kelas || 'Kelas Anda');
            setSemester(data.semester || '');
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

    fetchKokurikuler();
  }, [jenisPenilaian]);

  const handleEdit = (siswa: SiswaKokurikuler) => {
    setEditingId(siswa.id);
    setEditData({ ...siswa.kokurikuler });
    setShowDetail(true);
  };

  const handleSave = async (siswaId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sesi login habis.');
        return;
      }

      const payload = { ...editData };

      const res = await fetch(`http://localhost:5000/api/guru-kelas/kokurikuler/${siswaId}/${jenisPenilaian}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Data kokurikuler berhasil disimpan');
        const updatedSiswa = siswaList.map(s =>
          s.id === siswaId ? { ...s, kokurikuler: editData } : s
        );
        setSiswaList(updatedSiswa);
        setShowDetail(false);
        setEditingId(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menyimpan data kokurikuler');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Gagal terhubung ke server');
    }
  };

  const handleFieldChange = (field: keyof KokurikulerData, value: string | number | null) => {
    setEditData(prev => ({ ...prev, [field]: value }));
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
    }, 200);
  };

  const kolomTampil = jenisPenilaian === 'pts'
    ? [
        { key: 'mutabaah', label: 'Mutaba’ah Yaumiyah' },
        { key: 'mutabaah_nilai_angka', label: 'Nilai Angka' },
        { key: 'mutabaah_grade', label: 'Grade' }
      ]
    : [
        { key: 'mutabaah', label: 'Mutaba’ah Yaumiyah' },
        { key: 'bpi', label: 'Mentoring Bina Pribadi Islam' },
        { key: 'literasi', label: 'Literasi' },
        { key: 'judul_proyek', label: 'Judul Proyek' },
        { key: 'deskripsi_proyek', label: 'Deskripsi Proyek' }
      ];

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Nilai Kokurikuler Siswa</h1>

        {/* Header Informasi Kelas */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Kelas: {kelasNama}</h2>
              <p className="text-sm text-gray-600">
                Semester: <span className="font-medium">{semester || '-'}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Pilih Jenis Penilaian */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Jenis Penilaian:</label>
                <select
                  value={jenisPenilaian}
                  onChange={(e) => setJenisPenilaian(e.target.value as 'pts' | 'pas')}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="pas">PAS</option>
                  <option value="pts">PTS</option>
                </select>
              </div>

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
                  placeholder="Cari siswa..."
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
          <table className="w-full min-w-[800px] table-auto text-sm">
            <thead>
              <tr>
                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIS</th>
                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NISN</th>
                {kolomTampil.map(col => (
                  <th key={col.key} className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6 + kolomTampil.length} className="px-4 py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : currentSiswa.length === 0 ? (
                <tr>
                  <td colSpan={6 + kolomTampil.length} className="px-4 py-8 text-center text-gray-500">
                    Belum ada siswa di kelas ini.
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
                    {kolomTampil.map(col => {
                      const value = siswa.kokurikuler[col.key as keyof typeof siswa.kokurikuler];
                      return (
                        <td key={col.key} className="px-3 py-3 text-center align-middle">
                          {value !== undefined && value !== null ? (
                            <div className="max-w-xs truncate" title={String(value)}>
                              {String(value)}
                            </div>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center align-middle whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(siswa)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
                      >
                        <Pencil size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Edit Kokurikuler ({jenisPenilaian.toUpperCase()})
              </h2>
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
                return (
                  <div className="space-y-4">
                    {kolomTampil.map(col => {
                      const value = editData[col.key as keyof KokurikulerData];

                      if (col.key === 'mutabaah_nilai_angka') {
                        return (
                          <div key={col.key} className="border rounded-lg p-3">
                            <label className="text-xs text-gray-600 block mb-1">{col.label} (0–100)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={value ?? ''}
                              onChange={(e) => handleFieldChange(col.key, e.target.value ? Number(e.target.value) : null)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            />
                          </div>
                        );
                      }

                      if (col.key === 'mutabaah_grade') {
                        return (
                          <div key={col.key} className="border rounded-lg p-3">
                            <label className="text-xs text-gray-600 block mb-1">{col.label} (A–D)</label>
                            <select
                              value={value ?? ''}
                              onChange={(e) => handleFieldChange(col.key, e.target.value || null)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            >
                              <option value="">Pilih</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                        );
                      }

                      // Textarea untuk semua field lainnya
                      return (
                        <div key={col.key} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm mb-2">{col.label}</h4>
                          <textarea
                            value={value ?? ''}
                            onChange={(e) => handleFieldChange(col.key, e.target.value)}
                            placeholder={`Masukkan ${col.label.toLowerCase()}...`}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            rows={col.key === 'deskripsi_proyek' ? 4 : 2}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={closeDetail}
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-xs sm:text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleSave(editingId!)}
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