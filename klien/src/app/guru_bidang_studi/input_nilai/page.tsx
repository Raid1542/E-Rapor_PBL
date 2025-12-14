// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    ChevronRight,
    Menu,
    X,
    LogOut,
    User,
    Edit,
    Trash2,
    Plus,
    Home,
    Pencil,
} from 'lucide-react';

interface ProfileData {
    name: string;
    role: string;
    subject: string;
    email: string;
    phone: string;
    nip: string;
}

interface Kelas {
    id: number;
    name: string;
    tingkat: number;
    studentCount: number;
}

interface Siswa {
    id: number;
    nis: string;
    name: string;
    uh1: number;
    uh2: number;
    uh3: number;
    uh4: number;
    uh5: number;
    pts: number;
    pas: number;
    deskripsi: string;
}

export default function GuruBidangStudiDashboard() {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'input-nilai'>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    const [editingStudent, setEditingStudent] = useState<Siswa | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudent, setNewStudent] = useState<{
        uh1: number;
        uh2: number;
        uh3: number;
        uh4: number;
        uh5: number;
        pts: number;
        pas: number;
    }>({
        uh1: 0,
        uh2: 0,
        uh3: 0,
        uh4: 0,
        uh5: 0,
        pts: 0,
        pas: 0,
    });

    const [profileData, setProfileData] = useState<ProfileData>({
        name: 'Noir Prince S.Pd.',
        role: 'Guru Bidang Studi',
        subject: 'Matematika',
        email: 'noir.prince@sditulilalbab.sch.id',
        phone: '+6281234567890',
        nip: '198507122010011005',
    });

    // ✅ Kelas 1A sampai 6E (30 kelas)
    const [classes] = useState<Kelas[]>([
        // Kelas 1
        { id: 1, name: 'Kelas 1A', tingkat: 1, studentCount: 1 },
        { id: 2, name: 'Kelas 1B', tingkat: 1, studentCount: 1 },
        { id: 3, name: 'Kelas 1C', tingkat: 1, studentCount: 1 },
        { id: 4, name: 'Kelas 1D', tingkat: 1, studentCount: 1 },
        { id: 5, name: 'Kelas 1E', tingkat: 1, studentCount: 1 },
        // Kelas 2
        { id: 6, name: 'Kelas 2A', tingkat: 2, studentCount: 1 },
        { id: 7, name: 'Kelas 2B', tingkat: 2, studentCount: 1 },
        { id: 8, name: 'Kelas 2C', tingkat: 2, studentCount: 1 },
        { id: 9, name: 'Kelas 2D', tingkat: 2, studentCount: 1 },
        { id: 10, name: 'Kelas 2E', tingkat: 2, studentCount: 1 },
        // Kelas 3
        { id: 11, name: 'Kelas 3A', tingkat: 3, studentCount: 1 },
        { id: 12, name: 'Kelas 3B', tingkat: 3, studentCount: 1 },
        { id: 13, name: 'Kelas 3C', tingkat: 3, studentCount: 1 },
        { id: 14, name: 'Kelas 3D', tingkat: 3, studentCount: 1 },
        { id: 15, name: 'Kelas 3E', tingkat: 3, studentCount: 1 },
        // Kelas 4
        { id: 16, name: 'Kelas 4A', tingkat: 4, studentCount: 1 },
        { id: 17, name: 'Kelas 4B', tingkat: 4, studentCount: 1 },
        { id: 18, name: 'Kelas 4C', tingkat: 4, studentCount: 1 },
        { id: 19, name: 'Kelas 4D', tingkat: 4, studentCount: 1 },
        { id: 20, name: 'Kelas 4E', tingkat: 4, studentCount: 1 },
        // Kelas 5
        { id: 21, name: 'Kelas 5A', tingkat: 5, studentCount: 1 },
        { id: 22, name: 'Kelas 5B', tingkat: 5, studentCount: 1 },
        { id: 23, name: 'Kelas 5C', tingkat: 5, studentCount: 1 },
        { id: 24, name: 'Kelas 5D', tingkat: 5, studentCount: 1 },
        { id: 25, name: 'Kelas 5E', tingkat: 5, studentCount: 1 },
        // Kelas 6
        { id: 26, name: 'Kelas 6A', tingkat: 6, studentCount: 1 },
        { id: 27, name: 'Kelas 6B', tingkat: 6, studentCount: 1 },
        { id: 28, name: 'Kelas 6C', tingkat: 6, studentCount: 1 },
        { id: 29, name: 'Kelas 6D', tingkat: 6, studentCount: 1 },
        { id: 30, name: 'Kelas 6E', tingkat: 6, studentCount: 1 },
    ]);

    // ✅ Satu siswa unik per kelas
    const [classStudents, setClassStudents] = useState<Record<number, Siswa[]>>(() => {
        const names = [
            'Ariel Putra', 'Bunga Sari', 'Candra Wijaya', 'Dinda Permata', 'Eka Prasetya',
            'Fajar Nugroho', 'Gina Lestari', 'Hendra Gunawan', 'Intan Cahaya', 'Joko Santoso',
            'Karina Dewi', 'Lukman Hakim', 'Mira Anggraini', 'Nanda Pratama', 'Olivia Rahayu',
            'Pandu Wirawan', 'Qori Amalia', 'Raka Adhitama', 'Salsa Firdaus', 'Taufik Hidayat',
            'Ulya Maharani', 'Vino Darmawan', 'Winda Kusuma', 'Xavier Andika', 'Yuniarti Putri',
            'Zahra Maulida', 'Abimanyu', 'Bella Safira', 'Cinta Rani', 'Dimas Arya'
        ];
        const initial: Record<number, Siswa[]> = {};
        for (let i = 0; i < 30; i++) {
            const id = i + 1;
            const nilaiDasar = 70 + (i % 20); // variasi nilai
            initial[id] = [{
                id: id,
                nis: `NIS2024${String(id).padStart(3, '0')}`,
                name: names[i],
                uh1: nilaiDasar,
                uh2: nilaiDasar + 2,
                uh3: nilaiDasar - 1,
                uh4: nilaiDasar + 3,
                uh5: nilaiDasar + 1,
                pts: nilaiDasar + 2,
                pas: nilaiDasar + 4,
                deskripsi: '', // akan diisi otomatis
            }];
        }
        return initial;
    });

    const [selectedClass, setSelectedClass] = useState<Kelas | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!showAddModal) {
            inputRefs.current = [];
        } else {
            setTimeout(() => {
                if (inputRefs.current[0]) inputRefs.current[0].focus();
            }, 100);
        }
    }, [showAddModal]);

    const calculateRapor = (student: Siswa) => {
        const { uh1, uh2, uh3, uh4, uh5, pts, pas } = student;
        const total = uh1 + uh2 + uh3 + uh4 + uh5 + pts + pas;
        return parseFloat((total / 7).toFixed(1));
    };

    const getGradeAndDescription = (average: number): { grade: string; description: string } => {
        if (average >= 90) return { grade: 'A', description: 'Sangat Baik' };
        if (average >= 80) return { grade: 'B', description: 'Baik' };
        if (average >= 70) return { grade: 'C', description: 'Cukup' };
        if (average >= 60) return { grade: 'D', description: 'Kurang' };
        return { grade: 'E', description: 'Sangat Kurang' };
    };

    const handleViewDetail = (classData: Kelas) => {
        setSelectedClass(classData);
        setCurrentPage('input-nilai');
    };

    const handleEdit = (student: Siswa) => {
        setEditingStudent({ ...student });
    };

    const handleSaveEdit = () => {
        if (!editingStudent || !selectedClass) return;

        const { uh1, uh2, uh3, uh4, uh5, pts, pas } = editingStudent;
        const total = uh1 + uh2 + uh3 + uh4 + uh5 + pts + pas;
        const average = total / 7;
        const { description } = getGradeAndDescription(average);

        setClassStudents(prev => ({
            ...prev,
            [selectedClass.id]: prev[selectedClass.id].map(s =>
                s.id === editingStudent.id ? { ...editingStudent, deskripsi: description } : s
            )
        }));

        setEditingStudent(null);
    };

    const handleDelete = (id: number) => {
        if (!selectedClass) return;
        if (window.confirm('Hapus data siswa ini?')) {
            setClassStudents(prev => ({
                ...prev,
                [selectedClass.id]: prev[selectedClass.id].filter(s => s.id !== id)
            }));
        }
    };

    const handleAddStudent = () => {
        if (!selectedClass) return;

        const { uh1, uh2, uh3, uh4, uh5, pts, pas } = newStudent;
        const total = uh1 + uh2 + uh3 + uh4 + uh5 + pts + pas;
        if (total === 0) {
            alert('Masukkan minimal satu nilai!');
            return;
        }

        const average = total / 7;
        const { description } = getGradeAndDescription(average);

        const currentList = classStudents[selectedClass.id] || [];
        const id = currentList.length > 0 ? Math.max(...currentList.map(s => s.id)) + 1 : 1;

        const newSiswa: Siswa = {
            id,
            nis: `NIS2024${String(id).padStart(3, '0')}`,
            name: `Siswa Baru ${selectedClass.name}`,
            uh1,
            uh2,
            uh3,
            uh4,
            uh5,
            pts,
            pas,
            deskripsi: description,
        };

        setClassStudents(prev => ({
            ...prev,
            [selectedClass.id]: [...(prev[selectedClass.id] || []), newSiswa]
        }));

        setShowAddModal(false);
        setNewStudent({ uh1: 0, uh2: 0, uh3: 0, uh4: 0, uh5: 0, pts: 0, pas: 0 });
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextIndex = index + 1;
            if (inputRefs.current[nextIndex]) {
                inputRefs.current[nextIndex]?.focus();
            }
        }
    };

    const [showProfileModal, setShowProfileModal] = useState(false);
    const filteredClasses = classes.filter((c) => c.tingkat === activeTab);
    const currentStudents = selectedClass ? classStudents[selectedClass.id] || [] : [];

    // Hitung deskripsi awal untuk semua siswa (saat load)
    useEffect(() => {
        const updated: Record<number, Siswa[]> = {};
        Object.entries(classStudents).forEach(([kelasId, siswaList]) => {
            updated[parseInt(kelasId)] = siswaList.map(s => {
                const avg = calculateRapor(s);
                const { description } = getGradeAndDescription(avg);
                return { ...s, deskripsi: description };
            });
        });
        setClassStudents(updated);
    }, []);

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
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${currentPage === 'dashboard'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-800 hover:bg-orange-100'
                                } ${!sidebarOpen && 'justify-center'}`}
                        >
                            <Home className="w-5 h-5" />
                            {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
                        </button>
                        <button
                            onClick={() => setCurrentPage('input-nilai')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${currentPage === 'input-nilai'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-800 hover:bg-orange-100'
                                } ${!sidebarOpen && 'justify-center'}`}
                        >
                            <Edit className="w-5 h-5" />
                            {sidebarOpen && <span className="text-sm font-medium">Input Nilai</span>}
                        </button>
                    </nav>
                </div>

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
                                            className={`flex-1 px-6 py-4 font-semibold text-center transition ${activeTab === tingkat
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
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Rapor (Grade)</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Aksi</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Deskripsi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {currentStudents.map((student, index) => (
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
                                                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                                                        {calculateRapor(student).toFixed(1)} ({getGradeAndDescription(calculateRapor(student)).grade})
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEdit(student)}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-yellow-400 bg-yellow-100 text-black hover:bg-yellow-200 text-sm font-medium"
                                                            >
                                                                <Pencil size={14} />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(student.id)}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-red-400 bg-red-100 text-black hover:bg-red-200 text-sm font-medium"
                                                            >
                                                                <Trash2 size={14} />
                                                                <span>Hapus</span>
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
                            {(['uh1', 'uh2', 'uh3', 'uh4', 'uh5', 'pts', 'pas'] as const).map((field, idx) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.toUpperCase()}
                                    </label>
                                    <input
                                        ref={(el) => {
                                            inputRefs.current[idx] = el;
                                        }}
                                        type="number"
                                        value={newStudent[field]}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseInt(e.target.value, 10) || 0 : 0;
                                            setNewStudent(prev => ({ ...prev, [field]: val }));
                                        }}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        min="0"
                                        max="100"
                                        step="1"
                                    />
                                </div>
                            ))}
                            {/* Preview deskripsi otomatis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Otomatis</label>
                                {(() => {
                                    const { uh1, uh2, uh3, uh4, uh5, pts, pas } = newStudent;
                                    const total = uh1 + uh2 + uh3 + uh4 + uh5 + pts + pas;
                                    if (total === 0) return <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">-</div>;
                                    const avg = total / 7;
                                    const { description } = getGradeAndDescription(avg);
                                    return <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">{description}</div>;
                                })()}
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
                            {(['uh1', 'uh2', 'uh3', 'uh4', 'uh5', 'pts', 'pas'] as const).map((field, idx) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {field.toUpperCase()}
                                    </label>
                                    <input
                                        type="number"
                                        value={editingStudent[field]}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                                            setEditingStudent(prev => prev ? { ...prev, [field]: val } : null);
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            ))}
                            {/* Preview deskripsi otomatis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Otomatis</label>
                                {(() => {
                                    if (!editingStudent) return <div>-</div>;
                                    const { uh1, uh2, uh3, uh4, uh5, pts, pas } = editingStudent;
                                    const total = uh1 + uh2 + uh3 + uh4 + uh5 + pts + pas;
                                    const avg = total / 7;
                                    const { description } = getGradeAndDescription(avg);
                                    return <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">{description}</div>;
                                })()}
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
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                                <input
                                    type="text"
                                    value={profileData.nip}
                                    onChange={(e) => setProfileData({ ...profileData, nip: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                                <input
                                    type="text"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
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

            {profileOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setProfileOpen(false)} />
            )}
        </div>
    );
}