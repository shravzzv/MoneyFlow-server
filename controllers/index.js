const asyncHandler = require('express-async-handler')
const prisma = require('../config/db')

exports.index = (req, res) => {
  res.send('Welcome to the express api of the MoneyFlow app.')
}

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})
