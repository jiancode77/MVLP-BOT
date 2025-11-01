export const name = 'info';
export const description = 'Info bot';
export async function execute({ sock, sender, pushname, settings }) {
  const infoButtons = [
    { buttonId: `${settings.prefix}owner`, buttonText: { displayText: '👤 OWNER' }, type: 1 },
    { buttonId: `${settings.prefix}status`, buttonText: { displayText: '📊 STATUS' }, type: 1 },
    { buttonId: `${settings.prefix}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 }
  ];

  const message = `🤖 *Bot Information*\n\n👋 Halo ${pushname}!\n⚡ Bot WhatsApp Multi-Device\n🎯 Prefix: ${settings.prefix}\n📦 Total Plugins: 12+\n🛠️ Status: Active & Ready\n🔧 Version: 2.0.0\n📱 Platform: Baileys`;

  const buttonMessage = {
    text: message,
    footer: 'Bot WhatsApp Multi-Device',
    buttons: infoButtons,
    headerType: 1
  };

  await sock.sendMessage(sender, buttonMessage);
}
