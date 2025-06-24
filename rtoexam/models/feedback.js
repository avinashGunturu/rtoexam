const mongoose = require('mongoose');


const feedbackSchema = new mongoose.Schema({
     name:{type: 'string',required:true},
     email:{type: 'string',required:true},
     message:{type: 'string',required:true},
})



module.exports = mongoose.model('Feedback', feedbackSchema);