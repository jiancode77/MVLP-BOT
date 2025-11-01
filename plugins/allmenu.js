export const name = 'allmenu';
export const description = 'Semua menu lengkap dengan button interaktif';
export async function execute({ sock, sender, settings }) {
  const menuSections = [
    {
      title: "🤖 BOT COMMANDS",
      rows: [
        { title: "📊 Status Bot", description: "Cek status bot", rowId: `${settings.prefix}status` },
        { title: "⚡ Ping", description: "Cek kecepatan bot", rowId: `${settings.prefix}ping` },
        { title: "ℹ️ Info Bot", description: "Informasi bot", rowId: `${settings.prefix}info` },
        { title: "⏰ Runtime", description: "Waktu aktif bot", rowId: `${settings.prefix}runtime` }
      ]
    },
    {
      title: "👤 USER COMMANDS", 
      rows: [
        { title: "🆔 My JID", description: "Lihat JID Anda", rowId: `${settings.prefix}myjid` },
        { title: "📧 My LID", description: "Lihat LID Anda", rowId: `${settings.prefix}mylid` },
        { title: "👤 My Info", description: "Info akun Anda", rowId: `${settings.prefix}myinfo` }
      ]
    },
    {
      title: "👥 GROUP COMMANDS",
      rows: [
        { title: "📋 Group Info", description: "Informasi group", rowId: `${settings.prefix}groupinfo` },
        { title: "🔗 Group Link", description: "Dapatkan link group", rowId: `${settings.prefix}linkgroup` }
      ]
    },
    {
      title: "🔧 TOOLS COMMANDS",
      rows: [
        { title: "🚀 Speed Test", description: "Test kecepatan", rowId: `${settings.prefix}speedtest` }
      ]
    }
  ];

  const buttonMessage = {
    text: `🎯 *ALL MENU BOT* 🤖\n\nPilih menu yang diinginkan dari button di bawah:\n\n*📝 Cara penggunaan:*\nKlik salah satu button di bawah ini untuk menjalankan command`,
    footer: `Bot WhatsApp • Prefix: ${settings.prefix}`,
    title: "📋 DAFTAR MENU LENGKAP",
    buttonText: "📁 BUKA MENU",
    sections: menuSections
  };

  await sock.sendMessage(sender, buttonMessage);
}
