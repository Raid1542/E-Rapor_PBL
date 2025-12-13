'use client';

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Pencil, X, Search, BookOpen } from 'lucide-react';

// Sesuai RAPOR PAS.docx
const ASPEK_KOKUL = [
  'Mutabaaah Yaumiyah',
  'Mentoring Bina Pribadi Islam',
  'Literasi',
  'Sekolahku Indah Tanpa Sampah'
] as const;

type Aspek = typeof ASPEK_KOKUL[number];

interface KokurikulerData {
  aspek: Aspek;
  nilai_angka: number | null;
  grade: 'A' | 'B' | 'C' | 'D' | null;
  deskripsi: string;
}

interface SiswaKokurikuler {
  id: number;
  nama: string;
  nis: string;
  nisn: string;
  kokurikuler: KokurikulerData[];
}

export default function DataKokurikulerPage() {
  const [siswaList, setSiswaList] = useState<SiswaKokurikuler[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<KokurikulerData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [kelasNama, setKelasNama] = useState<string>('Kelas Anda');
  const [detailClosing, setDetailClosing] = useState(false);
  const [jenisPenilaian, setJenisPenilaian] = useState<'pts' | 'pas'>('pas');
  const [tahunAjaranId, setTahunAjaranId] = useState<number | null>(null);
  const [kelasId, setKelasId] = useState<number | null>(null);

  useEffect(() => {
    const fetchKokurikuler = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Silakan login terlebih dahulu');
          return;
        }

        const res = await fetch(`http://localhost:5000/api/guru-kelas/kokurikuler?jenis_penilaian=${jenisPenilaian}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSiswaList(data.data || []);
            setKelasNama(data.kelas || 'Kelas Anda');
            setTahunAjaranId(data.tahun_ajaran_id); 
            setKelasId(data.kelas_id);               
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
    setEditData([...siswa.kokurikuler]);
    setShowDetail(true);
  };

  const handleSave = async (siswaId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sesi login habis.');
        return;
      }

      const payload = {
        tahun_ajaran_id: tahunAjaranId,
        kelas_id: kelasId,
        jenis_penilaian,
        aspek_data: editData.map(item => ({
          aspek: item.aspek,
          nilai_angka: item.nilai_angka,
          grade: item.grade,
          deskripsi: item.deskripsi
        }))
      };

      const res = await fetch(`http://localhost:5000/api/guru-kelas/kokurikuler/${siswaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Data kokurikuler berhasil disimpan');
        // Refresh data
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

  const handleDeskripsiChange = (aspek: Aspek, value: string) => {
    setEditData(prev =>
      prev.map(item =>
        item.aspek === aspek ? { ...item, deskripsi: value } : item
      )
    );
  };

  const handleNilaiChange = (aspek: Aspek, field: 'nilai_angka' | 'grade', value: string) => {
    setEditData(prev =>
      prev.map(item =>
        item.aspek === aspek
          ? { ...item, [field]: field === 'nilai_angka' ? (value ? Number(value) : null) : (value || null) }
          : item
      )
    );
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
    // ... (sama seperti di absensi, bisa copy-paste)
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

  // Tentukan aspek yang ditampilkan berdasarkan jenis penilaian
  const aspekTampil = jenisPenilaian === 'pts' 
    ? ['Mutabaaah Yaumiyah'] 
    : ASPEK_KOKUL;

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Nilai Kokurikuler Siswa</h1>

        {/* Header Informasi Kelas */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Kelas: {kelasNama}</h2>
              <p className="text-sm text-gray-600">
                Isi catatan kokurikuler sesuai jenis penilaian:
                <span className="font-medium ml-1">
                  {jenisPenilaian === 'pts' ? 'PTS (Mutabaaah Yaumiyah)' : 'PAS (Semua Aspek)'}
                </span>
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
              <tr>
                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIS</th>
                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NISN</th>
                {aspekTampil.map(aspek => (
                  <th key={aspek} className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">
                    {aspek}
                  </th>
                ))}
                <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5 + aspekTampil.length} className="px-4 py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : currentSiswa.length === 0 ? (
                <tr>
                  <td colSpan={5 + aspekTampil.length} className="px-4 py-8 text-center text-gray-500">
                    Belum ada siswa di kelas ini.
                  </td>
                </tr>
              ) : (
                currentSiswa.map((siswa, index) => (
                  <tr
                    key={siswa.id}
                    className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                  >
                    <td className="px-4 py-3 text-center align-middle font-medium">{startIndex + index + 1}</td>
                    <td className="px-4 py-3 text-center align-middle font-medium">{siswa.nama}</td>
                    <td className="px-4 py-3 text-center align-middle">{siswa.nis}</td>
                    <td className="px-4 py-3 text-center align-middle">{siswa.nisn}</td>
                    {aspekTampil.map(aspek => {
                      const data = siswa.kokurikuler.find(k => k.aspek === aspek);
                      return (
                        <td key={aspek} className="px-4 py-3 text-center align-middle">
                          {data?.deskripsi ? (
                            <div className="max-w-xs truncate" title={data.deskripsi}>
                              {data.deskripsi}
                            </div>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                          {jenisPenilaian === 'pts' && data && (
                            <div className="text-xs text-gray-500 mt-1">
                              Nilai: {data.nilai_angka} | Grade: {data.grade}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Kokurikuler</h2>
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
                  <>
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <BookOpen className="w-12 h-12 sm:w-20 sm:h-20 text-gray-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center break-words">
                        {siswa.nama}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {jenisPenilaian === 'pts' ? 'PTS: Mutabaaah Yaumiyah' : 'PAS: Semua Aspek'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {aspekTampil.map(aspek => {
                        const data = editData.find(d => d.aspek === aspek);
                        if (!data) return null;

                        return (
                          <div key={aspek} className="border rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-2">{aspek}</h4>
                            <textarea
                              value={data.deskripsi}
                              onChange={(e) => handleDeskripsiChange(aspek, e.target.value)}
                              placeholder="Masukkan deskripsi..."
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              rows={3}
                            />
                            {jenisPenilaian === 'pts' && aspek === 'Mutabaaah Yaumiyah' && (
                              <div className="mt-3 grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-600">Nilai Angka (0–100)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.nilai_angka ?? ''}
                                    onChange={(e) => handleNilaiChange(aspek, 'nilai_angka', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">Grade (A–D)</label>
                                  <select
                                    value={data.grade ?? ''}
                                    onChange={(e) => handleNilaiChange(aspek, 'grade', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                                  >
                                    <option value="">Pilih</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

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
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}