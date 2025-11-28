'use client';

import { useState } from 'react';
import { ChevronRight, Menu, X, LogOut, User, Edit, Trash2, Plus, Home } from 'lucide-react';

export default function GuruBidangStudiDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    uh1: 0, uh2: 0, uh3: 0, uh4: 0, uh5: 0, pts: 0, pas: 0, deskripsi: ''
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
    { id: 1, nis: '2024001', name: 'Ahmad Fauzi', uh1: 80, uh2: 82, uh3: 78, uh4: 85, uh5: 83, pts: 82, pas: 88, deskripsi: 'Bagus' },
    { id: 2, nis: '2024002', name: 'Siti Nurhaliza', uh1: 88, uh2: 89, uh3: 90, uh4: 87, uh5: 91, pts: 89, pas: 92, deskripsi: 'Sangat baik' },
    { id: 3, nis: '2024003', name: 'Budi Prasetyo', uh1: 70, uh2: 72, uh3: 68, uh4: 71, uh5: 73, pts: 72, pas: 78, deskripsi: 'Perlu ditingkatkan' },
    { id: 4, nis: '2024004', name: 'Dewi Lestari', uh1: 85, uh2: 86, uh3: 84, uh4: 87, uh5: 88, pts: 87, pas: 90, deskripsi: 'Konsisten' },
    { id: 5, nis: '2024005', name: 'Riko Saputra', uh1: 75, uh2: 76, uh3: 74, uh4: 77, uh5: 78, pts: 76, pas: 80, deskripsi: 'Cukup baik' },
    { id: 6, nis: '2024006', name: 'Aisyah Putri', uh1: 90, uh2: 91, uh3: 92, uh4: 93, uh5: 94, pts: 91, pas: 93, deskripsi: 'Excellent' },
    { id: 7, nis: '2024007', name: 'Farhan Ali', uh1: 82, uh2: 83, uh3: 81, uh4: 84, uh5: 85, pts: 81, pas: 85, deskripsi: 'Baik' },
    { id: 8, nis: '2024008', name: 'Nadia Rahman', uh1: 84, uh2: 85, uh3: 86, uh4: 87, uh5: 88, pts: 86, pas: 89, deskripsi: 'Sangat baik' }
  ]);

  const [selectedClass, setSelectedClass] = useState(null);

  const calculateRapor = (student) => {
    const total = student.uh1 + student.uh2 + student.uh3 + student.uh4 + student.uh5 + student.pts + student.pas;
    const avg = total / 7;
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
    if (
      newStudent.uh1 === 0 &&
      newStudent.uh2 === 0 &&
      newStudent.uh3 === 0 &&
      newStudent.uh4 === 0 &&
      newStudent.uh5 === 0 &&
      newStudent.pts === 0 &&
      newStudent.pas === 0
    ) {
      alert('Silakan masukkan setidaknya satu nilai!');
      return;
    }
    const id = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    setStudents([...students, { 
      id, 
      nis: `NEW${id}`, 
      name: 'Siswa Baru', 
      ...newStudent 
    }]);
    setShowAddModal(false);
    setNewStudent({ uh1: 0, uh2: 0, uh3: 0, uh4: 0, uh5: 0, pts: 0, pas: 0, deskripsi: '' });
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const filteredClasses = classes.filter(c => c.tingkat === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="/images/logoUA.jpg"
              alt="Logo SDIT Ulil Albab"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                E-Rapor SDIT Ulil Albab
              </h1>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profileData.name}</p>
                <p className="text-xs text-gray-500">{profileData.nip}</p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <ChevronRight size={16} className="text-gray-600 rotate-90" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{profileData.name}</p>
                  <p className="text-sm text-gray-500">{profileData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      {profileData.role}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <User size={16} />
                    <span className="text-sm">Profil Saya</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div 
          className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white text-gray-800 border-r border-gray-200 transition-all duration-300 flex flex-col flex-shrink-0 shadow-lg`}
        >
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 hover:bg-gray-200 rounded"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => {
                setCurrentPage('dashboard');
                setSelectedClass(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                currentPage === 'dashboard'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-800 hover:bg-orange-100'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <Home className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
            </button>

            <button
              onClick={() => setCurrentPage('input-nilai')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                currentPage === 'input-nilai'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-800 hover:bg-orange-100'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <Edit className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm font-medium">Input Nilai</span>}
            </button>
          </nav>
        </div>

        {/* Konten Utama */}
        <main className="flex-1 overflow-auto p-6">
          {currentPage === 'dashboard' ? (
            <>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                  Selamat Datang, {profileData.name}! 👋
                </h2>
                <p className="text-orange-100">
                  NIP: {profileData.nip} • Mata Pelajaran: {profileData.subject}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-200">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredClasses.map((classData) => (
                  <div
                    key={classData.id}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => handleViewDetail(classData)}
                  >
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <User size={28} className="text-orange-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{classData.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{classData.studentCount} siswa</p>
                    <button className="mt-4 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-1 rounded-full font-medium">
                      Detail
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedClass ? selectedClass.name : 'Input Nilai'}
                    </h3>
                    <p className="text-orange-100 mt-1">
                      Mata Pelajaran: {profileData.subject}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-white text-orange-600 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
                  >
                    <Plus size={20} />
                    <span>Tambah Nilai</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">NIS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">UH1</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">UH2</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">UH3</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">UH4</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">UH5</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">PTS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">PAS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nilai Rapor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Aksi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.nis}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.uh1}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.uh2}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.uh3}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.uh4}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.uh5}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.pts}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{student.pas}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">{calculateRapor(student)}</td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(student)}
                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <Edit size={18} />
                                <span className="text-sm font-medium">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(student.id)}
                                className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                              >
                                <Trash2 size={18} />
                                <span className="text-sm font-medium">Hapus</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{student.deskripsi}</td>
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

      {/* MODAL PROFIL */}
      {showProfileModal && (
        <div 
          className="fixed top-0 left-0 w-full h-screen flex items-center justify-center z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
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
                onClick={() => {
                  alert(`Profil berhasil diperbarui!\nNama: ${profileData.name}\nNIP: ${profileData.nip}`);
                  setShowProfileModal(false);
                }}
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

      {/* MODAL EDIT */}
      {editingStudent && (
        <div 
          className="fixed top-0 left-0 w-full h-screen flex items-center justify-center z-50"
          onClick={() => setEditingStudent(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Edit Nilai - {editingStudent.name}</h3>
            <div className="space-y-4">
              {['uh1', 'uh2', 'uh3', 'uh4', 'uh5', 'pts', 'pas'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    value={editingStudent[field]}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                      setEditingStudent(prev => ({ ...prev, [field]: val }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={editingStudent.deskripsi}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, deskripsi: e.target.value }))}
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

      {/* MODAL TAMBAH */}
      {showAddModal && (
        <div 
          className="fixed top-0 left-0 w-full h-screen flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Tambah Nilai</h3>
            <div className="space-y-4">
              {['uh1', 'uh2', 'uh3', 'uh4', 'uh5', 'pts', 'pas'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    value={newStudent[field]}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) || 0 : 0;
                      setNewStudent(prev => ({ ...prev, [field]: val }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0–100"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={newStudent.deskripsi}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, deskripsi: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Deskripsi tambahan"
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

      {profileOpen && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setProfileOpen(false)} />
      )}
    </div>
  );
}