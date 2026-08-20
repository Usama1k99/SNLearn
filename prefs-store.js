/**
 * prefs-store.js — High-performance per-session preferences storage abstraction.
 * 
 * Uses Upstash Redis with native 7-day TTL (snlearn:session:<id>) when available,
 * otherwise falls back to local user-prefs.json with automatic lazy TTL pruning.
 * 
 * Public API:
 *   getSessionPrefs(sessionId)       -> returns session prefs object or null
 *   setSessionPrefs(sessionId, prefs)-> writes session prefs and resets 7-day TTL
 *   clearAllPrefs()                  -> clears all session data
 *   readAllPrefs()                   -> returns all active sessions (compatibility)
 */

const fs = require('fs');
const path = require('path');

// Load .env for local development
try { require('dotenv').config(); } catch (e) {}

const PREF_FILE = path.join(__dirname, 'user-prefs.json');
const SESSION_KEY_PREFIX = 'snlearn:session:';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 604,800 seconds (7 days)

let redis = null;
let useRedis = false;

// Try to initialize Upstash Redis if env vars are present
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        const { Redis } = require('@upstash/redis');
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        useRedis = true;
        console.log('[prefs-store] Using Upstash Redis with native 7-day TTL');
    } catch (e) {
        console.warn('[prefs-store] @upstash/redis init failed, falling back to JSON file');
    }
} else {
    console.log('[prefs-store] No Redis env vars found, using local JSON file');
}

// ---- JSON file helpers (Local Fallback) ----
function readFilePrefs() {
    if (fs.existsSync(PREF_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
            return pruneFilePrefs(data);
        } catch (e) {
            console.error('[prefs-store] Error reading JSON file:', e.message);
        }
    }
    return {};
}

function pruneFilePrefs(allPrefs) {
    const now = Date.now();
    const maxAgeMs = SESSION_TTL_SECONDS * 1000;
    let pruned = false;
    const clean = {};

    for (const [id, prefs] of Object.entries(allPrefs)) {
        if (!prefs || typeof prefs !== 'object') continue;
        const lastActive = prefs.lastActive ? new Date(prefs.lastActive).getTime() : 0;
        if (now - lastActive <= maxAgeMs) {
            clean[id] = prefs;
        } else {
            pruned = true;
        }
    }

    if (pruned) {
        writeFilePrefs(clean);
    }
    return clean;
}

function writeFilePrefs(obj) {
    try {
        fs.writeFileSync(PREF_FILE, JSON.stringify(obj, null, 2));
    } catch (e) {
        console.error('[prefs-store] Error writing JSON file:', e.message);
    }
}

// ---- Public API ----

/**
 * Retrieve preferences for a specific session ID.
 * Refreshes the lastActive timestamp and 7-day TTL in Redis upon access.
 */
async function getSessionPrefs(sessionId, updateLastActive = true) {
    if (!sessionId) return null;

    if (useRedis && redis) {
        try {
            const key = SESSION_KEY_PREFIX + sessionId;
            const data = await redis.get(key);
            if (!data) return null;

            const parsed = typeof data === 'string' ? JSON.parse(data) : data;

            if (updateLastActive && parsed) {
                parsed.lastActive = new Date().toISOString();
                // Persist new lastActive timestamp to Redis and reset 7-day TTL
                redis.set(key, JSON.stringify(parsed), { ex: SESSION_TTL_SECONDS }).catch(() => {});
            } else {
                redis.expire(key, SESSION_TTL_SECONDS).catch(() => {});
            }

            return parsed;
        } catch (e) {
            console.error('[prefs-store] Redis getSession error:', e.message);
            const fileData = readFilePrefs();
            return fileData[sessionId] || null;
        }
    }

    const fileData = readFilePrefs();
    if (fileData[sessionId] && updateLastActive) {
        fileData[sessionId].lastActive = new Date().toISOString();
        writeFilePrefs(fileData);
    }
    return fileData[sessionId] || null;
}

/**
 * Save preferences for a specific session ID with a 7-day TTL.
 */
async function setSessionPrefs(sessionId, prefs) {
    if (!sessionId || !prefs) return;

    const dataToSave = {
        ...prefs,
        lastActive: new Date().toISOString()
    };

    if (useRedis && redis) {
        try {
            const key = SESSION_KEY_PREFIX + sessionId;
            await redis.set(key, JSON.stringify(dataToSave), { ex: SESSION_TTL_SECONDS });
            return dataToSave;
        } catch (e) {
            console.error('[prefs-store] Redis setSession error:', e.message);
            const fileData = readFilePrefs();
            fileData[sessionId] = dataToSave;
            writeFilePrefs(fileData);
            return dataToSave;
        }
    }

    const fileData = readFilePrefs();
    fileData[sessionId] = dataToSave;
    writeFilePrefs(fileData);
    return dataToSave;
}

/**
 * Clear all session data from Redis and local JSON file.
 */
async function clearAllPrefs() {
    if (useRedis && redis) {
        try {
            await redis.del('snlearn:user-prefs');
            const keys = await redis.keys(SESSION_KEY_PREFIX + '*');
            if (keys && keys.length > 0) {
                for (const k of keys) {
                    await redis.del(k);
                }
            }
            console.log('[prefs-store] Cleared all Redis session keys');
        } catch (e) {
            console.error('[prefs-store] Error clearing Redis:', e.message);
        }
    }
    writeFilePrefs({});
}

/**
 * Compatibility helper: Read all active sessions.
 */
async function readAllPrefs() {
    if (useRedis && redis) {
        try {
            const keys = await redis.keys(SESSION_KEY_PREFIX + '*');
            const result = {};
            if (keys && keys.length > 0) {
                for (const k of keys) {
                    const sid = k.replace(SESSION_KEY_PREFIX, '');
                    const val = await redis.get(k);
                    if (val) {
                        result[sid] = typeof val === 'string' ? JSON.parse(val) : val;
                    }
                }
            }
            return result;
        } catch (e) {
            console.error('[prefs-store] Error reading all sessions:', e.message);
            return readFilePrefs();
        }
    }
    return readFilePrefs();
}

/**
 * Compatibility helper: Bulk write all sessions.
 */
async function writeAllPrefs(allObj) {
    if (useRedis && redis) {
        try {
            for (const [sid, prefs] of Object.entries(allObj)) {
                await setSessionPrefs(sid, prefs);
            }
            return;
        } catch (e) {
            console.error('[prefs-store] Bulk write error:', e.message);
        }
    }
    writeFilePrefs(allObj);
}

module.exports = {
    getSessionPrefs,
    setSessionPrefs,
    clearAllPrefs,
    readAllPrefs,
    writeAllPrefs,
    SESSION_TTL_SECONDS
};
