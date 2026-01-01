/**
 * Nama File: ekstrakurikulerModel.js
 * Fungsi: Model untuk mengelola data ekstrakurikuler dan keanggotaannya,
 *         mencakup operasi CRUD ekstrakurikuler, pengelolaan peserta,
 *         serta fungsi pendukung untuk guru kelas.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');

const ekstrakurikulerModel = {
  // Mengambil semua ekstrakurikuler berdasarkan tahun ajaran
  async getAllByTahunAjaran(tahun_ajaran_id) {
    const [rows] = await db.execute(
      `
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
      `,
      [tahun_ajaran_id, tahun_ajaran_id]
    );
    return rows;
  },

  // Menambahkan ekstrakurikuler baru
  async create(data) {
    const { nama_ekskul, nama_pembina, keterangan, tahun_ajaran_id } = data;
    const [result] = await db.execute(
      `INSERT INTO ekstrakurikuler 
          (nama_ekskul, nama_pembina, keterangan, tahun_ajaran_id, created_at, updated_at) 
          VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        nama_ekskul.trim(),
        nama_pembina || null,
        keterangan || null,
        tahun_ajaran_id,
      ]
    );
    return result.insertId;
  },

  // Memperbarui data ekstrakurikuler
  async update(id, data) {
    const { nama_ekskul, nama_pembina, keterangan, tahun_ajaran_id } = data;
    const [result] = await db.execute(
      `UPDATE ekstrakurikuler 
          SET nama_ekskul = ?, nama_pembina = ?, keterangan = ?, tahun_ajaran_id = ?, updated_at = NOW() 
          WHERE id_ekskul = ?`,
      [
        nama_ekskul.trim(),
        nama_pembina || null,
        keterangan || null,
        tahun_ajaran_id,
        id,
      ]
    );
    return result.affectedRows > 0;
  },

  // Menghapus ekstrakurikuler (hanya jika tidak punya anggota)
  async deleteById(id) {
    const [peserta] = await db.execute(
      'SELECT id_peserta_ekskul FROM peserta_ekstrakurikuler WHERE ekskul_id = ? LIMIT 1',
      [id]
    );
    if (peserta.length > 0) {
      throw new Error('Ekstrakurikuler tidak bisa dihapus karena masih memiliki anggota.');
    }

    const [result] = await db.execute(
      'DELETE FROM ekstrakurikuler WHERE id_ekskul = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Mengambil detail ekstrakurikuler berdasarkan ID
  async getById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM ekstrakurikuler WHERE id_ekskul = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Mengecek apakah nama ekstrakurikuler sudah ada di tahun ajaran tertentu
  async isNamaEkskulExist(nama_ekskul, tahun_ajaran_id, excludeId = null) {
    let query =
      'SELECT id_ekskul FROM ekstrakurikuler WHERE LOWER(nama_ekskul) = LOWER(?) AND tahun_ajaran_id = ?';
    const params = [nama_ekskul.trim(), tahun_ajaran_id];

    if (excludeId) {
      query += ' AND id_ekskul != ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0;
  },

  // Mengambil daftar peserta ekstrakurikuler berdasarkan ID dan tahun ajaran
  async getPesertaByEkskul(ekskulId, tahunAjaranId) {
    const [rows] = await db.execute(
      `
        SELECT 
            s.id_siswa,
            s.nis,
            s.nisn,
            s.nama_lengkap AS nama,
            pe.deskripsi,
            k.id_kelas,
            k.nama_kelas
        FROM peserta_ekstrakurikuler pe
        JOIN siswa s ON pe.siswa_id = s.id_siswa
        LEFT JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id AND sk.tahun_ajaran_id = ?
        LEFT JOIN kelas k ON sk.kelas_id = k.id_kelas
        WHERE pe.ekskul_id = ? AND pe.tahun_ajaran_id = ?
        ORDER BY s.nama_lengkap ASC
      `,
      [tahunAjaranId, ekskulId, tahunAjaranId]
    );
    return rows;
  },

  // === FUNGSI UNTUK GURU KELAS ===

  // Mendapatkan informasi kelas aktif yang diampu oleh guru
  async getGuruKelasAktif(userId) {
    const [rows] = await db.execute(
      `
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
      `,
      [userId]
    );
    return rows[0] || null;
  },

  // Mendapatkan daftar siswa dalam kelas tertentu
  async getSiswaInKelas(kelasId, tahunAjaranId) {
    const [rows] = await db.execute(
      `
        SELECT s.id_siswa, s.nama_lengkap AS nama, s.nis, s.nisn
        FROM siswa s
        JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
        WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
        ORDER BY s.nama_lengkap
      `,
      [kelasId, tahunAjaranId]
    );
    return rows;
  },

  // Mendapatkan daftar ekstrakurikuler aktif di tahun ajaran tertentu
  async getDaftarEkskulAktif(tahun_ajaran_id) {
    const [rows] = await db.execute(
      'SELECT id_ekskul, nama_ekskul FROM ekstrakurikuler WHERE tahun_ajaran_id = ? ORDER BY nama_ekskul',
      [tahun_ajaran_id]
    );
    return rows;
  },

  // Mendapatkan ekstrakurikuler yang diikuti siswa
  async getEkskulSiswa(siswaId, tahunAjaranId) {
    const [rows] = await db.execute(
      `
        SELECT 
            e.id_ekskul,
            e.nama_ekskul,
            COALESCE(pe.deskripsi, e.keterangan, 'Belum diisi') AS deskripsi
        FROM peserta_ekstrakurikuler pe
        JOIN ekstrakurikuler e ON pe.ekskul_id = e.id_ekskul
        WHERE pe.siswa_id = ? AND pe.tahun_ajaran_id = ?
      `,
      [siswaId, tahunAjaranId]
    );
    return rows;
  },

  // Menyimpan atau memperbarui keanggotaan ekstrakurikuler siswa
  async savePesertaEkskul(siswaId, tahunAjaranId, ekskulList) {
    await db.execute(
      'DELETE FROM peserta_ekstrakurikuler WHERE siswa_id = ? AND tahun_ajaran_id = ?',
      [siswaId, tahunAjaranId]
    );

    if (ekskulList.length === 0) return;

    const insertData = ekskulList.map(item => [
      siswaId,
      item.ekskul_id,
      tahunAjaranId,
      item.deskripsi || null,
    ]);

    await db.query(
      'INSERT INTO peserta_ekstrakurikuler (siswa_id, ekskul_id, tahun_ajaran_id, deskripsi) VALUES ?',
      [insertData]
    );
  },

  // Mengecek apakah siswa terdaftar di kelas tertentu pada tahun ajaran ini
  async isSiswaInKelas(siswaId, kelasId, tahunAjaranId) {
    const [rows] = await db.execute(
      'SELECT 1 FROM siswa_kelas WHERE siswa_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?',
      [siswaId, kelasId, tahunAjaranId]
    );
    return rows.length > 0;
  },
};

module.exports = ekstrakurikulerModel;