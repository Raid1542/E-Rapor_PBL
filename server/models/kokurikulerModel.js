const db = require('../config/db');

const kokurikulerModel = {
    getBySiswaAndTahunAjaran(siswaId, tahunAjaranId, semester) {
        const sql = `
            SELECT 
                mutabaah, bpi, literasi, judul_proyek, deskripsi_proyek,
                mutabaah_nilai_angka, mutabaah_grade
            FROM kokurikuler
            WHERE siswa_id = ? AND tahun_ajaran_id = ? AND semester = ?
        `;
        return db.query(sql, [siswaId, tahunAjaranId, semester]);
    },

    save(siswaId, tahunAjaranId, semester, data) {
        const { 
            mutabaah, bpi, literasi, judul_proyek, deskripsi_proyek,
            mutabaah_nilai_angka, mutabaah_grade 
        } = data;

        const sql = `
            INSERT INTO kokurikuler 
                (siswa_id, tahun_ajaran_id, semester, 
                mutabaah, bpi, literasi, judul_proyek, deskripsi_proyek,
                mutabaah_nilai_angka, mutabaah_grade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                mutabaah = VALUES(mutabaah),
                bpi = VALUES(bpi),
                literasi = VALUES(literasi),
                judul_proyek = VALUES(judul_proyek),
                deskripsi_proyek = VALUES(deskripsi_proyek),
                mutabaah_nilai_angka = VALUES(mutabaah_nilai_angka),
                mutabaah_grade = VALUES(mutabaah_grade),
                updated_at = CURRENT_TIMESTAMP
        `;
        return db.query(sql, [
            siswaId, tahunAjaranId, semester,
            mutabaah, bpi, literasi, judul_proyek, deskripsi_proyek,
            mutabaah_nilai_angka, mutabaah_grade
        ]);
    }
};

module.exports = kokurikulerModel;