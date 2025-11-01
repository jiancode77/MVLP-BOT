export const name = 'menu';
export const description = 'Menu utama bot';
export async function execute({ sock, sender, settings, pushname, isGroup }) {
  const menuButtons = [
    { buttonId: `${settings.prefix}allmenu`, buttonText: { displayText: '📋 ALL MENU' }, type: 1 },
    { buttonId: `${settings.prefix}info`, buttonText: { displayText: 'ℹ️ INFO' }, type: 1 },
    { buttonId: `${settings.prefix}owner`, buttonText: { displayText: '👤 OWNER' }, type: 1 }
  ];

  const buttonMessage = {
    text: `🤖 *BOT WHATSAPP MENU*\n\n👋 Halo *${pushname}*\n${isGroup ? '📍 Anda berada di *GROUP*' : '📍 Anda berada di *PRIVATE CHAT*'}\n\n📁 *MAIN MENU*\n• ${settings.prefix}ping - Cek latency bot\n• ${settings.prefix}owner - Info pemilik bot\n• ${settings.prefix}info - Info bot\n• ${settings.prefix}menu - Menu ini\n• ${settings.prefix}allmenu - Semua menu lengkap\n• ${settings.prefix}status - Status bot\n\n💡 *Note:* Klik button di bawah untuk akses cepat!`,
    footer: `Prefix: ${settings.prefix}`,
    buttons: menuButtons,
    headerType: 1
  };

  await sock.sendMessage(sender, buttonMessage);
}
