process.on('uncaughtException', (err, origin) => {
console.error('[ERROR FATAL TIDAK TERDUGA]', err, origin);
});
process.on('unhandledRejection', (reason, promise) => {
console.error('[PROMISE ERROR TIDAK TERDUGA]', reason, promise);
});

import './setting.js';
import fs from 'fs';
import pino from 'pino';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import yts from 'yt-search';
import readline from 'readline';
import FileType from 'file-type';
import { exec } from 'child_process';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';

import {
makeWASocket,
generateWAMessageFromContent,
prepareWAMessageMedia,
useMultiFileAuthState,
Browsers,
DisconnectReason,
fetchLatestBaileysVersion,
proto,
delay,
areJidsSameUser,
jidDecode,
downloadContentFromMessage,
generateMessageID,
generateWAMessage
} from '@whiskeysockets/baileys';

import haruka from '@ryuu-reinzz/haruka-lib';
import { MessagesUpsert, Solving } from './lib/message.js';
import { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, sleep } from './lib/myfunction.js';
import DataBase from './lib/database.js';

const pairingCode = global.pairing_code || process.argv.includes('--pairing-code');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const database = new DataBase();

(async () => {
try {
const loadData = await database.read();
global.db = {
users: {},
groups: {},
database: {},
settings: {},
...(loadData || {}),
};
if (Object.keys(loadData || {}).length === 0) {
await database.write(global.db);
}

let isSaving = false;
let pendingSave = false;

const saveDatabase = async () => {
if (isSaving) {
pendingSave = true;
return;
}

isSaving = true;
try {
await database.write(global.db);
} catch (e) {
console.error(chalk.red('❌ Error Simpan DB:'), e.message);
} finally {
isSaving = false;
if (pendingSave) {
pendingSave = false;
setTimeout(saveDatabase, 1000);
}
}
};

setInterval(saveDatabase, 30000);
} catch (e) {
console.error(chalk.red('❌ Gagal inisialisasi database:'), e.message);
process.exit(1);
}
})();

let reconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_BASE_DELAY = 5000;

async function startingBot() {

const store = {
messages: {},
contacts: {},
chats: {},
bind: (ev) => {},
loadMessage: (jid, id) => store.messages[jid]?.[id],
writeToFile: () => {}
};

const { state, saveCreds } = await useMultiFileAuthState('session');
const { version, isLatest } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
printQRInTerminal: !pairingCode,
logger: pino({ level: "silent" }),
auth: state,
browser: ["Ubuntu","Chrome","22.04.2"],
generateHighQualityLinkPreview: true,
getMessage: async (key) => store.loadMessage(key.remoteJid, key.id, undefined)?.message,
connectTimeoutMs: 60000,
keepAliveIntervalMs: 25000,
maxIdleTimeMs: 60000,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
});

const property = {
proto,
generateWAMessageFromContent,
jidDecode,
downloadContentFromMessage,
prepareWAMessageMedia,
generateMessageID,
generateWAMessage
};

haruka.addProperty(sock, store, null, property);

sock.decodeJid = (jid) => {
if (!jid) return jid;
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {};
return decode.user && decode.server && decode.user + '@' + decode.server || jid;
} else return jid;
};

const groupCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
sock.safeGroupMetadata = async (id) => {
if (groupCache.has(id)) return groupCache.get(id);
try {
const meta = await Promise.race([
sock.groupMetadata(id),
new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout meta")), 10000))
]);
groupCache.set(id, meta);
return meta;
} catch (err) {
console.error(chalk.red(`❌ Error ambil metadata grup ${id}:`), err.message);
return { id, subject: 'Unknown', participants: [] };
}
};

if (pairingCode && !sock.authState.creds.registered) {
console.clear();

console.log(chalk.cyan(`
╔═══════════════════════════════════════════╗
║                                           ║
║           SIMPLE BOT v1.7                 ║
║                                           ║
║      ███████╗██╗███╗   ███╗██████╗        ║
║      ██╔════╝██║████╗ ████║██╔══██╗       ║
║      ███████╗██║██╔████╔██║██████╔╝       ║
║      ╚════██║██║██║╚██╔╝██║██╔═══╝        ║
║      ███████║██║██║ ╚═╝ ██║██║            ║
║      ╚══════╝╚═╝╚═╝     ╚═╝╚═╝            ║
║                                           ║
║      Simple WhatsApp Bot Library          ║
║                                           ║
╚═══════════════════════════════════════════╝
`));

console.log(chalk.cyan('╔═══════════════════════════════════════════╗'));
console.log(chalk.cyan('║') + chalk.white('     PENGATURAN NOMOR WHATSAPP BOT        ') + chalk.cyan('║'));
console.log(chalk.cyan('╚═══════════════════════════════════════════╝\n'));

let phoneNumber = await question(
chalk.white('Masukkan Nomor WhatsApp\n') +
chalk.gray('Contoh: 62812XXX\n') +
chalk.cyan('> ')
);

phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

setTimeout(async () => {
let code = await sock.requestPairingCode(phoneNumber);
code = code?.match(/.{1,4}/g)?.join(" - ") || code;

console.log(chalk.cyan('\n╔═══════════════════════════════════════════╗'));
console.log(chalk.cyan('║') + chalk.green('  Pairing Code: ') + chalk.white.bold(code) + '          ' + chalk.cyan('║'));
console.log(chalk.cyan('╚═══════════════════════════════════════════╝\n'));

await sock.sendMessage(global.jids, { text: `🔔 *NOTIFIKASI SISTEM*\n\n✅ Pairing Code: *${code}*\n📱 Nomor: ${phoneNumber}\n⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n_Simple Bot v1.7 - Pairing Success_` });
}, 3000);
}

