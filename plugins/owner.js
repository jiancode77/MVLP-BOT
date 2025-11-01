export const name = 'owner';
export async function execute({ sock, sender, settings }) {
  await sock.sendMessage(sender, { text: `Owner bot: ${settings.owner}` });
}
