const express = require('express');
const feedback = require('../controllers/feedback');

const router = express.Router();



router.get('/feedback',feedback)




module.exports = router;