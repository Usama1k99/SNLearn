/**
 * prefs-store.js — Unified preferences storage abstraction.
 * 
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL is available,
 * otherwise falls back to local JSON file.
 * 
 * Both paths expose the same async API:
 *   readAllPrefs()  -> returns the full prefs object
 *   writeAllPrefs(obj) -> writes the full prefs object
 */

const fs = require('fs');
const path = require('path');

// Load .env for local development
try { require('dotenv').config(); } catch (e) {}

const PREF_FILE = path.join(__dirname, 'user-prefs.json');
const REDIS_KEY = 'snlearn:user-prefs';

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
        console.log('[prefs-store] Using Upstash Redis for preferences');
    } catch (e) {
        console.warn('[prefs-store] @upstash/redis init failed, falling back to JSON file');
    }
} else {
    console.log('[prefs-store] No Redis env vars found, using local JSON file');
}

// ---- JSON file helpers ----
function readFilePrefs() {
    if (fs.existsSync(PREF_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
        } catch (e) {
            console.error('[prefs-store] Error reading JSON file:', e.message);
        }
    }
    return {};
}

function writeFilePrefs(obj) {
    fs.writeFileSync(PREF_FILE, JSON.stringify(obj, null, 2));
}

// ---- Public API ----
async function readAllPrefs() {
    if (useRedis && redis) {
        try {
            const data = await redis.get(REDIS_KEY);
            return data || {};
        } catch (e) {
            console.error('[prefs-store] Redis read error:', e.message);
            return readFilePrefs();
        }
    }
    return readFilePrefs();
}

async function writeAllPrefs(obj) {
    if (useRedis && redis) {
        try {
            await redis.set(REDIS_KEY, JSON.stringify(obj));
        } catch (e) {
            console.error('[prefs-store] Redis write error:', e.message);
            writeFilePrefs(obj);
        }
    } else {
        writeFilePrefs(obj);
    }
}

module.exports = { readAllPrefs, writeAllPrefs };
