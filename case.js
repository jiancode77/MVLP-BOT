const moment = require("moment");

module.exports = async (sock, m, chatUpdate, store) => {
    try {
        const body = m.body || "";
        const prefix = ".";
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : "";
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");

        switch (command) {
            case "ping": {
                const start = Date.now();
                const msg = await m.reply("Pinging...");
                const end = Date.now();
                await sock.sendMessage(m.from, {
                    text: `┌────────────────────────────────────────────┐\n│  Pong! ${end - start}ms                             │\n│  Time: ${moment().format("HH:mm:ss")}                        │\n└────────────────────────────────────────────┘`,
                    edit: msg.key
                });
            }
            break;
        }
    } catch (err) {
        console.log(err);
    }
};
