
const Feedback = require('../models/feedback');
const logger = require('../utils/logger');
const sendEmail = require('../utils/mail');

const feedback = async function (req, res){
    try {
        const feedbackData = req.body

        // Insert the exam data into the Exam collection
        const feedback = new Feedback(feedbackData);
        await feedback.save();
       

        let email = feedbackData.email
        let emailSubject = "Feedback";
        let emailText = "Feedback Received: \n\n";

        let replacements = {
            name: feedbackData?.name,
            email: feedbackData?.email,
            message: feedbackData?.message
        }

        await sendEmail(email, emailSubject, emailText,"feedback",replacements);

         // Log the Data with user data, route, and request type
       await logger(req, { type: 'feedback' }, 200, true); 

        return res.status(200).json({
            success: true,
            code: 0,
            data: feedbackData
        });
        
    } catch (err) {
         // Log the Data with user data, route, and request type
       await logger(req, { type: 'feedback' }, 500, false); 
        
        return res.status(500).json({
            success: false,
            code: 1,
            data: {}
        });
    }

}

module.exports = feedback;