const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const prisma = require('../config/db')

exports.getAll = asyncHandler(async (req, res) => {
  const entries = await prisma.entry.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  })

  res.json(entries)
})

exports.getOne = asyncHandler(async (req, res) => {
  const entry = await prisma.entry.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  })

  if (entry) {
    res.json(entry)
  } else {
    res.status(404).json({ message: 'Entry not found.' })
  }
})

exports.create = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type must not be empty.')
    .isIn(['INCOME', 'EXPENSE'])
    .withMessage('Type must be either INCOME or EXPENSE.'),

  body('amount')
    .notEmpty()
    .withMessage('Amount must not be empty.')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number.'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category must not be empty.')
    .escape(),

  body('notes').trim().optional(),

  body('date')
    .notEmpty()
    .withMessage('Date must not be empty.')
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { type, amount, category, notes, date } = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    if (errors.isEmpty()) {
      const newEntry = await prisma.entry.create({
        data: {
          type,
          amount,
          category,
          notes,
          date,
        },
      })
      res.json(newEntry)
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.update = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type must not be empty.')
    .isIn(['INCOME', 'EXPENSE'])
    .withMessage('Type must be either INCOME or EXPENSE.'),

  body('amount')
    .notEmpty()
    .withMessage('Amount must not be empty.')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number.'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category must not be empty.')
    .escape(),

  body('notes').trim().optional(),

  body('date')
    .notEmpty()
    .withMessage('Date must not be empty.')
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { type, amount, category, notes, date } = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    if (errors.isEmpty()) {
      const oldEntry = await prisma.entry.findUnique({
        where: {
          id: parseInt(req.params.id),
        },
      })

      if (!oldEntry) {
        return res.status(404).json({ message: 'Entry not found.' })
      }

      const updatedEntry = await prisma.entry.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: {
          type,
          amount,
          category,
          notes,
          date,
        },
      })

      res.json(updatedEntry)
    } else {
      res.status(401).json(errors.array())
    }
  }),
]

exports.delete = asyncHandler(async (req, res) => {
  const entry = await prisma.entry.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  })

  if (!entry) {
    return res.status(404).json({ message: 'Entry not found.' })
  }

  await prisma.entry.delete({
    where: {
      id: parseInt(req.params.id),
    },
  })

  res.json({ message: 'Entry deleted.' })
})
