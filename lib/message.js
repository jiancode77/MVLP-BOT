import chalk from 'chalk';
import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import handler from '../case.js';

export async function MessagesUpsert(sock, chatUpdate, store) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message) return;
        
        m.message = Object.keys(m.message)[0] === 'ephemeralMessage' ? m.message.ephemeralMessage.message : m.message;
        
        if (m.key && m.key.remoteJid === 'status@broadcast') return;
        if (!sock.public && !m.key.fromMe && chatUpdate.type === 'notify') return;
        if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return;
        
        const type = Object.keys(m.message)[0];
        m.mtype = type;
        m.msg = m.message[type];
        m.from = m.key.remoteJid;
        m.chat = m.from;
        m.sender = sock.decodeJid(m.fromMe && sock.user.id || m.participant || m.key.participant || m.chat || '');
        m.pushName = m.pushName || 'User';
        m.isGroup = m.chat.endsWith('@g.us');
        
        if (m.isGroup) m.metadata = await sock.safeGroupMetadata(m.chat);
        
        m.quoted = m.msg?.contextInfo?.quotedMessage ? {
            ...m.msg.contextInfo,
            message: m.msg.contextInfo.quotedMessage,
            msg: m.msg.contextInfo.quotedMessage[Object.keys(m.msg.contextInfo.quotedMessage)[0]],
            mtype: Object.keys(m.msg.contextInfo.quotedMessage)[0],
            download: () => sock.downloadMediaMessage(m.msg.contextInfo.quotedMessage)
        } : null;
        
        m.body = m.message?.conversation || 
                 m.message?.[type]?.text || 
                 m.message?.[type]?.caption || 
                 m.message?.[type]?.contentText || 
                 m.message?.[type]?.selectedDisplayText || 
                 m.message?.[type]?.title || '';
        
        m.text = m.body;
        
        m.reply = (text, options = {}) => {
            return sock.sendMessage(m.chat, { text: text, ...options }, { quoted: m });
        };
        
        m.download = () => sock.downloadMediaMessage(m);
        
        console.log(
            chalk.cyan('╔═══════════════════════════════════╗\n') +
            chalk.cyan('║ ') + chalk.white('From: ') + chalk.green(m.pushName) + '\n' +
            chalk.cyan('║ ') + chalk.white('Chat: ') + chalk.green(m.isGroup ? 'Group' : 'Private') + '\n' +
            chalk.cyan('║ ') + chalk.white('Message: ') + chalk.yellow(m.body.slice(0, 30)) + '\n' +
            chalk.cyan('╚═══════════════════════════════════╝')
        );
        
        await handler(sock, m, chatUpdate, store);
        
    } catch (err) {
        console.error(chalk.red('❌ Error di MessagesUpsert:'), err);
    }
}

export async function Solving(sock, store) {
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };
    
    sock.getName = (jid, withoutContact = false) => {
        const id = sock.decodeJid(jid);
        withoutContact = sock.withoutContact || withoutContact;
        let v;
        if (id.endsWith('@g.us')) return new Promise(async (resolve) => {
            v = store.contacts[id] || {};
            if (!(v.name || v.subject)) v = await sock.safeGroupMetadata(id) || {};
            resolve(v.name || v.subject || '+' + id.replace('@s.whatsapp.net', ''));
        });
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === sock.decodeJid(sock.user.id) ?
            sock.user :
            (store.contacts[id] || {});
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || '+' + jid.replace('@s.whatsapp.net', '');
    };
    
    sock.public = true;
    
    sock.downloadMediaMessage = async (message) => {
        let quoted = message.msg ? message.msg : message;
        let mtype = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mtype.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };
}
