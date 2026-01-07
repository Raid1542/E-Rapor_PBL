/**
 * Nama File: data_guru_client.tsx
 * Fungsi: Komponen klien untuk mengelola data guru,
 *         mencakup fitur tambah, edit, detail, import Excel, filter,
 *         pencarian, dan pagination.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022 & Frima Rizky Lianda - NIM: 3312401016
 * Tanggal: 15 September 2025
 */

'use client';

import { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Eye, Pencil, Upload, X, Plus, Search, Filter } from 'lucide-react';

interface Guru {
  id: number;
  nama: string;
  email?: string;
  niy?: string;
  nuptk?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenisKelamin?: string;
  alamat?: string;
  no_telepon?: string;
  statusGuru?: string;
  profileImage?: string;
  roles?: string[];
}

interface FormDataType {
  nama: string;
  niy: string;
  nuptk: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  no_telepon: string;
  email: string;
  roles: string[];
  statusGuru: string;
  confirmData: boolean;
}

const formatTanggalIndonesia = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  const hari = date.getDate();
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ][date.getMonth()];
  const tahun = date.getFullYear();
  return `${hari} ${bulan} ${tahun}`;
};

export default function DataGuruClient() {
  const formatGender = (g?: string | null) => {
    if (!g) return '-';
    const s = String(g).trim().toLowerCase();
    if (s === 'laki-laki' || s === 'laki laki' || s === 'laki' || s === 'l') return 'Laki-laki';
    if (s === 'perempuan' || s === 'p' || s === 'perempuan') return 'Perempuan';
    if (s.includes('laki')) return 'Laki-laki';
    if (s.includes('peremp')) return 'Perempuan';
    return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
  };

  // === State Utama ===
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showTambah, setShowTambah] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const [importClosing, setImportClosing] = useState(false);
  const [filterClosing, setFilterClosing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // === Filter ===
  const [filterValues, setFilterValues] = useState({
    role: '',
    jenisKelamin: '',
    status: ''
  });
  const [tempFilterValues, setTempFilterValues] = useState(filterValues);

  // === Fetch Guru ===
  const fetchGuru = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }
      const res = await fetch("http://localhost:5000/api/admin/guru", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const validRoles = ['guru kelas', 'guru bidang studi'];
        const list = Array.isArray(data.data)
          ? data.data.map((g: any) => {
            let normalizedStatus = 'aktif';
            if (typeof g.status === 'string') {
              normalizedStatus = g.status.trim().toLowerCase();
              if (normalizedStatus !== 'aktif') normalizedStatus = 'nonaktif';
            }
            let roles: string[] = [];
            if (g.roles) {
              const rawRoles = Array.isArray(g.roles) ? g.roles : [g.roles];
              roles = rawRoles
                .map((r: any) => String(r).toLowerCase().trim())
                .filter((r: string) => validRoles.includes(r));
            }
            return {
              id: g.id_user || g.id,
              nama: g.nama_lengkap || g.nama,
              email: g.email_sekolah || g.email,
              niy: g.niy,
              nuptk: g.nuptk,
              tempat_lahir: g.tempat_lahir || '',
              tanggal_lahir: g.tanggal_lahir || '',
              jenisKelamin: g.jenis_kelamin || '',
              alamat: g.alamat,
              no_telepon: g.no_telepon || '',
              statusGuru: normalizedStatus,
              roles: roles,
              profileImage: g.profileImage || null,
            };
          })
          : [];
        setGuruList(list);
      } else {
        alert('Gagal memuat data guru: ' + (data.message || 'Error tidak diketahui'));
      }
    } catch (err) {
      console.error('Error fetch guru:', err);
      alert('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuru();
  }, []);

  // === Form & Validasi ===
  const [formData, setFormData] = useState<FormDataType>({
    nama: '',
    niy: '',
    nuptk: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    alamat: '',
    no_telepon: '',
    email: '',
    roles: [],
    statusGuru: 'aktif',
    confirmData: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDetail = (guru: Guru) => {
    setSelectedGuru(guru);
    setShowDetail(true);
  };

  const handleEdit = (guru: Guru) => {
    setEditId(guru.id);
    setFormData({
      nama: guru.nama || '',
      email: guru.email || '',
      niy: guru.niy || '',
      nuptk: guru.nuptk || '',
      tempatLahir: guru.tempat_lahir || '',
      tanggalLahir: guru.tanggal_lahir || '',
      jenisKelamin: guru.jenisKelamin || '',
      alamat: guru.alamat || '',
      no_telepon: guru.no_telepon || '',
      roles: Array.isArray(guru.roles) ? guru.roles : [],
      statusGuru: guru.statusGuru === 'aktif' ? 'aktif' : 'nonaktif',
      confirmData: false
    });
    setShowEdit(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (isEdit: boolean): boolean => {
    const newErrors: Record<string, string> = {};

    // === WAJIB: SEMUA MODE ===
    if (!formData.nama?.trim()) {
      newErrors.nama = 'Nama wajib diisi';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email wajib diisi';
    }
    if (!formData.niy?.trim()) {
      newErrors.niy = 'NIY wajib diisi';
    }
    if (!formData.nuptk?.trim()) {
      newErrors.nuptk = 'NUPTK wajib diisi';
    }
    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = 'Pilih minimal satu role';
    }

    // === WAJIB: HANYA SAAT EDIT ===
    if (isEdit && (!formData.statusGuru || formData.statusGuru === '')) {
      newErrors.statusGuru = 'Status guru wajib dipilih';
    }

    // Konfirmasi akhir
    if (!formData.confirmData) {
      newErrors.confirmData = 'Harap konfirmasi data sebelum melanjutkan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTambah = async () => {
    if (!validate(false)) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis. Silakan login ulang.');
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/admin/guru", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_lengkap: formData.nama,
          email_sekolah: formData.email,
          roles: formData.roles,
          niy: formData.niy,
          nuptk: formData.nuptk,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          jenis_kelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          no_telepon: formData.no_telepon,
        })
      });
      if (res.ok) {
        alert("Data guru berhasil ditambahkan");
        setShowTambah(false);
        fetchGuru();
        handleReset();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menambah data guru");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleSubmitEdit = async () => {
    const originalData = guruList.find(g => g.id === editId);
    if (!originalData) return;
    const normalize = (str: string | null | undefined): string => (str || '').trim().toLowerCase();
    const hasChanged =
      formData.nama !== (originalData.nama || '') ||
      formData.email !== (originalData.email || '') ||
      formData.niy !== (originalData.niy || '') ||
      formData.nuptk !== (originalData.nuptk || '') ||
      formData.tempatLahir !== (originalData.tempat_lahir || '') ||
      formData.tanggalLahir !== (originalData.tanggal_lahir || '') ||
      normalize(formData.jenisKelamin) !== normalize(originalData.jenisKelamin) ||
      formData.alamat !== (originalData.alamat || '') ||
      formData.no_telepon !== (originalData.no_telepon || '') ||
      formData.statusGuru !== (originalData.statusGuru || 'aktif') ||
      JSON.stringify(formData.roles.sort()) !== JSON.stringify((originalData.roles || []).sort());
    if (!hasChanged) {
      alert("Tidak ada perubahan data.");
      return;
    }
    if (!validate(true)) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login habis.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/admin/guru/${editId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_lengkap: formData.nama,
          email_sekolah: formData.email,
          roles: formData.roles,
          niy: formData.niy,
          nuptk: formData.nuptk,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          jenis_kelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          no_telepon: formData.no_telepon,
          status: formData.statusGuru
        })
      });
      if (res.ok) {
        alert("Data guru berhasil diperbarui");
        setShowEdit(false);
        setEditId(null);
        fetchGuru();
        handleReset();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal memperbarui data guru");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleReset = () => {
    setFormData({
      nama: '',
      niy: '',
      nuptk: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: '',
      alamat: '',
      no_telepon: '',
      email: '',
      roles: [],
      statusGuru: 'aktif',
      confirmData: false
    });
    setErrors({});
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      alert('Pilih file Excel dulu.');
      return;
    }
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/guru/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        alert(`Berhasil import ${result.total} data guru!`);
        setShowImport(false);
        setImportFile(null);
        fetchGuru();
      } else {
        alert('Gagal: ' + (result.message || 'Gagal import data guru'));
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Gagal terhubung ke server');
    }
  };

  // === Filter & Pencarian ===
  const filteredGuru = guruList.filter((guru) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      guru.nama?.toLowerCase().includes(query) ||
      guru.email?.toLowerCase().includes(query) ||
      guru.niy?.includes(query) ||
      guru.nuptk?.includes(query) ||
      guru.tempat_lahir?.toLowerCase().includes(query) ||
      guru.no_telepon?.includes(query);
    const matchesRole = !filterValues.role ||
      (guru.roles && guru.roles.includes(filterValues.role));
    const matchesJenisKelamin = !filterValues.jenisKelamin ||
      (guru.jenisKelamin?.toLowerCase() === filterValues.jenisKelamin.toLowerCase());
    const matchesStatus = !filterValues.status ||
      (guru.statusGuru?.toLowerCase() === filterValues.status.toLowerCase());
    return matchesSearch && matchesRole && matchesJenisKelamin && matchesStatus;
  });

  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGuru = filteredGuru.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages: ReactNode[] = [];
    const maxVisible = 5;
    if (currentPage > 1) pages.push(
      <button key="prev" onClick={() => setCurrentPage(c => c - 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">«</button>
    );
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{i}</button>
        );
      }
    } else {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>1</button>
      );
      if (currentPage > 3) pages.push(<span key="dots1" className="px-2 text-gray-600">...</span>);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(
          <button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{i}</button>
        );
      }
      if (currentPage < totalPages - 2) pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 border border-gray-300 rounded ${currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}>{totalPages}</button>
      );
    }
    if (currentPage < totalPages) pages.push(
      <button key="next" onClick={() => setCurrentPage(c => c + 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">»</button>
    );
    return pages;
  };

  const resetFilter = () => {
    const empty = { role: '', jenisKelamin: '', status: '' };
    setFilterValues(empty);
    setTempFilterValues(empty);
  };

  const openFilterModal = () => {
    setTempFilterValues(filterValues);
    setShowFilter(true);
  };

  const applyFilter = () => {
    setFilterValues(tempFilterValues);
    setFilterClosing(true);
    setTimeout(() => {
      setShowFilter(false);
      setFilterClosing(false);
    }, 200);
  };

  const closeFilterModal = () => {
    setFilterClosing(true);
    setTimeout(() => {
      setShowFilter(false);
      setFilterClosing(false);
    }, 200);
  };

  // === Render Form ===
  const renderForm = (isEdit: boolean) => (
    <div className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Data Guru</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEdit ? 'Edit Data Guru' : 'Tambah Data Guru'}
            </h2>
            <button onClick={() => { isEdit ? setShowEdit(false) : setShowTambah(false); handleReset(); }} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
                className={`w-full border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
              />
              {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Akun <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contoh@sekolah.sch.id"
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                NIY <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="niy"
                value={formData.niy}
                onChange={handleInputChange}
                placeholder="Nomor Induk Yayasan"
                className={`w-full border ${errors.niy ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
              />
              {errors.niy && <p className="text-red-500 text-xs mt-1">{errors.niy}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                NUPTK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nuptk"
                value={formData.nuptk}
                onChange={handleInputChange}
                placeholder="Nomor Unik Pendidik"
                className={`w-full border ${errors.nuptk ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
              />
              {errors.nuptk && <p className="text-red-500 text-xs mt-1">{errors.nuptk}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tempat Lahir
              </label>
              <input
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleInputChange}
                placeholder="Misal: Jakarta"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggalLahir"
                value={formData.tanggalLahir}
                onChange={handleInputChange}
                className={`w-full border ${errors.tanggalLahir ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
              />
              {/* ❌ Tidak ada error message → opsional */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jenis Kelamin
              </label>
              <select
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleInputChange}
                className={`w-full border ${errors.jenisKelamin ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
              >
                <option value="">-- Pilih --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {/* ❌ Tidak ada error message → opsional */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Telepon
              </label>
              <input
                type="tel"
                name="no_telepon"
                value={formData.no_telepon}
                onChange={handleInputChange}
                placeholder="misal: 081234567890"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                placeholder="Masukkan alamat lengkap"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role (Hak Akses) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'guru kelas', label: 'Guru Kelas' },
                      { key: 'guru bidang studi', label: 'Guru Bidang Studi' }
                    ].map(role => {
                      const active = formData.roles.includes(role.key);
                      return (
                        <button
                          key={role.key}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              roles: prev.roles.includes(role.key)
                                ? prev.roles.filter(r => r !== role.key)
                                : [...prev.roles, role.key]
                            }));
                            setErrors(prev => ({ ...prev, roles: '' }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}
                        >
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles}</p>}
                </div>
                {isEdit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status Guru <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="statusGuru"
                      value={formData.statusGuru}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.statusGuru ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5`}
                    >
                      <option value="">-- Pilih --</option>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                    {errors.statusGuru && <p className="text-red-500 text-xs mt-1">{errors.statusGuru}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="confirmData"
                checked={formData.confirmData}
                onChange={handleInputChange}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Saya yakin data yang diisi sudah benar</span>
            </label>
            {errors.confirmData && <p className="text-red-500 text-xs mt-1">{errors.confirmData}</p>}
          </div>
          <div className="mt-6 sm:mt-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => { isEdit ? setShowEdit(false) : setShowTambah(false); handleReset(); }}
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Guru</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Tombol Aksi */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <button
              onClick={() => setShowTambah(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} /> Tambah Guru
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
              <button
                onClick={openFilterModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Filter size={20} /> Filter Guru
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Upload size={20} /> Import Guru
              </button>
            </div>
          </div>
          {/* Tabel Data */}
          <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
            <table className="w-full min-w-[600px] table-auto text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">No.</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Nama</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Jenis Kelamin</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NIY</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">NUPTK</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Status</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800 text-white z-10 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : currentGuru.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data guru
                    </td>
                  </tr>
                ) : (
                  currentGuru.map((guru, index) => (
                    <tr
                      key={guru.id}
                      className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                    >
                      <td className="px-4 py-3 text-center align-middle font-medium">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 align-middle font-medium">{guru.nama}</td>
                      <td className="px-4 py-3 text-center align-middle">
                        {formatGender(guru.jenisKelamin)}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">{guru.niy || '-'}</td>
                      <td className="px-4 py-3 text-center align-middle">{guru.nuptk || '-'}</td>
                      <td className="px-4 py-3 text-center align-middle">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${guru.statusGuru === 'aktif'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {guru.statusGuru?.toUpperCase() || 'AKTIF'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleDetail(guru)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Eye size={16} />{' '}
                            <span className="hidden sm:inline">Detail</span>
                          </button>
                          <button
                            onClick={() => handleEdit(guru)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-2 sm:px-3 py-1.5 rounded flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Pencil size={16} />{' '}
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
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredGuru.length)} dari{' '}
              {filteredGuru.length} data
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
      {/*  MODAL DETAIL DENGAN FOTO/INISIAL */}
      {showDetail && selectedGuru && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${detailClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDetailClosing(true);
              setTimeout(() => {
                setShowDetail(false);
                setDetailClosing(false);
              }, 200);
            }
          }}
        >
          <div className="absolute inset-0 bg-gray-900/70"></div>
          <div
            className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${detailClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Guru</h2>
              <button
                onClick={() => {
                  setDetailClosing(true);
                  setTimeout(() => {
                    setShowDetail(false);
                    setDetailClosing(false);
                  }, 200);
                }}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {/*  AVATAR FOTO/INISIAL */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 overflow-hidden mb-3 flex-shrink-0 flex items-center justify-center">
                  {selectedGuru.profileImage ? (
                    <img
                      src={`http://localhost:5000${selectedGuru.profileImage.startsWith('/') ? selectedGuru.profileImage : '/' + selectedGuru.profileImage}`}
                      alt="Foto Profil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-gray-700 text-xl sm:text-2xl font-bold">
                      {selectedGuru.nama
                        .split(' ')
                        .slice(0, 2)
                        .map(word => word[0]?.toUpperCase() || '')
                        .join('') || '??'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center break-words">
                  {selectedGuru.nama}
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm col-span-1 sm:col-span-1">Status</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <div className="col-span-1 sm:col-span-2">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs sm:text-sm font-medium ${selectedGuru.statusGuru === 'AKTIF' || selectedGuru.statusGuru === 'aktif'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                    >
                      {selectedGuru.statusGuru?.toUpperCase() || 'AKTIF'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">NIY</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedGuru.niy || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">NUPTK</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedGuru.nuptk || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Jenis Kelamin</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2">
                    {formatGender(selectedGuru.jenisKelamin)}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Tempat Lahir</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedGuru.tempat_lahir || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Tanggal Lahir</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2">
                    {formatTanggalIndonesia(selectedGuru.tanggal_lahir)}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Telepon</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedGuru.no_telepon || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Alamat</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedGuru.alamat || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Email</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedGuru.email || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Hak Akses</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedGuru.roles && selectedGuru.roles.length > 0
                      ? selectedGuru.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')
                      : '-'}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  onClick={() => {
                    setDetailClosing(true);
                    setTimeout(() => {
                      setShowDetail(false);
                      setDetailClosing(false);
                    }, 200);
                  }}
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-xs sm:text-sm font-medium"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedGuru);
                    setDetailClosing(true);
                    setTimeout(() => {
                      setShowDetail(false);
                      setDetailClosing(false);
                    }, 200);
                  }}
                  className="px-4 sm:px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded transition text-xs sm:text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Import */}
      {showImport && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${importClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setImportClosing(true);
              setTimeout(() => {
                setShowImport(false);
                setImportClosing(false);
              }, 200);
            }
          }}
        >
          <div className="absolute inset-0 bg-gray-900/70"></div>
          <div
            className={`relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${importClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Import Data Guru</h2>
              <button
                onClick={() => {
                  setImportClosing(true);
                  setTimeout(() => {
                    setShowImport(false);
                    setImportClosing(false);
                  }, 200);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Tutup modal"
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
                  href="http://localhost:5000/templates/template_import_guru.xlsx"
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
                  onClick={() => {
                    setImportClosing(true);
                    setTimeout(() => {
                      setShowImport(false);
                      setImportClosing(false);
                    }, 200);
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Filter */}
      {showFilter && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${filterClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeFilterModal();
            }
          }}
        >
          <div className="absolute inset-0 bg-gray-900/70"></div>
          <div
            className={`relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${filterClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          >
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filter Guru</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={tempFilterValues.role}
                  onChange={(e) => setTempFilterValues((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Semua Role</option>
                  <option value="guru kelas">Guru Kelas</option>
                  <option value="guru bidang studi">Guru Bidang Studi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select
                  value={tempFilterValues.jenisKelamin}
                  onChange={(e) =>
                    setTempFilterValues((prev) => ({ ...prev, jenisKelamin: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Semua Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={tempFilterValues.status}
                  onChange={(e) => setTempFilterValues((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetFilter}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilter}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition text-sm"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}