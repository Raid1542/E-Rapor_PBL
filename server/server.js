require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Folder uploads
const uploadsPath = path.join(__dirname, 'public', 'uploads');
console.log('📂 Uploads path:', uploadsPath);

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Folder uploads dibuat');
}

// ✅ Folder templates (untuk template import)
const templatesPath = path.join(__dirname, 'public', 'templates');
console.log('📂 Templates path:', templatesPath);

if (!fs.existsSync(templatesPath)) {
    fs.mkdirSync(templatesPath, { recursive: true });
    console.log('✅ Folder templates dibuat');
}

// ✅ Serve static files
app.use('/uploads', express.static(uploadsPath));
app.use('/templates', express.static(templatesPath));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const guruKelasRoutes = require('./routes/guruKelasRoutes');
app.use('/api/guru-kelas', guruKelasRoutes);

const guruBidangStudiRoutes = require('./routes/guruBidangStudiRoutes');
app.use('/api/guru-bidang-studi', guruBidangStudiRoutes);

const sekolahPublicRoutes = require('./routes/sekolahPublicRoutes');
app.use('/api/sekolah', sekolahPublicRoutes);

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

// ✅ Root
app.get('/', (req, res) => {
    res.send('Backend E-Rapor SDIT Ulil Albab berjalan!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📂 Uploads: http://localhost:${PORT}/uploads/`);
    console.log(`📥 Templates: http://localhost:${PORT}/templates/`);
});