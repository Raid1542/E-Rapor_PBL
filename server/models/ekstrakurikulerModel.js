// /backend/models/Ekstrakurikuler.js
const db = require('../config/db');

class Ekstrakurikuler {
  // GET: semua ekstrakurikuler berdasarkan tahun_pelajaran (dari kolom `keterangan`)
  static async findAllByTahun(tahun_pelajaran) {
    // Karena di DB Anda tidak ada kolom `tahun_pelajaran`, kita asumsi:
    // ✅ `keterangan` berisi nilai seperti "2025/2026"
    const [rows] = await db.query(
      `SELECT 
        id_ekskul AS id,
        nama_ekskul AS nama_ekstrakurikuler,
        COALESCE(nama_pembina, '-') AS pembina,
        keterangan AS tahun_pelajaran,
        0 AS jumlah_anggota  -- karena tidak ada kolom jumlah_anggota di DB Anda
      FROM ekstrakurikuler 
      WHERE keterangan = ?`,
      [tahun_pelajaran]
    );
    return rows;
  }

  // GET: daftar tahun ajaran unik dari kolom `keterangan`
  static async getTahunAjaranList() {
    const [rows] = await db.query(
      `SELECT DISTINCT keterangan 
       FROM ekstrakurikuler 
       WHERE keterangan IS NOT NULL AND keterangan != ''
       ORDER BY keterangan DESC`
    );
    
    const tahunList = rows.map(row => row.keterangan || '');
    // Ambil tahun aktif (misal: yang paling baru)
    const tahunAktif = tahunList.length > 0 ? `${tahunList[0]} (Aktif)` : '2025/2026 (Aktif)';
    
    // Format list: tambahkan "(Aktif)" pada yang aktif
    const listWithActive = tahunList.map(t => 
      t === tahunList[0] ? `${t} (Aktif)` : t
    );

    return {
      tahun_ajaran_list: listWithActive.length > 0 ? listWithActive : ['2025/2026 (Aktif)', '2024/2025', '2023/2024'],
      tahun_ajaran_aktif: tahunAktif
    };
  }

  // POST: tambah ekstrakurikuler
  static async create(data) {
    const { nama_ekstrakurikuler, pembina, tahun_pelajaran } = data;
    const [result] = await db.query(
      `INSERT INTO ekstrakurikuler (nama_ekskul, nama_pembina, keterangan, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [nama_ekstrakurikuler, pembina || null, tahun_pelajaran]
    );
    return { id: result.insertId, ...data };
  }

  // GET by ID
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        id_ekskul AS id,
        nama_ekskul AS nama_ekstrakurikuler,
        COALESCE(nama_pembina, '-') AS pembina,
        keterangan AS tahun_pelajaran,
        0 AS jumlah_anggota
      FROM ekstrakurikuler 
      WHERE id_ekskul = ?`,
      [id]
    );
    return rows[0] || null;
  }

  // PUT: update
  static async update(id, data) {
    const { nama_ekstrakurikuler, pembina, tahun_pelajaran } = data;
    await db.query(
      `UPDATE ekstrakurikuler 
       SET nama_ekskul = ?, nama_pembina = ?, keterangan = ?, updated_at = NOW()
       WHERE id_ekskul = ?`,
      [nama_ekstrakurikuler, pembina || null, tahun_pelajaran, id]
    );
    return { id, ...data };
  }

  // DELETE
  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM ekstrakurikuler WHERE id_ekskul = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Ekstrakurikuler;