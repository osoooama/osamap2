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
            const raw = fs.readFileSync(dbPath, 'utf8');
            const data = JSON.parse(raw);
            return data;
        }
    } catch (e) {
        console.warn('[JSON-DB] load error:', e.message);
    }
    return { categories: [], playlist_items: [], epg_programs: [], sync_status: [], favorites: [], watch_history: [] };
}

function saveStore() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(store), 'utf8');
    } catch (e) {
        console.warn('[JSON-DB] save error:', e.message);
    }
}

let store = loadStore();

function getTable(name) {
    if (!store[name]) store[name] = [];
    return store[name];
}

let inTransaction = false;
let transactionOps = [];

function execSimple(sql, params) {
    const s = sql.trim();
    if (s.startsWith('CREATE TABLE') || s.startsWith('CREATE INDEX')) return { changes: 0 };

    if (s.startsWith('INSERT')) {
        const tableMatch = s.match(/INTO\s+(\w+)/i);
        if (!tableMatch) return { changes: 0 };
        const table = getTable(tableMatch[1]);
        const colsMatch = s.match(/\(([^)]+)\)\s*VALUES/i);
        if (!colsMatch) return { changes: 0 };
        const cols = colsMatch[1].split(',').map(c => c.trim().replace(/[`"']/g, ''));
        const row = {};
        cols.forEach((c, i) => { row[c] = params[i]; });

        if (s.includes('INSERT OR IGNORE')) {
            const pk = cols[0];
            const exists = table.find(r => r[pk] === row[pk]);
            if (exists) return { changes: 0 };
        }

        if (s.includes('ON CONFLICT') && s.includes('DO UPDATE SET')) {
            const pk = cols[0];
            const existing = table.findIndex(r => r[pk] === row[pk]);
            if (existing >= 0) {
                const setMatch = s.match(/DO UPDATE SET\s+(.+?)(?:\s+WHERE|$)/i);
                if (setMatch) {
                    const setParts = setMatch[1].split(',').map(p => p.trim());
                    for (const part of setParts) {
                        const eq = part.match(/(\w+)\s*=\s*(?:excluded\.(\w+)|\?)/);
                        if (eq) {
                            const colName = eq[1];
                            const src = eq[2];
                            if (src) {
                                table[existing][colName] = row[src];
                            } else {
                                const pi = cols.indexOf(colName);
                                table[existing][colName] = pi >= 0 ? params[pi] : undefined;
                            }
                        }
                    }
                }
                return { changes: 0 };
            }
        }

        table.push(row);
        if (!inTransaction) saveStore();
        return { changes: 1, lastInsertRowid: table.length };
    }

    if (s.startsWith('DELETE')) {
        const tableMatch = s.match(/FROM\s+(\w+)/i);
        if (!tableMatch) return { changes: 0 };
        const table = getTable(tableMatch[1]);
        const fn = buildWhereFilter(s, params);
        const before = table.length;
        const remaining = table.filter(r => !fn(r));
        store[tableMatch[1]] = remaining;
        if (!inTransaction) saveStore();
        return { changes: before - remaining.length };
    }

    if (s.startsWith('UPDATE')) {
        const tableMatch = s.match(/UPDATE\s+(\w+)/i);
        if (!tableMatch) return { changes: 0 };
        const table = getTable(tableMatch[1]);
        const fn = buildWhereFilter(s, params);
        let changes = 0;
        let pi = 0;

        const setMatch = s.match(/SET\s+(.+?)\s+WHERE/i);
        const setVals = {};
        if (setMatch) {
            const setParts = setMatch[1].split(',').map(p => p.trim());
            for (const part of setParts) {
                const eq = part.match(/(\w+)\s*=\s*\?/);
                if (eq) setVals[eq[1]] = params[pi++];
            }
        }

        for (const row of table) {
            if (fn(row)) {
                Object.assign(row, setVals);
                changes++;
            }
        }
        if (!inTransaction) saveStore();
        return { changes };
    }

    if (s.startsWith('ALTER TABLE')) {
        return { changes: 0 };
    }

    return { changes: 0 };
}

function buildWhereFilter(sql, params) {
    const whereParts = sql.split(/WHERE/i).slice(1).join('WHERE');
    if (!whereParts) return () => true;

    const andParts = whereParts.split(/AND/i);
    let pi = 0;
    const conditions = [];

    for (const part of andParts) {
        const trimmed = part.trim().replace(/;.*$/, '').trim();
        const eqMatch = trimmed.match(/(\w+)\s*=\s*\?/);
        const neMatch = trimmed.match(/(\w+)\s*!=\s*\?/);
        const gtMatch = trimmed.match(/(\w+)\s*>\s*\?/);
        const ltMatch = trimmed.match(/(\w+)\s*<\s*\?/);
        const gteMatch = trimmed.match(/(\w+)\s*>=\s*\?/);
        const lteMatch = trimmed.match(/(\w+)\s*<=\s*\?/);

        if (eqMatch) conditions.push({ col: eqMatch[1], op: '=', val: params[pi++] });
        else if (neMatch) conditions.push({ col: neMatch[1], op: '!=', val: params[pi++] });
        else if (gteMatch) conditions.push({ col: gteMatch[1], op: '>=', val: params[pi++] });
        else if (lteMatch) conditions.push({ col: lteMatch[1], op: '<=', val: params[pi++] });
        else if (gtMatch) conditions.push({ col: gtMatch[1], op: '>', val: params[pi++] });
        else if (ltMatch) conditions.push({ col: ltMatch[1], op: '<', val: params[pi++] });
    }

    return (row) => {
        for (const c of conditions) {
            const rv = row[c.col];
            switch (c.op) {
                case '=': if (rv !== c.val) return false; break;
                case '!=': if (rv === c.val) return false; break;
                case '>': if (!(rv > c.val)) return false; break;
                case '<': if (!(rv < c.val)) return false; break;
                case '>=': if (!(rv >= c.val)) return false; break;
                case '<=': if (!(rv <= c.val)) return false; break;
            }
        }
        return true;
    };
}

function extractTable(sql) {
    const m = sql.match(/FROM\s+(\w+)/i);
    return m ? m[1] : null;
}

class JsonStmt {
    constructor(sql) {
        this._sql = sql;
    }

    all(...params) {
        if (!this._sql) return [];
        const sql = this._sql;
        const table = extractTable(sql);
        if (!table) return [];

        const rows = getTable(table);
        const fn = buildWhereFilter(sql, params);
        let result = rows.filter(fn);

        // Handle COUNT(*) aggregation
        const countMatch = sql.match(/SELECT\s+COUNT\(\s*\*\s*\)/i);
        if (countMatch) {
            const aliasMatch = sql.match(/AS\s+(\w+)/i);
            const alias = aliasMatch ? aliasMatch[1] : 'cnt';
            return [{ [alias]: result.length }];
        }

        // Handle SELECT specific columns
        const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
        if (selectMatch && !selectMatch[1].includes('*')) {
            const cols = selectMatch[1].split(',').map(c => {
                const parts = c.trim().split(/\s+AS\s+/i);
                return { col: parts[0].trim().replace(/[`"']/g, ''), alias: (parts[1] || parts[0]).trim().replace(/[`"']/g, '') };
            });
            result = result.map(row => {
                const out = {};
                for (const { col, alias } of cols) {
                    out[alias] = row[col];
                }
                return out;
            });
        }

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
    }

    get(...params) {
        return this.all(...params)[0] || undefined;
    }

    run(...params) {
        return execSimple(this._sql, params);
    }
}

class JsonDb {
    prepare(sql) {
        return new JsonStmt(sql);
    }

    exec(sql) {
        execSimple(sql, []);
    }

    pragma(str) {}

    transaction(fn) {
        return (...args) => {
            inTransaction = true;
            transactionOps = [];
            try {
                const result = fn(...args);
                saveStore();
                inTransaction = false;
                return result;
            } catch (e) {
                inTransaction = false;
                throw e;
            }
        };
    }
}

let jsonDb;

function getDb() {
    if (!jsonDb) {
        console.log('[JSON-DB] Initializing JSON database');
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
    console.log('[JSON-DB] Schema initialized, tables:', Object.keys(store).join(', '));
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
        saveStore();
        return true;
    },

    remove(userId, sourceId, itemId, itemType = 'channel') {
        const table = getTable('favorites');
        const before = table.length;
        store.favorites = table.filter(r => !(r.user_id === userId && r.source_id === sourceId && r.item_id === String(itemId) && r.item_type === itemType));
        saveStore();
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
