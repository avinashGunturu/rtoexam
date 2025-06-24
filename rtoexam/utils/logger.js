const Log = require('../models/log.js'); // Adjust the path based on your project structure

// /**
//  * Helper function to log data
//  * @param {Object} req - Express request object
//  * @param {Object} options - Additional options to log
//  * @param {number} responseStatus - HTTP response status
//  * @param {boolean} isSuccess - Whether the operation was successful
//  */
async function logger(req, options = {}, responseStatus = 200, isSuccess = true) {
    try {
        await Log.create({
            route: req.originalUrl,
            requestType: req.method,
            requestBody: req.body,
            responseStatus,
            type: options.type || 'general',
            isSuccess,
            userData: {
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.get('User-Agent'),
                referrer: req.get('Referrer') || null,
                timestamp: new Date(),
            },
            ...options.additionalData, // Allows adding extra fields dynamically
        });
    } catch (error) {
        console.error('Error logging request:', error);
    }
}

module.exports = logger;
