const express = require('express')
const router = express.Router()
const controller = require('../controllers/index')

router.get('/', controller.index)

router.get('/users', controller.getUsers)

module.exports = router
