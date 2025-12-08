const db = require('../config/db');

const PembelajaranModel = {
    // ✅ Ambil semua data pembelajaran dengan JOIN lengkap
    getAll: (callback) => {
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
        db.query(query, callback);
    },

    // ✅ Cari berdasarkan ID
    findById: (id, callback) => {
        const query = `
      SELECT * FROM guru_bidang_studi 
        WHERE id_guru_bidang_studi = ?
    `;
        db.query(query, [id], callback);
    },

    // ✅ Validasi: apakah mapel_id valid untuk tahun_ajaran_id yang diberikan?
    isValidMapelForTahunAjaran: (mapel_id, tahun_ajaran_id, callback) => {
        const query = `
        SELECT 1 
        FROM mata_pelajaran 
        WHERE id_mata_pelajaran = ? AND tahun_ajaran_id = ?
    `;
        db.query(query, [mapel_id, tahun_ajaran_id], (err, results) => {
            if (err) return callback(err, false);
            callback(null, results.length > 0);
        });
    },

    // ✅ Cek duplikasi: apakah kombinasi sudah ada?
    isDuplicate: (user_id, mapel_id, kelas_id, tahun_ajaran_id, callback) => {
        const query = `
        SELECT 1 
        FROM guru_bidang_studi 
        WHERE user_id = ? AND mapel_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
        `;
        db.query(query, [user_id, mapel_id, kelas_id, tahun_ajaran_id], (err, results) => {
            if (err) return callback(err, false);
            callback(null, results.length > 0);
        });
    },

    // ✅ Tambah data pembelajaran
    create: (data, callback) => {
        const { user_id, mapel_id, kelas_id, tahun_ajaran_id } = data;
        const query = `
        INSERT INTO guru_bidang_studi (user_id, mapel_id, kelas_id, tahun_ajaran_id)
        VALUES (?, ?, ?, ?)
    `;
        db.query(query, [user_id, mapel_id, kelas_id, tahun_ajaran_id], callback);
    },

    // ✅ Update data pembelajaran
    update: (id, data, callback) => {
        const { user_id, mapel_id, kelas_id, tahun_ajaran_id } = data;
        const query = `
        UPDATE guru_bidang_studi 
        SET user_id = ?, mapel_id = ?, kelas_id = ?, tahun_ajaran_id = ?
        WHERE id_guru_bidang_studi = ?
    `;
        db.query(query, [user_id, mapel_id, kelas_id, tahun_ajaran_id, id], callback);
    },

    // ✅ Hapus data pembelajaran
    delete: (id, callback) => {
        const query = `
        DELETE FROM guru_bidang_studi 
        WHERE id_guru_bidang_studi = ?
    `;
        db.query(query, [id], callback);
    },

    // ✅ Ambil daftar guru yang memiliki role 'guru_bidang_studi'
    getGuruBidangStudiList: (callback) => {
        const query = `
        SELECT u.id_user, u.nama_lengkap
        FROM user u
        INNER JOIN user_role ur ON u.id_user = ur.id_user
        WHERE ur.role = 'guru_bidang_studi'
        ORDER BY u.nama_lengkap
    `;
        db.query(query, callback);
    },

    // ✅ Ambil daftar mata pelajaran berdasarkan tahun_ajaran_id (untuk dropdown dinamis)
    getMapelByTahunAjaran: (tahun_ajaran_id, callback) => {
        const query = `
        SELECT id_mata_pelajaran, nama_mapel, kode_mapel
        FROM mata_pelajaran
        WHERE tahun_ajaran_id = ?
        ORDER BY nama_mapel
    `;
        db.query(query, [tahun_ajaran_id], callback);
    }
};

module.exports = PembelajaranModel;