require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ CORS dulu
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// ✅ Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES - INI YANG PALING PENTING
const uploadsPath = path.join(__dirname, 'public', 'uploads');
console.log('📂 Uploads path:', uploadsPath);

// Buat folder jika belum ada
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Folder uploads dibuat');
}

// Serve static files
app.use('/uploads', express.static(uploadsPath));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// ✅ Debug endpoint
app.get('/debug/uploads', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsPath);
        res.json({
            uploadsPath,
            files,
            fileCount: files.length,
            exists: fs.existsSync(uploadsPath)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Backend E-Rapor SDIT Ulil Albab berjalan!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📂 Uploads: http://localhost:${PORT}/uploads/`);
});