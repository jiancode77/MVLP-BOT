const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const moment = require("moment");
const fs = require("fs");
const readline = require("readline");

const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    console.log(chalk.cyan(`
╔════════════════════════════════════════════╗
║          SFESR WHATSAPP BOT                ║
║          Version: ${version.join(".")}                     ║
╚════════════════════════════════════════════╝
    `));

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["Chrome (Linux)", "", ""],
        auth: state,
        version
    });

    store.bind(sock.ev);

    if (!sock.authState.creds.registered) {
        console.log(chalk.yellow(`┌────────────────────────────────────────────┐`));
        console.log(chalk.yellow(`│`) + chalk.white(`  Masukkan Nomor WhatsApp                   `) + chalk.yellow(`│`));
        console.log(chalk.yellow(`└────────────────────────────────────────────┘`));
        
        let phoneNumber = await question(chalk.cyan("  Nomor: "));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

        if (!phoneNumber.startsWith("62")) {
            phoneNumber = "62" + phoneNumber;
        }

        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            
            console.log(chalk.yellow(`┌────────────────────────────────────────────┐`));
            console.log(chalk.yellow(`│`) + chalk.white(`  Kode Pairing: `) + chalk.green(code) + chalk.white(`                    `) + chalk.yellow(`│`));
            console.log(chalk.yellow(`└────────────────────────────────────────────┘`));
        }, 3000);
    }

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            
            mek.message = (Object.keys(mek.message)[0] === "ephemeralMessage") 
                ? mek.message.ephemeralMessage.message 
                : mek.message;
            
            if (mek.key && mek.key.remoteJid === "status@broadcast") return;
            if (!mek.key.fromMe && chatUpdate.type === "notify") {
                const m = await require("./lib/serialize")(sock, mek, store);
                require("./case")(sock, m, chatUpdate, store);
            }
        } catch (err) {
            console.log(err);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.badSession) {
                console.log(chalk.red(`┌────────────────────────────────────────────┐`));
                console.log(chalk.red(`│`) + chalk.white(`  Bad Session, Reconnecting...              `) + chalk.red(`│`));
                console.log(chalk.red(`└────────────────────────────────────────────┘`));
                startBot();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log(chalk.yellow(`┌────────────────────────────────────────────┐`));
                console.log(chalk.yellow(`│`) + chalk.white(`  Connection Closed, Reconnecting...        `) + chalk.yellow(`│`));
                console.log(chalk.yellow(`└────────────────────────────────────────────┘`));
                startBot();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log(chalk.yellow(`┌────────────────────────────────────────────┐`));
                console.log(chalk.yellow(`│`) + chalk.white(`  Connection Lost, Reconnecting...          `) + chalk.yellow(`│`));
                console.log(chalk.yellow(`└────────────────────────────────────────────┘`));
                startBot();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log(chalk.red(`┌────────────────────────────────────────────┐`));
                console.log(chalk.red(`│`) + chalk.white(`  Connection Replaced                       `) + chalk.red(`│`));
                console.log(chalk.red(`└────────────────────────────────────────────┘`));
                startBot();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red(`┌────────────────────────────────────────────┐`));
                console.log(chalk.red(`│`) + chalk.white(`  Device Logged Out                         `) + chalk.red(`│`));
                console.log(chalk.red(`└────────────────────────────────────────────┘`));
                if (fs.existsSync("./session")) {
                    fs.rmSync("./session", { recursive: true, force: true });
                }
                startBot();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log(chalk.yellow(`┌────────────────────────────────────────────┐`));
                console.log(chalk.yellow(`│`) + chalk.white(`  Restart Required, Restarting...           `) + chalk.yellow(`│`));
                console.log(chalk.yellow(`└────────────────────────────────────────────┘`));
                startBot();
            } else if (reason === DisconnectReason.timedOut) {
                console.log(chalk.yellow(`┌────────────────────────────────────────────┐`));
                console.log(chalk.yellow(`│`) + chalk.white(`  Connection Timed Out, Reconnecting...     `) + chalk.yellow(`│`));
                console.log(chalk.yellow(`└────────────────────────────────────────────┘`));
                startBot();
            } else {
                console.log(chalk.red(`┌────────────────────────────────────────────┐`));
                console.log(chalk.red(`│`) + chalk.white(`  Unknown Reason: ${reason}                 `) + chalk.red(`│`));
                console.log(chalk.red(`└────────────────────────────────────────────┘`));
                startBot();
            }
        } else if (connection === "open") {
            console.log(chalk.green(`┌────────────────────────────────────────────┐`));
            console.log(chalk.green(`│`) + chalk.white(`  Bot Connected Successfully!               `) + chalk.green(`│`));
            console.log(chalk.green(`│`) + chalk.white(`  Time: ${moment().format("HH:mm:ss")}                        `) + chalk.green(`│`));
            console.log(chalk.green(`└────────────────────────────────────────────┘`));
        }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.sendButtonMessage = async (jid, buttons, quoted, opts = {}) => {
        const message = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: opts.header || undefined,
                        body: { text: opts.body || "" },
                        footer: { text: opts.footer || "" },
                        nativeFlowMessage: {
                            buttons: buttons.map(btn => ({
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: btn.displayText || btn.text,
                                    id: btn.buttonId || btn.id
                                })
                            })),
                            messageParamsJson: ""
                        }
                    }
                }
            }
        };

        return await sock.relayMessage(jid, message, { quoted });
    };

    return sock;
}

startBot();
