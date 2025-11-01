import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';
import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import settings from './settings.js';
import { readdir } from 'fs/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

const sessions = new Map();
const SESSIONS_DIR = "./sessions";

if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device_${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber) {
  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: 'silent' });

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: logger,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,
  });

  let pairingCodeRequested = false;
  let connectionEstablished = false;

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      
      if (statusCode === DisconnectReason.loggedOut) {
        console.log(chalk.red('┃ LOGGED OUT ┃'));
        try {
          if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          }
        } catch (error) {
          console.error("Error deleting session:", error);
        }
        return;
      }
      
      console.log(chalk.yellow('┃ RECONNECTING ┃'));
      setTimeout(() => connectToWhatsApp(botNumber), 2000);
    } 
    else if (connection === "open") {
      if (!connectionEstablished) {
        connectionEstablished = true;
        sessions.set(botNumber, sock);
        console.log(chalk.green('\n╔══════════════════════════════╗'));
        console.log(chalk.green('║   BERHASIL TERHUBUNG KE WA   ║'));
        console.log(chalk.green('╚══════════════════════════════╝'));
        console.log(chalk.white(`📱 Nomor: ${botNumber}`));
        console.log(chalk.white(`🤖 Prefix: ${settings.prefix}`));
        console.log(chalk.white(`🟢 Status: Bot aktif!`));
        rl.close();
        
        setupMessageHandler(botNumber);
      }
    } 
    else if (connection === "connecting") {
      console.log(chalk.yellow('┃ MENGHUBUNGKAN ┃'));
      
      if (!pairingCodeRequested && !fs.existsSync(`${sessionDir}/creds.json`)) {
        pairingCodeRequested = true;
        
        setTimeout(() => {
          requestPairingCode(sock, botNumber);
        }, 1000);
      }
    }

    if (qr && !pairingCodeRequested) {
      console.log(chalk.yellow('┃ QR CODE TERSEDIA ┃'));
      pairingCodeRequested = true;
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

async function requestPairingCode(sock, botNumber) {
  try {
    const cleanNumber = botNumber.replace(/[^0-9]/g, '');
    console.log(chalk.yellow('┃ MEMINTA PAIRING CODE... ┃'));
    
    const code = await sock.requestPairingCode(cleanNumber);
    const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
    
    console.log(chalk.blue('\n╔══════════════════════════════╗'));
    console.log(chalk.blue('║         PAIRING CODE         ║'));
    console.log(chalk.blue('║                              ║'));
    console.log(chalk.blue(`║        ${formattedCode}         ║`));
    console.log(chalk.blue('║                              ║'));
    console.log(chalk.blue('╚══════════════════════════════╝'));
    console.log(chalk.white('📱 Buka WhatsApp > Linked Devices > Link a Device'));
    console.log(chalk.white(`🔢 Masukkan pairing code: ${formattedCode}`));
    console.log(chalk.yellow('⏳ Menunggu verifikasi...'));
    
  } catch (error) {
    console.log(chalk.red(`┃ GAGAL: ${error.message} ┃`));
    console.log(chalk.yellow('┃ COBA ULANG DALAM 3 DETIK ┃'));
    
    setTimeout(() => {
      requestPairingCode(sock, botNumber);
    }, 3000);
  }
}

function setupMessageHandler(botNumber) {
  const sock = sessions.get(botNumber);
  if (!sock) return;

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text ||
                 msg.message.imageMessage?.caption ||
                 msg.message.videoMessage?.caption;

    const sender = msg.key.remoteJid;
    const pushname = msg.pushName || 'Unknown';

    if (text && text.startsWith(settings.prefix)) {
      const args = text.slice(settings.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const plugin = plugins[command];

      console.log(chalk.cyan(`[CMD] ${pushname}: ${text}`));

      if (plugin) {
        try {
          await plugin.execute({
            sock: sock,
            sender,
            args,
            text: args.join(' '),
            pushname,
            settings
          });
        } catch (error) {
          console.error(chalk.red(`[ERROR] ${error.message}`));
        }
      }
    }
  });
}

const plugins = {};
try {
  const pluginFiles = await readdir('./plugins');
  for (const file of pluginFiles) {
    if (file.endsWith('.js')) {
      const plugin = await import(`./plugins/${file}`);
      plugins[plugin.name] = plugin;
    }
  }
  console.log(chalk.green(`✓ Loaded ${Object.keys(plugins).length} plugins`));
} catch (error) {
  fs.mkdirSync('./plugins', { recursive: true });
}

console.log(chalk.cyan('╔══════════════════════════════╗'));
console.log(chalk.cyan('║      WHATSAPP BOT START      ║'));
console.log(chalk.cyan('╚══════════════════════════════╝'));

console.log(chalk.yellow('\n╔══════════════════════════════╗'));
console.log(chalk.yellow('║     MASUKAN NOMOR WHATSAPP   ║'));
console.log(chalk.yellow('╚══════════════════════════════╝'));

const phoneNumber = await question(chalk.blue('Nomor WhatsApp (contoh: 6281234567890): '));

if (!phoneNumber) {
  console.log(chalk.red('❌ Nomor WhatsApp harus diisi!'));
  process.exit(1);
}

console.log(chalk.yellow(`\n🔄 Menghubungkan ke WhatsApp: ${phoneNumber}`));
await connectToWhatsApp(phoneNumber);
