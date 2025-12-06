'use client';
import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Pencil, Plus, Search, X } from 'lucide-react';

interface Kelas {
  id: number;
  nama_kelas: string;
  wali_kelas: string;
  fase: string;
  jumlah_siswa: number;
}

interface TahunAjaran {
  id: number;
  tahun_ajaran: string;
  semester: string;
  is_aktif: boolean;
}

interface FormDataType {
  nama_kelas: string;
  fase: string;
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
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<number | null>(null);
  const [selectedTahunAjaranAktif, setSelectedTahunAjaranAktif] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormDataType>({
    nama_kelas: '',
    fase: '',
    confirmData: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // === Fetch Tahun Ajaran ===
  const fetchTahunAjaran = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }
      const res = await fetch("http://localhost:5000/api/admin/tahun-ajaran", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const options = data.data.map((ta: any) => ({
          id: ta.id_tahun_ajaran,
          tahun_ajaran: ta.tahun_ajaran,
          semester: (ta.semester || 'ganjil').toLowerCase(),
          is_aktif: ta.status === 'aktif'
        }));
        setTahunAjaranList(options);
      }
    } catch (err) {
      console.error('Gagal ambil tahun ajaran:', err);
      alert('Gagal terhubung ke server');
    }
  };

  // === Fetch Data Kelas (berdasarkan tahun ajaran) ===
  const fetchKelas = async (tahunAjaranId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }
      const res = await fetch(`http://localhost:5000/api/admin/kelas?tahun_ajaran_id=${tahunAjaranId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKelasList(data.data);
      } else {
        alert('Gagal memuat data kelas: ' + (data.message || 'Tidak terotorisasi'));
      }
    } catch (err) {
      console.error('Error fetch kelas:', err);
      alert('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  // === Handle Form ===
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama_kelas?.trim()) newErrors.nama_kelas = 'Nama kelas wajib diisi';
    if (!formData.fase?.trim()) newErrors.fase = 'Fase wajib diisi';
    if (!formData.confirmData) newErrors.confirmData = 'Harap konfirmasi data';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTambah = async () => {
    if (!validate()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login telah habis. Silakan login ulang.');
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
        alert("Kelas berhasil ditambahkan");
        setShowTambah(false);
        if (selectedTahunAjaranId) fetchKelas(selectedTahunAjaranId);
        handleReset();
      } else {
        const error = await res.json();
        alert(error.message || "Gagal menambah kelas");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleEdit = (kelas: Kelas) => {
    setEditId(kelas.id);
    setFormData({
      nama_kelas: kelas.nama_kelas,
      fase: kelas.fase,
      confirmData: false
    });
    setShowEdit(true);
  };

  const handleSubmitEdit = async () => {
    if (!validate()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login telah habis. Silakan login ulang.');
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
        if (selectedTahunAjaranId) fetchKelas(selectedTahunAjaranId);
        handleReset();
      } else {
        const error = await res.json();
        alert(error.message || "Gagal memperbarui kelas");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleReset = () => {
    setFormData({
      nama_kelas: '',
      fase: '',
      confirmData: false
    });
    setErrors({});
  };

  // === Filtering & Pagination ===
  const filteredKelas = kelasList.filter((kelas) => {
    const query = searchQuery.toLowerCase().trim();
    return !query ||
      kelas.nama_kelas.toLowerCase().includes(query) ||
      (kelas.wali_kelas !== '-' && kelas.wali_kelas.toLowerCase().includes(query)) ||
      kelas.fase.toLowerCase().includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(filteredKelas.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKelas = filteredKelas.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages: ReactNode[] = [];
    const maxVisible = 5;
    if (currentPage > 1) {
      pages.push(<button key="prev" onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">«</button>);
    }
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{i}</button>);
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
      pages.push(<button key="next" onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">»</button>);
    }
    return pages;
  };

  // === Render Form Tambah/Edit ===
  const renderForm = (isEdit: boolean) => (
    <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-2xl mx-auto">
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
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_kelas"
                value={formData.nama_kelas}
                onChange={handleInputChange}
                placeholder="Contoh: 1A, 1G, 2B, dst"
                className={`w-full border ${errors.nama_kelas ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
              />
              {errors.nama_kelas && <p className="text-red-500 text-xs mt-1">{errors.nama_kelas}</p>}
            </div>
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
                className={`w-full border ${errors.fase ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
              />
              {errors.fase && <p className="text-red-500 text-xs mt-1">{errors.fase}</p>}
            </div>
          </div>
          <div className="mt-6">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="confirmData"
                checked={formData.confirmData}
                onChange={handleInputChange}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
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
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium"
              >
                Reset
              </button>
              <button
                onClick={isEdit ? handleSubmitEdit : handleSubmitTambah}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium"
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
          {/* Dropdown Tahun Ajaran */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Tahun Ajaran
            </label>
            <select
              value={selectedTahunAjaranId ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setSelectedTahunAjaranId(null);
                  setSelectedTahunAjaranAktif(false);
                  setLoading(false);
                  setKelasList([]);
                  return;
                }
                const id = Number(value);
                const selectedTa = tahunAjaranList.find(ta => ta.id === id);
                setSelectedTahunAjaranId(id);
                setSelectedTahunAjaranAktif(selectedTa?.is_aktif || false);
                setLoading(true);
                fetchKelas(id);
              }}
              className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {tahunAjaranList.map(ta => {
                const semesterDisplay = ta.semester === 'ganjil' ? 'Ganjil' : 'Genap';
                return (
                  <option key={ta.id} value={ta.id}>
                    {ta.tahun_ajaran} {semesterDisplay} {ta.is_aktif ? "(Aktif)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedTahunAjaranId === null ? (
            <div className="mt-8 text-center py-8 bg-yellow-50 border border-dashed border-yellow-300 rounded-lg">
              <p className="text-gray-700 text-lg font-medium">Silakan pilih Tahun Ajaran terlebih dahulu.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  {selectedTahunAjaranAktif && (
                    <button
                      onClick={() => setShowTambah(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
                    >
                      <Plus size={20} />
                      Tambah Kelas
                    </button>
                  )}
                </div>
                <div className="relative min-w-[200px] sm:min-w-[240px] max-w-[400px]">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="pencarian"
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

              <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
                <table className="w-full min-w-[600px] table-auto text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                      <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama Kelas</th>
                      <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Guru Kelas</th>
                      <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Fase</th>
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
                          <td className="px-4 py-3 text-center align-middle font-medium">{kelas.nama_kelas}</td>
                          <td className="px-4 py-3 text-center align-middle">
                            {kelas.wali_kelas === '-' ? 'Belum ditetapkan' : kelas.wali_kelas}
                          </td>
                          <td className="px-4 py-3 text-center align-middle">{kelas.fase}</td>
                          <td className="px-4 py-3 text-center align-middle">{kelas.jumlah_siswa}</td>
                          <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                            <button
                              onClick={() => handleEdit(kelas)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1.5 rounded flex items-center gap-1 transition text-sm"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredKelas.length > 0 && (
                <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
                  <div className="text-sm text-gray-600">
                    Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredKelas.length)} dari {filteredKelas.length} data
                  </div>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {renderPagination()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}