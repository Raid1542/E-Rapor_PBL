'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Pencil, X, Plus, Trash2 } from 'lucide-react';

// ====== TYPES ======

interface KategoriNilai {
    id: number;
    min_nilai: number;
    max_nilai: number;
    kategori: 'kokurikuler' | 'akademik';
    grade: string;
    deskripsi: string;
    urutan: number;
}

interface KomponenPenilaian {
    id_komponen: number;
    nama_komponen: string;
    urutan: number;
}

interface BobotItem {
    komponen_id: number;
    bobot: number;
    is_active: boolean;
}

interface MapelItem {
    mata_pelajaran_id: number;
    nama_mapel: string;
    jenis: 'wajib' | 'pilihan';
    bisa_input: boolean;
}

// ====== MAIN COMPONENT ======

export default function AturPenilaianPage() {
    // State umum
    const [activeTab, setActiveTab] = useState<'kokurikuler' | 'akademik' | 'bobot'>('kokurikuler');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Kategori
    const [kategoriList, setKategoriList] = useState<KategoriNilai[]>([]);
    const [showEditKategori, setShowEditKategori] = useState(false);
    const [editKategoriId, setEditKategoriId] = useState<number | null>(null);
    const [editKategoriClosing, setEditKategoriClosing] = useState(false);
    const [editKategoriData, setEditKategoriData] = useState<Omit<KategoriNilai, 'id' | 'urutan'>>({
        min_nilai: 0,
        max_nilai: 100,
        kategori: 'kokurikuler',
        grade: 'A',
        deskripsi: ''
    });

    // Bobot
    const [mapelList, setMapelList] = useState<MapelItem[]>([]);
    const [selectedMapelId, setSelectedMapelId] = useState<number | null>(null);
    const [komponenList, setKomponenList] = useState<KomponenPenilaian[]>([]);
    const [bobotList, setBobotList] = useState<BobotItem[]>([]);
    const [bobotLoading, setBobotLoading] = useState(false);

    // ====== FETCH DATA ======

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Token tidak ditemukan');

                // Ambil komponen & mapel (sama untuk semua tab)
                const [resKomponen, resMapel] = await Promise.all([
                    fetch('http://localhost:5000/api/guru-kelas/atur-penilaian/komponen', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/guru-kelas/mapel', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (!resKomponen.ok || !resMapel.ok) throw new Error('Gagal mengambil data pendukung');

                const komponenData = await resKomponen.json();
                const mapelData = await resMapel.json();

                setKomponenList(komponenData.data || []);
                setMapelList([...(mapelData.wajib || []), ...(mapelData.pilihan || [])]);
            } catch (err: any) {
                console.error('Error fetch data:', err);
                setError(err.message || 'Gagal memuat data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch kategori saat tab berubah
    useEffect(() => {
        const fetchKategori = async () => {
            if (activeTab === 'bobot') return;

            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(
                    `http://localhost:5000/api/guru-kelas/atur-penilaian/kategori?kategori=${activeTab}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) throw new Error('Gagal mengambil kategori');
                const data = await res.json();
                setKategoriList(data.data || []);
            } catch (err: any) {
                console.error('Error fetch kategori:', err);
                setError(err.message || 'Gagal memuat kategori');
            } finally {
                setLoading(false);
            }
        };

        fetchKategori();
    }, [activeTab]);

    // Fetch bobot saat mapel dipilih
    useEffect(() => {
        if (selectedMapelId === null || activeTab !== 'bobot') {
            setBobotList([]);
            return;
        }

        const fetchBobot = async () => {
            setBobotLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/guru-kelas/atur-penilaian/bobot/${selectedMapelId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const bobotMap = new Map<number, number>();
                    (data.data || []).forEach((b: any) => {
                        bobotMap.set(b.komponen_id, b.bobot);
                    });

                    const fullBobot = komponenList.map(k => ({
                        komponen_id: k.id_komponen,
                        bobot: bobotMap.get(k.id_komponen) || 0,
                        is_active: bobotMap.has(k.id_komponen) && bobotMap.get(k.id_komponen) > 0
                    }));
                    setBobotList(fullBobot);
                }
            } catch (err) {
                alert('Gagal mengambil bobot penilaian');
            } finally {
                setBobotLoading(false);
            }
        };

        fetchBobot();
    }, [selectedMapelId, komponenList, activeTab]);

    // ====== KATEGORI ======

    const openEditKategori = (kategori: KategoriNilai | null = null) => {
        if (kategori) {
            setEditKategoriId(kategori.id);
            setEditKategoriData({
                min_nilai: kategori.min_nilai,
                max_nilai: kategori.max_nilai,
                kategori: kategori.kategori,
                grade: kategori.grade,
                deskripsi: kategori.deskripsi
            });
        } else {
            setEditKategoriId(null);
            setEditKategoriData({
                min_nilai: 0,
                max_nilai: 100,
                kategori: activeTab as 'kokurikuler' | 'akademik',
                grade: 'A',
                deskripsi: ''
            });
        }
        setShowEditKategori(true);
    };

    const closeEditKategori = () => {
        setEditKategoriClosing(true);
        setTimeout(() => {
            setShowEditKategori(false);
            setEditKategoriClosing(false);
            setEditKategoriId(null);
        }, 200);
    };

    const handleSaveKategori = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = editKategoriId
                ? `http://localhost:5000/api/guru-kelas/atur-penilaian/kategori/${editKategoriId}`
                : `http://localhost:5000/api/guru-kelas/atur-penilaian/kategori`;

            const res = await fetch(url, {
                method: editKategoriId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editKategoriData)
            });

            if (res.ok) {
                alert(editKategoriId ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
                closeEditKategori();
                // Reload
                const resReload = await fetch(
                    `http://localhost:5000/api/guru-kelas/atur-penilaian/kategori?kategori=${activeTab}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await resReload.json();
                setKategoriList(data.data || []);
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menyimpan kategori');
            }
        } catch (err: any) {
            alert('Gagal menyimpan: ' + err.message);
        }
    };

    const handleDeleteKategori = async (id: number) => {
        if (!confirm('Hapus kategori ini?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/guru-kelas/atur-penilaian/kategori/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setKategoriList(kategoriList.filter(k => k.id !== id));
                alert('Kategori berhasil dihapus');
            } else {
                alert('Gagal menghapus kategori');
            }
        } catch (err) {
            alert('Gagal menghubungi server');
        }
    };

    // ====== BOBOT ======

    const handleBobotChange = (komponenId: number, value: string) => {
        const newValue = parseFloat(value) || 0;
        setBobotList(prev =>
            prev.map(b => (b.komponen_id === komponenId ? { ...b, bobot: newValue } : b))
        );
    };

    const handleSaveBobot = async () => {
        if (!selectedMapelId) return;

        const total = bobotList.reduce((sum, b) => sum + b.bobot, 0);
        if (Math.abs(total - 100) > 0.1) {
            alert('Total bobot harus 100%');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/guru-kelas/atur-penilaian/bobot/${selectedMapelId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bobotList)
            });

            if (res.ok) {
                alert('Bobot penilaian berhasil disimpan');
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menyimpan bobot');
            }
        } catch (err) {
            alert('Gagal menyimpan bobot');
        }
    };

    // ====== RENDER ======

    if (loading) {
        return (
            <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Memuat data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-red-600">Error: {error}</div>
            </div>
        );
    }

    // ✅ Main content — hanya di-render jika tidak loading & tidak error
    return (
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Atur Penilaian</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'kokurikuler' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('kokurikuler')}
                    >
                        Kategori Kokurikuler
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'akademik' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('akademik')}
                    >
                        Kategori Akademik
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'bobot' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('bobot')}
                    >
                        Atur Bobot Penilaian
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'kokurikuler' || activeTab === 'akademik' ? (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {activeTab === 'kokurikuler' ? 'Kategori Nilai Kokurikuler' : 'Kategori Nilai Akademik (Nilai Rapor)'}
                            </h2>
                            <button
                                onClick={() => openEditKategori()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Tambah Kategori
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full min-w-[600px] table-auto text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-3 text-center bg-gray-800 text-white font-semibold">Grade</th>
                                        <th className="px-3 py-3 text-center bg-gray-800 text-white font-semibold">Range Nilai</th>
                                        <th className="px-3 py-3 text-center bg-gray-800 text-white font-semibold">Deskripsi</th>
                                        <th className="px-3 py-3 text-center bg-gray-800 text-white font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kategoriList.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                                Belum ada kategori
                                            </td>
                                        </tr>
                                    ) : (
                                        kategoriList.map((kategori) => (
                                            <tr key={kategori.id} className="border-b hover:bg-gray-50">
                                                <td className="px-3 py-3 text-center font-medium">{kategori.grade}</td>
                                                <td className="px-3 py-3 text-center">
                                                    {kategori.min_nilai} – {kategori.max_nilai}
                                                </td>
                                                <td className="px-3 py-3 text-center max-w-[250px] truncate" title={kategori.deskripsi}>
                                                    {kategori.deskripsi}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditKategori(kategori)}
                                                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 text-xs"
                                                        >
                                                            <Pencil size={16} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteKategori(kategori.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                                                        >
                                                            <Trash2 size={16} />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Mata Pelajaran
                            </label>
                            <select
                                value={selectedMapelId || ''}
                                onChange={(e) => setSelectedMapelId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">-- Pilih Mata Pelajaran --</option>
                                {mapelList.map((mapel) => (
                                    <option key={mapel.mata_pelajaran_id} value={mapel.mata_pelajaran_id}>
                                        {mapel.nama_mapel} ({mapel.jenis})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedMapelId && (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Atur Bobot untuk: {mapelList.find(m => m.mata_pelajaran_id === selectedMapelId)?.nama_mapel}
                                </h2>

                                {bobotLoading ? (
                                    <div className="text-gray-500">Memuat bobot...</div>
                                ) : (
                                    <div className="space-y-4">
                                        {bobotList.map((bobot) => {
                                            const komponen = komponenList.find(k => k.id_komponen === bobot.komponen_id);
                                            return (
                                                <div key={bobot.komponen_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                                                    <span className="font-medium min-w-[100px]">{komponen?.nama_komponen || 'Komponen'}</span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={bobot.bobot}
                                                            onChange={(e) => handleBobotChange(bobot.komponen_id, e.target.value)}
                                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                                        />
                                                        <span className="text-gray-600">%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="pt-4 border-t">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Total Bobot:</span>
                                                <span className={`text-lg font-bold ${Math.abs(bobotList.reduce((sum, b) => sum + b.bobot, 0) - 100) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {bobotList.reduce((sum, b) => sum + b.bobot, 0).toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-6">
                                            <button
                                                onClick={handleSaveBobot}
                                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
                                            >
                                                Simpan Bobot
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Edit Kategori */}
            {showEditKategori && (
                <div
                    className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${editKategoriClosing ? 'opacity-0' : 'opacity-100'} p-3 sm:p-4`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeEditKategori();
                    }}
                >
                    <div className="absolute inset-0 bg-gray-900/70"></div>
                    <div
                        className={`relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto transform transition-all duration-200 ${editKategoriClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    >
                        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                                {editKategoriId ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h2>
                            <button
                                onClick={closeEditKategori}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Tutup"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                                <input
                                    type="text"
                                    value={editKategoriData.grade}
                                    onChange={(e) => setEditKategoriData({ ...editKategoriData, grade: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    maxLength={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Min</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editKategoriData.min_nilai}
                                        onChange={(e) => setEditKategoriData({ ...editKategoriData, min_nilai: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Max</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editKategoriData.max_nilai}
                                        onChange={(e) => setEditKategoriData({ ...editKategoriData, max_nilai: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Tampilkan jenis kategori secara otomatis — TIDAK ADA PILIHAN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kategori</label>
                                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm">
                                    {activeTab === 'kokurikuler' ? 'Kokurikuler' : 'Akademik'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    value={editKategoriData.deskripsi}
                                    onChange={(e) => setEditKategoriData({ ...editKategoriData, deskripsi: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    rows={3}
                                    placeholder="Contoh: Sangat Baik, Perlu Bimbingan, dll."
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={closeEditKategori}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveKategori}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};