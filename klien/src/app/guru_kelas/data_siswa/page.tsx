'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Filter, Search, Eye, Pencil, X, User } from 'lucide-react';

interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  alamat: string;
  status: 'aktif' | 'nonaktif';
  email: string;
  username: string;
  kelas: string;
}

interface FormData extends Siswa {
  password: string;
}

export default function DataSiswaPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([
    { id: '1', nis: '12345', nisn: '9876543210', nama: 'Ahmad Rizki', tempatLahir: 'Jakarta', tanggalLahir: '2010-05-15', jenisKelamin: 'L', alamat: 'Jl. Merdeka No. 123', status: 'aktif', email: 'ahmad@email.com', username: 'ahmad123', kelas: 'Kelas 7A' },
    { id: '2', nis: '12346', nisn: '9876543211', nama: 'Siti Nurhaliza', tempatLahir: 'Bandung', tanggalLahir: '2010-08-20', jenisKelamin: 'P', alamat: 'Jl. Sudirman No. 456', status: 'aktif', email: 'siti@email.com', username: 'siti456', kelas: 'Kelas 7A' },
    { id: '3', nis: '12347', nisn: '9876543212', nama: 'Bagas Nasution', tempatLahir: 'Surabaya', tanggalLahir: '2010-03-10', jenisKelamin: 'L', alamat: 'Jl. Diponegoro No. 789', status: 'nonaktif', email: 'bagas@email.com', username: 'bagas789', kelas: 'Kelas 7B' },
    { id: '4', nis: '12348', nisn: '9876543213', nama: 'Dewi Lestari', tempatLahir: 'Yogyakarta', tanggalLahir: '2010-11-25', jenisKelamin: 'P', alamat: 'Jl. Gatot Subroto No. 321', status: 'aktif', email: 'dewi@email.com', username: 'dewi321', kelas: 'Kelas 7B' },
  ]);
  
  const [filteredSiswa, setFilteredSiswa] = useState<Siswa[]>(siswaList);
  const [showTambahModal, setShowTambahModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id: '', nis: '', nisn: '', nama: '', tempatLahir: '', tanggalLahir: '',
    jenisKelamin: 'L', alamat: '', status: 'aktif', email: '', username: '', password: '', kelas: ''
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [filterJenisKelamin, setFilterJenisKelamin] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [konfirmasiChecked, setKonfirmasiChecked] = useState<boolean>(false);

  useEffect(() => {
    let filtered = siswaList.filter(siswa =>
      siswa.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filterJenisKelamin) {
      filtered = filtered.filter(siswa => siswa.jenisKelamin === filterJenisKelamin);
    }
    if (filterStatus) {
      filtered = filtered.filter(siswa => siswa.status === filterStatus);
    }
    setFilteredSiswa(filtered);
  }, [searchTerm, filterJenisKelamin, filterStatus, siswaList]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!konfirmasiChecked) {
      alert('Harap centang konfirmasi!');
      return;
    }
    if (showEditModal) {
      const { password, ...siswaData } = formData;
      setSiswaList(siswaList.map(s => s.id === formData.id ? siswaData : s));
    } else {
      const { password, ...siswaData } = formData;
      setSiswaList([...siswaList, { ...siswaData, id: Date.now().toString() }]);
    }
    resetForm();
  };

  const handleHapus = (id: string) => {
    if (confirm('Yakin hapus?')) {
      setSiswaList(siswaList.filter(s => s.id !== id));
    }
  };

  const openEdit = (siswa: Siswa) => {
    setFormData({ ...siswa, password: '' });
    setShowEditModal(true);
    setShowTambahModal(true);
    setShowDetailModal(false);
  };

  const resetForm = () => {
    setFormData({ id: '', nis: '', nisn: '', nama: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'L', alamat: '', status: 'aktif', email: '', username: '', password: '', kelas: '' });
    setShowTambahModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedSiswa(null);
    setKonfirmasiChecked(false);
  };

  const applyFilter = () => {
    setShowFilterModal(false);
  };

  // ✅ Backdrop transparan ringan
  const modalBackdropClass = "fixed inset-0 bg-black/10 flex justify-center items-start pt-12 md:pt-16 p-4 z-50 overflow-y-auto";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Siswa</h1>
        
        {/* ======== PANEL AKSI ======== */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button onClick={() => setShowTambahModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition inline-flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Tambah Siswa
            </button>
            {/* ✅ "Hapus Beberapa Siswa" DIHAPUS */}
            <button onClick={() => setShowFilterModal(true)} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition inline-flex items-center justify-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Data
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={10}>Tampilkan 10 data</option>
              <option value={20}>Tampilkan 20 data</option>
              <option value={50}>Tampilkan 50 data</option>
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Cari nama siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-gray-300 rounded-lg p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* ======== TABEL DATA ======== */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-3 text-left">No.</th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Kelas</th>
                  <th className="p-3 text-left">NIS</th>         {/* ✅ Dipisah */}
                  <th className="p-3 text-left">NISN</th>        {/* ✅ Dipisah */}
                  <th className="p-3 text-left">Jenis Kelamin</th> {/* ✅ Lengkap */}
                  <th className="p-3 text-left">Status Siswa</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSiswa.slice(0, pageSize).map((siswa, index) => (
                  <tr key={siswa.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{siswa.nama}</td>
                    <td className="p-3 text-gray-600">{siswa.kelas}</td>
                    <td className="p-3 text-gray-600 font-mono">{siswa.nis}</td>    {/* ✅ NIS */}
                    <td className="p-3 text-gray-600 font-mono">{siswa.nisn}</td>   {/* ✅ NISN */}
                    <td className="p-3">
                      {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}   {/* ✅ Full text */}
                    </td>
                    <td className="p-3">
                      {/* ✅ Status dengan dot warna */}
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${siswa.status === 'aktif' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className={siswa.status === 'aktif' ? 'text-gray-700 font-medium' : 'text-gray-500 font-medium'}>
                          {siswa.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => { setSelectedSiswa(siswa); setShowDetailModal(true); }} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition" title="Detail">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(siswa)} className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleHapus(siswa.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSiswa.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      Belum ada data siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======== MODAL TAMBAH/EDIT ======== */}
        {showTambahModal && (
          <div className={modalBackdropClass}>
            <div className="bg-white rounded-lg w-full max-w-3xl p-6 my-4 shadow-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{showEditModal ? 'Edit Data Siswa' : 'Tambah Data Siswa'}</h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                  <input name="nama" value={formData.nama} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <input name="kelas" value={formData.kelas} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Kelas 7A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                  <input name="nis" value={formData.nis} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                  <input name="nisn" value={formData.nisn} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <input name="tempatLahir" value={formData.tempatLahir} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <input name="alamat" value={formData.alamat} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
                {!showEditModal && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Akun</label>
                      <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                      <input name="username" value={formData.username} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input type="password" name="password" value={formData.password} onChange={handleFormChange} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input type="checkbox" checked={konfirmasiChecked} onChange={(e) => setKonfirmasiChecked(e.target.checked)} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Saya yakin sudah mengisi dengan benar</label>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={handleSubmit} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
                  Simpan
                </button>
                <button onClick={resetForm} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition">
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======== MODAL DETAIL ======== */}
        {showDetailModal && selectedSiswa && (
          <div className={modalBackdropClass}>
            <div className="bg-white rounded-lg w-full max-w-md p-6 my-4 shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Detail Siswa</h2>
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold">{selectedSiswa.nama}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Kelas:</span> {selectedSiswa.kelas}</p>
                <p><span className="font-medium">NIS:</span> {selectedSiswa.nis}</p>
                <p><span className="font-medium">NISN:</span> {selectedSiswa.nisn}</p>
                <p><span className="font-medium">Tempat, Tanggal Lahir:</span> {selectedSiswa.tempatLahir}, {selectedSiswa.tanggalLahir}</p>
                <p><span className="font-medium">Jenis Kelamin:</span> {selectedSiswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                <p><span className="font-medium">Alamat:</span> {selectedSiswa.alamat}</p>
                <p><span className="font-medium">Email:</span> {selectedSiswa.email}</p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span className="inline-flex items-center gap-1 ml-1">
                    <span className={`w-2 h-2 rounded-full ${selectedSiswa.status === 'aktif' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {selectedSiswa.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setShowDetailModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition">
                  Tutup
                </button>
                <button onClick={() => openEdit(selectedSiswa)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition">
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======== MODAL FILTER ======== */}
        {showFilterModal && (
          <div className={modalBackdropClass}>
            <div className="bg-white rounded-lg w-full max-w-md p-6 my-4 shadow-xl border border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Filter Data</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select value={filterJenisKelamin} onChange={(e) => setFilterJenisKelamin(e.target.value)} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Semua --</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Akun</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Semua --</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={applyFilter} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
                  Terapkan Filter
                </button>
                <button onClick={() => setShowFilterModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition">
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}