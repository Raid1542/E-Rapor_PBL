const db = require('../config/db');

// Daftar fase yang valid (sesuai dengan ENUM di database)
const VALID_FASE = ['A', 'B', 'C'];

/**
 * Mengambil semua kelas (opsional: filter by tahun_ajaran_id)
 */
const getAll = async (tahun_ajaran_id = null) => {
    if (tahun_ajaran_id) {
        const [rows] = await db.execute(
            'SELECT * FROM kelas WHERE tahun_ajaran_id = ? ORDER BY nama_kelas ASC',
            [tahun_ajaran_id]
        );
        return rows;
    }
    const [rows] = await db.execute('SELECT * FROM kelas ORDER BY nama_kelas ASC');
    return rows;
};

/**
 * Mengambil data kelas berdasarkan ID
 */
const getById = async (id) => {
    const [rows] = await db.execute(
        'SELECT * FROM kelas WHERE id_kelas = ?',
        [id]
    );
    return rows[0] || null;
};

/**
 * Menambahkan kelas baru (wajib sertakan tahun_ajaran_id)
 */
const create = async (data) => {
    const { nama_kelas, fase, tahun_ajaran_id } = data;

    if (!nama_kelas || !fase || !tahun_ajaran_id) {
        throw new Error('Nama kelas, fase, dan tahun_ajaran_id wajib diisi');
    }

    if (!VALID_FASE.includes(fase)) {
        throw new Error(`Fase tidak valid. Pilih dari: ${VALID_FASE.join(', ')}`);
    }

    // ✅ Cek duplikasi HANYA di tahun ajaran yang sama
    const [existing] = await db.execute(
        'SELECT id_kelas FROM kelas WHERE LOWER(nama_kelas) = LOWER(?) AND tahun_ajaran_id = ?',
        [nama_kelas.trim(), tahun_ajaran_id]
    );
    if (existing.length > 0) {
        throw new Error(`Kelas dengan nama "${nama_kelas}" sudah ada di tahun ajaran ini`);
    }

    const [result] = await db.execute(
        'INSERT INTO kelas (nama_kelas, fase, tahun_ajaran_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [nama_kelas.trim(), fase, tahun_ajaran_id]
    );
    return result.insertId;
};

/**
 * Memperbarui data kelas
 */
const update = async (id, data) => {
    const { nama_kelas, fase, tahun_ajaran_id } = data;

    if (!nama_kelas || !fase || !tahun_ajaran_id) {
        throw new Error('Nama kelas, fase, dan tahun_ajaran_id wajib diisi');
    }

    if (!VALID_FASE.includes(fase)) {
        throw new Error(`Fase tidak valid. Pilih dari: ${VALID_FASE.join(', ')}`);
    }

    // ✅ Cek duplikasi di tahun ajaran yang sama, kecuali diri sendiri
    const [existing] = await db.execute(
        'SELECT id_kelas FROM kelas WHERE LOWER(nama_kelas) = LOWER(?) AND tahun_ajaran_id = ? AND id_kelas != ?',
        [nama_kelas.trim(), tahun_ajaran_id, id]
    );
    if (existing.length > 0) {
        throw new Error(`Nama kelas "${nama_kelas}" sudah digunakan di tahun ajaran ini`);
    }

    const [result] = await db.execute(
        'UPDATE kelas SET nama_kelas = ?, fase = ?, tahun_ajaran_id = ?, updated_at = NOW() WHERE id_kelas = ?',
        [nama_kelas.trim(), fase, tahun_ajaran_id, id]
    );
    return result.affectedRows > 0;
};

/**
 * Mengambil semua kelas berdasarkan tahun_ajaran_id
 */
const getByTahunAjaran = async (tahun_ajaran_id) => {
    if (!tahun_ajaran_id) {
        throw new Error('tahun_ajaran_id wajib diisi');
    }
    const [rows] = await db.execute(
        'SELECT * FROM kelas WHERE tahun_ajaran_id = ? ORDER BY nama_kelas ASC',
        [tahun_ajaran_id]
    );
    return rows;
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    getByTahunAjaran
};