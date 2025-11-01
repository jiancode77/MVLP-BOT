export const name = 'info';
export async function execute({ sock, sender, pushname }) {
  const message = `Halo ${pushname}!\nBot WhatsApp aktif dan berjalan dengan baik.`;
  await sock.sendMessage(sender, { text: message });
}
