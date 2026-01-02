import axios from 'axios';
import fetch from 'node-fetch';

export function isUrl(url) {
    const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return regex.test(url);
}

export function generateMessageTag(epoch) {
    const tag = (epoch || Date.now()).toString();
    return tag;
}

export async function getBuffer(url, options = {}) {
    try {
        const res = await axios({
            method: 'get',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (e) {
        console.error('Error getBuffer:', e.message);
        return null;
    }
}

export function getSizeMedia(path) {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path)
                .then(res => {
                    const length = res.headers['content-length'];
                    const type = res.headers['content-type'];
                    resolve({ length, type });
                })
                .catch(reject);
        } else {
            reject('Path bukan URL');
        }
    });
}

export async function fetchJson(url, options = {}) {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        console.error('Error fetchJson:', err.message);
        return null;
    }
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatSize(bytes) {
    if (bytes >= 1000000000) {
        return (bytes / 1000000000).toFixed(2) + ' GB';
    } else if (bytes >= 1000000) {
        return (bytes / 1000000).toFixed(2) + ' MB';
    } else if (bytes >= 1000) {
        return (bytes / 1000).toFixed(2) + ' KB';
    } else if (bytes > 1) {
        return bytes + ' bytes';
    } else if (bytes == 1) {
        return bytes + ' byte';
    } else {
        return '0 bytes';
    }
}

export function clockString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

export function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + (d == 1 ? ' hari, ' : ' hari, ') : '';
    const hDisplay = h > 0 ? h + (h == 1 ? ' jam, ' : ' jam, ') : '';
    const mDisplay = m > 0 ? m + (m == 1 ? ' menit, ' : ' menit, ') : '';
    const sDisplay = s > 0 ? s + (s == 1 ? ' detik' : ' detik') : '';
    return dDisplay + hDisplay + mDisplay + sDisplay;
}
