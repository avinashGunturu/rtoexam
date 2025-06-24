
const express = require('express');
const { contactController } = require('../controllers/contact');
const router = express.Router();


// this API is used get the contact us information 

router.post('/contact', contactController);
  


  module.exports = router;