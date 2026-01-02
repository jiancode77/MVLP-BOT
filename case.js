import fs from 'fs';
import axios from 'axios';
import yts from 'yt-search';
import chalk from 'chalk';
import archiver from 'archiver';
import path from 'path';
import { isUrl, getBuffer, fetchJson } from './lib/myfunction.js';

export default async function handler(sock, m, chatUpdate, store) {
try {
const body = m.mtype === 'conversation' ? m.message.conversation : 
m.mtype === 'imageMessage' ? m.message.imageMessage.caption : 
m.mtype === 'videoMessage' ? m.message.videoMessage.caption : 
m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : 
m.mtype === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId : 
m.mtype === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
m.mtype === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId : 
m.mtype === 'messageContextInfo' ? m.message.buttonsResponseMessage?.selectedButtonId || 
m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : '';

const budy = typeof m.text === 'string' ? m.text : '';
const prefix = global.prefix;
const isCmd = body.startsWith(prefix);
const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();
const args = body.trim().split(/ +/).slice(1);
const text = args.join(' ');
const quoted = m.quoted ? m.quoted : m;
const mime = (quoted.msg || quoted).mimetype || '';
const isGroup = m.chat.endsWith('@g.us');
const sender = m.sender;
const pushname = m.pushName || 'User';
const botNumber = await sock.decodeJid(sock.user.id);
const isOwner = global.ownerNumbers.includes(sender) || sender.split('@')[0].replace(/[^0-9]/g, '') === global.owner;

if (!global.db.users[sender]) {
global.db.users[sender] = {
name: pushname,
limit: 100,
premium: false
};
}

if (isGroup && !global.db.groups[m.chat]) {
global.db.groups[m.chat] = {
name: (await sock.safeGroupMetadata(m.chat)).subject,
antidelete: false,
welcome: false,
antilink: false
};
}

switch (command) {
case 'menu':
case 'help': {
await sock.sendButton(m.chat, {
caption: `👋 Halo ${pushname}

📱 *${global.botname}*
Prefix: ${prefix}
Owner: ${global.ownername}

📌 *Daftar Command*
• ${prefix}menu - Tampilkan menu
• ${prefix}button - Test button
• ${prefix}order - Buat pesanan
• ${prefix}album - Kirim album
• ${prefix}card - Tampilkan kartu
• ${prefix}sticker - Buat stiker
• ${prefix}toimg - Stiker ke gambar
• ${prefix}play - Putar musik
• ${prefix}antidelete - Anti hapus pesan
• ${prefix}owner - Info owner
• ${prefix}addcase - Tambah case (owner)
• ${prefix}backup - Backup bot (owner)

🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
image: { url: global.thumbnail },
footer: global.ownername,
buttons: [
{
name: "cta_url",
buttonParamsJson: JSON.stringify({
display_text: "Owner",
url: `https://wa.me/${global.owner}`
})
},
{
name: "quick_reply",
buttonParamsJson: JSON.stringify({
display_text: "Owner Info",
id: `${prefix}owner`
})
}
]
}, { quoted: m });
}
break;

case 'addcase': {
if (!global.ownerNumbers.includes(sender) && sender.split('@')[0].replace(/[^0-9]/g, '') !== global.owner) return m.reply('❌ Khusus owner bot');
if (!m.quoted) return m.reply('❌ Reply pesan yang berisi case yang ingin ditambahkan');

const caseCode = m.quoted.text;
if (!caseCode) return m.reply('❌ Tidak ada teks yang direply');

if (!caseCode.includes('case') || !caseCode.includes('break')) {
return m.reply('❌ Format case tidak valid. Pastikan mengandung case dan break');
}

const filepath = './case.js';

try {
let fileContent = fs.readFileSync(filepath, 'utf-8');

const defaultCaseIndex = fileContent.lastIndexOf('default:');
const lastBreakIndex = fileContent.lastIndexOf('break;', defaultCaseIndex);

let insertPosition;
if (defaultCaseIndex !== -1 && lastBreakIndex !== -1) {
insertPosition = lastBreakIndex + 6;
} else {
insertPosition = fileContent.lastIndexOf('}');
}

const formattedCase = '\n\n' + caseCode;

const newContent = fileContent.slice(0, insertPosition) + formattedCase + '\n' + fileContent.slice(insertPosition);

fs.writeFileSync(filepath, newContent, 'utf-8');

const sentMsg = await m.reply('✅ Case berhasil ditambahkan\n⏳ Bot akan restart dalam 3 detik...');

setTimeout(async () => {
await sock.sendMessage(m.chat, {
text: '✅ Case berhasil ditambahkan\n🔄 Bot berhasil direstart',
edit: sentMsg.key
});
process.exit();
}, 3000);

} catch (error) {
console.error(error);
m.reply(`❌ Terjadi kesalahan:\n${error.message}`);
}
}
break;

