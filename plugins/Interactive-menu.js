export const name = 'imenu';
export const description = 'Menu interaktif dengan sections';
export async function execute({ sock, sender, settings }) {
  const interactiveMessage = {
    header: {
      type: "text",
      text: "🎯 INTERACTIVE MENU"
    },
    body: {
      text: `Pilih kategori menu yang diinginkan:\n\nKlik salah satu button di bawah untuk melihat commands sesuai kategori.`
    },
    footer: {
      text: `Bot WhatsApp • Prefix: ${settings.prefix}`
    },
    action: {
      button: "📁 BUKA KATEGORI",
      sections: [
        {
          title: "🤖 BOT UTILITIES",
          rows: [
            { id: "bot_status", title: "📊 Status Bot", description: "Cek status bot lengkap" },
            { id: "bot_ping", title: "⚡ Ping Test", description: "Test kecepatan response" },
            { id: "bot_info", title: "ℹ️ Bot Info", description: "Informasi tentang bot" }
          ]
        },
        {
          title: "👤 USER INFO",
          rows: [
            { id: "user_jid", title: "🆔 My JID", description: "Lihat JID Anda" },
            { id: "user_lid", title: "📧 My LID", description: "Lihat LID Anda" },
            { id: "user_info", title: "👤 My Info", description: "Info akun lengkap" }
          ]
        },
        {
          title: "👥 GROUP TOOLS",
          rows: [
            { id: "group_info", title: "📋 Group Info", description: "Informasi group" },
            { id: "group_link", title: "🔗 Group Link", description: "Dapatkan link group" }
          ]
        }
      ]
    }
  };

  await sock.sendMessage(sender, interactiveMessage);
}
