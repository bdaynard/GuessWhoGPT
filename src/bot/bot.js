const eris = require("eris")
const constants = require("../constants")
const axios = require('axios')
require("dotenv").config()

const bot = new eris.Client(process.env.DISCORD_BOT_TOKEN)

const url = process.env.URL || 'http://localhost:3000'
const headers = {
    'content-type': 'application/json'
}

bot.on("ready", () => {
    console.log("Connected and ready.")
});

bot.on("messageCreate", async (msg) => {
    const message = msg.content

    if (!msg.channel.guild || !message.startsWith(constants.BOT_PREFIX)) {
        return
    }

    const command = message.substring(constants.BOT_PREFIX.length).trim()

    //TODO: Add in more discord commands that translate to the instructions for chat gpt
    //
    //if "who! play" = "Guess who"
    //if "who! quit" = "I give up"
    
    //Could add in scoring, fewest guesses? cache? db?
    //Could add in a feature where users pass in celebrity and different user needs to guess?

    //TODO: Add in message history
    const newMessage = {"role": "user", "content": command}

    try {
        const response = await axios.post(`${url}/guess`, [newMessage], headers)

        try {
            await msg.channel.createMessage(`${response.data.data}`);
        } catch (err) {
            console.warn(err.response.data)
        }
    } catch (err) {
        console.warn(err.response.data)
    }
})

bot.on("error", (err) => {
    console.warn(err);
})

bot.connect()