sock.ev.on('creds.update', saveCreds);
sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, qr, receivedPendingNotifications } = update;
if (qr) console.log(chalk.yellow('📱 Masukan code untuk melanjutkan...'));

if (connection === 'close') {
const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
console.log(chalk.red(`🔍 Alasan Disconnect: ${reason || 'Unknown'}`));

if (reason === DisconnectReason.loggedOut) {
console.log(chalk.red('🚫 PERANGKAT KELUAR, SILAKAN HAPUS FOLDER SESSION DAN PAIRING ULANG!'));
process.exit(0);
}

if (!reconnecting) {
reconnecting = true;
reconnectAttempts++;
const baseDelay = Math.min(RECONNECT_BASE_DELAY * Math.pow(1.5, reconnectAttempts), 60000);
const jitter = Math.random() * 2000;
const delayTime = baseDelay + jitter;

console.log(chalk.yellow(`🟩 Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} dalam ${Math.round(delayTime / 1000)} detik...`));

setTimeout(async () => {
try {
await startingBot();
} catch (e) {
console.error("❌ Reconnect gagal:", e.message);
} finally {
reconnecting = false;
}
}, delayTime);
}
}
if (connection === 'open') {
reconnectAttempts = 0;
try {
await sock.sendMessage(global.jids, { text: `🔔 *NOTIFIKASI SISTEM*\n\n✅ ${global.botname2}\n⏰ ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n_Bot berhasil terhubung ke WhatsApp_` });
} catch (e) {
console.error(chalk.red('❌ Error kirim notif:'), e.message);
}

console.log(chalk.cyan('\n╔═══════════════════════════════════════════╗'));
console.log(chalk.cyan('║') + chalk.green('  ✅ BOT BERHASIL TERHUBUNG              ') + chalk.cyan('║'));
console.log(chalk.cyan('║                                           ║'));
console.log(chalk.cyan('║') + chalk.white('  Simple Bot v1.7 - Ready to use 🚀     ') + chalk.cyan('║'));
console.log(chalk.cyan('╚═══════════════════════════════════════════╝\n'));
}

if (receivedPendingNotifications) {
console.log('⏳ Sinkronisasi pesan, mohon tunggu sekitar 1 menit...');
}
});

await Solving(sock, store);

sock.ev.on('messages.upsert', async (message) => {
try {
await MessagesUpsert(sock, message, store);
} catch (err) {
console.log('❌ Error di handler messages.upsert:', err);
}
});

sock.ev.on('messages.update', async (updates) => {
for (const { key, update } of updates) {
if (update.messageStubType === proto.WebMessageInfo.StubType.REVOKE && !update.message) {
try {
const chatId = key.remoteJid;
if (!global.db.groups[chatId]?.antidelete) continue;
const Banned = await store.loadMessage(chatId, key.id, undefined);
if (!Banned || !Banned.message) continue;

const sender = Banned.key.fromMe ? sock.user.id : Banned.key.participant || Banned.key.remoteJid;
if (areJidsSameUser(sender, sock.user.id)) continue;

const messageType = Object.keys(Banned.message)[0];

let text = `🚫 *PESAN DIHAPUS TERDETEKSI* 🚫\n\n`;
text += `*Dari:* @${sender.split('@')[0]}\n`;
text += `*Waktu Hapus:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n`;
text += `*Tipe Pesan:* ${messageType.replace('Message', '')}`;
await sock.sendMessage(chatId, {
text: text,
mentions: [sender]
});
await sock.relayMessage(chatId, Banned.message, {
messageId: Banned.key.id
});
} catch (err) {
console.error(chalk.red('❌ Error di anti-delete:'), err);
}
}
}
});

const userQueues = {};
const messageTimestamps = new Map();
const oriSend = sock.sendMessage.bind(sock);

sock.sendMessage = async (jid, content, options) => {
const now = Date.now();
const lastSent = messageTimestamps.get(jid) || 0;

if (now - lastSent < 50) await delay(50 - (now - lastSent));
if (!userQueues[jid]) userQueues[jid] = Promise.resolve();

userQueues[jid] = userQueues[jid].then(() => new Promise(async (resolve) => {
try {
const result = await Promise.race([
oriSend(jid, content, options),
new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout sendMessage")), 10000))
]);
messageTimestamps.set(jid, Date.now());
resolve(result);
} catch (err) {
console.error(`❌ Error sendMessage ke ${jid}:`, err.message);
resolve();
}
}));
return userQueues[jid];
};

return sock;
}

startingBot().catch(err => {
console.error(chalk.red('❌ Gagal memulai bot:'), err);
setTimeout(startingBot, 10000);
});
