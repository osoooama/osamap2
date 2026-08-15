const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'content.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function loadStore() {
    try {
        if (fs.existsSync(dbPath)) {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }
    } catch (e) {}
    return { categories: [], playlist_items: [], epg_programs: [], sync_status: [], favorites: [], watch_history: [] };
}

function saveStore(store) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(store), 'utf8');
    } catch (e) {
        console.warn('[JSON-DB] save error:', e.message);
    }
}

let store = loadStore();

function matchRow(row, where) {
    for (const [key, val] of Object.entries(where)) {
        if (val === null || val === undefined) continue;
        if (val instanceof Array) {
            if (!val.includes(row[key])) return false;
        } else {
            if (row[key] !== val) return false;
        }
    }
    return true;
}

function parseWhere(sql, params) {
    const conditions = [];
    const paramIdx = { i: 0 };
    let s = sql;

    const patterns = [
        { re: /(\w+)\s*=\s*\?/g, fn: (m, col) => ({ col, op: '=' }) },
        { re: /(\w+)\s*!=\s*\?/g, fn: (m, col) => ({ col, op: '!=' }) },
        { re: /(\w+)\s*>\s*\?/g, fn: (m, col) => ({ col, op: '>' }) },
        { re: /(\w+)\s*<\s*\?/g, fn: (m, col) => ({ col, op: '<' }) },
        { re: /(\w+)\s*>=\s*\?/g, fn: (m, col) => ({ col, op: '>=' }) },
        { re: /(\w+)\s*<=\s*\?/g, fn: (m, col) => ({ col, op: '<=' }) },
        { re: /(\w+)\s+LIKE\s+\?/gi, fn: (m, col) => ({ col, op: 'LIKE' }) },
    ];

    const whereParts = s.split(/WHERE/i).slice(1).join('WHERE');
    if (!whereParts) return () => true;

    const andParts = whereParts.split(/AND/i);

    const conditionsList = [];
    for (const part of andParts) {
        const trimmed = part.trim().replace(/;.*$/, '').trim();
        const eqMatch = trimmed.match(/(\w+)\s*=\s*\?/);
        const neMatch = trimmed.match(/(\w+)\s*!=\s*\?/);
        const gtMatch = trimmed.match(/(\w+)\s*>\s*\?/);
        const ltMatch = trimmed.match(/(\w+)\s*<\s*\?/);
        const gteMatch = trimmed.match(/(\w+)\s*>=\s*\?/);
        const lteMatch = trimmed.match(/(\w+)\s*<=\s*\?/);
        const likeMatch = trimmed.match(/(\w+)\s+LIKE\s+\?/i);

        if (eqMatch) conditionsList.push({ col: eqMatch[1], op: '=', val: params[paramIdx.i++] });
        else if (neMatch) conditionsList.push({ col: neMatch[1], op: '!=', val: params[paramIdx.i++] });
        else if (gteMatch) conditionsList.push({ col: gteMatch[1], op: '>=', val: params[paramIdx.i++] });
        else if (lteMatch) conditionsList.push({ col: lteMatch[1], op: '<=', val: params[paramIdx.i++] });
        else if (gtMatch) conditionsList.push({ col: gtMatch[1], op: '>', val: params[paramIdx.i++] });
        else if (ltMatch) conditionsList.push({ col: ltMatch[1], op: '<', val: params[paramIdx.i++] });
        else if (likeMatch) conditionsList.push({ col: likeMatch[1], op: 'LIKE', val: params[paramIdx.i++] });
    }

    return (row) => {
        for (const c of conditionsList) {
            const rv = row[c.col];
            switch (c.op) {
                case '=': if (rv !== c.val) return false; break;
                case '!=': if (rv === c.val) return false; break;
                case '>': if (!(rv > c.val)) return false; break;
                case '<': if (!(rv < c.val)) return false; break;
                case '>=': if (!(rv >= c.val)) return false; break;
                case '<=': if (!(rv <= c.val)) return false; break;
                case 'LIKE': {
                    const pattern = c.val.replace(/%/g, '.*');
                    if (!new RegExp(`^${pattern}$`, 'i').test(String(rv || ''))) return false;
                    break;
                }
            }
        }
        return true;
    };
}

function extractTable(sql) {
    const m = sql.match(/FROM\s+(\w+)/i);
    return m ? m[1] : null;
}

