const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const chat = require('../utils/ai')

exports.chat = [
  body('query').trim().notEmpty().withMessage('Query must not be empty.'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { query } = matchedData(req, {
      onlyValidData: false,
    })

    if (errors.isEmpty()) {
      const data = await chat(query)
      res.json({ message: data })
    } else {
      res.status(401).json(errors.array())
    }
  }),
]
