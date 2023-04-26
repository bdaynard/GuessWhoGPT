const eris = require("eris")
const constants = require("../constants")
const axios = require('axios')
require("dotenv").config()

const bot = new eris.Client(process.env.DISCORD_BOT_TOKEN)

const url = process.env.URL || 'http://localhost:3000'
var startMessage

const headers = {
    'content-type': 'application/json'
}

bot.on("ready", () => {
    console.log("Connected and ready.")
});

bot.on("messageCreate", async (msg) => {
    let command = msg.content

    if (!msg.channel.guild || !command.startsWith(constants.BOT_PREFIX)) {
        return
    }

    command = command.substring(constants.BOT_PREFIX.length).trim()

    if (command.length === 0) {
        try {
            await msg.channel.createMessage(`Try adding a message after your command!`);
            return
        } catch (err) {
            console.warn(err.response.data)
        }
    }

    switch (command.toLowerCase()) {
        case (constants.START_COMMAND.toLowerCase()):
            startMessage = msg.id
            break
        case (constants.END_COMMAND.toLowerCase()):
            if (!startMessage) {
                await msg.channel.createMessage(`No game to quit. If you want to start a game type: "who! play"`);
                return
            }
            break
        default:
            if (!startMessage) {
                await msg.channel.createMessage(`If you want to start a game type: "who! play"`);
                return
            }
    }

    const getMessageOptions = {
        after: startMessage
    }

    let messages = await msg.channel.getMessages(getMessageOptions)
    messages = messages.filter(list => list.author.bot || list.content.startsWith(constants.BOT_PREFIX))

    messages = formatMessageList(messages)
    
    //Could add in scoring, fewest guesses? cache? db?
    //Could add in a feature where users pass in celebrity and different user needs to guess?

    try {
        const response = await axios.post(`${url}/guess`, messages, headers)

        try {
            await msg.channel.createMessage(`${response.data.data}`);
            if (command == constants.END_COMMAND) {
                startMessage = null
            }
        } catch (err) {
            console.warn(err.response.data)
        }
    } catch (err) {
        console.warn(err.response.data)
    }
})

function formatMessageList(messages) {
    let formattedMessages = messages.map(message => {
        if (message.author.bot) {
            return {"role": "assistant", "content": message.content}
        }
        let content = convertCommandToMessage(message.content)
        return {"role": "user", "content": content}
    })

    return formattedMessages.reverse()
}

function convertCommandToMessage(content) {
    switch (content.toLowerCase()) {
        case (constants.START_COMMAND.toLowerCase()):
            return constants.START_PROMPT
        case (constants.END_COMMAND.toLowerCase()):
            return constants.END_PROMPT
        default:
            return content
    }
}

bot.on("error", (err) => {
    console.warn(err);
})

bot.connect()
