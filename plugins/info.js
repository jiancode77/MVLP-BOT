export const name = 'info';
export async function execute({ sock, sender, pushname }) {
  const message = `👋 Halo ${pushname}!\n\n🤖 Bot WhatsApp aktif dan berjalan dengan baik.\n📍 Gunakan prefix: !\n📂 Total plugins: 3`;
  await sock.sendMessage(sender, { text: message });
}
