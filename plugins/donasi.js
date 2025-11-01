export const name = 'donasi';
export const description = 'Donasi untuk pengembangan bot';
export async function execute({ sock, sender }) {
  const button = [
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "💳 Donate Here",
        url: "https://saweria.co",
        merchant_url: "https://saweria.co"
      })
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📋 MENU",
        id: ".menu"
      })
    }
  ];

  const message = {
    text: `❤️ *SUPPORT DEVELOPMENT*\n\n` +
          `Terima kasih ingin mendukung pengembangan bot!\n\n` +
          `💳 *Donasi Via:*\n` +
          `• Saweria: https://saweria.co\n` +
          `• Trakteer: https://trakteer.id\n` +
          `• Dana: 081234567890\n\n` +
          `Donasi akan digunakan untuk:\n` +
          `• Server & Hosting\n` +
          `• Pengembangan Fitur\n` +
          `• Maintenance Bot`,
    footer: "Thank you for your support!",
    templateButtons: button,
    headerType: 1
  };

  await sock.sendMessage(sender, message);
}
