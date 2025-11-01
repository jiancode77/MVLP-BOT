export const name = 'status';
export const description = 'Status bot dan server';
export async function execute({ sock, sender }) {
  const statusButtons = [
    { buttonId: `${settings.prefix}ping`, buttonText: { displayText: '🏓 PING' }, type: 1 },
    { buttonId: `${settings.prefix}runtime`, buttonText: { displayText: '⏰ RUNTIME' }, type: 1 },
    { buttonId: `${settings.prefix}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 }
  ];

  const statusText = `
📊 *BOT STATUS*

🟢 Status: Online
⚡ Response: Active
🔧 Mode: Multi-Device
📱 Platform: WhatsApp Web

🖥️ *SERVER INFO*
• OS: Ubuntu Linux
• Runtime: Node.js
• Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB
• Uptime: ${Math.floor(process.uptime() / 60)} menit

✅ *SERVICES*
• WhatsApp: Connected
• Plugins: Loaded
• Session: Active
• Auto-Reconnect: Enabled

🤖 Bot siap melayani!
  `.trim();

  const buttonMessage = {
    text: statusText,
    footer: 'Klik button untuk aksi cepat',
    buttons: statusButtons,
    headerType: 1
  };

  await sock.sendMessage(sender, buttonMessage);
}
