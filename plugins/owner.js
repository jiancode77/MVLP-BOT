export const name = 'owner';
export const description = 'Info pemilik bot';
export async function execute({ sock, sender, settings }) {
  const ownerButtons = [
    { buttonId: `${settings.prefix}info`, buttonText: { displayText: 'ℹ️ INFO' }, type: 1 },
    { buttonId: `${settings.prefix}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 },
    { buttonId: `${settings.prefix}ping`, buttonText: { displayText: '🏓 PING' }, type: 1 }
  ];

  const buttonMessage = {
    text: `👤 *Owner Bot*\n\n📞 ${settings.owner}\n💬 Hubungi owner untuk bantuan\n🔧 Bot Creator\n⚡ WhatsApp Bot Multi-Device`,
    footer: 'Contact Owner for Support',
    buttons: ownerButtons,
    headerType: 1
  };

  await sock.sendMessage(sender, buttonMessage);
}
