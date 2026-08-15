const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const syncService = require('./services/syncService');

// Initialize database
try { require('./db/sqlite'); } catch(e) { console.warn('SQLite init:', e.message); }

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', true);

// CORS — allow the IPTV frontend
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || origin.includes('localhost') || origin.includes('osamap2') || origin.includes('pages.dev')) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, '..', 'public')));

// FFMPEG Configuration
const { execSync } = require('child_process');

function findFFmpeg() {
    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        console.log('FFmpeg: system');
        return 'ffmpeg';
    } catch (e) {}
    try {
        let ffmpegPath = require('ffmpeg-static');
        if (ffmpegPath && ffmpegPath.includes('app.asar')) {
            ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
        }
        console.log('FFmpeg:', ffmpegPath);
        return ffmpegPath;
    } catch (err) {
        console.warn('FFmpeg not available — transcoding disabled.');
        return null;
    }
}

function findFFprobe() {
    try {
        execSync('ffprobe -version', { stdio: 'ignore' });
        console.log('FFprobe: system');
        return 'ffprobe';
    } catch (e) {}
    try {
        const ffprobePath = require('@ffprobe-installer/ffprobe').path;
        if (ffprobePath) {
            console.log('FFprobe:', ffprobePath);
            return ffprobePath;
        }
    } catch (err) {}
    console.warn('FFprobe not available.');
    return null;
}

app.locals.ffmpegPath = findFFmpeg();
app.locals.ffprobePath = findFFprobe();

// Dynamic services loader
const fs = require('fs');
const services = {};
try {
    const servicesDir = path.join(__dirname, 'services');
    const serviceFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('.js'));
    for (const file of serviceFiles) {
        const name = file.replace(/\.js$/, '');
        try {
            services[name] = require(path.join(servicesDir, file));
        } catch (e) {
            console.warn(`Failed to load service ${file}:`, e.message);
        }
    }
} catch (e) {
    console.warn('Services directory:', e.message);
}
Object.freeze(services);

// Plugin loader
const loadedPlugins = [];
async function loadPlugins() {
    try {
        const pluginsDir = path.join(__dirname, 'plugins');
        if (fs.existsSync(pluginsDir)) {
            const pluginFiles = fs.readdirSync(pluginsDir)
                .filter(f => f.endsWith('.js'))
                .sort();
            for (const file of pluginFiles) {
                try {
                    const plugin = require(path.join(pluginsDir, file));
                    if (typeof plugin === 'function') {
                        await plugin(app, services);
                        loadedPlugins.push({ name: file, plugin: null });
                        console.log(`✓ Plugin: ${file}`);
                    } else if (plugin && typeof plugin.init === 'function') {
                        await plugin.init(app, services);
                        loadedPlugins.push({ name: file, plugin });
                        console.log(`✓ Plugin: ${file} (lifecycle)`);
                    }
                } catch (err) {
                    console.error(`✗ Plugin ${file}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.warn('Plugin loader:', err.message);
    }
}

process.on('SIGTERM', async () => {
    console.log('SIGTERM — shutting down plugins...');
    for (const { name, plugin } of loadedPlugins) {
        if (plugin && typeof plugin.shutdown === 'function') {
            try { await plugin.shutdown(); } catch (_) {}
        }
    }
    process.exit(0);
});

// API Routes (auth disabled — all routes are public)
const routeMap = {
    '/api/channels': './routes/channels',
    '/api/sources': './routes/sources',
    '/api/proxy': './routes/proxy',
    '/api/favorites': './routes/favorites',
    '/api/transcode': './routes/transcode',
    '/api/remux': './routes/remux',
    '/api/probe': './routes/probe',
    '/api/subtitle': './routes/subtitle',
    '/api/settings': './routes/settings',
    '/api/history': './routes/history',
    '/api/browse': './routes/browse',
};

for (const [routePath, routeFile] of Object.entries(routeMap)) {
    try {
        app.use(routePath, require(routeFile));
    } catch (e) {
        console.warn(`Route ${routePath} not loaded:`, e.message);
    }
}

app.get('/api/version', (req, res) => {
    const pkg = require('../package.json');
    res.json({ version: pkg.version });
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
    console.log(`NodeCast TV server running on http://localhost:${PORT}`);
    try { await loadPlugins(); } catch(err) { console.error('Plugin init failed:', err.message); }
    setTimeout(async () => {
        try { await syncService.syncAll(); } catch(e) { console.error('Sync failed:', e.message); }
        try { await syncService.startSyncTimer(); } catch(e) { console.error('Sync timer failed:', e.message); }
        try { await require('./services/hwDetect').detect(); } catch(e) { console.warn('HW detection:', e.message); }
    }, 5000);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err.message);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
});
