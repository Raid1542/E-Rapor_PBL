/**
 * Nama File: db.js
 * Fungsi: Mengelola koneksi pool ke database MySQL/MariaDB untuk sistem e-rapor.
 *         Menginisialisasi koneksi dan melakukan uji koneksi saat server dijalankan.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const mysql = require('mysql2/promise');

// Membuat connection pool ke database menggunakan konfigurasi dari environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Uji koneksi ke database saat aplikasi dijalankan
pool
  .getConnection()
  .then(() => {
    console.log('✅ Koneksi ke MariaDB berhasil');
  })
  .catch(err => {
    console.error('❌ Gagal koneksi ke MariaDB:', err.message);
    process.exit(1); // Menghentikan proses jika koneksi database gagal
  });

// Uji query sederhana untuk memastikan koneksi berfungsi dengan baik
pool
  .execute('SELECT 1')
  .then(() => {
    console.log('✅ Query test berhasil');
  })
  .catch(err => {
    console.error('❌ Query test gagal:', err.message);
  });

// Ekspor connection pool untuk digunakan di modul lain
module.exports = pool;
