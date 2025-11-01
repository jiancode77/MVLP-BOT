import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import settings from './settings.js';
import fs from 'fs';
import { readdir } from 'fs/promises';

const plugins = {};
try {
  const pluginFiles = await readdir('./plugins');
  for (const file of pluginFiles) {
    if (file.endsWith('.js')) {
      const plugin = await import(`./plugins/${file}`);
      plugins[plugin.name] = plugin;
    }
  }
} catch (error) {
  console.log(chalk.yellow('Folder plugins tidak ditemukan, membuat folder...'));
  fs.mkdirSync('./plugins', { recursive: true });
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    printQRInTerminal: false,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr, pairingCode } = update;

    if (qr) {
      console.log(chalk.yellow('\n╔══════════════════════════════╗'));
      console.log(chalk.yellow('║        SCAN QR CODE         ║'));
      console.log(chalk.yellow('╚══════════════════════════════╝'));
      qrcode.generate(qr, { small: true });
    }

    if (pairingCode) {
      console.log(chalk.blue('\n╔══════════════════════════════╗'));
      console.log(chalk.blue('║         PAIRING CODE         ║'));
      console.log(chalk.blue('║                              ║'));
      console.log(chalk.blue(`║         ${pairingCode}           ║`));
      console.log(chalk.blue('║                              ║'));
      console.log(chalk.blue('╚══════════════════════════════╝'));
    }

    if (connection === 'open') {
      console.log(chalk.green('\n╔══════════════════════════════╗'));
      console.log(chalk.green('║   BERHASIL TERHUBUNG KE WA   ║'));
      console.log(chalk.green('╚══════════════════════════════╝'));
    }

    if (connection === 'close') {
      console.log(chalk.red('\nKoneksi terputus, menghubungkan kembali...'));
      startBot();
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    const pushname = msg.pushName;

    if (text && text.startsWith(settings.prefix)) {
      const args = text.slice(settings.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const plugin = plugins[command];

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
          console.error(error);
        }
      }
    }
  });
}

console.log(chalk.cyan('Memulai WhatsApp Bot...'));
startBot();
