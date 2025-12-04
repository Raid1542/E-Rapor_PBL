'use client';

import React, { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Plus, Pencil, Trash2, Filter, X, Settings, Search } from 'lucide-react';

interface MataPelajaran {
  id: number;
  namaMapel: string;
  singkatan: string;
  kelompok: string;
}

interface TahunAjaran {
  id_tahun_ajaran: number;
  tahun_ajaran: string;
  semester: string;
  aktif: boolean; // ✅ wajib dari API
}

const DataMataPelajaran = () => {
  // === STATE UTAMA ===
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState<MataPelajaran | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // === TAHUN AJARAN ===
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | null>(null);
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState<boolean | null>(null);
  const [loadingTA, setLoadingTA] = useState(true);

  // === FORM ===
  const [formMapel, setFormMapel] = useState({
    namaMapel: '',
    singkatan: '',
    kelompok: ''
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const kelompokList = [
    'Mata Pelajaran Wajib',
    'Seni dan Budaya',
    'Muatan Lokal'
  ];

  // === Fetch Tahun Ajaran ===
  const fetchTahunAjaran = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/admin/tahun-ajaran", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTahunAjaranList(data.data);
      }
    } catch (err) {
      console.error('Error fetch tahun ajaran:', err);
    } finally {
      setLoadingTA(false);
    }
  };

  // === Fetch Mapel berdasarkan TA ===
  const fetchMapel = async (taId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }
      const res = await fetch(`http://localhost:5000/api/admin/mapel?tahun_ajaran_id=${taId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMapelList(Array.isArray(data.data) ? data.data : []);
      } else {
        alert('Gagal memuat data mata pelajaran: ' + (data.message || 'Error tidak diketahui'));
      }
    } catch (err) {
      console.error('Error fetch mapel:', err);
      alert('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const handlePilihTahunAjaran = (e: ChangeEvent<HTMLSelectElement>) => {
    const taId = Number(e.target.value);
    if (taId) {
      const ta = tahunAjaranList.find(t => t.id_tahun_ajaran === taId);
      setSelectedTahunAjaran(taId);
      setTahunAjaranAktif(ta?.aktif ?? false);
      setLoading(true);
      fetchMapel(taId);
    } else {
      setSelectedTahunAjaran(null);
      setTahunAjaranAktif(null);
      setMapelList([]);
      setLoading(false);
    }
  };

  // === VALIDASI & HANDLER ===
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formMapel.namaMapel?.trim()) newErrors.namaMapel = 'Nama wajib diisi';
    if (!formMapel.singkatan?.trim()) newErrors.singkatan = 'Singkatan wajib diisi';
    if (!formMapel.kelompok) newErrors.kelompok = 'Pilih kelompok';
    if (!isConfirmed) newErrors.confirmData = 'Harap konfirmasi data';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTambah = () => {
    setIsEditing(false);
    setSelectedMapel(null);
    setFormMapel({ namaMapel: '', singkatan: '', kelompok: '' });
    setIsConfirmed(false);
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (mapel: MataPelajaran) => {
    setIsEditing(true);
    setSelectedMapel(mapel);
    setFormMapel({
      namaMapel: mapel.namaMapel,
      singkatan: mapel.singkatan,
      kelompok: mapel.kelompok
    });
    setIsConfirmed(false);
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!tahunAjaranAktif) {
      alert('Tahun ajaran ini tidak aktif. Data hanya bisa dilihat.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      // Kirim ke API di sini nanti
      setMapelList(mapelList.filter(m => m.id !== id));
      alert('Data berhasil dihapus');
    }
  };

  const handleSubmit = async () => {
    if (!selectedTahunAjaran) {
      alert('Harap pilih tahun ajaran terlebih dahulu.');
      return;
    }
    if (!validate()) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        nama_mapel: formMapel.namaMapel,
        singkatan: formMapel.singkatan,
        kelompok: formMapel.kelompok,
        tahun_ajaran_id: selectedTahunAjaran
      };

      if (isEditing && selectedMapel) {
        // PUT /api/admin/mapel/{id}
        alert('Update berhasil (dummy)'); // Ganti dengan API call
        setMapelList(mapelList.map(m => m.id === selectedMapel.id ? { ...m, ...formMapel } : m));
      } else {
        // POST /api/admin/mapel
        const newMapel = {
          id: Math.max(...mapelList.map(m => m.id), 0) + 1,
          ...formMapel
        };
        setMapelList([...mapelList, newMapel]);
        alert('Data berhasil ditambahkan (dummy)');
      }
      setShowForm(false);
    } catch (err) {
      alert('Gagal menyimpan data');
    }
  };

  const handleBatal = () => {
    setShowForm(false);
    setFormMapel({ namaMapel: '', singkatan: '', kelompok: '' });
    setIsConfirmed(false);
    setErrors({});
  };

  // === FILTER & PAGINATION ===
  const filteredMapel = mapelList.filter(item =>
    item.namaMapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.singkatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kelompok.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredMapel.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMapel = filteredMapel.slice(startIndex, startIndex + itemsPerPage);

  const renderPagination = () => {
    const pages: ReactNode[] = [];
    const maxVisible = 5;

    if (currentPage > 1) {
      pages.push(
        <button key="prev" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">«</button>
      );
    }

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button key={i} onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>1</button>
      );
      if (currentPage > 3) pages.push(<span key="dots1" className="px-2 text-gray-600">...</span>);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(
          <button key={i} onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">»</button>
      );
    }
    return pages;
  };

  // === FORM RENDER ===
  if (showForm) {
    return (
      <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Data Mata Pelajaran</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Data Mata Pelajaran' : 'Tambah Data Mata Pelajaran'}
              </h2>
              <button onClick={handleBatal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formMapel.namaMapel}
                  onChange={(e) => setFormMapel({ ...formMapel, namaMapel: e.target.value })}
                  placeholder="Masukkan nama mata pelajaran"
                  className={`w-full border ${errors.namaMapel ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.namaMapel && <p className="text-red-500 text-xs mt-1">{errors.namaMapel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Singkatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formMapel.singkatan}
                  onChange={(e) => setFormMapel({ ...formMapel, singkatan: e.target.value.toUpperCase() })}
                  placeholder="Contoh: MTK, IPA, IPS"
                  className={`w-full border ${errors.singkatan ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.singkatan && <p className="text-red-500 text-xs mt-1">{errors.singkatan}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kelompok Mapel <span className="text-red-500">*</span>
                </label>
                <select
                  value={formMapel.kelompok}
                  onChange={(e) => setFormMapel({ ...formMapel, kelompok: e.target.value })}
                  className={`w-full border ${errors.kelompok ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">-- Pilih Kelompok --</option>
                  {kelompokList.map(kel => (
                    <option key={kel} value={kel}>{kel}</option>
                  ))}
                </select>
                {errors.kelompok && <p className="text-red-500 text-xs mt-1">{errors.kelompok}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Saya yakin data yang diisi sudah benar
                </span>
              </label>
              {errors.confirmData && <p className="text-red-500 text-xs mt-1">{errors.confirmData}</p>}
            </div>

            <div className="mt-6 sm:mt-8">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={handleBatal}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setFormMapel({ namaMapel: '', singkatan: '', kelompok: '' });
                    setIsConfirmed(false);
                    setErrors({});
                  }}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition"
                >
                  {isEditing ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === MAIN VIEW ===
  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Mata Pelajaran</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Dropdown Tahun Ajaran — 100% konsisten dengan DataGuruPage */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <select
              value={selectedTahunAjaran || ''}
              onChange={handlePilihTahunAjaran}
              className="w-full md:w-auto border border-gray-300 rounded px-3 py-2"
              disabled={loadingTA}
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {tahunAjaranList.map(ta => (
                <option key={ta.id_tahun_ajaran} value={ta.id_tahun_ajaran}>
                  {ta.tahun_ajaran} ({ta.semester})
                </option>
              ))}
            </select>
          </div>

          {/* Pesan jika belum pilih TA */}
          {!selectedTahunAjaran && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-700">
                Harap pilih tahun ajaran terlebih dahulu untuk melihat dan mengelola data mata pelajaran.
              </p>
            </div>
          )}

          {/* Jika TA dipilih */}
          {selectedTahunAjaran && (
            <>
              {/* 🔴 Pesan khusus untuk TA tidak aktif */}
              {!tahunAjaranAktif && (
                <div className="mb-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p className="text-sm text-yellow-700 font-medium">
                      📌 Tahun ajaran ini sudah berakhir. Data hanya bisa dilihat — tidak dapat ditambah, diubah, atau dihapus.
                    </p>
                  </div>
                </div>
              )}

              {/* 🔵 Tombol & Filter — hanya muncul jika TA aktif */}
              {tahunAjaranAktif && (
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <button
                    onClick={handleTambah}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <Plus size={20} />
                    Tambah Mapel
                  </button>
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
                          onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap">
                      <Filter size={20} /> Filter Data
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap">
                      <Settings size={20} /> Kelompok Mapel
                    </button>
                  </div>
                </div>
              )}

              {/* Tabel — selalu muncul (bisa dilihat di TA aktif & nonaktif) */}
              <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full min-w-[600px] table-auto text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                      <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama Mapel</th>
                      <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Singkatan</th>
                      <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Kelompok</th>
                      <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Memuat data...</td>
                      </tr>
                    ) : currentMapel.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          {searchQuery ? 'Tidak ada data sesuai pencarian' : 'Tidak ada data mata pelajaran'}
                        </td>
                      </tr>
                    ) : (
                      currentMapel.map((mapel, index) => (
                        <tr
                          key={mapel.id}
                          className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                        >
                          <td className="px-4 py-3 text-center font-medium">{startIndex + index + 1}</td>
                          <td className="px-4 py-3 font-medium">{mapel.namaMapel}</td>
                          <td className="px-4 py-3 text-center font-medium text-blue-600">{mapel.singkatan}</td>
                          <td className="px-4 py-3">{mapel.kelompok}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex justify-center gap-1 sm:gap-2">
                              <button
                                onClick={() => handleEdit(mapel)}
                                disabled={!tahunAjaranAktif}
                                className={`px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm ${
                                  tahunAjaranAktif
                                    ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                                }`}
                              >
                                <Pencil size={16} />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(mapel.id)}
                                disabled={!tahunAjaranAktif}
                                className={`px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm ${
                                  tahunAjaranAktif
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                                }`}
                              >
                                <Trash2 size={16} />
                                <span className="hidden sm:inline">Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination — selalu muncul */}
              <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
                <div className="text-sm text-gray-600">
                  Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredMapel.length)} dari {filteredMapel.length} data
                </div>
                <div className="flex gap-1 flex-wrap justify-center">
                  {renderPagination()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataMataPelajaran;~