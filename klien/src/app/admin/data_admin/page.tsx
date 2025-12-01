"use client";

import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, X, EyeOff, Plus } from 'lucide-react';

//const dummyAdmin = [
//{ id: 1, nama: 'Admin', lp: 'L', niy: '1900002154666979', nuptk: '8000005490594546', jenisKelamin: 'LAKI-LAKI', statusAdmin: 'AKTIF', tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '', email: '' },
//];*

export default function DataAdminPage() {
  const formatGender = (g?: string | null) => {
    if (!g) return '-';
    const s = String(g).trim().toLowerCase();
    if (s === 'laki-laki' || s === 'laki laki' || s === 'laki' || s === 'l') return 'Laki-laki';
    if (s === 'perempuan' || s === 'p' || s === 'perempuan') return 'Perempuan';
    if (s.includes('laki')) return 'Laki-laki';
    if (s.includes('peremp')) return 'Perempuan';
    return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
  };

  // Fungsi untuk format tanggal ke YYYY-MM-DD (untuk input date)
  const formatDateInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const formatTanggalIndo = (dateString?: string | null): string => {
    if (!dateString) return '-';
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString; // kembalikan aslinya jika tidak valid
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const [adminList, setAdminList] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showTambah, setShowTambah] = useState(false);
  const [editMode, setEditMode] = useState(false);
const [editingId, setEditingId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailClosing, setDetailClosing] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAdmin();
  }, []);

  // Debug selectedAdmin
  useEffect(() => {
    if (selectedAdmin) {
      console.log('🔍 SELECTED ADMIN DEBUG:', selectedAdmin);
      console.log('📍 Tempat Lahir:', selectedAdmin.tempat_lahir);
      console.log('📅 Tanggal Lahir:', selectedAdmin.tanggal_lahir);
      console.log('📧 Email:', selectedAdmin.email);
    }
  }, [selectedAdmin]);

  const fetchAdmin = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        return;
      }

      const res = await fetch("http://localhost:5000/api/admin/admin", {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        console.log('✅ Data admin berhasil difetch:', data.data);

        // Normalisasi data dari backend
        const normalizedAdmins = (data.data || []).map((admin: any) => ({
          id: admin.id,
          nama: admin.nama,
          email: admin.email,
          statusAdmin: admin.statusAdmin,
          niy: admin.niy,
          nuptk: admin.nuptk,
          tempat_lahir: admin.tempat_lahir || admin.tempatLahir || '',
          tanggal_lahir: admin.tanggal_lahir || admin.tanggalLahir || '',
          jenis_kelamin: admin.jenis_kelamin || admin.jenisKelamin || '',
          alamat: admin.alamat,
          no_telepon: admin.no_telepon || admin.noTelepon || ''
        }));

        console.log('🚀 Final normalized data:', normalizedAdmins);
        setAdminList(normalizedAdmins);

      } else {
        alert('Gagal memuat data admin: ' + (data.message || 'Tidak terotorisasi'));
      }
    } catch (err) {
      console.error('Error fetch admin:', err);
      alert('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const [formData, setFormData] = useState({
  email_sekolah: '',
  nama_lengkap: '',
  password: '',
  niy: '',
  nuptk: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: '',
  alamat: '',
  no_telepon: '',
  confirmData: false
});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDetail = (admin: Admin): void => {
    console.log('🔄 Handle Detail dipanggil:', admin);
    setSelectedAdmin(admin);
    setShowDetail(true);
  };

  const handleEdit = (admin: Admin): void => {
    console.log('✏️ Handle Edit dipanggil:', admin);
    setEditId(admin.id);
    setFormData({
      email_sekolah: admin.email || '',
      nama_lengkap: admin.nama || '',
      niy: admin.niy || '',
      nuptk: admin.nuptk || '',
      tempat_lahir: admin.tempat_lahir || '',
      tanggal_lahir: admin.tanggal_lahir || '',
      jenis_kelamin: admin.jenisKelamin === 'LAKI-LAKI' ? 'Laki-laki' : 'Perempuan',
      alamat: admin.alamat || '',
      no_telepon: admin.no_telepon || '',
      password: '',
      confirmData: true
    });
    setEditingId(admin.id);
    setEditMode(true);
    setShowTambah(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus data admin ini?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login telah habis. Silakan login ulang.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Data admin berhasil dihapus');
        fetchAdmin();
      } else {
        const error = await res.json();
        alert(error.message || 'Gagal menghapus data admin');
      }
    } catch (err) {
      alert('Gagal terhubung ke server');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama?.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!formData.email?.trim()) newErrors.email = 'Email wajib diisi';
    if (!formData.jenisKelamin) newErrors.jenisKelamin = 'Pilih jenis kelamin';
    if (!formData.tanggal_lahir) {
      newErrors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    } else {
      const dob = new Date(formData.tanggal_lahir);
      if (isNaN(dob.getTime())) {
        newErrors.tanggal_lahir = 'Tanggal lahir tidak valid';
      } else {
        const today = new Date();
        const dobMid = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
        const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (dobMid > todayMid) {
          newErrors.tanggal_lahir = 'Tanggal lahir tidak boleh di masa depan';
        } else {
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
          if (age < 18) newErrors.tanggal_lahir = 'Usia minimal 18 tahun';
        }
      }
    }

    if (showEdit && (!formData.statusAdmin || formData.statusAdmin === '')) {
      newErrors.statusAdmin = 'Status wajib dipilih';
    }

    if (!formData.confirmData) newErrors.confirmData = 'Harap konfirmasi data sebelum melanjutkan';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
        if (el && typeof el.focus === 'function') el.focus();
      }, 10);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
  if (!formData.confirmData) {
    alert('Harap centang konfirmasi data');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const url = editMode 
      ? `http://localhost:5000/api/admin/admin/${editingId}` 
      : 'http:localhost:5000/api/admin/admin';
    const method = editMode ? 'PUT' : 'POST';

    // Jangan kirim password jika kosong (kecuali saat tambah)
    const payload = { ...formData };
    if (editMode && !payload.password) {
      delete payload.password;
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(editMode ? 'Admin berhasil diperbarui!' : 'Admin berhasil ditambahkan!');
      setFormData({
        email_sekolah: '',
        nama_lengkap: '',
        password: '',
        niy: '',
        nuptk: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        no_telepon: '',
        confirmData: false
      });
      setShowTambah(false);
      setEditMode(false);
      setEditingId(null);
      fetchAdminData();
    } else {
      const err = await res.json();
      alert(err.message || 'Terjadi kesalahan');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal menghubungi server');
  }
};

  const handleReset = () => {
  setFormData({
    email_sekolah: '',
    nama_lengkap: '',
    password: '',
    niy: '',
    nuptk: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    no_telepon: '',
    confirmData: false
  });
};

  const filteredAdmin = adminData.filter(admin =>
    admin.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.niy.includes(searchQuery) // Diubah dari nip menjadi niy
  );

  const totalPages = Math.ceil(filteredAdmin.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmin = filteredAdmin.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages: ReactNode[] = [];
    const maxVisible = 5;

    if (currentPage > 1) {
      pages.push(
        <button key="prev" onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">«</button>
      );
    }

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(
          <span key="dots1" className="px-2 text-gray-600">
            ...
          </span>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="dots2" className="px-2 text-gray-600">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
        >
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(<button key="next" onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">»</button>);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (showTambah) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Admin</h1>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tambah Data Admin</h2>
              <button
                onClick={() => setShowTambah(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  placeholder="Ketik Nama"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Akun</label>
                <input
                  type="email"
                  name="email_sekolah"
                  value={formData.email_sekolah}
                  onChange={handleInputChange}
                  placeholder="Ketik Email"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">NIY</label> {/* Diubah dari NIP menjadi NIY */}
                <input
                  type="text"
                  name="niy" 
                  value={formData.niy} 
                  onChange={handleInputChange}
                  placeholder="Ketik NIY" 
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password Akun <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Ketik Password"
                    className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">NUPTK</label>
                <input
                  type="text"
                  name="nuptk"
                  value={formData.nuptk}
                  onChange={handleInputChange}
                  placeholder="Ketik NUPTK"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={handleInputChange}
                  placeholder="Ketik Tempat Lahir"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                >
                  <option value="">-- Pilih --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Ketik Alamat"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Telepon</label>
                <input
                  type="tel"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleInputChange}
                  placeholder="Ketik Telepon"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
            )}
          </div>

          <div className="mt-6 sm:mt-7">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="confirmData"
                checked={formData.confirmData}
                onChange={handleInputChange}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-gray-700">Saya yakin sudah mengisi dengan benar</span>
            </label>
            {errors.confirmData && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmData}</p>}
          </div>

          <div className="mt-6 sm:mt-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => {
                  isEdit ? setShowEdit(false) : setShowTambah(false);
                  handleReset();
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition flex items-center justify-center"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-6 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-medium transition flex items-center justify-center"
              >
                Reset
              </button>
              <button
                onClick={() => setShowTambah(false)}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded transition"
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

  // Tampilan utama
  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Admin</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTambah(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Tambah Admin
              </button>

            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Tampilkan</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-700">data</span>
            </div>
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-4 py-2 w-64"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
            <table className="w-full min-w-[600px] table-auto text-sm">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-4 py-3 text-left">No.</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">L/P</th>
                  <th className="px-4 py-3 text-left">NIY</th> {/* Diubah dari NIP menjadi NIY */}
                  <th className="px-4 py-3 text-left">NUPTK</th>
                  <th className="px-4 py-3 text-left">Status Admin</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentAdmin.map((admin, index) => (
                  <tr
                    key={admin.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">{admin.nama}</td>
                    <td className="px-4 py-3">{admin.lp}</td>
                    <td className="px-4 py-3">{admin.niy}</td> {/* Diubah dari nip menjadi niy */}
                    <td className="px-4 py-3">{admin.nuptk}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{admin.statusAdmin}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDetail(admin)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Eye size={16} />
                          Detail
                        </button>
                        <button
                          onClick={() => handleEdit(admin)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredAdmin.length)} dari {filteredAdmin.length} data
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {showDetail && selectedAdmin && (
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
          <div className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${detailClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detail Admin</h2>
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
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3 flex-shrink-0">
                  <svg className="w-12 h-12 sm:w-20 sm:h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{selectedAdmin.nama}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Status Admin</span>
                  <span className="mr-4">:</span>
                  <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                    {selectedAdmin.statusAdmin}
                  </span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">NIY</span> {/* Diubah dari NIP menjadi NIY */}
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.niy}</span> {/* Diubah dari nip menjadi niy */}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Tempat Lahir</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">
                    {selectedAdmin.tempat_lahir || '-'}
                  </span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Jenis Kelamin</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.jenisKelamin}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Telepon</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.telepon || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Email</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.email || '-'}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border-b pb-2">
                  <span className="font-semibold text-xs sm:text-sm">Email</span>
                  <span className="text-xs sm:text-sm">:</span>
                  <span className="text-xs sm:text-sm col-span-1 sm:col-span-2 break-words">{selectedAdmin.email || '-'}</span>
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
                    handleEdit(selectedAdmin);
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
    </div>
  );
}