"use client";

import { useState } from 'react';
import { Eye, Pencil, Trash2, Upload, X, Plus, Filter } from 'lucide-react';

const dummySiswa = [
  { id: 1, nama: 'Ade Zamira Purwanti S.E', kelas: 'Kelas 4', nis: '1910201598', nisn: '3188812016', tempatLahir: 'Jakarta', tanggalLahir: '2010-05-15', jenisKelamin: 'PEREMPUAN', fase: 'C' },
  { id: 2, nama: 'Adhiarja Ardianto', kelas: 'Kelas 4', nis: '7619323124', nisn: '5951093170', tempatLahir: 'Bandung', tanggalLahir: '2010-08-20', jenisKelamin: 'LAKI-LAKI', fase: 'C' },
  { id: 3, nama: 'Adiarja Parman Winarno M.Pd', kelas: 'Kelas 1', nis: '5038502437', nisn: '5397647198', tempatLahir: 'Surabaya', tanggalLahir: '2013-03-12', jenisKelamin: 'LAKI-LAKI', fase: 'A' },
  { id: 4, nama: 'Agus Ardianto S.Ked', kelas: 'Kelas 4', nis: '2373911477', nisn: '1615842761', tempatLahir: 'Medan', tanggalLahir: '2010-11-08', jenisKelamin: 'LAKI-LAKI', fase: 'C' },
  { id: 5, nama: 'Agus Haryanto S.Pd', kelas: 'Kelas 6', nis: '4766883896', nisn: '8001890388', tempatLahir: 'Semarang', tanggalLahir: '2008-07-25', jenisKelamin: 'LAKI-LAKI', fase: 'C' },
  { id: 6, nama: 'Ajeng Diah Hassanah S.Pt', kelas: 'Kelas 3', nis: '8230902494', nisn: '6391052685', tempatLahir: 'Yogyakarta', tanggalLahir: '2011-02-18', jenisKelamin: 'PEREMPUAN', fase: 'B' },
  { id: 7, nama: 'Ajimin Ozy Pangestu M.Ak', kelas: 'Kelas 2', nis: '3567211609', nisn: '3992758226', tempatLahir: 'Malang', tanggalLahir: '2012-09-30', jenisKelamin: 'LAKI-LAKI', fase: 'A' },
  { id: 8, nama: 'Akarsana Marbun', kelas: 'Kelas 6', nis: '1206681324', nisn: '6743636540', tempatLahir: 'Palembang', tanggalLahir: '2008-12-05', jenisKelamin: 'PEREMPUAN', fase: 'C' },
  { id: 9, nama: 'Amelia Bella Pudjiastuti S.Ked', kelas: 'Kelas 3', nis: '8059617411', nisn: '9187741330', tempatLahir: 'Denpasar', tanggalLahir: '2011-06-22', jenisKelamin: 'PEREMPUAN', fase: 'B' },
  { id: 10, nama: 'Ani Rahayu', kelas: 'Kelas 6', nis: '5879615723', nisn: '2358200371', tempatLahir: 'Makassar', tanggalLahir: '2008-04-10', jenisKelamin: 'PEREMPUAN', fase: 'C' },
];

