const request = require('supertest')
const express = require('express')
const aiController = require('../controllers/ai')
const prisma = require('../config/db')

const app = express()
app.use(express.json())
app.get('/chats', aiController.getAllChats)
app.post('/chat', aiController.chat)

jest.mock('../config/db', () => ({
  chatHistory: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  entry: {
    findMany: jest.fn(),
  },
}))

jest.mock('../utils/ai', () => jest.fn())

describe('AI Controller', () => {
  describe('GET /chats', () => {
    it('should return all chat history', async () => {
      prisma.chatHistory.findMany.mockResolvedValue([
        {
          id: 1,
          message: 'Hello',
          isUser: true,
          timestamp: new Date().toISOString(),
        },
      ])
      const res = await request(app).get('/chats')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual([
        {
          id: 1,
          message: 'Hello',
          isUser: true,
          timestamp: expect.any(String),
        },
      ])
    })
  })

  describe('POST /chat', () => {
    it('should return AI response and store chat history', async () => {
      const query = 'What is the balance?'
      const entries = [
        {
          id: 1,
          type: 'INCOME',
          amount: 100,
          category: 'Salary',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const chatHistory = [
        {
          id: 1,
          message: 'Hello',
          isUser: true,
          timestamp: new Date().toISOString(),
        },
      ]
      const aiResponse = 'The balance is $100.'

      prisma.entry.findMany.mockResolvedValue(entries)
      prisma.chatHistory.findMany.mockResolvedValue(chatHistory)
      require('../utils/ai').mockResolvedValue(aiResponse)

      const res = await request(app).post('/chat').send({ query })
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({ message: aiResponse })
      expect(prisma.chatHistory.create).toHaveBeenCalledTimes(2)
    })

    it('should return validation errors', async () => {
      const res = await request(app).post('/chat').send({ query: '' })
      expect(res.statusCode).toEqual(401)
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Query must not be empty.' }),
        ])
      )
    })
  })
})
