export const name = 'ping';
export const description = 'Cek latency bot';
export async function execute({ sock, sender }) {
  const start = Date.now();
  const pingMsg = await sock.sendMessage(sender, { text: '🏓 Measuring ping...' });
  const latency = Date.now() - start;

  const pingButtons = [
    { buttonId: `${settings.prefix}speedtest`, buttonText: { displayText: '🚀 SPEED TEST' }, type: 1 },
    { buttonId: `${settings.prefix}status`, buttonText: { displayText: '📊 STATUS' }, type: 1 },
    { buttonId: `${settings.prefix}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 }
  ];

  const pingMessage = {
    text: `🏓 *PONG!*\n\n📡 Latency: ${latency}ms\n⚡ Status: ${latency < 500 ? 'Excellent' : latency < 1000 ? 'Good' : 'Slow'}\n💾 Response: ${latency} milliseconds`,
    footer: `Bot Response Time`,
    buttons: pingButtons,
    headerType: 1
  };

  await sock.sendMessage(sender, pingMessage);
}
