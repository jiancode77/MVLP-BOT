export const name = 'info';
export const description = 'Info bot';
export async function execute({ sock, sender, pushname, settings }) {
  const button = [
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "👤 OWNER",
        id: ".owner"
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📊 STATUS", 
        id: ".status"
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
    text: `🤖 *Bot Information*\n\n` +
          `👋 Halo ${pushname}!\n` +
          `⚡ Bot WhatsApp Multi-Device\n` +
          `🎯 Prefix: ${settings.prefix}\n` +
          `📦 Total Plugins: 15+\n` +
          `🛠️ Status: Active & Ready\n` +
          `🔧 Version: 2.0.0\n` +
          `📱 Platform: Baileys\n` +
          `🌐 Support: LID & JID`,
    footer: "JIAN BOT • Multi-Device WhatsApp",
    templateButtons: button,
    headerType: 1
  };

  await sock.sendMessage(sender, message);
}
