'use client';

import React, { useState, useEffect } from 'react';
import { Filter, Search, Eye, ArrowLeft, Download, X } from 'lucide-react';

interface Kelas {
  id: number;
  nama_kelas: string;
  wali_kelas: string;
  tingkat: number;
  jumlah_siswa: number;
  tahun_ajaran?: string;
  semester?: string;
}

interface Siswa {
  id: number;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: string;
}

export default function UnduhRaporPage() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [kelasData, setKelasData] = useState<Kelas[]>([]);
  const [siswaData, setSiswaData] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKertas, setSelectedKertas] = useState('F4');
  const [showFilter, setShowFilter] = useState(false);
  const [filterClosing, setFilterClosing] = useState(false);
  const [filterTingkat, setFilterTingkat] = useState('');

  // Data dummy kelas
  const dummyKelasData: Kelas[] = [
    {
      id: 1,
      nama_kelas: '7A',
      wali_kelas: 'Budi Santoso, S.Pd',
      tingkat: 7,
      jumlah_siswa: 32,
      tahun_ajaran: '2024/2025',
      semester: 'Ganjil'
    },
    {
      id: 2,
      nama_kelas: '7B',
      wali_kelas: 'Siti Aminah, S.Pd',
      tingkat: 7,
      jumlah_siswa: 30,
      tahun_ajaran: '2024/2025',
      semester: 'Ganjil'
    },
    {
      id: 3,
      nama_kelas: '8A',
      wali_kelas: 'Ahmad Dahlan, M.Pd',
      tingkat: 8,
      jumlah_siswa: 28,
      tahun_ajaran: '2024/2025',
      semester: 'Ganjil'
    },
    {
      id: 4,
      nama_kelas: '8B',
      wali_kelas: 'Rina Wati, S.Pd',
      tingkat: 8,
      jumlah_siswa: 29,
      tahun_ajaran: '2024/2025',
      semester: 'Ganjil'
    },
    {
      id: 5,
      nama_kelas: '9A',
      wali_kelas: 'Hadi Susilo, M.Pd',
      tingkat: 9,
      jumlah_siswa: 31,
      tahun_ajaran: '2024/2025',
      semester: 'Ganjil'
    }
  ];

  // Data dummy siswa
  const dummySiswaData: { [key: number]: Siswa[] } = {
    1: [
      { id: 1, nis: '2024001', nisn: '0078945612', nama_lengkap: 'Ahmad Fauzi', jenis_kelamin: 'L' },
      { id: 2, nis: '2024002', nisn: '0078945613', nama_lengkap: 'Siti Rahma', jenis_kelamin: 'P' },
      { id: 3, nis: '2024003', nisn: '0078945614', nama_lengkap: 'Budi Santoso', jenis_kelamin: 'L' },
      { id: 4, nis: '2024004', nisn: '0078945615', nama_lengkap: 'Dewi Lestari', jenis_kelamin: 'P' },
      { id: 5, nis: '2024005', nisn: '0078945616', nama_lengkap: 'Eko Prasetyo', jenis_kelamin: 'L' },
      { id: 6, nis: '2024006', nisn: '0078945617', nama_lengkap: 'Fitri Handayani', jenis_kelamin: 'P' },
      { id: 7, nis: '2024007', nisn: '0078945618', nama_lengkap: 'Galih Wicaksono', jenis_kelamin: 'L' },
      { id: 8, nis: '2024008', nisn: '0078945619', nama_lengkap: 'Hana Safitri', jenis_kelamin: 'P' }
    ],
    2: [
      { id: 9, nis: '2024009', nisn: '0078945620', nama_lengkap: 'Indra Permana', jenis_kelamin: 'L' },
      { id: 10, nis: '2024010', nisn: '0078945621', nama_lengkap: 'Joko Susilo', jenis_kelamin: 'L' },
      { id: 11, nis: '2024011', nisn: '0078945622', nama_lengkap: 'Kartini Putri', jenis_kelamin: 'P' },
      { id: 12, nis: '2024012', nisn: '0078945623', nama_lengkap: 'Lukman Hakim', jenis_kelamin: 'L' },
      { id: 13, nis: '2024013', nisn: '0078945624', nama_lengkap: 'Maya Sari', jenis_kelamin: 'P' }
    ],
    3: [
      { id: 14, nis: '2024014', nisn: '0078945625', nama_lengkap: 'Nurul Hidayah', jenis_kelamin: 'P' },
      { id: 15, nis: '2024015', nisn: '0078945626', nama_lengkap: 'Omar Abdullah', jenis_kelamin: 'L' },
      { id: 16, nis: '2024016', nisn: '0078945627', nama_lengkap: 'Putri Ayu', jenis_kelamin: 'P' },
      { id: 17, nis: '2024017', nisn: '0078945628', nama_lengkap: 'Qori Ananda', jenis_kelamin: 'L' }
    ],
    4: [
      { id: 18, nis: '2024018', nisn: '0078945629', nama_lengkap: 'Rina Marlina', jenis_kelamin: 'P' },
      { id: 19, nis: '2024019', nisn: '0078945630', nama_lengkap: 'Surya Pratama', jenis_kelamin: 'L' },
      { id: 20, nis: '2024020', nisn: '0078945631', nama_lengkap: 'Tari Wulandari', jenis_kelamin: 'P' }
    ],
    5: [
      { id: 21, nis: '2024021', nisn: '0078945632', nama_lengkap: 'Umar Bakri', jenis_kelamin: 'L' },
      { id: 22, nis: '2024022', nisn: '0078945633', nama_lengkap: 'Vina Melati', jenis_kelamin: 'P' },
      { id: 23, nis: '2024023', nisn: '0078945634', nama_lengkap: 'Wahyu Hidayat', jenis_kelamin: 'L' }
    ]
  };

  useEffect(() => {
    fetchKelasData();
  }, []);

  const fetchKelasData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setKelasData(dummyKelasData);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/kelas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setKelasData(result.data || dummyKelasData);
      } else {
        setKelasData(dummyKelasData);
      }
    } catch (error) {
      console.error('Error fetching kelas data:', error);
      setKelasData(dummyKelasData);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiswaData = async (kelasId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setSiswaData(dummySiswaData[kelasId] || []);
        setLoading(false);
        return;
      }

      const kelasResponse = await fetch(`http://localhost:5000/api/admin/kelas/${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (kelasResponse.ok) {
        const kelasResult = await kelasResponse.json();
        setSelectedKelas(kelasResult.data);
      }

      const siswaResponse = await fetch(
        `http://localhost:5000/api/admin/kelas/${kelasId}/siswa`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (siswaResponse.ok) {
        const siswaResult = await siswaResponse.json();
        setSiswaData(siswaResult.data || dummySiswaData[kelasId] || []);
      } else {
        setSiswaData(dummySiswaData[kelasId] || []);
      }
    } catch (error) {
      console.error('Error fetching siswa data:', error);
      setSiswaData(dummySiswaData[kelasId] || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (kelas: Kelas) => {
    setSelectedKelas(kelas);
    setView('detail');
    setSearchTerm('');
    setCurrentPage(1);
    fetchSiswaData(kelas.id);
  };

  const handleBack = () => {
    setView('list');
    setSelectedKelas(null);
    setSiswaData([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleUnduhRapor = async (siswa: Siswa) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Demo mode: Rapor untuk ' + siswa.nama_lengkap + ' akan diunduh');
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/rapor/semester/${siswa.id}?kertas=${selectedKertas}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapor_${siswa.nama_lengkap}_${selectedKelas?.nama_kelas}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Gagal mengunduh rapor');
      }
    } catch (error) {
      console.error('Error downloading rapor:', error);
      alert('Demo mode: Rapor akan diunduh (Backend tidak tersedia)');
    }
  };

  const openFilterModal = () => {
    setShowFilter(true);
  };

  const closeFilterModal = () => {
    setFilterClosing(true);
    setTimeout(() => {
      setShowFilter(false);
      setFilterClosing(false);
    }, 200);
  };

  const applyFilter = () => {
    setCurrentPage(1);
    closeFilterModal();
  };

  const resetFilter = () => {
    setFilterTingkat('');
    setCurrentPage(1);
    closeFilterModal();
  };

  const filteredData = view === 'list'
    ? kelasData.filter((kelas) => {
        const matchSearch = kelas.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kelas.wali_kelas.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterTingkat === '' || kelas.tingkat.toString() === filterTingkat;
        return matchSearch && matchFilter;
      })
    : siswaData.filter(
        (siswa) =>
          siswa.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
          siswa.nis.includes(searchTerm) ||
          siswa.nisn.includes(searchTerm)
      );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  if (loading && view === 'list') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {view === 'detail' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {view === 'list' ? 'Cetak Rapor' : `Cetak Rapor ${selectedKelas?.nama_kelas || 'Kelas'}`}
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Info Box untuk Detail View - Sekarang di dalam card */}
          {view === 'detail' && selectedKelas && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-600 mb-1">Nama Kelas</span>
                  <span className="text-sm font-medium text-gray-800">{selectedKelas.nama_kelas}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-600 mb-1">Wali Kelas</span>
                  <span className="text-sm font-medium text-gray-800">{selectedKelas.wali_kelas}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-600 mb-1">Tahun Pelajaran</span>
                  <span className="text-sm font-medium text-gray-800">
                    {selectedKelas.tahun_ajaran || '2025/2026'} - {selectedKelas.semester || 'Ganjil'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-600 mb-1">Jenis Kertas</span>
                  <select
                    value={selectedKertas}
                    onChange={(e) => setSelectedKertas(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                  >
                    <option value="F4">F4</option>
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Controls Section - Semuanya dalam satu baris yang rapi */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Tampilkan per halaman */}
            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm whitespace-nowrap">Tampilkan</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-700 text-sm whitespace-nowrap">data</span>
            </div>

            {/* Spacer untuk mendorong search dan filter ke kanan */}
            <div className="flex-1 min-w-[20px]"></div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Button - hanya di list view */}
            {view === 'list' && (
              <button
                onClick={openFilterModal}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap text-sm transition-colors"
              >
                <Filter size={18} />
                Filter
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {view === 'list' ? (
              // Table Kelas
              <table className="w-full min-w-[600px] table-auto text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">No.</th>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">Nama Kelas</th>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">Wali Kelas</th>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">Tingkat</th>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">Jumlah Siswa</th>
                    <th className="px-4 py-3 text-center bg-gray-800 text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    (currentData as Kelas[]).map((kelas, index) => (
                      <tr key={kelas.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                        <td className="px-4 py-3 font-medium">{startIndex + index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{kelas.nama_kelas}</td>
                        <td className="px-4 py-3">{kelas.wali_kelas}</td>
                        <td className="px-4 py-3">{kelas.tingkat}</td>
                        <td className="px-4 py-3">{kelas.jumlah_siswa}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDetail(kelas)}
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded shadow-sm transition-all hover:shadow-md font-medium text-xs"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Tidak ada data kelas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              // Table Siswa
              <table className="w-full min-w-[600px] table-auto text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">No.</th>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">NIS/NISN</th>
                    <th className="px-4 py-3 text-left bg-gray-800 text-white font-semibold">Nama</th>
                    <th className="px-4 py-3 text-center bg-gray-800 text-white font-semibold">L/P</th>
                    <th className="px-4 py-3 text-center bg-gray-800 text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : currentData.length > 0 ? (
                    (currentData as Siswa[]).map((siswa, index) => (
                      <tr key={siswa.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                        <td className="px-4 py-3 font-medium">{startIndex + index + 1}</td>
                        <td className="px-4 py-3">
                          {siswa.nis}/{siswa.nisn}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{siswa.nama_lengkap}</td>
                        <td className="px-4 py-3 text-center">{siswa.jenis_kelamin}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleUnduhRapor(siswa)}
                              className="inline-flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded shadow-sm transition-all hover:shadow-md font-medium text-xs"
                              title="Unduh Rapor Semester"
                            >
                              <Download size={16} />
                              Rapor Semester
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Tidak ada data siswa
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari{' '}
              {filteredData.length} data
            </div>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 border rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Filter */}
      {showFilter && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${
            filterClosing ? 'opacity-0' : 'opacity-100'
          } p-3 sm:p-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeFilterModal();
            }
          }}
        >
          <div className="absolute inset-0 bg-gray-900/70"></div>
          <div
            className={`relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${
              filterClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Filter Data</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat</label>
                <select 
                  value={filterTingkat}
                  onChange={(e) => setFilterTingkat(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Tingkat</option>
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetFilter}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilter}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition text-sm font-medium"
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