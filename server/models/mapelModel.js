const db = require('../config/db');

const MapelModel = {
    // 1. Ambil semua mata pelajaran berdasarkan tahun_ajaran_id
    getAllByTahunAjaran: async (tahun_ajaran_id) => {
        const sql = `
            SELECT 
                mp.id_mata_pelajaran,
                mp.kode_mapel,
                mp.nama_mapel,
                mp.jenis,
                mp.kurikulum,
                mp.tahun_ajaran_id,
                ta.tahun_ajaran,
                ta.semester
            FROM mata_pelajaran mp
            JOIN tahun_ajaran ta ON mp.tahun_ajaran_id = ta.id_tahun_ajaran
            WHERE mp.tahun_ajaran_id = ?
            ORDER BY mp.kode_mapel ASC
        `;
        const [rows] = await db.execute(sql, [tahun_ajaran_id]);
        return rows; // array of objects
    },

    // 2. Ambil satu mata pelajaran berdasarkan ID
    getById: async (id) => {
        const sql = `
            SELECT 
                mp.id_mata_pelajaran,
                mp.kode_mapel,
                mp.nama_mapel,
                mp.jenis,
                mp.kurikulum,
                mp.tahun_ajaran_id,
                ta.tahun_ajaran,
                ta.semester
            FROM mata_pelajaran mp
            JOIN tahun_ajaran ta ON mp.tahun_ajaran_id = ta.id_tahun_ajaran
            WHERE mp.id_mata_pelajaran = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows; // array (bisa kosong)
    },

    // 3. Tambah mata pelajaran baru
    create: async (data) => {
        const { kode_mapel, nama_mapel, jenis, kurikulum, tahun_ajaran_id } = data;
        const sql = `
            INSERT INTO mata_pelajaran 
                (kode_mapel, nama_mapel, jenis, kurikulum, tahun_ajaran_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [kode_mapel, nama_mapel, jenis, kurikulum, tahun_ajaran_id]);
        return result; // { insertId, affectedRows, ... }
    },

    // 4. Update mata pelajaran
    update: async (id, data) => {
        const { kode_mapel, nama_mapel, jenis, kurikulum, tahun_ajaran_id } = data;
        const sql = `
            UPDATE mata_pelajaran 
            SET 
                kode_mapel = ?,
                nama_mapel = ?,
                jenis = ?,
                kurikulum = ?,
                tahun_ajaran_id = ?
            WHERE id_mata_pelajaran = ?
        `;
        const [result] = await db.execute(sql, [kode_mapel, nama_mapel, jenis, kurikulum, tahun_ajaran_id, id]);
        return result; // { affectedRows, changedRows, ... }
    },

    // 5. Hapus mata pelajaran
    delete: async (id) => {
        const sql = `DELETE FROM mata_pelajaran WHERE id_mata_pelajaran = ?`;
        const [result] = await db.execute(sql, [id]);
        return result; // { affectedRows, ... }
    },

    // 6. Cek apakah kode_mapel sudah dipakai di tahun ajaran yang sama
    isKodeMapelExist: async (kode_mapel, tahun_ajaran_id, excludeId = null) => {
        let sql = `
            SELECT 1
            FROM mata_pelajaran 
            WHERE kode_mapel = ? AND tahun_ajaran_id = ?
        `;
        const params = [kode_mapel, tahun_ajaran_id];

        if (excludeId !== null && excludeId !== undefined) {
            sql += ` AND id_mata_pelajaran != ?`;
            params.push(excludeId);
        }

        const [rows] = await db.execute(sql, params);
        return rows.length > 0; // boolean
    },

    // 7. Cek apakah tahun_ajaran_id valid (ada di tabel tahun_ajaran)
    isTahunAjaranValid: async (tahun_ajaran_id) => {
        const sql = `SELECT 1 FROM tahun_ajaran WHERE id_tahun_ajaran = ?`;
        const [rows] = await db.execute(sql, [tahun_ajaran_id]);
        return rows.length > 0; // boolean
    }
};

module.exports = MapelModel;