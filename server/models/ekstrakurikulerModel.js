const db = require('../config/db');

/**
 * Ambil semua ekstrakurikuler berdasarkan tahun ajaran
 */
const getAllByTahunAjaran = async (tahun_ajaran_id) => {
    const [rows] = await db.execute(`
        SELECT 
            e.id_ekskul,
            e.nama_ekskul,
            e.nama_pembina,
            e.keterangan,
            e.tahun_ajaran_id,
            COUNT(pe.siswa_id) AS jumlah_anggota
        FROM ekstrakurikuler e
        LEFT JOIN peserta_ekstrakurikuler pe 
            ON e.id_ekskul = pe.ekskul_id 
            AND pe.tahun_ajaran_id = ?
        WHERE e.tahun_ajaran_id = ?
        GROUP BY e.id_ekskul
        ORDER BY e.nama_ekskul ASC
    `, [tahun_ajaran_id, tahun_ajaran_id]);
    return rows;
};

/**
 * Tambah ekstrakurikuler baru
 */
const create = async (data) => {
    const { nama_ekskul, nama_pembina, keterangan, tahun_ajaran_id } = data;
    const [result] = await db.execute(
        `INSERT INTO ekstrakurikuler 
        (nama_ekskul, nama_pembina, keterangan, tahun_ajaran_id, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [nama_ekskul.trim(), nama_pembina || null, keterangan || null, tahun_ajaran_id]
    );
    return result.insertId;
};

/**
 * Edit ekstrakurikuler
 */
const update = async (id, data) => {
    const { nama_ekskul, nama_pembina, keterangan, tahun_ajaran_id } = data;
    const [result] = await db.execute(
        `UPDATE ekstrakurikuler 
        SET nama_ekskul = ?, nama_pembina = ?, keterangan = ?, tahun_ajaran_id = ?, updated_at = NOW() 
        WHERE id_ekskul = ?`,
        [nama_ekskul.trim(), nama_pembina || null, keterangan || null, tahun_ajaran_id, id]
    );
    return result.affectedRows > 0;
};

/**
 * Hapus ekstrakurikuler
 */
const deleteById = async (id) => {
    // Pastikan tidak ada peserta
    const [peserta] = await db.execute(
        'SELECT id_peserta_ekskul FROM peserta_ekstrakurikuler WHERE ekskul_id = ? LIMIT 1',
        [id]
    );
    if (peserta.length > 0) {
        throw new Error('Ekstrakurikuler tidak bisa dihapus karena masih memiliki anggota.');
    }

    const [result] = await db.execute('DELETE FROM ekstrakurikuler WHERE id_ekskul = ?', [id]);
    return result.affectedRows > 0;
};

/**
 * Ambil detail ekstrakurikuler by ID
 */
const getById = async (id) => {
    const [rows] = await db.execute(
        'SELECT * FROM ekstrakurikuler WHERE id_ekskul = ?',
        [id]
    );
    return rows[0] || null;
};

/**
 * Cek apakah nama ekskul sudah ada di tahun ajaran tertentu
 */
const isNamaEkskulExist = async (nama_ekskul, tahun_ajaran_id, excludeId = null) => {
    let query = 'SELECT id_ekskul FROM ekstrakurikuler WHERE LOWER(nama_ekskul) = LOWER(?) AND tahun_ajaran_id = ?';
    const params = [nama_ekskul.trim(), tahun_ajaran_id];

    if (excludeId) {
        query += ' AND id_ekskul != ?';
        params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
};

// === GURU KELAS FUNCTIONS ===
const getGuruKelasAktif = async (userId) => {
    const [rows] = await db.execute(`
    SELECT 
        gk.kelas_id, 
        ta.id_tahun_ajaran, 
        ta.tahun_ajaran,
        k.nama_kelas
    FROM guru_kelas gk
    JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
    JOIN kelas k ON gk.kelas_id = k.id_kelas
    WHERE gk.user_id = ? AND ta.status = 'aktif'
    LIMIT 1
    `, [userId]);
    return rows[0] || null;
};


const getSiswaInKelas = async (kelasId, tahunAjaranId) => {
    const [rows] = await db.execute(`
    SELECT s.id_siswa, s.nama_lengkap AS nama, s.nis, s.nisn
    FROM siswa s
    JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
    WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
    ORDER BY s.nama_lengkap
    `, [kelasId, tahunAjaranId]);
    return rows;
};

const getDaftarEkskulAktif = async (tahun_ajaran_id) => {
    const [rows] = await db.execute(
        'SELECT id_ekskul, nama_ekskul FROM ekstrakurikuler WHERE tahun_ajaran_id = ? ORDER BY nama_ekskul',
        [tahun_ajaran_id]
    );
    return rows;
};

const getEkskulSiswa = async (siswaId, tahunAjaranId) => {
    const [rows] = await db.execute(`
    SELECT 
        e.id_ekskul,
        e.nama_ekskul,
        COALESCE(pe.deskripsi, e.keterangan, 'Belum diisi') AS deskripsi
    FROM peserta_ekstrakurikuler pe
    JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
    WHERE pe.siswa_id = ? AND pe.tahun_ajaran_id = ?
    `, [siswaId, tahunAjaranId]);
    return rows;
};

const savePesertaEkskul = async (siswaId, tahunAjaranId, ekskulList) => {
    await db.execute(
        'DELETE FROM peserta_ekstrakurikuler WHERE siswa_id = ? AND tahun_ajaran_id = ?',
        [siswaId, tahunAjaranId]
    );

    if (ekskulList.length === 0) return;

    const insertData = ekskulList.map(item => [
        siswaId,
        item.ekskul_id,
        tahunAjaranId,
        item.deskripsi || null
    ]);

    await db.query(
        'INSERT INTO peserta_ekstrakurikuler (siswa_id, ekskul_id, tahun_ajaran_id, deskripsi) VALUES ?',
        [insertData]
    );
};

const isSiswaInKelas = async (siswaId, kelasId, tahunAjaranId) => {
    const [rows] = await db.execute(
        'SELECT 1 FROM siswa_kelas WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?',
        [siswaId, kelasId, tahunAjaranId]
    );
    return rows.length > 0;
};

// === EXPORT SEMUA ===
module.exports = {
    // Admin
    getAllByTahunAjaran,
    create,
    update,
    deleteById,
    getById,
    isNamaEkskulExist,

    // Guru Kelas
    getGuruKelasAktif,
    getSiswaInKelas,
    getDaftarEkskulAktif,
    getEkskulSiswa,
    savePesertaEkskul,
    isSiswaInKelas
};