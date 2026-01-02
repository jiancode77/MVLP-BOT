🤖 Simple Bot v1.7 - WhatsApp Bot

<div align="center">

https://img.shields.io/badge/WhatsApp-Bot-green?style=for-the-badge&logo=whatsapp
https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=for-the-badge&logo=node.js
https://img.shields.io/badge/ES-Modules-blue?style=for-the-badge&logo=javascript
https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge

A powerful WhatsApp bot built with Baileys and Haruka-Lib extensions

Features • Installation • Commands • Configuration

</div>

✨ Features

🚀 Core Features

· ✅ ES Module Support - Pure ES Modules (no CommonJS)
· ✅ Auto Reconnect - Automatic reconnection handling
· ✅ Session Management - Multi-file auth state
· ✅ Password Protection - Secure pairing with password
· ✅ Message Queue - Rate limiting and queuing system

💬 Message Types

· 📱 Button Messages - Interactive button messages
· 🛒 Order Messages - Professional order displays
· 🖼️ Album Messages - Multiple images in one message
· 🎡 Card/Carousel - Slideable menu cards
· 🏷️ Custom Stickers - Create stickers with custom pack info
· 🌐 Web Screenshots - Capture website screenshots via API

🔧 Technical

· 📦 Haruka-Lib Integration - Extended Baileys functionality
· 🛡️ Error Handling - Comprehensive error catching
· 💾 JSON Database - Simple file-based database
· 🔄 Live Reload - File watching for updates

📦 Installation

Prerequisites

· Node.js 18 or higher
· npm or yarn
· WhatsApp account (phone number)

Step-by-Step Setup

1. Clone or create project

```bash
mkdir simple-bot
cd simple-bot
```

1. Initialize package.json

```bash
npm init -y
```

1. Install dependencies

```bash
npm install @ryuu-reinzz/baileys @ryuu-reinzz/haruka-lib chalk pino node-cache @hapi/boom node-fetch cfonts
```

1. Create project structure

```
simple-bot/
├── index.js          # Main bot file
├── case.js           # Command handler
├── setting.js        # Configuration
├── package.json
└── lib/
    └── database.js   # Database handler
```

1. Run the bot

```bash
# Normal mode (QR code)
npm start

# Pairing code mode
npm run pair
```

⚙️ Configuration

Edit setting.js with your preferences:

```javascript
export default {
    botname: "Simple Bot",
    ownername: "Your Name",
    thumbnail: "https://i.imgur.com/example.jpg",
    
    pairing_code: false,      // Set true for pairing code mode
    custompairing: false,     // Custom pairing code
    
    prefix: ".",              // Command prefix
    
    password: "yourpassword", // Password for pairing
    
    jids: [
        "6281234567890@s.whatsapp.net"  // Owner's JID for notifications
    ]
}
```

🎮 Commands

Basic Commands

Command Description Example
.menu Show main menu .menu
.ping Check bot response time .ping
.info Show bot information .info
.owner Show owner contact .owner

Media Commands

Command Description Example
.ss Take website screenshot .ss google.com
.ssweb Advanced screenshot .ssweb https://example.com
.sticker Create sticker from image Reply .sticker to image
.album Send multiple images .album

Advanced Features

Command Description Example
.button Send button message .button
.order Send order message .order
.card Send carousel card .card
.lid Get LID from phone number .lid 6281234567890
.pn Get phone number from LID .pn 1234567890@lid
.alljid List all JIDs in group .alljid

🖼️ Screenshot Feature

Capture any website with simple commands:

```bash
# Basic usage
.ss google.com

# With full URL
.ss https://github.com

# Reply to message containing URL
Reply ".ss" to any message with URL
```

Features:

· Real-time status updates with message editing
· Progress indication
· Error handling
· Direct download button

🏗️ Project Structure

```
simple-bot/
├── index.js          # Main entry point, connection handling
├── case.js           # All command handlers
├── setting.js        # Configuration and settings
├── package.json      # Dependencies and scripts
├── lib/
│   └── database.js   # JSON database management
├── session/          # Auto-created WhatsApp session
└── database.json     # Auto-created data storage
```

🔧 Troubleshooting

Common Issues

1. "makeWASocket is not a function"

```javascript
// ❌ Wrong
import { makeWASocket } from '@ryuu-reinzz/baileys';

// ✅ Correct
import makeWASocket from '@ryuu-reinzz/baileys';
```

1. "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

1. QR Code not showing

· Check internet connection
· Ensure no firewall blocking
· Try pairing code mode instead

1. Bot not responding

· Check if session folder exists
· Verify phone number in settings
· Check console for errors

Debug Mode

Add debug case to case.js:

```javascript
case 'debug':
console.log('Debug:', { from: m.chat, sender: m.sender, text: m.text });
await sock.sendMessage(m.chat, { text: JSON.stringify(m, null, 2) }, { quoted: m });
break;
```

📝 Environment Variables

Create .env file (optional):

```
BOT_NAME="Simple Bot"
BOT_OWNER="Your Name"
BOT_PREFIX="."
PAIRING_PASSWORD="yourpassword"
```

🔄 Auto Restart

For production, use PM2:

```bash
npm install -g pm2
pm2 start index.js --name "whatsapp-bot"
pm2 save
pm2 startup
```

📁 File Examples

Quick Start Template

```javascript
// index.js - Minimal version
import process from 'process';
process.on('unhandledRejection', console.error);

import makeWASocket from '@ryuu-reinzz/baileys';
import { useMultiFileAuthState } from '@ryuu-reinzz/baileys';

async function startBot() {
    const { state } = await useMultiFileAuthState('session');
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });
    
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.message) return;
        
        const text = message.message.conversation || '';
        if (text === '.ping') {
            await sock.sendMessage(message.key.remoteJid, { text: 'Pong!' });
        }
    });
}

startBot();
```

🤝 Contributing

1. Fork the repository
2. Create feature branch (git checkout -b feature/AmazingFeature)
3. Commit changes (git commit -m 'Add AmazingFeature')
4. Push to branch (git push origin feature/AmazingFeature)
5. Open Pull Request

📄 License

Distributed under MIT License. See LICENSE for more information.

⚠️ Disclaimer

This bot is for educational purposes only. The developers are not responsible for any misuse of this software. Use in accordance with WhatsApp's Terms of Service.

📞 Support

For issues and questions:

1. Check the Troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed error logs

---

<div align="center">

Made with ❤️ using:
Baileys• Haruka-Lib • Node.js

⭐ Star this project if you found it useful!

</div>
