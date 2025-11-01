import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import settings from './settings.js' assert { type: 'json' };
import fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

const plugins = {};
const pluginFiles = await readdir('./plugins');
for (const file of pluginFiles) {
  if (file.endsWith('.js')) {
    const plugin = await import(`./plugins/${file}`);
    plugins[plugin.name] = plugin;
  }
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
      console.log(chalk.yellow('Scan QR Code berikut:'));
      qrcode.generate(qr, { small: true });
    }

    if (pairingCode) {
      console.log(chalk.blue(`Pairing Code: ${pairingCode}`));
    }

    if (connection === 'open') {
      console.log(chalk.green('✓ Berhasil terhubung ke WhatsApp!'));
    }

    if (connection === 'close') {
      console.log(chalk.red('Koneksi terputus, mencoba menghubungkan kembali...'));
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
