const express = require('express');
const { getQuestionController } = require('../controllers/question');
const router = express.Router();



router.post('/', getQuestionController);

module.exports = router;