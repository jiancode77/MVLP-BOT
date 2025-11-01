export const name = 'sc';
export const description = 'Source code bot';
export async function execute({ sock, sender }) {
  const button = [
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "📁 Get Source Code",
        url: "https://github.com",
        merchant_url: "https://github.com"
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📋 MENU",
        id: ".menu"
      })
    }
  ];

  const message = {
    text: `🧩 *SOURCE CODE BOT*\n\n` +
          `Ingin membuat bot seperti ini?\n\n` +
          `📚 *TECH STACK:*\n` +
          `• @whiskeysockets/baileys\n` +
          `• Node.js\n` +
          `• JavaScript ES6\n\n` +
          `🚀 *FEATURES:*\n` +
          `• Multi-Device\n` +
          `• Button Interface\n` +
          `• Plugin System\n` +
          `• Auto-Reconnect\n\n` +
          `Klik button di bawah untuk mendapatkan source code!`,
    footer: "Open Source Project",
    templateButtons: button,
    headerType: 1
  };

  await sock.sendMessage(sender, message);
}
