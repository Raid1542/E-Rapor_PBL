'use client';

import { useState } from 'react';
import { ChevronRight, Menu, X, LogOut, User, Edit, Trash2, Plus, Home, Eye } from 'lucide-react'; // Tetap impor semua ikon

export default function GuruBidangStudiDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    latihan: 0, uh: 0, pts: 0, pas: 0, notes: ''
  });

  const [profileData, setProfileData] = useState({
    name: 'Noir Prince S.Pd.',
    role: 'Guru Bidang Studi',
    subject: 'Matematika',
    email: 'noir.prince@sditulilalbab.sch.id',
    phone: '+6281234567890',
    nip: '198507122010011005'
  });

  const [classes] = useState([
    { id: 1, name: 'Kelas 1A', tingkat: 1, studentCount: 28 },
    { id: 2, name: 'Kelas 1B', tingkat: 1, studentCount: 30 },
    { id: 3, name: 'Kelas 1C', tingkat: 1, studentCount: 27 },
    { id: 4, name: 'Kelas 1D', tingkat: 1, studentCount: 29 },
    { id: 5, name: 'Kelas 1E', tingkat: 1, studentCount: 26 },
    { id: 6, name: 'Kelas 2A', tingkat: 2, studentCount: 30 },
    { id: 7, name: 'Kelas 2B', tingkat: 2, studentCount: 28 },
    { id: 8, name: 'Kelas 2C', tingkat: 2, studentCount: 29 },
    { id: 9, name: 'Kelas 2D', tingkat: 2, studentCount: 27 },
    { id: 10, name: 'Kelas 2E', tingkat: 2, studentCount: 31 },
    { id: 11, name: 'Kelas 3A', tingkat: 3, studentCount: 27 },
    { id: 12, name: 'Kelas 3B', tingkat: 3, studentCount: 29 },
    { id: 13, name: 'Kelas 3C', tingkat: 3, studentCount: 28 },
    { id: 14, name: 'Kelas 3D', tingkat: 3, studentCount: 30 },
    { id: 15, name: 'Kelas 3E', tingkat: 3, studentCount: 26 },
    { id: 16, name: 'Kelas 4A', tingkat: 4, studentCount: 29 },
    { id: 17, name: 'Kelas 4B', tingkat: 4, studentCount: 31 },
    { id: 18, name: 'Kelas 4C', tingkat: 4, studentCount: 28 },
    { id: 19, name: 'Kelas 4D', tingkat: 4, studentCount: 30 },
    { id: 20, name: 'Kelas 4E', tingkat: 4, studentCount: 27 },
    { id: 21, name: 'Kelas 5A', tingkat: 5, studentCount: 31 },
    { id: 22, name: 'Kelas 5B', tingkat: 5, studentCount: 29 },
    { id: 23, name: 'Kelas 5C', tingkat: 5, studentCount: 30 },
    { id: 24, name: 'Kelas 5D', tingkat: 5, studentCount: 28 },
    { id: 25, name: 'Kelas 5E', tingkat: 5, studentCount: 32 },
    { id: 26, name: 'Kelas 6A', tingkat: 6, studentCount: 26 },
    { id: 27, name: 'Kelas 6B', tingkat: 6, studentCount: 28 },
    { id: 28, name: 'Kelas 6C', tingkat: 6, studentCount: 27 },
    { id: 29, name: 'Kelas 6D', tingkat: 6, studentCount: 29 },
    { id: 30, name: 'Kelas 6E', tingkat: 6, studentCount: 25 }
  ]);

  const [students, setStudents] = useState([
    { id: 1, nis: '2024001', name: 'Ahmad Fauzi', latihan: 85, uh: 80, pts: 82, pas: 88, notes: 'Bagus' },
    { id: 2, nis: '2024002', name: 'Siti Nurhaliza', latihan: 90, uh: 88, pts: 89, pas: 92, notes: 'Sangat baik' },
    { id: 3, nis: '2024003', name: 'Budi Prasetyo', latihan: 75, uh: 70, pts: 72, pas: 78, notes: 'Perlu ditingkatkan' },
    { id: 4, nis: '2024004', name: 'Dewi Lestari', latihan: 88, uh: 85, pts: 87, pas: 90, notes: 'Konsisten' },
    { id: 5, nis: '2024005', name: 'Riko Saputra', latihan: 78, uh: 75, pts: 76, pas: 80, notes: 'Cukup baik' },
    { id: 6, nis: '2024006', name: 'Aisyah Putri', latihan: 92, uh: 90, pts: 91, pas: 93, notes: 'Excellent' },
    { id: 7, nis: '2024007', name: 'Farhan Ali', latihan: 80, uh: 82, pts: 81, pas: 85, notes: 'Baik' },
    { id: 8, nis: '2024008', name: 'Nadia Rahman', latihan: 87, uh: 84, pts: 86, pas: 89, notes: 'Sangat baik' }
  ]);

  const [selectedClass, setSelectedClass] = useState(null);

  const calculateAverage = (student) => {
    const avg = (student.latihan + student.uh + student.pts + student.pas) / 4;
    return avg.toFixed(1);
  };

  const handleViewDetail = (classData) => {
    setSelectedClass(classData);
    setCurrentPage('input-nilai');
  };

  const handleEdit = (student) => {
    setEditingStudent({ ...student });
  };

  const handleSaveEdit = () => {
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    setEditingStudent(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleAddStudent = () => {
    // Validasi hanya untuk nilai-nilai sekarang
    if (newStudent.latihan === 0 && newStudent.uh === 0 && newStudent.pts === 0 && newStudent.pas === 0) {
      alert('Silakan masukkan setidaknya satu nilai!');
      return;
    }
    const id = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    // Dummy NIS dan Nama untuk demo (di sistem nyata, ini akan dipilih dari daftar siswa)
    setStudents([...students, { 
      id, 
      nis: `NEW${id}`, 
      name: 'Siswa Baru', 
      ...newStudent 
    }]);
    setShowAddModal(false);
    setNewStudent({ latihan: 0, uh: 0, pts: 0, pas: 0, notes: '' });
  };

  const handleSaveProfile = () => {
    alert(`Profil berhasil diperbarui!\nNama: ${profileData.name}\nNIP: ${profileData.nip}`);
    setShowProfileModal(false);
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const filteredClasses = classes.filter(c => c.tingkat === activeTab);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 🔸 HEADER UTAMA - LOGO & TEKS DI KIRI, PROFIL DI KANAN 🔸 */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          {/* Logo dan Teks di Sebelah Kiri */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/logoUA.jpg" 
              alt="Logo SDIT Ulil Albab" 
              className="w-12 h-12 rounded"
            />
            <h1 className="text-2xl font-bold text-gray-800">E-Rapor SDIT Ulil Albab</h1>
          </div>

          {/* Profil Pengguna di Pojok Kanan Atas */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2"
            >
              <span className="text-sm font-medium text-gray-700">{profileData.name}</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <ChevronRight size={16} className="rotate-90" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-blue-600"
                >
                  <User size={16} />
                  <span>Ubah Profil</span>
                </button>
                <button
                  onClick={() => alert('Logout clicked')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-orange-600 text-white transition-all duration-300 flex flex-col`}>
          <div className="p-4 flex items-center justify-between border-b border-orange-500">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-orange-500 rounded">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          
          <nav className="flex-1 p-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 ${
                currentPage === 'dashboard' ? 'bg-orange-500' : 'hover:bg-orange-500'
              }`}
            >
              <Home size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </button>
            
            <button
              onClick={() => setCurrentPage('input-nilai')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
                currentPage === 'input-nilai' ? 'bg-orange-500' : 'hover:bg-orange-500'
              }`}
            >
              <Edit size={20} />
              {sidebarOpen && <span>Input Nilai</span>}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* 🔸 HEADER KONTEN (Dashboard / Input Nilai) - TETAP DI KIRI */}
          <header className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentPage === 'dashboard' ? 'Dashboard' : 'Input Nilai'}
              </h2>
              
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{profileData.name}</p>
                    <p className="text-xs text-gray-500">{profileData.nip}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-blue-600"
                    >
                      <User size={16} />
                      <span>Ubah Profil</span>
                    </button>
                    <button
                      onClick={() => alert('Logout clicked')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 overflow-auto">
            {currentPage === 'dashboard' ? (
              <>
                {/* 🔸 CARD "SELAMAT DATANG" TANPA LOGO 🔸 */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    Selamat Datang, {profileData.name}! 👋
                  </h2>
                  <p className="text-orange-100">
                    NIP: {profileData.nip} • Kelola nilai siswa SD dengan mudah
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    {[1, 2, 3, 4, 5, 6].map((tingkat) => (
                      <button
                        key={tingkat}
                        onClick={() => setActiveTab(tingkat)}
                        className={`flex-1 px-6 py-4 font-semibold text-center transition ${
                          activeTab === tingkat
                            ? 'bg-orange-500 text-white border-b-4 border-orange-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Kelas {tingkat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Hapus logo dari sini */}
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Daftar Kelas {activeTab}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Pilih kelas untuk input nilai siswa
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kelas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Siswa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredClasses.map((classData, index) => (
                          <tr key={classData.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{classData.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{classData.studentCount} siswa</td>
                            <td className="px-6 py-4">
                              {/* Gunakan komponen Eye dari lucide-react dan ubah teks menjadi "Detail" */}
                              <button
                                onClick={() => handleViewDetail(classData)}
                                className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium text-sm bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md"
                              >
                                <Eye size={16} />
                                <span>Detail</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <button
                        onClick={() => setCurrentPage('dashboard')}
                        className="text-orange-600 hover:text-orange-700 mb-2 flex items-center space-x-1"
                      >
                        <ChevronRight size={16} className="rotate-180" />
                        <span>Kembali ke Dashboard</span>
                      </button>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {selectedClass ? selectedClass.name : 'Input Nilai'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Mata Pelajaran: {profileData.subject}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>Tambah Nilai</span>
                    </button>
                  </div>
                </div>

                {/* 🔸 TABEL INPUT NILAI DENGAN TEKS "EDIT" DAN "HAPUS" 🔸 */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latihan</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ulangan Harian</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PTS</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAS</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rata-rata</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {students.map((student, index) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{student.nis}</td>
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{student.latihan}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{student.uh}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{student.pts}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{student.pas}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-gray-900">{calculateAverage(student)}</td>
                            <td className="px-4 py-4">
                              <div className="flex space-x-2">
                                {/* Tambahkan teks "Edit" di samping ikon */}
                                <button
                                  onClick={() => handleEdit(student)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                  <span className="text-sm font-medium">Edit</span>
                                </button>
                                {/* Tambahkan teks "Hapus" di samping ikon */}
                                <button
                                  onClick={() => handleDelete(student.id)}
                                  className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                                  title="Hapus"
                                >
                                  <Trash2 size={18} />
                                  <span className="text-sm font-medium">Hapus</span>
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{student.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal Ubah Profil */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Ubah Profil</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                <input
                  type="text"
                  value={profileData.nip}
                  onChange={(e) => setProfileData({...profileData, nip: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nomor Induk Pegawai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Nilai - {editingStudent.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latihan</label>
                <input
                  type="number"
                  value={editingStudent.latihan}
                  onChange={(e) => setEditingStudent({...editingStudent, latihan: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ulangan Harian</label>
                <input
                  type="number"
                  value={editingStudent.uh}
                  onChange={(e) => setEditingStudent({...editingStudent, uh: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PTS</label>
                <input
                  type="number"
                  value={editingStudent.pts}
                  onChange={(e) => setEditingStudent({...editingStudent, pts: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAS</label>
                <input
                  type="number"
                  value={editingStudent.pas}
                  onChange={(e) => setEditingStudent({...editingStudent, pas: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={editingStudent.notes}
                  onChange={(e) => setEditingStudent({...editingStudent, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
              >
                Simpan
              </button>
              <button
                onClick={() => setEditingStudent(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal - DIPERBARUI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Tambah Nilai</h3>
            <div className="space-y-4">
              {/* Kolom NIS dan Nama dihapus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latihan</label>
                <input
                  type="number"
                  value={newStudent.latihan}
                  onChange={(e) => setNewStudent({...newStudent, latihan: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ulangan Harian</label>
                <input
                  type="number"
                  value={newStudent.uh}
                  onChange={(e) => setNewStudent({...newStudent, uh: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PTS</label>
                <input
                  type="number"
                  value={newStudent.pts}
                  onChange={(e) => setNewStudent({...newStudent, pts: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAS</label>
                <input
                  type="number"
                  value={newStudent.pas}
                  onChange={(e) => setNewStudent({...newStudent, pas: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Catatan tambahan"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddStudent}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
              >
                Tambah
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </div>
  );
}