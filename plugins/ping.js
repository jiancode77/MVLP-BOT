export const name = 'ping';
export async function execute({ sock, sender }) {
  await sock.sendMessage(sender, { text: 'Pong!' });
}
