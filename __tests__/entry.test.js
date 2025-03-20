const request = require('supertest')
const express = require('express')
const entryRouter = require('../routes/entry')
const prisma = require('../config/db')

const app = express()
app.use(express.json())
app.use('/entries', entryRouter)

jest.mock('../config/db', () => ({
  entry: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Entry API', () => {
  describe('GET /entries', () => {
    it('should return all entries', async () => {
      prisma.entry.findMany.mockResolvedValue([
        {
          id: 1,
          type: 'INCOME',
          amount: 100,
          category: 'Salary',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      const res = await request(app).get('/entries')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual([
        {
          id: 1,
          type: 'INCOME',
          amount: 100,
          category: 'Salary',
          date: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })
  })

  describe('GET /entries/:id', () => {
    it('should return a single entry', async () => {
      prisma.entry.findUnique.mockResolvedValue({
        id: 1,
        type: 'INCOME',
        amount: 100,
        category: 'Salary',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      const res = await request(app).get('/entries/1')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({
        id: 1,
        type: 'INCOME',
        amount: 100,
        category: 'Salary',
        date: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should return 404 if entry not found', async () => {
      prisma.entry.findUnique.mockResolvedValue(null)
      const res = await request(app).get('/entries/1')
      expect(res.statusCode).toEqual(404)
      expect(res.body).toEqual({ message: 'Entry not found.' })
    })
  })

  describe('POST /entries', () => {
    it('should create a new entry', async () => {
      const newEntry = {
        type: 'INCOME',
        amount: 100,
        category: 'Salary',
        date: new Date().toISOString(),
        notes: 'Monthly salary',
      }
      const createdEntry = {
        id: 1,
        ...newEntry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      prisma.entry.create.mockResolvedValue(createdEntry)
      const res = await request(app).post('/entries').send(newEntry)
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual(createdEntry)
    })

    it('should return validation errors', async () => {
      const res = await request(app)
        .post('/entries')
        .send({ type: '', amount: -100, category: '' })
      expect(res.statusCode).toEqual(401)
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Type must not be empty.' }),
          expect.objectContaining({ msg: 'Amount must be a positive number.' }),
          expect.objectContaining({ msg: 'Category must not be empty.' }),
        ])
      )
    })
  })

  describe('PUT /entries/:id', () => {
    it('should update an existing entry', async () => {
      const updatedEntry = {
        id: 1,
        type: 'INCOME',
        amount: 200,
        category: 'Bonus',
        date: new Date().toISOString(),
        notes: 'Year-end bonus',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      prisma.entry.findUnique.mockResolvedValue({
        id: 1,
        type: 'INCOME',
        amount: 100,
        category: 'Salary',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }) // Mock the initial entry
      prisma.entry.update.mockResolvedValue(updatedEntry)
      const res = await request(app).put('/entries/1').send(updatedEntry)
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({
        updatedEntry: expect.objectContaining(updatedEntry),
      })
    })

    it('should return 404 if entry not found', async () => {
      prisma.entry.findUnique.mockResolvedValue(null)
      const res = await request(app).put('/entries/1').send({
        type: 'INCOME',
        amount: 200,
        category: 'Bonus',
        date: new Date().toISOString(),
        notes: 'Year-end bonus',
      })
      expect(res.statusCode).toEqual(404)
      expect(res.body).toEqual({ message: 'Entry not found.' })
    })
  })

  describe('DELETE /entries/:id', () => {
    it('should delete an entry', async () => {
      prisma.entry.findUnique.mockResolvedValue({
        id: 1,
        type: 'INCOME',
        amount: 100,
        category: 'Salary',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      prisma.entry.delete.mockResolvedValue({})
      const res = await request(app).delete('/entries/1')
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({ message: 'Entry deleted.' })
    })

    it('should return 404 if entry not found', async () => {
      prisma.entry.findUnique.mockResolvedValue(null)
      const res = await request(app).delete('/entries/1')
      expect(res.statusCode).toEqual(404)
      expect(res.body).toEqual({ message: 'Entry not found.' })
    })
  })
})
