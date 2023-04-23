const eris = require("eris");
require("dotenv").config();
const constants = require("../constants");

const bot = new eris.Client(process.env.DISCORD_BOT_TOKEN);

bot.on("ready", () => {
    console.log("Connected and ready.");
});

bot.on("messageCreate", async (msg) => {
    const message = msg.content

    if (!msg.channel.guild || !message.startsWith(constants.BOT_PREFIX)) {
        return
    }

    const command = message.substring(constants.BOT_PREFIX.length).trim()

    try {
        await msg.channel.createMessage(`${command}`);
    } catch (err) {
        console.warn(err)
    }
});

bot.on("error", (err) => {
    console.warn(err);
});

bot.connect();
