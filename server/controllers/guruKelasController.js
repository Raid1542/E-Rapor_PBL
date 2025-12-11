const db = require('../config/db');

// Ambil data kelas yang diampu oleh guru yang sedang login
exports.getKelasSaya = async (req, res) => {
    try {
        // Ambil ID user dari token JWT (sudah diverifikasi di middleware)
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID tidak ditemukan' });
        }

        // Query: ambil nama_kelas, jumlah siswa, dan tahun ajaran aktif
        const query = `
        SELECT 
        k.nama_kelas,
        COUNT(sk.siswa_id) AS jumlah_siswa,
        ta.tahun_ajaran
        FROM user u
        INNER JOIN guru g ON u.id_user = g.user_id
        INNER JOIN guru_kelas gk ON g.user_id = gk.user_id  
        INNER JOIN tahun_ajaran ta ON gk.tahun_ajaran_id = ta.id_tahun_ajaran
        LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.kelas_id 
            AND sk.tahun_ajaran_id = ta.id_tahun_ajaran
        WHERE 
        u.id_user = ? 
        AND ta.status = 'aktif'
        GROUP BY k.id_kelas, ta.id_tahun_ajaran
    `;

        const [rows] = await db.execute(query, [userId]);

        // Jika tidak ada kelas ditemukan
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Anda belum ditugaskan sebagai guru kelas pada tahun ajaran ini.'
            });
        }

        const data = rows[0];
        res.json({
            kelas: data.nama_kelas,        // contoh: "1 A"
            jumlah_siswa: data.jumlah_siswa,
            tahun_ajaran: data.tahun_ajaran
        });

    } catch (err) {
        console.error('Error di getKelasSaya:', err);
        res.status(500).json({
            message: 'Gagal mengambil data kelas',
            error: err.message || 'Unknown error'
        });
    }
};