case 'backup': {
if (!global.ownerNumbers.includes(sender) && sender.split('@')[0].replace(/[^0-9]/g, '') !== global.owner) return m.reply('❌ Khusus owner bot');

const loadingMsg = await m.reply('⏳ Sedang membuat backup...');

try {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const zipName = `backup-${timestamp}.zip`;
const output = fs.createWriteStream(zipName);
const archive = archiver('zip', { zlib: { level: 9 } });

let archiveSize = 0;

archive.on('progress', (progress) => {
archiveSize = progress.fs.processedBytes;
});

output.on('close', async () => {
await sock.sendMessage(m.chat, {
document: fs.readFileSync(zipName),
fileName: zipName,
mimetype: 'application/zip',
caption: `📦 *BACKUP BOT*

📁 File: ${zipName}
📊 Size: ${(archiveSize / 1024 / 1024).toFixed(2)} MB
⏰ ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}

_${global.botname}_`
}, { quoted: m });

fs.unlinkSync(zipName);

await sock.sendMessage(m.chat, {
text: '✅ Backup berhasil dibuat',
edit: loadingMsg.key
});
});

archive.on('error', (err) => {
throw err;
});

archive.pipe(output);

if (fs.existsSync('index.js')) archive.file('index.js', { name: 'index.js' });
if (fs.existsSync('package.json')) archive.file('package.json', { name: 'package.json' });
if (fs.existsSync('case.js')) archive.file('case.js', { name: 'case.js' });
if (fs.existsSync('setting.js')) archive.file('setting.js', { name: 'setting.js' });
if (fs.existsSync('lib')) archive.directory('lib/', 'lib');

await archive.finalize();

} catch (error) {
console.error(error);
await sock.sendMessage(m.chat, {
text: `❌ Terjadi kesalahan:\n${error.message}`,
edit: loadingMsg.key
});
}
}
break;

case 'button': {
await sock.sendButton(m.chat, {
caption: `🔘 *TEST BUTTON MESSAGE*

Ini adalah contoh button message menggunakan Haruka Library

_${global.botname}_`,
image: { url: global.thumbnail },
footer: global.ownername,
buttons: [
{
name: "cta_url",
buttonParamsJson: JSON.stringify({
display_text: "Visit Website",
url: "https://google.com"
})
},
{
name: "quick_reply",
buttonParamsJson: JSON.stringify({
display_text: "Menu",
id: `${prefix}menu`
})
}
]
}, { quoted: m });
}
break;

case 'order': {
await sock.sendOrder(m.chat, {
orderId: "ORDER-" + Date.now(),
thumbnail: global.thumbnail,
itemCount: 15,
status: 1,
surface: 1,
orderTitle: "Premium Subscription",
message: global.botname,
sellerJid: sock.user.jid,
totalAmount1000: 500000000,
totalCurrencyCode: "IDR"
}, { quoted: m, mentions: [sender] });
}
break;

case 'album': {
await sock.sendAlbum(m.chat, [
{ image: { url: global.thumbnail }, caption: `📸 Gambar 1\n\n_${global.botname}_` },
{ image: { url: global.thumbnail }, caption: `📸 Gambar 2\n\n_${global.botname}_` },
{ image: { url: global.thumbnail }, caption: `📸 Gambar 3\n\n_${global.botname}_` }
], { quoted: m });
}
break;

