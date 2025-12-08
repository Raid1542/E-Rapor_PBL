const db = require('../config/db');

const PembelajaranModel = {
    // ✅ Ambil semua data pembelajaran dengan JOIN lengkap
    getAll: async () => {
        const query = `
        SELECT 
            gbs.id_guru_bidang_studi,
            gbs.user_id,
            gbs.mapel_id,
            gbs.kelas_id,
            gbs.tahun_ajaran_id,
            u.nama_lengkap AS nama_guru,
            mp.nama_mapel,
            k.nama_kelas,
            ta.tahun_ajaran
        FROM guru_bidang_studi gbs
        INNER JOIN user u ON gbs.user_id = u.id_user
        INNER JOIN mata_pelajaran mp ON gbs.mapel_id = mp.id_mata_pelajaran
        INNER JOIN kelas k ON gbs.kelas_id = k.id_kelas
        INNER JOIN tahun_ajaran ta ON gbs.tahun_ajaran_id = ta.id_tahun_ajaran
        ORDER BY ta.tahun_ajaran DESC, k.nama_kelas, mp.nama_mapel
    `;
        const [rows] = await db.execute(query);
        return rows;
    },

    // ✅ Cari berdasarkan ID
    findById: async (id) => {
        const query = `
        SELECT * FROM guru_bidang_studi 
        WHERE id_guru_bidang_studi = ?
    `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    // ✅ Validasi: apakah mapel_id valid untuk tahun_ajaran_id?
    isValidMapelForTahunAjaran: async (mapel_id, tahun_ajaran_id) => {
        const query = `
        SELECT 1 
        FROM mata_pelajaran 
        WHERE id_mata_pelajaran = ? AND tahun_ajaran_id = ?
    `;
        const [rows] = await db.execute(query, [mapel_id, tahun_ajaran_id]);
        return rows.length > 0;
    },

    // ✅ Cek duplikasi
    isDuplicate: async (user_id, mapel_id, kelas_id, tahun_ajaran_id) => {
        const query = `
        SELECT 1 
        FROM guru_bidang_studi 
        WHERE user_id = ? AND mapel_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
    `;
        const [rows] = await db.execute(query, [user_id, mapel_id, kelas_id, tahun_ajaran_id]);
        return rows.length > 0;
    },

    // ✅ Tambah data
    create: async (data) => {
        const { user_id, mapel_id, kelas_id, tahun_ajaran_id } = data;
        const query = `
        INSERT INTO guru_bidang_studi (user_id, mapel_id, kelas_id, tahun_ajaran_id)
        VALUES (?, ?, ?, ?)
    `;
        const [result] = await db.execute(query, [user_id, mapel_id, kelas_id, tahun_ajaran_id]);
        return result;
    },

    // ✅ Update data
    update: async (id, data) => {
        const { user_id, mapel_id, kelas_id, tahun_ajaran_id } = data;
        const query = `
        UPDATE guru_bidang_studi 
        SET user_id = ?, mapel_id = ?, kelas_id = ?, tahun_ajaran_id = ?
        WHERE id_guru_bidang_studi = ?
    `;
        const [result] = await db.execute(query, [user_id, mapel_id, kelas_id, tahun_ajaran_id, id]);
        return result;
    },

    // ✅ Hapus data
    delete: async (id) => {
        const query = `
        DELETE FROM guru_bidang_studi 
        WHERE id_guru_bidang_studi = ?
    `;
        const [result] = await db.execute(query, [id]);
        return result;
    },

    // ✅ Ambil daftar guru bidang studi
    getGuruBidangStudiList: async () => {
        const query = `
        SELECT u.id_user, u.nama_lengkap AS nama
        FROM user u
        INNER JOIN user_role ur ON u.id_user = ur.id_user
        WHERE ur.role = 'guru_bidang_studi'
        ORDER BY u.nama_lengkap
    `;
        const [rows] = await db.execute(query);
        return rows;
    },

    // ✅ Ambil daftar mata pelajaran berdasarkan tahun ajaran
    getMapelByTahunAjaran: async (tahun_ajaran_id) => {
        const query = `
        SELECT id_mata_pelajaran, nama_mapel, kode_mapel
        FROM mata_pelajaran
        WHERE tahun_ajaran_id = ?
        ORDER BY nama_mapel
    `;
        const [rows] = await db.execute(query, [tahun_ajaran_id]);
        return rows;
    }
};

module.exports = PembelajaranModel;