const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");

const downloadMediaMessage = async (message) => {
    let quoted = message.msg ? message.msg : message;
    let mtype = (message.msg || message).mimetype || "";
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mtype.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};

module.exports = async (sock, m, store) => {
    if (m.key) {
        m.id = m.key.id;
        m.isSelf = m.key.fromMe;
        m.from = m.key.remoteJid;
        m.isGroup = m.from.endsWith("@g.us");
        m.sender = m.isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid;
    }

    if (m.message) {
        m.type = getContentType(m.message);
        m.msg = (m.type === "viewOnceMessage" ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type]);
        m.body = m.message.conversation || m.msg?.text || m.msg?.caption || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || "";
        m.isMedia = /image|video|sticker|audio/.test(m.type);

        if (m.isMedia) {
            m.download = () => downloadMediaMessage(m);
        }

        m.text = m.msg?.text || m.msg?.caption || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.body || "";

        m.reply = async (text, options = {}) => {
            return await sock.sendMessage(m.from, { text: text, ...options }, { quoted: m });
        };

        m.quoted = m.msg?.contextInfo ? m.msg.contextInfo.quotedMessage : null;
    }

    return m;
};
