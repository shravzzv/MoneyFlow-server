const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const prisma = require('../config/db')
const chat = require('../utils/ai')

exports.getAllChats = asyncHandler(async (req, res) => {
  const chats = await prisma.chatHistory.findMany({
    orderBy: {
      timestamp: 'asc',
    },
  })

  res.json(chats)
})

exports.chat = [
  body('query').trim().notEmpty().withMessage('Query must not be empty.'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { query } = matchedData(req, {
      onlyValidData: false,
    })

    const entries = await prisma.entry.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    const chatHistory = await prisma.chatHistory.findMany({
      orderBy: { timestamp: 'asc' },
    })

    if (errors.isEmpty()) {
      // Store the user's query in the chat history
      await prisma.chatHistory.create({
        data: {
          message: query,
          isUser: true,
        },
      })

      const data = await chat(entries, chatHistory, query)

      // Store the AI's response in the chat history
      await prisma.chatHistory.create({
        data: {
          message: data,
          isUser: false,
        },
      })

      res.json({ message: data })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]
