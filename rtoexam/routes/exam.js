const express = require('express');
const { getExamQuestion,getExamResults } = require('../controllers/exam');
const router = express.Router();


// Exam API: Fetch 20 random questions (excluding the answer key)
router.post('/exam',getExamQuestion);

// Result API: Evaluate user's answers and return the result
router.post('/result', getExamResults);




module.exports = router;