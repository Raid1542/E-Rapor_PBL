'use client';
import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, Upload, X, Filter } from 'lucide-react';

// ====== TYPES ======
interface Pembelajaran {
  id: number;
  nama_mapel: string;
  nama_kelas: string;
  nama_guru: string;
  tahun_ajaran: string;
}

interface TahunAjaran {
  id: number;
  tahun_ajaran: string;
  semester: string;
  is_aktif: boolean;
}

interface DropdownItem {
  id: number;
  nama: string;
}

interface FormDataType {
  guru_id: string;
  mapel_id: string;
  kelas_id: string;
  confirmData: boolean;
}

// ====== MAIN COMPONENT ======
export default function DataPembelajaranPage() {
  // ====== STATE ======
  const [dataList, setDataList] = useState<Pembelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTambah, setShowTambah] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ====== DROPDOWN DATA ======
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<number | null>(null);
  const [selectedTahunAjaranAktif, setSelectedTahunAjaranAktif] = useState<boolean>(false);

  const [guruList, setGuruList] = useState<DropdownItem[]>([]);
  const [mapelList, setMapelList] = useState<DropdownItem[]>([]);
  const [kelasList, setKelasList] = useState<DropdownItem[]>([]);

  const [guruLoading, setGuruLoading] = useState(false);
  const [mapelLoading, setMapelLoading] = useState(false);
  const [kelasLoading, setKelasLoading] = useState(false);

  // ====== FORM & VALIDATION ======
  const [formData, setFormData] = useState<FormDataType>({
    guru_id: '',
    mapel_id: '',
    kelas_id: '',
    confirmData: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ====== FETCH DROPDOWN: TAHUN AJARAN ======
  const fetchTahunAjaran = async () => {
    try {
      const token = localStorage.getItem('token');
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

  // ====== FETCH DROPDOWN: GURU, MAPEL, KELAS ======
  const fetchGuruDropdown = async () => {
    setGuruLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:5000/api/admin/pembelajaran/dropdown/guru", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGuruList(data.data);
      }
    } catch (err) {
      console.error('Error fetch guru dropdown:', err);
    } finally {
      setGuruLoading(false);
    }
  };

  const fetchMapelDropdown = async (taId: number) => {
    setMapelLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/pembelajaran/dropdown/mapel?tahun_ajaran_id=${taId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMapelList(data.data);
      }
    } catch (err) {
      console.error('Error fetch mapel dropdown:', err);
    } finally {
      setMapelLoading(false);
    }
  };

  const fetchKelasDropdown = async () => {
    setKelasLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:5000/api/admin/dropdown", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKelasList(data.data);
      }
    } catch (err) {
      console.error('Error fetch kelas dropdown:', err);
    } finally {
      setKelasLoading(false);
    }
  };

  // ====== FETCH DATA PEMBELAJARAN ======
  const fetchData = async (taId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/pembelajaran?tahun_ajaran_id=${taId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const camelCased = data.results.map((item: any) => ({
          id: item.id_guru_bidang_studi,
          nama_mapel: item.nama_mapel,
          nama_kelas: item.nama_kelas,
          nama_guru: item.nama_guru,
          tahun_ajaran: item.tahun_ajaran
        }));
        setDataList(camelCased);
      }
    } catch (err) {
      console.error('Error fetch pembelajaran:', err);
      alert('Gagal memuat data pembelajaran');
    } finally {
      setLoading(false);
    }
  };

  // ====== EFFECTS ======
  useEffect(() => {
    fetchTahunAjaran();
    fetchKelasDropdown();
  }, []);

  useEffect(() => {
    if (selectedTahunAjaranId) {
      fetchMapelDropdown(selectedTahunAjaranId);
      fetchData(selectedTahunAjaranId);
    }
  }, [selectedTahunAjaranId]);

  // ====== EVENT HANDLERS ======
  const handleInputChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.guru_id) newErrors.guru_id = 'Pilih guru';
    if (!formData.mapel_id) newErrors.mapel_id = 'Pilih mata pelajaran';
    if (!formData.kelas_id) newErrors.kelas_id = 'Pilih kelas';
    if (!formData.confirmData) newErrors.confirmData = 'Harap konfirmasi data';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isEdit: boolean) => {
    if (!validate()) return;
    const token = localStorage.getItem('token');
    const url = isEdit
      ? `http://localhost:5000/api/admin/pembelajaran/${editId}`
      : `http://localhost:5000/api/admin/pembelajaran`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: Number(formData.guru_id),
          mapel_id: Number(formData.mapel_id),
          kelas_id: Number(formData.kelas_id),
          tahun_ajaran_id: selectedTahunAjaranId
        })
      });

      if (res.ok) {
        alert(isEdit ? 'Data pembelajaran berhasil diperbarui' : 'Data pembelajaran berhasil ditambahkan');
        if (selectedTahunAjaranId) fetchData(selectedTahunAjaranId);
        setShowTambah(false);
        setShowEdit(false);
        setFormData({ guru_id: '', mapel_id: '', kelas_id: '', confirmData: false });
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      alert('Gagal terhubung ke server');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data pembelajaran ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/pembelajaran/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Data pembelajaran berhasil dihapus');
        if (selectedTahunAjaranId) fetchData(selectedTahunAjaranId);
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menghapus data');
      }
    } catch (err) {
      alert('Gagal terhubung ke server');
    }
  };

  // ====== FILTERING & PAGINATION ======
  const filteredData = dataList.filter(item =>
    !searchQuery ||
    item.nama_mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nama_guru.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const renderPagination = () => {
    const pages: ReactNode[] = [];
    const maxVisible = 5;
    if (currentPage > 1) pages.push(<button key="prev" onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded">«</button>);
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border rounded ${currentPage === i ? 'bg-blue-500 text-white' : ''}`}>{i}</button>);
    } else {
      pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : ''}`}>1</button>);
      if (currentPage > 3) pages.push(<span key="dots1" className="px-2">...</span>);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border rounded ${currentPage === i ? 'bg-blue-500 text-white' : ''}`}>{i}</button>);
      if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="px-2">...</span>);
      pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : ''}`}>{totalPages}</button>);
    }
    if (currentPage < totalPages) pages.push(<button key="next" onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded">»</button>);
    return pages;
  };

  // ====== RENDER FORM ======
  const renderForm = (title: string, isEdit: boolean) => (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={() => { setShowTambah(false); setShowEdit(false); }} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Guru Pengampu <span className="text-red-500">*</span></label>
              <select
                name="guru_id"
                value={formData.guru_id}
                onChange={handleInputChange}
                className={`w-full border ${errors.guru_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
              >
                <option value="">-- Pilih --</option>
                {guruList.map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
              {errors.guru_id && <p className="text-red-500 text-xs mt-1">{errors.guru_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mata Pelajaran <span className="text-red-500">*</span></label>
              <select
                name="mapel_id"
                value={formData.mapel_id}
                onChange={handleInputChange}
                className={`w-full border ${errors.mapel_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
              >
                <option value="">-- Pilih --</option>
                {mapelList.map(m => (
                  <option key={m.id} value={m.id}>{m.nama}</option>
                ))}
              </select>
              {errors.mapel_id && <p className="text-red-500 text-xs mt-1">{errors.mapel_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Kelas <span className="text-red-500">*</span></label>
              <select
                name="kelas_id"
                value={formData.kelas_id}
                onChange={handleInputChange}
                className={`w-full border ${errors.kelas_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
              >
                <option value="">-- Pilih --</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
              {errors.kelas_id && <p className="text-red-500 text-xs mt-1">{errors.kelas_id}</p>}
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
              <span className="text-sm text-gray-700">Saya yakin data yang diisi sudah benar</span>
            </label>
            {errors.confirmData && <p className="text-red-500 text-xs mt-1">{errors.confirmData}</p>}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => { setShowTambah(false); setShowEdit(false); }}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={() => handleSubmit(isEdit)}
              className="flex-1 bg-blue-500 text-white py-2.5 rounded hover:bg-blue-600"
            >
              {isEdit ? 'Update' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (showTambah) return renderForm('Tambah Data Pembelajaran', false);
  if (showEdit) return renderForm('Edit Data Pembelajaran', true);

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Pembelajaran</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Dropdown Tahun Ajaran - Versi yang disesuaikan */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tahun Ajaran</label>
            <select
              value={selectedTahunAjaranId ?? ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                const ta = tahunAjaranList.find(t => t.id === id);
                setSelectedTahunAjaranId(id || null);
                setSelectedTahunAjaranAktif(!!ta?.is_aktif);
              }}
              className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-0"
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {tahunAjaranList.map(ta => (
                <option key={ta.id} value={ta.id}>
                  {ta.tahun_ajaran} {ta.semester === 'ganjil' ? 'Ganjil' : 'Genap'} {ta.is_aktif ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Pesan "Silakan pilih Tahun Ajaran terlebih dahulu" - Versi yang disesuaikan */}
          {selectedTahunAjaranId === null ? (
            <div className="mt-8 text-center py-8 bg-yellow-50 border border-dashed border-yellow-300 rounded-lg">
              <p className="text-gray-700 text-lg font-medium">Silakan pilih Tahun Ajaran terlebih dahulu.</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap justify-between gap-3 mb-4">
                {selectedTahunAjaranAktif && (
                  <button
                    onClick={() => setShowTambah(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <Plus size={18} /> Tambah Pembelajaran
                  </button>
                )}
                <div className="flex gap-3">
                  <div className="relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full border border-gray-300 rounded pl-10 pr-4 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[600px] table-auto text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white text-left">
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Mata Pelajaran</th>
                      <th className="px-4 py-3">Kelas</th>
                      <th className="px-4 py-3">Guru Pengampu</th>
                      {selectedTahunAjaranAktif && <th className="px-4 py-3 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center">Memuat data...</td></tr>
                    ) : currentData.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center">Tidak ada data pembelajaran</td></tr>
                    ) : (
                      currentData.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3">{startIndex + idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{item.nama_mapel}</td>
                          <td className="px-4 py-3">{item.nama_kelas}</td>
                          <td className="px-4 py-3">{item.nama_guru}</td>
                          {selectedTahunAjaranAktif && (
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditId(item.id);
                                    setFormData({
                                      guru_id: item.nama_guru ? String(item.id) : '',
                                      mapel_id: item.nama_mapel ? String(item.id) : '',
                                      kelas_id: item.nama_kelas ? String(item.id) : '',
                                      confirmData: false
                                    });
                                    setShowEdit(true);
                                  }}
                                  className="bg-yellow-400 text-gray-800 px-3 py-1 rounded flex items-center gap-1"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
                  </div>
                  <div className="flex gap-1">{renderPagination()}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}