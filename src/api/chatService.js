const express = require("express")
const bodyParser = require("body-parser")
// const cors = require("cors")
// const helmet = require("helmet")
// const morgan = require("morgan")
const { Configuration, OpenAIApi } = require("openai")
require('dotenv').config()
const constants = require("../constants")

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration)
const port = process.env.PORT || "3000"

const app = express()
app.use(bodyParser.json())

// app.use(helmet())
// app.use(cors())
// app.use(morgan("combined"))

app.post("/guess", async (req, res) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "Missing API Key",
      },
    })
    return
  }

  const messages = req.body

  var messageList = [
    {"role": "system", "content": constants.SYSTEM_SETTINGS},
    ...messages
  ]

  console.log(messageList)

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messageList,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 1.5,
      max_tokens: 150
    })

    res.status(200).json({ data: completion.data.choices[0].message.content })

  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      })
    }

  }
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})
