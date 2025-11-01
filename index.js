import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import settings from './settings.js';
import fs from 'fs';
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

console.log(chalk.cyan('╔══════════════════════════════╗'));
console.log(chalk.cyan('║      WHATSAPP BOT START      ║'));
console.log(chalk.cyan('╚══════════════════════════════╝'));

const plugins = {};
try {
  const pluginFiles = await readdir('./plugins');
  for (const file of pluginFiles) {
    if (file.endsWith('.js')) {
      const pluginPath = `./plugins/${file}`;
      const plugin = await import(pluginPath);
      plugins[plugin.name] = plugin;
    }
  }
  console.log(chalk.green(`✓ Loaded ${Object.keys(plugins).length} plugins`));
} catch (error) {
  console.log(chalk.yellow('⚠ Folder plugins tidak ditemukan, membuat folder...'));
  fs.mkdirSync('./plugins', { recursive: true });
}

console.log(chalk.yellow('\n╔══════════════════════════════╗'));
console.log(chalk.yellow('║     MASUKAN NOMOR WHATSAPP   ║'));
console.log(chalk.yellow('╚══════════════════════════════╝'));

const phoneNumber = await question(chalk.blue('Nomor WhatsApp (contoh: 6281234567890): '));
const connectionMethod = await question(chalk.blue('Pilih metode koneksi (1=QR Code, 2=Pairing Code): '));

if (!phoneNumber) {
  console.log(chalk.red('❌ Nomor WhatsApp harus diisi!'));
  process.exit(1);
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, {
        log: console
      }),
    },
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    retryRequestDelayMs: 1000,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, pairingCode, isNewLogin, lastDisconnect } = update;

    if (qr && connectionMethod === '1') {
      console.log(chalk.yellow('\n╔══════════════════════════════╗'));
      console.log(chalk.yellow('║        SCAN QR CODE         ║'));
      console.log(chalk.yellow('╚══════════════════════════════╝'));
      qrcode.generate(qr, { small: true });
      console.log(chalk.white('Buka WhatsApp > Linked Devices > Scan QR Code'));
    }

    if (pairingCode && connectionMethod === '2') {
      console.log(chalk.blue('\n╔══════════════════════════════╗'));
      console.log(chalk.blue('║         PAIRING CODE         ║'));
      console.log(chalk.blue('║                              ║'));
      console.log(chalk.blue(`║        ${pairingCode}         ║`));
      console.log(chalk.blue('║                              ║'));
      console.log(chalk.blue('╚══════════════════════════════╝'));
      console.log(chalk.white('Buka WhatsApp > Linked Devices > Link a Device'));
      console.log(chalk.white(`Masukkan pairing code: ${pairingCode}`));
    }

    if (connection === 'open') {
      console.log(chalk.green('\n╔══════════════════════════════╗'));
      console.log(chalk.green('║   BERHASIL TERHUBUNG KE WA   ║'));
      console.log(chalk.green('╚══════════════════════════════╝'));
      console.log(chalk.white(`📱 Nomor: ${phoneNumber}`));
      console.log(chalk.white(`🤖 Bot siap digunakan! Prefix: ${settings.prefix}`));
      rl.close();
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log(chalk.red('\n⚠ Koneksi terputus...'));
      
      if (shouldReconnect) {
        console.log(chalk.yellow('🔄 Mencoba menghubungkan kembali...'));
        setTimeout(connectToWhatsApp, 5000);
      } else {
        console.log(chalk.red('❌ Session expired, hapus folder auth_info dan restart bot'));
        rl.close();
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

    const text = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || 
                 msg.message.imageMessage?.caption ||
                 msg.message.videoMessage?.caption;

    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    const pushname = msg.pushName || 'Unknown';

    if (text && text.startsWith(settings.prefix)) {
      const args = text.slice(settings.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const plugin = plugins[command];

      console.log(chalk.cyan(`[CMD] ${pushname}: ${text}`));

      if (plugin) {
        try {
          await plugin.execute({
            sock,
            sender,
            args,
            text: args.join(' '),
            isGroup,
            pushname,
            settings
          });
        } catch (error) {
          console.error(chalk.red(`[ERROR] ${error.message}`));
          await sock.sendMessage(sender, { 
            text: `❌ Error: ${error.message}` 
          });
        }
      }
    }
  });

  return sock;
}

console.log(chalk.yellow(`\n🔄 Menghubungkan ke WhatsApp: ${phoneNumber}`));
connectToWhatsApp().catch(err => {
  console.error(chalk.red('❌ Gagal menghubungkan:'), err);
  rl.close();
});
