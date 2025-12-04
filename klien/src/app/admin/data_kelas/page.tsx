'use client';

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Pencil, Plus, Search, Filter, X, Trash2 } from 'lucide-react';

interface Kelas {
  id: number;
  nama_kelas: string;
  fase: string;
  wali_kelas: string;
  jumlah_siswa: number;
}

interface FormData {
  nama_kelas: string;
  fase: string;
  wali_kelas_id: string; // ID guru yang dipilih
  confirmData: boolean;
}

export default function DataKelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTambah, setShowTambah] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Daftar guru kelas untuk dropdown
  const [guruKelasList, setGuruKelasList] = useState<{ id_guru: number; nama: string }[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    nama_kelas: '',
    fase: '',
    wali_kelas_id: '',
    confirmData: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // === Fetch Data Kelas ===
  const fetchKelas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }
      const res = await fetch("http://localhost:5000/api/admin/kelas", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKelasList(data.data);
      } else {
        alert('Gagal memuat data kelas: ' + (data.message || 'Error tidak diketahui'));
      }
    } catch (err) {
      console.error('Error fetch kelas:', err);
      alert('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  // === Fetch Daftar Guru Kelas (hanya yang punya role "guru kelas") ===
  const fetchGuruKelas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/admin/guru-kelas", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGuruKelasList(data.data);
      }
    } catch (err) {
      console.error('Error fetch guru kelas:', err);
    } finally {
      setLoadingGuru(false);
    }
  };

  useEffect(() => {
    fetchKelas();
    fetchGuruKelas();
  }, []);

  const handleEdit = (kelas: Kelas) => {
    setEditId(kelas.id);
    // Cari ID guru berdasarkan nama (ini tidak ideal, tapi untuk MVP bisa pakai nama sementara)
    // Di versi lanjut, kirim `wali_kelas_id` dari backend
    setFormData({
      nama_kelas: kelas.nama_kelas,
      fase: kelas.fase,
      wali_kelas_id: '', // 🔸 Asumsi: tidak bisa edit wali kelas langsung di form ini
      confirmData: false
    });
    setShowEdit(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama_kelas.trim()) newErrors.nama_kelas = 'Nama kelas wajib diisi';
    if (!formData.fase.trim()) newErrors.fase = 'Fase wajib diisi';
    if (!formData.confirmData) newErrors.confirmData = 'Harap konfirmasi data sebelum menyimpan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTambah = async () => {
    if (!validate()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis. Silakan login ulang.');
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/kelas", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_kelas: formData.nama_kelas,
          fase: formData.fase
        })
      });

      if (res.ok) {
        const newKelas = await res.json();

        // Jika wali kelas dipilih, simpan ke guru_kelas
        if (formData.wali_kelas_id) {
          await fetch(`http://localhost:5000/api/admin/kelas/${newKelas.id}/guru`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ guru_id: Number(formData.wali_kelas_id) })
          });
        }

        alert("Kelas berhasil ditambahkan");
        setShowTambah(false);
        fetchKelas();
        handleReset();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menambah kelas");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleSubmitEdit = async () => {
    if (!validate() || editId === null) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis. Silakan login ulang.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/kelas/${editId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_kelas: formData.nama_kelas,
          fase: formData.fase
        })
      });

      if (res.ok) {
        alert("Data kelas berhasil diperbarui");
        setShowEdit(false);
        setEditId(null);
        fetchKelas();
        handleReset();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal memperbarui data kelas");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/kelas/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Kelas berhasil dihapus");
        fetchKelas();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menghapus kelas");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleReset = () => {
    setFormData({
      nama_kelas: '',
      fase: '',
      wali_kelas_id: '',
      confirmData: false
    });
    setErrors({});
  };

  // === Filter & Pencarian ===
  const filteredKelas = kelasList.filter(kelas =>
    kelas.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kelas.fase.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kelas.wali_kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKelas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKelas = filteredKelas.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages: ReactNode[] = [];
    const maxVisible = 5;
    if (currentPage > 1) {
      pages.push(
        <button key="prev" onClick={() => setCurrentPage(c => c - 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">«</button>
      );
    }
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>1</button>);
      if (currentPage > 3) pages.push(<span key="dots1" className="px-2 text-gray-600">...</span>);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{i}</button>);
      }
      if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
      pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{totalPages}</button>);
    }
    if (currentPage < totalPages) {
      pages.push(<button key="next" onClick={() => setCurrentPage(c => c + 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">»</button>);
    }
    return pages;
  };

  // === Render Form Tambah/Edit ===
  const renderForm = (isEdit: boolean) => (
    <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Data Kelas</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEdit ? 'Edit Data Kelas' : 'Tambah Data Kelas'}
            </h2>
            <button
              onClick={() => {
                isEdit ? setShowEdit(false) : setShowTambah(false);
                handleReset();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Nama Kelas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_kelas"
                value={formData.nama_kelas}
                onChange={handleInputChange}
                placeholder="Contoh: Kelas 1 A"
                className={`w-full border ${errors.nama_kelas ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.nama_kelas && <p className="text-red-500 text-xs mt-1">{errors.nama_kelas}</p>}
            </div>
            {/* Fase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fase <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fase"
                value={formData.fase}
                onChange={handleInputChange}
                placeholder="Contoh: A, B, C"
                className={`w-full border ${errors.fase ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.fase && <p className="text-red-500 text-xs mt-1">{errors.fase}</p>}
            </div>
            {/* Wali Kelas (Hanya di Tambah, tidak di edit) */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Wali Kelas
                </label>
                <select
                  name="wali_kelas_id"
                  value={formData.wali_kelas_id}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Wali Kelas --</option>
                  {guruKelasList.map(guru => (
                    <option key={guru.id_guru} value={guru.id_guru}>
                      {guru.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Konfirmasi */}
          <div className="mt-6">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="confirmData"
                checked={formData.confirmData}
                onChange={handleInputChange}
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
                onClick={() => {
                  isEdit ? setShowEdit(false) : setShowTambah(false);
                  handleReset();
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition"
              >
                Reset
              </button>
              <button
                onClick={isEdit ? handleSubmitEdit : handleSubmitTambah}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition"
              >
                {isEdit ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showTambah) return renderForm(false);
  if (showEdit) return renderForm(true);

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Kelas</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Baris Tombol & Pencarian */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <button
              onClick={() => setShowTambah(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
            >
              <Plus size={20} />
              Tambah Kelas
            </button>
            <div className="relative flex-1 min-w-[200px] sm:min-w-[240px] max-w-[400px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama kelas, fase, atau wali kelas..."
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
          </div>

          {/* Tabel Data */}
          <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
            <table className="w-full min-w-[600px] table-auto text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama Kelas</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Wali Kelas</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800 text-white z-10 font-semibold">Fase</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Jumlah Siswa</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Memuat data...</td>
                  </tr>
                ) : currentKelas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada data kelas</td>
                  </tr>
                ) : (
                  currentKelas.map((kelas, index) => (
                    <tr key={kelas.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                      <td className="px-4 py-3 text-center align-middle font-medium">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 align-middle font-medium">{kelas.nama_kelas}</td>
                      <td className="px-4 py-3 align-middle">{kelas.wali_kelas || '-'}</td>
                      <td className="px-4 py-3 align-middle font-mono">{kelas.fase}</td>
                      <td className="px-4 py-3 text-center align-middle">{kelas.jumlah_siswa}</td>
                      <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEdit(kelas)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
                          >
                            <Pencil size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(kelas.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 transition text-xs sm:text-sm"
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
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
              <div className="text-sm text-gray-600">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredKelas.length)} dari {filteredKelas.length} data
              </div>
              <div className="flex gap-1 flex-wrap justify-center">
                {renderPagination()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}