export const name = 'owner';
export const description = 'Info pemilik bot';
export async function execute({ sock, sender, settings }) {
  const button = [
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "ℹ️ INFO",
        id: ".info"
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📋 MENU", 
        id: ".menu"
      })
    },
    {
      name: "quick_reply", 
      buttonParamsJson: JSON.stringify({
        display_text: "🏓 PING",
        id: ".ping"
      })
    }
  ];

  const message = {
    text: `👤 *Owner Bot*\n\n` +
          `📞 ${settings.owner}\n` +
          `💬 Hubungi owner untuk bantuan\n` +
          `🔧 Bot Creator\n` +
          `⚡ WhatsApp Bot Multi-Device\n` +
          `🌟 JIAN BOT System`,
    footer: "Contact Owner for Support",
    templateButtons: button,
    headerType: 1
  };

  await sock.sendMessage(sender, message);
}
