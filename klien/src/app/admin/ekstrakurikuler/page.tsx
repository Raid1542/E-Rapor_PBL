'use client';

import { useState, useEffect, ChangeEvent, ReactNode, FormEvent } from 'react';
import { Pencil, Plus, Search, Filter, X, Trash2, Download, Upload } from 'lucide-react';

interface Ekstrakurikuler {
  id: number;
  nama_ekstrakurikuler: string;
  pembina: string;
  tahun_pelajaran: string;
  jumlah_anggota: number;
}

interface FormData {
  nama_ekstrakurikuler: string;
  pembina: string;
  confirmData: boolean;
}

interface TahunAjaranData {
  tahun_ajaran_list: string[];
  tahun_ajaran_aktif: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export default function DataEkstrakurikulerPage() {
  const [ekskulList, setEkskulList] = useState<Ekstrakurikuler[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTambah, setShowTambah] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Tahun Ajaran
  const [tahunAjaranList, setTahunAjaranList] = useState<string[]>([]);
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    nama_ekstrakurikuler: '',
    pembina: '',
    confirmData: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // === Modal States ===
  const [showFilter, setShowFilter] = useState(false);
  const [filterClosing, setFilterClosing] = useState(false);
  const [filterValues, setFilterValues] = useState({
    pembina: ''
  });
  const [openedFilterValues, setOpenedFilterValues] = useState({
    pembina: ''
  });

  const [showImport, setShowImport] = useState(false);
  const [importClosing, setImportClosing] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // === Fetch Daftar Tahun Ajaran ===
  const fetchTahunAjaranList = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/admin/tahun-ajaran-list", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data: ApiResponse<TahunAjaranData> = await res.json();
      if (res.ok && data.success) {
        setTahunAjaranList(data.data.tahun_ajaran_list);
        setTahunAjaranAktif(data.data.tahun_ajaran_aktif);
      }
    } catch (err) {
      console.error('Error fetch tahun ajaran:', err);
      // Fallback jika API belum ada
      setTahunAjaranList(['2025/2026 (Aktif)', '2024/2025', '2023/2024']);
      setTahunAjaranAktif('2025/2026 (Aktif)');
    }
  };

  // === Fetch Data Ekstrakurikuler ===
  const fetchEkskul = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }
      const tahunParam = tahunAjaranAktif.replace(' (Aktif)', '');
      const res = await fetch(`http://localhost:5000/api/admin/ekstrakurikuler?tahun_ajaran=${encodeURIComponent(tahunParam)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data: ApiResponse<Ekstrakurikuler[]> = await res.json();
      if (res.ok && data.success) {
        setEkskulList(data.data);
      } else {
        alert('Gagal memuat data ekstrakurikuler: ' + (data.message || 'Error tidak diketahui'));
      }
    } catch (err) {
      console.error('Error fetch ekstrakurikuler:', err);
      alert('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaranList();
  }, []);

  useEffect(() => {
    if (tahunAjaranAktif) {
      fetchEkskul();
    }
  }, [tahunAjaranAktif]);

  const handleEdit = (ekskul: Ekstrakurikuler): void => {
    setEditId(ekskul.id);
    setFormData({
      nama_ekstrakurikuler: ekskul.nama_ekstrakurikuler,
      pembina: ekskul.pembina !== '-' ? ekskul.pembina : '',
      confirmData: false
    });
    setShowEdit(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama_ekstrakurikuler.trim()) {
      newErrors.nama_ekstrakurikuler = 'Nama ekstrakurikuler wajib diisi';
    }
    if (!formData.confirmData) {
      newErrors.confirmData = 'Harap centang kotak konfirmasi sebelum melanjutkan!';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTambah = async (): Promise<void> => {
    if (!validate()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis. Silakan login ulang.');
      return;
    }

    try {
      const tahunParam = tahunAjaranAktif.replace(' (Aktif)', '');
      const res = await fetch("http://localhost:5000/api/admin/ekstrakurikuler", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_ekstrakurikuler: formData.nama_ekstrakurikuler,
          pembina: formData.pembina || null,
          tahun_pelajaran: tahunParam
        })
      });

      if (res.ok) {
        alert("Ekstrakurikuler berhasil ditambahkan");
        setShowTambah(false);
        fetchEkskul();
        handleReset();
      } else {
        const err: { message?: string } = await res.json();
        alert(err.message || "Gagal menambah ekstrakurikuler");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleSubmitEdit = async (): Promise<void> => {
    if (!validate() || editId === null) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis. Silakan login ulang.');
      return;
    }

    try {
      const tahunParam = tahunAjaranAktif.replace(' (Aktif)', '');
      const res = await fetch(`http://localhost:5000/api/admin/ekstrakurikuler/${editId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_ekstrakurikuler: formData.nama_ekstrakurikuler,
          pembina: formData.pembina || null,
          tahun_pelajaran: tahunParam
        })
      });

      if (res.ok) {
        alert("Data ekstrakurikuler berhasil diperbarui");
        setShowEdit(false);
        setEditId(null);
        fetchEkskul();
        handleReset();
      } else {
        const err: { message?: string } = await res.json();
        alert(err.message || "Gagal memperbarui data ekstrakurikuler");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus ekstrakurikuler ini?')) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/ekstrakurikuler/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Ekstrakurikuler berhasil dihapus");
        fetchEkskul();
      } else {
        const err: { message?: string } = await res.json();
        alert(err.message || "Gagal menghapus ekstrakurikuler");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleReset = (): void => {
    setFormData({
      nama_ekstrakurikuler: '',
      pembina: '',
      confirmData: false
    });
    setErrors({});
  };

  const handleExport = (): void => {
    alert('Fitur ekspor akan segera tersedia');
  };

  // === Filter & Pencarian ===
  const filteredEkskul: Ekstrakurikuler[] = ekskulList.filter(ekskul => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      ekskul.nama_ekstrakurikuler.toLowerCase().includes(query) ||
      (ekskul.pembina && ekskul.pembina.toLowerCase().includes(query));
    const matchesPembina = !filterValues.pembina ||
      ekskul.pembina.toLowerCase().includes(filterValues.pembina.toLowerCase());
    return matchesSearch && matchesPembina;
  });

  const totalPages: number = Math.ceil(filteredEkskul.length / itemsPerPage);
  const startIndex: number = (currentPage - 1) * itemsPerPage;
  const endIndex: number = startIndex + itemsPerPage;
  const currentEkskul: Ekstrakurikuler[] = filteredEkskul.slice(startIndex, endIndex);

  // === Modal Handlers ===
  const resetFilter = () => {
    setFilterValues({ pembina: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const closeFilterModal = () => {
    setFilterClosing(true);
    setTimeout(() => {
      setFilterValues(openedFilterValues);
      setShowFilter(false);
      setFilterClosing(false);
    }, 200);
  };

  const closeImportModal = () => {
    setImportClosing(true);
    setTimeout(() => {
      setShowImport(false);
      setImportClosing(false);
    }, 200);
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      alert('Silakan pilih file Excel terlebih dahulu');
      return;
    }
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/ekstrakurikuler/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        alert(`Berhasil import ${result.total} data ekstrakurikuler!`);
        setShowImport(false);
        setImportFile(null);
        fetchEkskul();
      } else {
        alert('Gagal: ' + (result.message || 'Gagal import data'));
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Gagal terhubung ke server');
    }
  };

  // === Render Modal Form ===
  const renderModal = (isEdit: boolean): JSX.Element => (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${isEdit ? (showEdit && !showEdit ? 'opacity-0' : 'opacity-100') : (showTambah && !showTambah ? 'opacity-0' : 'opacity-100')}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isEdit) {
            setShowEdit(false);
            handleReset();
          } else {
            setShowTambah(false);
            handleReset();
          }
        }
      }}
    >
      <div className="absolute inset-0 bg-gray-900/70"></div>
      <div
        className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${isEdit ? (showEdit ? 'opacity-100 scale-100' : 'opacity-0 scale-95') : (showTambah ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}`}
      >
        <form onSubmit={(e) => { e.preventDefault(); if (isEdit) handleSubmitEdit(); else handleSubmitTambah(); }}>
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {isEdit ? 'Edit Data Ekstrakurikuler' : 'Tambah Data Ekstrakurikuler'}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (isEdit) {
                  setShowEdit(false);
                } else {
                  setShowTambah(false);
                }
                handleReset();
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Tutup modal"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start justify-between">
              <span><span className="text-red-500 font-bold">*</span> adalah kolom yang wajib diisi!</span>
              <button
                type="button"
                onClick={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.classList.add('hidden');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-gray-800">
              Harap centang kotak konfirmasi sebelum melanjutkan!
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Ekstrakurikuler <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_ekstrakurikuler"
                value={formData.nama_ekstrakurikuler}
                onChange={handleInputChange}
                placeholder="Contoh: Pramuka"
                className={`w-full border ${errors.nama_ekstrakurikuler ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 text-sm`}
              />
              {errors.nama_ekstrakurikuler && (
                <p className="text-red-500 text-xs mt-1">{errors.nama_ekstrakurikuler}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pembina
              </label>
              <input
                type="text"
                name="pembina"
                value={formData.pembina}
                onChange={handleInputChange}
                placeholder="Nama pembina"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Tahun Pelajaran:</span> {tahunAjaranAktif}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                *Tahun pelajaran mengikuti pilihan tahun ajaran di atas
              </p>
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmData"
                  checked={formData.confirmData}
                  onChange={handleInputChange}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Saya yakin sudah mengisi dengan benar
                </span>
              </label>
              {errors.confirmData && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmData}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (isEdit) setShowEdit(false); else setShowTambah(false);
                  handleReset();
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition text-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  if (showTambah) return renderModal(false);
  if (showEdit) return renderModal(true);

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Ekstrakurikuler</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Dropdown Tahun Ajaran */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
            <select
              value={tahunAjaranAktif}
              onChange={(e) => {
                setTahunAjaranAktif(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {tahunAjaranList.map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <button
              onClick={() => setShowTambah(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
            >
              <Plus size={20} /> Tambah Ekstrakurikuler
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

              <button
                onClick={() => {
                  setOpenedFilterValues({ ...filterValues });
                  setShowFilter(true);
                  setFilterClosing(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
              >
                <Filter size={20} /> Filter Ekstrakurikuler
              </button>

              <button
                onClick={() => {
                  setShowImport(true);
                  setImportClosing(false);
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
              >
                <Upload size={20} /> Import Ekstrakurikuler
              </button>
            </div>
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
            <table className="w-full min-w-[600px] table-auto text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama Ekstrakurikuler</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Pembina</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Jumlah Anggota</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : currentEkskul.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery ? 'Tidak ada data sesuai pencarian' : 'Tidak ada data ekstrakurikuler'}
                    </td>
                  </tr>
                ) : (
                  currentEkskul.map((ekskul, index) => (
                    <tr
                      key={ekskul.id}
                      className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                    >
                      <td className="px-4 py-3 text-center font-medium">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 font-medium">{ekskul.nama_ekstrakurikuler}</td>
                      <td className="px-4 py-3">{ekskul.pembina || '-'}</td>
                      <td className="px-4 py-3 text-center">{ekskul.jumlah_anggota}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEdit(ekskul)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
                          >
                            <Pencil size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(ekskul.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
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

          {/* Pagination */}
          <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredEkskul.length)} dari {filteredEkskul.length} data
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === Modal Filter === */}
      {showFilter && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${filterClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFilterModal();
          }}
        >
          <div className="absolute inset-0 bg-gray-900/70"></div>
          <div
            className={`relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${filterClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filter Ekstrakurikuler</h2>
              <button
                onClick={closeFilterModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Tutup filter"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pembina</label>
                <input
                  type="text"
                  placeholder="Cari pembina"
                  value={filterValues.pembina}
                  onChange={(e) => setFilterValues({ ...filterValues, pembina: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetFilter}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setFilterClosing(true);
                    setTimeout(() => {
                      setShowFilter(false);
                      setFilterClosing(false);
                    }, 200);
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition text-sm"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Modal Import === */}
      {showImport && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${importClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeImportModal();
          }}
        >
          <div className="absolute inset-0 bg-gray-900/70"></div>
          <div
            className={`relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${importClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Import Data Ekstrakurikuler</h2>
              <button
                onClick={closeImportModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Tutup import"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-600 mb-4">
                Format file: <strong>.xlsx</strong> atau <strong>.xls</strong>
              </p>
              <div className="mb-4">
                <a
                  href="http://localhost:5000/templates/template_import_ekstrakurikuler.xlsx"
                  download
                  className="text-blue-500 text-sm hover:underline flex items-center gap-1"
                >
                  📥 Unduh template Excel
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  Isi sesuai contoh, lalu simpan sebagai <strong>.xlsx</strong>
                </p>
              </div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {importFile ? (
                      <span className="font-medium text-blue-600">{importFile.name}</span>
                    ) : (
                      'Klik untuk pilih file'
                    )}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleImportExcel}
                  disabled={!importFile}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition ${!importFile ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  Import
                </button>
                <button
                  onClick={closeImportModal}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}