export default function DataSiswaPage() {
  const [showDetail, setShowDetail] = useState(false);
  const [showTambah, setShowTambah] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmImport, setConfirmImport] = useState(false);
  const [siswaData, setSiswaData] = useState(dummySiswa);

  // Filter states
  const [filterKelas, setFilterKelas] = useState('');
  const [filterJenisKelamin, setFilterJenisKelamin] = useState('');
  const [filterFase, setFilterFase] = useState('');

  const [formData, setFormData] = useState({
    nama: '',
    kelas: '',
    nis: '',
    nisn: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    fase: '',
    confirmData: false
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleDetail = (siswa) => {
    setSelectedSiswa(siswa);
    setShowDetail(true);
  };

  const handleEdit = (siswa) => {
    setFormData({
      nama: siswa.nama,
      kelas: siswa.kelas,
      nis: siswa.nis,
      nisn: siswa.nisn,
      tempatLahir: siswa.tempatLahir,
      tanggalLahir: siswa.tanggalLahir,
      jenisKelamin: siswa.jenisKelamin,
      fase: siswa.fase,
      confirmData: true
    });
    setEditMode(true);
    setEditId(siswa.id);
    setShowTambah(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setSiswaData(prev => prev.filter(siswa => siswa.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.confirmData) {
      alert('Silakan centang konfirmasi data benar terlebih dahulu');
      return;
    }

    if (editMode) {
      // Edit existing siswa
      setSiswaData(prev => 
        prev.map(siswa => 
          siswa.id === editId 
            ? { ...siswa, ...formData }
            : siswa
        )
      );
    } else {
      // Add new siswa
      const newSiswa = {
        id: siswaData.length > 0 ? Math.max(...siswaData.map(s => s.id)) + 1 : 1,
        ...formData
      };
      setSiswaData(prev => [...prev, newSiswa]);
    }

    // Reset form
    setFormData({
      nama: '',
      kelas: '',
      nis: '',
      nisn: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: '',
      fase: '',
      confirmData: false
    });
    setEditMode(false);
    setEditId(null);
    setShowTambah(false);
  };

  const handleReset = () => {
    setFormData({
      nama: '',
      kelas: '',
      nis: '',
      nisn: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: '',
      fase: '',
      confirmData: false
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleCancel = () => {
    setShowTambah(false);
    setEditMode(false);
    setEditId(null);
    handleReset();
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setFilterKelas('');
    setFilterJenisKelamin('');
    setFilterFase('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        alert('File harus berupa dokumen Microsoft Excel dengan ekstensi .xlsx');
        e.target.value = null;
      }
    }
  };

  const handleImportSubmit = () => {
    if (!selectedFile) {
      alert('Silakan pilih file terlebih dahulu');
      return;
    }
    if (!confirmImport) {
      alert('Silakan centang konfirmasi terlebih dahulu');
      return;
    }
    
    console.log('Importing file:', selectedFile.name);
    alert('Data berhasil diimport!');
    setShowImportModal(false);
    setSelectedFile(null);
    setConfirmImport(false);
  };

  const filteredSiswa = siswaData.filter(siswa => {
    const matchSearch = siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      siswa.nis.includes(searchQuery) ||
      siswa.nisn.includes(searchQuery) ||
      siswa.kelas.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchKelas = !filterKelas || siswa.kelas === filterKelas;
    const matchJenisKelamin = !filterJenisKelamin || siswa.jenisKelamin === filterJenisKelamin;
    const matchFase = !filterFase || siswa.fase === filterFase;

    return matchSearch && matchKelas && matchJenisKelamin && matchFase;
  });

  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSiswa = filteredSiswa.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          «
        </button>
      );
    }

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${
              currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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
          className={`px-3 py-1 border border-gray-300 rounded transition ${
            currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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
            className={`px-3 py-1 border border-gray-300 rounded transition ${
              currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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
          className={`px-3 py-1 border border-gray-300 rounded transition ${
            currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          »
        </button>
      );
    }

    return pages;
  };

  if (showTambah) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Siswa</h1>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editMode ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Ketik Nama Lengkap"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                >
                  <option value="">-- Pilih Kelas --</option>
                  <option value="Kelas 1">Kelas 1</option>
                  <option value="Kelas 2">Kelas 2</option>
                  <option value="Kelas 3">Kelas 3</option>
                  <option value="Kelas 4">Kelas 4</option>
                  <option value="Kelas 5">Kelas 5</option>
                  <option value="Kelas 6">Kelas 6</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  NIS <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nis"
                  value={formData.nis}
                  onChange={handleInputChange}
                  placeholder="Ketik NIS"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nisn"
                  value={formData.nisn}
                  onChange={handleInputChange}
                  placeholder="Ketik NISN"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleInputChange}
                  placeholder="Ketik Tempat Lahir"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                >
                  <option value="">-- Pilih --</option>
                  <option value="LAKI-LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fase <span className="text-red-500">*</span>
                </label>
                <select
                  name="fase"
                  value={formData.fase}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                >
                  <option value="">-- Pilih Fase --</option>
                  <option value="A">Fase A</option>
                  <option value="B">Fase B</option>
                  <option value="C">Fase C</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmData"
                  checked={formData.confirmData}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm">Saya yakin sudah mengisi dengan benar</span>
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded transition"
              >
                {editMode ? 'Update' : 'Simpan'}
              </button>
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded transition"
              >
                Reset
              </button>
              <button
                onClick={handleCancel}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Siswa</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowTambah(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Tambah Siswa
              </button>
              <button
                onClick={() => setShowFilterModal(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Filter size={20} />
                Filter Data
              </button>
            </div>
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Upload size={20} />
              Import Data Siswa
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
              className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-4 py-3 text-left">No.</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Kelas</th>
                  <th className="px-4 py-3 text-left">NIS</th>
                  <th className="px-4 py-3 text-left">NISN</th>
                  <th className="px-4 py-3 text-left">Fase</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentSiswa.length > 0 ? (
                  currentSiswa.map((siswa, index) => (
                    <tr
                      key={siswa.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{startIndex + index + 1}</td>
                      <td className="px-4 py-3">{siswa.nama}</td>
                      <td className="px-4 py-3">{siswa.kelas}</td>
                      <td className="px-4 py-3">{siswa.nis}</td>
                      <td className="px-4 py-3">{siswa.nisn}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">Fase {siswa.fase}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDetail(siswa)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition text-sm"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                          <button
                            onClick={() => handleEdit(siswa)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition text-sm"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(siswa.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition text-sm"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data siswa yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredSiswa.length)} dari {filteredSiswa.length} data
            </div>
            <div className="flex flex-wrap gap-1 justify-center">{renderPagination()}</div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedSiswa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Siswa</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center">{selectedSiswa.nama}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Kelas</span>
                  <span className="mr-4">:</span>
                  <span>{selectedSiswa.kelas}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">NIS</span>
                  <span className="mr-4">:</span>
                  <span>{selectedSiswa.nis}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">NISN</span>
                  <span className="mr-4">:</span>
                  <span>{selectedSiswa.nisn}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Tempat Lahir</span>
                  <span className="mr-4">:</span>
                  <span>{selectedSiswa.tempatLahir || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Tanggal Lahir</span>
                  <span className="mr-4">:</span>
                  <span>{selectedSiswa.tanggalLahir || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Jenis Kelamin</span>
                  <span className="mr-4">:</span>
                  <span>{selectedSiswa.jenisKelamin}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Fase</span>
                  <span className="mr-4">:</span>
                  <span>Fase {selectedSiswa.fase}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedSiswa);
                    setShowDetail(false);
                  }}
                  className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6 p-6 border-b">
              <h2 className="text-xl font-bold">Filter Data</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas
                </label>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                >
                  <option value="">-- Pilih --</option>
                  <option value="Kelas 1">Kelas 1</option>
                  <option value="Kelas 2">Kelas 2</option>
                  <option value="Kelas 3">Kelas 3</option>
                  <option value="Kelas 4">Kelas 4</option>
                  <option value="Kelas 5">Kelas 5</option>
                  <option value="Kelas 6">Kelas 6</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <select
                  value={filterJenisKelamin}
                  onChange={(e) => setFilterJenisKelamin(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                >
                  <option value="">-- Pilih --</option>
                  <option value="LAKI-LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fase
                </label>
                <select
                  value={filterFase}
                  onChange={(e) => setFilterFase(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                >
                  <option value="">-- Pilih --</option>
                  <option value="A">Fase A</option>
                  <option value="B">Fase B</option>
                  <option value="C">Fase C</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleResetFilter}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilter}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6 p-6 border-b">
              <h2 className="text-xl font-bold">Import Data Siswa</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setConfirmImport(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Penting!</strong> File yang diunggah harus berupa dokumen Microsoft Excel dengan ekstensi .xlsx
              </p>
              <a href="#" className="text-blue-600 hover:underline text-sm">
                Download Format Import
              </a>
            </div>

            <div className="mb-6 px-6">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  File dipilih: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="mb-6 px-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmImport}
                  onChange={(e) => setConfirmImport(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Saya yakin sudah mengisi dengan benar
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setConfirmImport(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleImportSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}