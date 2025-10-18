// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi Database dari .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log('Database tidak terkoneksi:', err.message);
  } else {
    console.log('Database terkoneksi');
  }
});

// ========================================
// API LOGIN
// ========================================
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ 
      success: false, 
      message: 'Email dan password wajib diisi' 
    });
  }

  const sql = 'SELECT * FROM user WHERE email_sekolah = ?';
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.log('Error:', err);
      return res.json({ success: false, message: 'Error database' });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: 'Email tidak ditemukan' });
    }

    const user = results[0];
    
    // Cek password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Password salah' });
    }

    // Login berhasil
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id_user,
        email: user.email_sekolah,
        role: user.role
      }
    });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});