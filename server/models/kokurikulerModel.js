const db = require('../config/db');

const kokurikulerModel = {
    // Ambil data kokurikuler berdasarkan siswa, kelas, tahun ajaran, semester
    getBySiswaAndKelas(siswaId, kelasId, tahunAjaranId, semester) {
        const sql = `
            SELECT 
                mutabaah_nilai, mutabaah_grade, mutabaah_deskripsi,
                bpi_nilai, bpi_grade, bpi_deskripsi,
                literasi_nilai, literasi_grade, literasi_deskripsi,
                judul_proyek_nilai, judul_proyek_grade, judul_proyek_deskripsi
            FROM nilai_kokurikuler
            WHERE siswa_id = ? 
                AND kelas_id = ? 
                AND tahun_ajaran_id = ? 
                AND semester = ?
        `;
        return db.execute(sql, [siswaId, kelasId, tahunAjaranId, semester]);
    },

    // Simpan/Update data kokurikuler
    save(siswaId, kelasId, tahunAjaranId, semester, data) {
        const { 
            mutabaah_nilai, mutabaah_grade, mutabaah_deskripsi,
            bpi_nilai, bpi_grade, bpi_deskripsi,
            literasi_nilai, literasi_grade, literasi_deskripsi,
            judul_proyek_nilai, judul_proyek_grade, judul_proyek_deskripsi
        } = data;

        const sql = `
            INSERT INTO nilai_kokurikuler 
                (siswa_id, kelas_id, tahun_ajaran_id, semester,
                 mutabaah_nilai, mutabaah_grade, mutabaah_deskripsi,
                 bpi_nilai, bpi_grade, bpi_deskripsi,
                 literasi_nilai, literasi_grade, literasi_deskripsi,
                 judul_proyek_nilai, judul_proyek_grade, judul_proyek_deskripsi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                mutabaah_nilai = VALUES(mutabaah_nilai),
                mutabaah_grade = VALUES(mutabaah_grade),
                mutabaah_deskripsi = VALUES(mutabaah_deskripsi),
                bpi_nilai = VALUES(bpi_nilai),
                bpi_grade = VALUES(bpi_grade),
                bpi_deskripsi = VALUES(bpi_deskripsi),
                literasi_nilai = VALUES(literasi_nilai),
                literasi_grade = VALUES(literasi_grade),
                literasi_deskripsi = VALUES(literasi_deskripsi),
                judul_proyek_nilai = VALUES(judul_proyek_nilai),
                judul_proyek_grade = VALUES(judul_proyek_grade),
                judul_proyek_deskripsi = VALUES(judul_proyek_deskripsi),
                updated_at = CURRENT_TIMESTAMP
        `;
        return db.execute(sql, [
            siswaId, kelasId, tahunAjaranId, semester,
            mutabaah_nilai, mutabaah_grade, mutabaah_deskripsi,
            bpi_nilai, bpi_grade, bpi_deskripsi,
            literasi_nilai, literasi_grade, literasi_deskripsi,
            judul_proyek_nilai, judul_proyek_grade, judul_proyek_deskripsi
        ]);
    },

    // Ambil konfigurasi nilai kokurikuler
    getKonfigurasi() {
        const sql = `
            SELECT kategori, min_nilai, max_nilai, grade, deskripsi, urutan
            FROM konfigurasi_nilai_kokurikuler
            ORDER BY kategori, urutan
        `;
        return db.execute(sql);
    }
};

module.exports = kokurikulerModel;