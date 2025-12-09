const db = require('../config/db');

const getAllByTahunAjaran = async (tahunAjaranId) => {
    const [rows] = await db.execute(`
        SELECT p.*, k.nama_kelas, mp.nama_mapel, mp.jenis AS jenis_mapel, u.nama_lengkap AS nama_guru
        FROM pembelajaran p
        JOIN kelas k ON p.kelas_id = k.id_kelas
        JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran  -- ✅ diubah
        JOIN user u ON p.user_id = u.id_user
        WHERE p.tahun_ajaran_id = ?
        ORDER BY k.nama_kelas, mp.nama_mapel
    `, [tahunAjaranId]);
    return rows;
};

const create = async (data, connection = db) => {
    const { tahun_ajaran_id, kelas_id, mata_pelajaran_id, user_id } = data; // ✅ diubah
    const [result] = await connection.execute(
        `INSERT INTO pembelajaran (tahun_ajaran_id, kelas_id, mata_pelajaran_id, user_id)  -- ✅ diubah
        VALUES (?, ?, ?, ?)`,
        [tahun_ajaran_id, kelas_id, mata_pelajaran_id, user_id]
    );
    return result.insertId;
};

const update = async (id, data, connection = db) => {
    const { kelas_id, mata_pelajaran_id, user_id } = data; // ✅ diubah
    const [result] = await connection.execute(
        `UPDATE pembelajaran 
        SET kelas_id = ?, mata_pelajaran_id = ?, user_id = ?  -- ✅ diubah
        WHERE id = ?`,
        [kelas_id, mata_pelajaran_id, user_id, id]
    );
    return result.affectedRows > 0;
};

const deleteById = async (id, connection = db) => {
    const [result] = await connection.execute(
        `DELETE FROM pembelajaran WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

const getGuruAktif = async () => {
    const [rows] = await db.execute(`
        SELECT 
            u.id_user AS id,
            u.nama_lengkap AS nama
        FROM user u
        INNER JOIN user_role ur ON u.id_user = ur.id_user  -- ✅ benar: ur.id_user (bukan ur.user_id)
        WHERE u.status = 'aktif'
        AND ur.role IN ('guru kelas', 'guru bidang studi')
        ORDER BY u.nama_lengkap ASC
    `);
    return rows;
};

const getKelasByTahunAjaran = async (tahunAjaranId) => {
    const [rows] = await db.execute(`
        SELECT 
            id_kelas AS id,
            nama_kelas AS nama
        FROM kelas
        WHERE tahun_ajaran_id = ?  -- ✅ diubah
        ORDER BY nama_kelas ASC
    `, [tahunAjaranId]);
    return rows;
};

const getMapelByTahunAjaran = async (tahunAjaranId) => {
    const [rows] = await db.execute(`
        SELECT 
            id_mata_pelajaran AS id,
            nama_mapel AS nama
        FROM mata_pelajaran
        WHERE tahun_ajaran_id = ?
        ORDER BY nama_mapel ASC
    `, [tahunAjaranId]);
    return rows;
};

module.exports = {
    getAllByTahunAjaran,
    create,
    update,
    deleteById,
    getGuruAktif,
    getKelasByTahunAjaran,      
    getMapelByTahunAjaran       
};