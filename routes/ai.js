const express = require('express')
const router = express.Router()
const controller = require('../controllers/ai')

router.get('/', controller.getAllChats)

router.post('/', controller.chat)

module.exports = router
