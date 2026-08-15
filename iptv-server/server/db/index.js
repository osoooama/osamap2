const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

function readDb() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (e) {
        console.warn('[DB] read error:', e.message);
    }
    return { nextId: 2, sources: [], settings: {}, hiddenItems: [], users: [], favorites: [] };
}

function writeDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4), 'utf8');
}

const defaultSettings = {
    quality: 'medium',
    upscaleEnabled: false,
    overlayDuration: 5,
    forceVideoTranscode: false,
    upscaleMethod: 'hardware',
    seriesProbeCacheDays: 7,
    userAgentPreset: 'chrome',
    hwEncoder: 'auto',
    defaultVolume: 80,
    autoTranscode: true,
    lastVolume: 80,
    autoPlayNextEpisode: false,
    forceRemux: false,
    userAgentCustom: '',
    probeCacheTTL: 300,
    forceTranscode: false,
    upscaleTarget: '1080p',
    rememberVolume: true,
    audioMixPreset: 'auto',
    maxResolution: '1080p',
    epgRefreshInterval: '24',
    streamFormat: 'm3u8',
    arrowKeysChangeChannel: true,
    forceProxy: false,
};

const sources = {
    getAll() {
        const db = readDb();
        return db.sources || [];
    },
    get(id) {
        const db = readDb();
        return (db.sources || []).find(s => s.id === id);
    },
    add(source) {
        const db = readDb();
        if (!db.sources) db.sources = [];
        const id = db.nextId || (db.sources.length + 1);
        const newSource = { id, ...source, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), enabled: true };
        db.sources.push(newSource);
        db.nextId = id + 1;
        writeDb(db);
        return newSource;
    },
    update(id, updates) {
        const db = readDb();
        const idx = (db.sources || []).findIndex(s => s.id === id);
        if (idx === -1) return null;
        db.sources[idx] = { ...db.sources[idx], ...updates, updated_at: new Date().toISOString() };
        writeDb(db);
        return db.sources[idx];
    },
    remove(id) {
        const db = readDb();
        if (!db.sources) return false;
        const before = db.sources.length;
        db.sources = db.sources.filter(s => s.id !== id);
        writeDb(db);
        return db.sources.length < before;
    },
    getByType(type) {
        return this.getAll().filter(s => s.type === type);
    }
};

const settings = {
    async get() {
        const db = readDb();
        return { ...defaultSettings, ...(db.settings || {}) };
    },
    async update(updates) {
        const db = readDb();
        db.settings = { ...(db.settings || {}), ...updates };
        writeDb(db);
        return { ...defaultSettings, ...db.settings };
    }
};

function getDefaultSettings() {
    return { ...defaultSettings };
}

module.exports = { sources, settings, getDefaultSettings };
