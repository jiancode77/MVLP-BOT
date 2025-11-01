export const name = 'allmenu';
export const description = 'Menu lengkap dengan button interaktif';
export async function execute({ sock, sender, settings }) {
  const button = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "Select Here",
        sections: [
          {
            title: "Main Command",
            rows: [
              { 
                header: "Show Menu", 
                title: "🔮 Tampilkan Menu", 
                description: 'Menampilkan Daftar Fitur', 
                id: '.allmenu' 
              },
              { 
                header: "User Info", 
                title: "💠 Status User", 
                description: 'Menampilkan Status Pengguna', 
                id: '.info' 
              },
              { 
                header: "Owner Contact", 
                title: "👑 Hubungi Kami", 
                description: 'Menampilkan Kontak Pemilik', 
                id: '.owner' 
              },
              { 
                header: "System Status", 
                title: "⚙️ Statis Mesin", 
                description: 'Menampilkan Informasi Server Bot', 
                id: '.ping' 
              },
              { 
                header: "Support Development", 
                title: "❤️ Donasi", 
                description: 'Menampilkan Kotak Amal', 
                id: '.donasi' 
              },
              { 
                header: "Source Code Bot", 
                title: "🧩 Script Bot", 
                description: 'Dapatkan Gratis Script bot', 
                id: '.sc' 
              }
            ]
          },
          {
            title: "Bot Control",
            rows: [
              { 
                header: "Self Mode", 
                title: "Owner Only", 
                description: 'Beralih Ke Mode Self', 
                id: '.self' 
              },
              { 
                header: "Public Mode", 
                title: "Owner Only", 
                description: 'Beralih Ke Mode Public', 
                id: '.public' 
              },
              { 
                header: "Group Only True", 
                title: "Owner Only", 
                description: 'Aktifkan Mode Khusus Grup',
                id: '.gconly on' 
              },
              { 
                header: "Grup Only False", 
                title: "Owner Only", 
                description: 'Nonaktifkan Mode Khusus Grup', 
                id: '.gconly off' 
              },
              { 
                header: "Auto View Sw True", 
                title: "Owner Only", 
                description: 'Mengaktifkan Auto View Sw', 
                id: '.autoviewsw on' 
              },
              { 
                header: "Auto View Sw False", 
                title: "Owner Only", 
                description: 'Nonaktifkan Auto View Sw', 
                id: '.autoviewsw off' 
              }
            ]
          },
          {
            title: "User Tools",
            rows: [
              { 
                header: "My JID", 
                title: "🆔 My JID", 
                description: 'Lihat JID Anda', 
                id: '.myjid' 
              },
              { 
                header: "My LID", 
                title: "📧 My LID", 
                description: 'Lihat LID Anda', 
                id: '.mylid' 
              },
              { 
                header: "My Info", 
                title: "👤 My Info", 
                description: 'Info akun lengkap', 
                id: '.myinfo' 
              },
              { 
                header: "Group Info", 
                title: "📋 Group Info", 
                description: 'Informasi group', 
                id: '.groupinfo' 
              },
              { 
                header: "Group Link", 
                title: "🔗 Group Link", 
                description: 'Dapatkan link group', 
                id: '.linkgroup' 
              },
              { 
                header: "Speed Test", 
                title: "🚀 Speed Test", 
                description: 'Test kecepatan bot', 
                id: '.speedtest' 
              }
            ]
          }
        ]
      })
    },
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "🌐 Official Website",
        url: "https://github.com",
        merchant_url: "https://github.com"
      })
    }
  ];

  const message = {
    text: `┏━━〔 *JIAN SYSTEM INTERFACE* 〕━━┓\n\n` +
          `Halo! Selamat datang di bot WhatsApp.\n\n` +
          `*🤖 BOT FEATURES:*\n` +
          `• Multi-Device Support\n` +
          `• Fast Response\n` +
          `• 20+ Commands\n` +
          `• Group & Private Support\n\n` +
          `*📝 INSTRUKSI:*\n` +
          `Pilih menu di bawah untuk menjalankan command\n` +
          `Gunakan prefix: *${settings.prefix}*`,
    footer: "JIAN BOT • WhatsApp Multi-Device",
    templateButtons: button,
    headerType: 1
  };

  await sock.sendMessage(sender, message);
}