case 'card':
case 'carousel': {
await sock.sendCard(m.chat, {
text: `🎴 *CAROUSEL CARD*

Slide untuk melihat card lainnya

_${global.botname}_`,
footer: global.ownername,
quoted: m,
sender: sender,
cards: [
{
image: global.thumbnail,
caption: "Card 1 - Simple Bot",
buttons: [
{
name: "cta_url",
buttonParamsJson: JSON.stringify({
display_text: "Visit",
url: "https://google.com"
})
}
]
},
{
image: global.thumbnail,
caption: "Card 2 - Simple Bot",
buttons: [
{
name: "quick_reply",
buttonParamsJson: JSON.stringify({
display_text: "Menu",
id: `${prefix}menu`
})
}
]
}
]
});
}
break;

case 's':
case 'sticker': {
if (!quoted) return m.reply('❌ Reply gambar/video dengan caption .sticker');
if (/image/.test(mime)) {
const media = await quoted.download();
await sock.sendSticker(m.chat, {
sticker: media,
packname: global.botname,
author: global.ownername
}, { quoted: m });
} else if (/video/.test(mime)) {
if ((quoted.msg || quoted).seconds > 11) return m.reply('❌ Maksimal 10 detik');
const media = await quoted.download();
await sock.sendSticker(m.chat, {
sticker: media,
packname: global.botname,
author: global.ownername
}, { quoted: m });
} else {
m.reply('❌ Reply gambar/video dengan caption .sticker');
}
}
break;

case 'toimg':
case 'toimage': {
if (!quoted) return m.reply('❌ Reply sticker dengan caption .toimg');
if (!/webp/.test(mime)) return m.reply('❌ Reply sticker dengan caption .toimg');
const media = await quoted.download();
await sock.sendMessage(m.chat, { image: media }, { quoted: m });
}
break;

case 'play':
case 'ytplay': {
if (!text) return m.reply(`❌ Contoh: ${prefix}play dj komang`);
const search = await yts(text);
const video = search.videos[0];
if (!video) return m.reply('❌ Video tidak ditemukan');

await sock.sendButton(m.chat, {
caption: `🎵 *YOUTUBE PLAY*

📌 *Judul:* ${video.title}
⏰ *Durasi:* ${video.timestamp}
👁️ *Views:* ${video.views}
📤 *Upload:* ${video.ago}
🔗 *Link:* ${video.url}

_${global.botname}_`,
image: { url: video.thumbnail },
footer: global.ownername,
buttons: [
{
name: "cta_url",
buttonParamsJson: JSON.stringify({
display_text: "Watch on YouTube",
url: video.url
})
}
]
}, { quoted: m });
}
break;

case 'antidelete':
case 'antidel': {
if (!isGroup) return m.reply('❌ Fitur ini hanya untuk grup');
if (!isOwner) return m.reply('❌ Khusus owner');

if (!global.db.groups[m.chat]) {
global.db.groups[m.chat] = { antidelete: false };
}

global.db.groups[m.chat].antidelete = !global.db.groups[m.chat].antidelete;
m.reply(`✅ Anti Delete ${global.db.groups[m.chat].antidelete ? 'Aktif' : 'Non-Aktif'}`);
}
break;

case 'owner':
case 'creator': {
await sock.sendMessage(m.chat, {
contacts: {
displayName: global.ownername,
contacts: [{
vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${global.ownername}\nTEL;type=CELL;type=VOICE;waid=${global.owner}:+${global.owner}\nEND:VCARD`
}]
}
}, { quoted: m });
}
break;

case 'getlid': {
if (!text) return m.reply(`❌ Contoh: ${prefix}getlid 6288246552068`);
const phone = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
const lid = await sock.getLidFromPN(m, phone);
m.reply(`✅ LID dari ${text}:\n${lid}`);
}
break;

case 'getpn': {
if (!text) return m.reply(`❌ Contoh: ${prefix}getpn 129459441135829@lid`);
const pn = await sock.getPNFromLid(m, text);
m.reply(`✅ Phone Number dari LID:\n${pn}`);
}
break;

default:
if (isCmd) {
console.log(chalk.red(`Command ${command} tidak ditemukan`));
}
}

} catch (err) {
console.error(chalk.red('❌ Error di case handler:'), err);
m.reply(`❌ Error: ${err.message}`);
}
}
