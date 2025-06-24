const mongoose = require('mongoose');

// Log Schema
const logSchema = new mongoose.Schema({
    route: { type: String, required: true }, // Store the route
    requestType: { type: String, required: true }, // Store the request type (e.g., POST, GET)
    type: { type: String, required: true },
    isSuccess:{type:Boolean,required:true}, // Store the request type (e.g., POST, GET)
    requestBody: { type: Object, required: true },
    responseStatus: { type: Number, required: true },
    userData: {
        ipAddress: { type: String, required: true },
        userAgent: { type: String, required: true },
        referrer: { type: String, default: null },
        timestamp: { type: Date, default: Date.now }
    }
});

// Log Model
const Log = mongoose.model('Log', logSchema);

module.exports = Log;