function extractInsertValues(sql) {
    const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    const valsMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
    if (!colsMatch || !valsMatch) return null;
    const cols = colsMatch[1].split(',').map(c => c.trim().replace(/[`"']/g, ''));
    return cols;
}

function getTable(name) {
    if (!store[name]) store[name] = [];
    return store[name];
}

const stmtApi = {
    all(...params) {
        if (!this._sql) return [];
        const sql = this._sql;
        const table = extractTable(sql);
        if (!table) return [];

        const rows = getTable(table);
        const fn = parseWhere(sql, params);
        let result = rows.filter(fn);

        const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
        if (orderMatch) {
            const col = orderMatch[1];
            const dir = (orderMatch[2] || 'ASC').toUpperCase();
            result.sort((a, b) => {
                if (a[col] < b[col]) return dir === 'ASC' ? -1 : 1;
                if (a[col] > b[col]) return dir === 'ASC' ? 1 : -1;
                return 0;
            });
        }

        const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) result = result.slice(0, parseInt(limitMatch[1]));

        return result;
    },

    get(...params) {
        return this.all(...params)[0] || undefined;
    },

    run(...params) {
        if (!this._sql) return { changes: 0, lastInsertRowid: 0 };
        const sql = this._sql.trim();

        if (sql.startsWith('INSERT')) {
            const tableMatch = sql.match(/INTO\s+(\w+)/i);
            if (!tableMatch) return { changes: 0, lastInsertRowid: 0 };
            const table = getTable(tableMatch[1]);
            const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
            if (!colsMatch) return { changes: 0, lastInsertRowid: 0 };
            const cols = colsMatch[1].split(',').map(c => c.trim().replace(/[`"']/g, ''));
            const row = {};
            cols.forEach((c, i) => { row[c] = params[i]; });
            if (sql.includes('INSERT OR IGNORE')) {
                const exists = table.find(r => {
                    for (const c of cols) { if (r[c] !== row[c]) return false; }
                    return true;
                });
                if (exists) return { changes: 0, lastInsertRowid: 0 };
            }
            table.push(row);
            saveStore(store);
            return { changes: 1, lastInsertRowid: table.length };
        }

        if (sql.startsWith('DELETE')) {
            const tableMatch = sql.match(/FROM\s+(\w+)/i);
            if (!tableMatch) return { changes: 0 };
            const table = getTable(tableMatch[1]);
            const fn = parseWhere(sql, params);
            const before = table.length;
            const newRows = table.filter(r => !fn(r));
            store[tableMatch[1]] = newRows;
            saveStore(store);
            return { changes: before - newRows.length };
        }

        if (sql.startsWith('UPDATE')) {
            const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
            if (!tableMatch) return { changes: 0 };
            const table = getTable(tableMatch[1]);
            const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
            const fn = parseWhere(sql, params);
            let changes = 0;
            let pi = 0;
            const setParts = setMatch ? setMatch[1].split(',').map(p => p.trim()) : [];
            const setVals = {};
            for (const part of setParts) {
                const eq = part.match(/(\w+)\s*=\s*\?/);
                if (eq) setVals[eq[1]] = params[pi++];
            }
            for (const row of table) {
                if (fn(row)) {
                    Object.assign(row, setVals);
                    changes++;
                }
            }
            saveStore(store);
            return { changes };
        }

        return { changes: 0 };
    }
};

class JsonDb {
    prepare(sql) {
        return Object.create(stmtApi, { _sql: { value: sql } });
    }

    exec(sql) {
        if (sql.includes('CREATE TABLE')) {
            return;
        }
        if (sql.includes('CREATE INDEX')) {
            return;
        }
        if (sql.startsWith('INSERT')) {
            this.prepare(sql).run();
        }
    }

    pragma(str) {}
}

let jsonDb;

function getDb() {
    if (!jsonDb) {
        console.log('[JSON-DB] Initializing in-memory JSON database');
        jsonDb = new JsonDb();
        initSchema();
    }
    return jsonDb;
}

function initSchema() {
    getTable('categories');
    getTable('playlist_items');
    getTable('epg_programs');
    getTable('sync_status');
    getTable('favorites');
    getTable('watch_history');
    console.log('[JSON-DB] Schema initialized');
}

const favorites = {
    getAll(userId, sourceId = null, itemType = null) {
        let rows = getTable('favorites').filter(r => r.user_id === userId);
        if (sourceId) rows = rows.filter(r => r.source_id === sourceId);
        if (itemType) rows = rows.filter(r => r.item_type === itemType);
        return rows.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    },

    add(userId, sourceId, itemId, itemType = 'channel') {
        const table = getTable('favorites');
        const exists = table.find(r => r.user_id === userId && r.source_id === sourceId && r.item_id === String(itemId) && r.item_type === itemType);
        if (exists) return false;
        table.push({ user_id: userId, source_id: sourceId, item_id: String(itemId), item_type: itemType, created_at: new Date().toISOString() });
        saveStore(store);
        return true;
    },

    remove(userId, sourceId, itemId, itemType = 'channel') {
        const table = getTable('favorites');
        const before = table.length;
        store.favorites = table.filter(r => !(r.user_id === userId && r.source_id === sourceId && r.item_id === String(itemId) && r.item_type === itemType));
        saveStore(store);
        return store.favorites.length < before;
    },

    isFavorite(userId, sourceId, itemId, itemType = 'channel') {
        return getTable('favorites').some(r => r.user_id === userId && r.source_id === sourceId && r.item_id === String(itemId) && r.item_type === itemType);
    },

    getAllAsSet(userId) {
        const rows = getTable('favorites').filter(r => r.user_id === userId);
        const set = new Set();
        for (const row of rows) set.add(`${row.source_id}:${row.item_id}:${row.item_type}`);
        return set;
    }
};

module.exports = { getDb, initSchema, favorites };
