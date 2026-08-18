const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY ====================
// All API URLs are SERVER-SIDE ONLY — never exposed to client
const API_ENDPOINTS = {
    youtube: 'https://api.lmnx9.shop/download/youtube.php?url=',
    facebook: 'https://api.lmnx9.shop/download/facebook.php?url=',
    instagram: 'https://api.lmnx9.shop/download/Instagram.php?url=',
    tiktok: 'https://api.lmnx9.shop/download/tiktok.php?url=',
    universal: 'https://social-dl.lmnx9.workers.dev?url='
};

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            mediaSrc: ["'self'", "https:", "http:", "blob:"],
            connectSrc: ["'self'"]
        }
    }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: { success: false, error: 'Too many requests. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ==================== VALIDATION ====================
function validateURL(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

function detectPlatform(url) {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return 'facebook';
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
    if (lower.includes('tiktok.com') || lower.includes('vm.tiktok')) return 'tiktok';
    return null;
}

// ==================== API ROUTES ====================

// YouTube Download
app.post('/api/youtube', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !validateURL(url)) {
            return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
        }

        const platform = detectPlatform(url);
        if (platform !== 'youtube') {
            return res.status(400).json({ success: false, error: 'Please provide a valid YouTube URL' });
        }

        // Try primary API
        let response;
        try {
            response = await axios.get(`${API_ENDPOINTS.youtube}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        } catch {
            // Fallback to universal API
            response = await axios.get(`${API_ENDPOINTS.universal}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        }

        const data = response.data;
        res.json({ success: true, platform: 'youtube', data });

    } catch (error) {
        console.error('YouTube API Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch video. Please try again.' });
    }
});

// Facebook Download
app.post('/api/facebook', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !validateURL(url)) {
            return res.status(400).json({ success: false, error: 'Invalid Facebook URL' });
        }

        const platform = detectPlatform(url);
        if (platform !== 'facebook') {
            return res.status(400).json({ success: false, error: 'Please provide a valid Facebook URL' });
        }

        let response;
        try {
            response = await axios.get(`${API_ENDPOINTS.facebook}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        } catch {
            response = await axios.get(`${API_ENDPOINTS.universal}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        }

        const data = response.data;
        res.json({ success: true, platform: 'facebook', data });

    } catch (error) {
        console.error('Facebook API Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch video. Please try again.' });
    }
});

// Instagram Download
app.post('/api/instagram', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !validateURL(url)) {
            return res.status(400).json({ success: false, error: 'Invalid Instagram URL' });
        }

        const platform = detectPlatform(url);
        if (platform !== 'instagram') {
            return res.status(400).json({ success: false, error: 'Please provide a valid Instagram URL' });
        }

        let response;
        try {
            response = await axios.get(`${API_ENDPOINTS.instagram}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        } catch {
            response = await axios.get(`${API_ENDPOINTS.universal}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        }

        const data = response.data;
        res.json({ success: true, platform: 'instagram', data });

    } catch (error) {
        console.error('Instagram API Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch content. Please try again.' });
    }
});

// TikTok Download
app.post('/api/tiktok', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !validateURL(url)) {
            return res.status(400).json({ success: false, error: 'Invalid TikTok URL' });
        }

        const platform = detectPlatform(url);
        if (platform !== 'tiktok') {
            return res.status(400).json({ success: false, error: 'Please provide a valid TikTok URL' });
        }

        let response;
        try {
            response = await axios.get(`${API_ENDPOINTS.tiktok}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        } catch {
            response = await axios.get(`${API_ENDPOINTS.universal}${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'SocialDownloader/1.0' }
            });
        }

        const data = response.data;
        res.json({ success: true, platform: 'tiktok', data });

    } catch (error) {
        console.error('TikTok API Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch video. Please try again.' });
    }
});

// Proxy download route (to hide direct download URLs)
app.get('/api/proxy-download', async (req, res) => {
    try {
        const { u, f } = req.query; // u=url(base64), f=filename
        if (!u) return res.status(400).json({ error: 'Missing parameters' });

        const downloadUrl = Buffer.from(u, 'base64').toString('utf-8');

        if (!validateURL(downloadUrl)) {
            return res.status(400).json({ error: 'Invalid download URL' });
        }

        const filename = f || 'download.mp4';

        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            timeout: 120000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        }
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        response.data.pipe(res);

    } catch (error) {
        console.error('Proxy download error:', error.message);
        res.status(500).json({ error: 'Download failed' });
    }
});

// ==================== PAGE ROUTES ====================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/youtube', (req, res) => res.sendFile(path.join(__dirname, 'public', 'youtube.html')));
app.get('/facebook', (req, res) => res.sendFile(path.join(__dirname, 'public', 'facebook.html')));
app.get('/instagram', (req, res) => res.sendFile(path.join(__dirname, 'public', 'instagram.html')));
app.get('/tiktok', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tiktok.html')));

// 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 API endpoints are hidden from client`);
});