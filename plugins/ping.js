export const name = 'ping';
export async function execute({ sock, sender }) {
  const start = Date.now();
  await sock.sendMessage(sender, { text: '🏓 Pong!' });
  const latency = Date.now() - start;
  await sock.sendMessage(sender, { text: `📡 Latency: ${latency}ms` });
}
