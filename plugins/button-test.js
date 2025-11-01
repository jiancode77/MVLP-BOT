export const name = 'btest';
export const description = 'Test button interaktif';
export async function execute({ sock, sender, settings }) {
  const interactiveMsg = {
    text: "🔘 *TEST BUTTON INTERAKTIF*\n\nPilih salah satu button di bawah ini:",
    footer: "Button Interactive Test",
    buttons: [
      {
        buttonId: `${settings.prefix}ping`,
        buttonText: { displayText: "🏓 PING TEST" },
        type: 1
      },
      {
        buttonId: `${settings.prefix}status`, 
        buttonText: { displayText: "📊 STATUS" },
        type: 1
      },
      {
        buttonId: `${settings.prefix}menu`,
        buttonText: { displayText: "📋 MENU" },
        type: 1
      }
    ],
    headerType: 1
  };

  await sock.sendMessage(sender, interactiveMsg);
}
