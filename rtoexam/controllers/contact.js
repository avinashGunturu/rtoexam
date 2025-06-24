const Contact = require("../models/contact");
const logger = require('../utils/logger');
const sendEmail = require('../utils/mail');

const contactController = async (req, res) => {
    try {
      const { name, email, phone, subject, message, state, preferredContactMethod } = req.body;

      // Log the Data with user data, route, and request type
     await logger(req, { type: 'contact' }, 200, true);
  
      // Save to MongoDB
      const newContact = new Contact({ name, email, phone, subject, message, state, preferredContactMethod });
      await newContact.save();
  
      // Send email to the customer
    //   await sendEmail(email, name, subject);   

     // Send email to the customer
     const emailSubject = `Thank you for contacting us regarding : ${subject}`;
     const emailText = `Hi ${name},\n\nThank you for reaching out to us about "${subject}". We have received your message and will get back to you soon.\n\nBest regards,\nYour Company`;

     const replacements = {
        name:name,
        subject:subject,
        email:email,
     }

     await sendEmail(email, emailSubject, emailText,"contact",replacements);
  
      res.status(201).json({ message: 'Contact form submitted successfully!',code:0 });
    } catch (error) {
      console.error('Error submitting contact form:', error);

     // Log the request
     await logger(req, { type: 'contact' }, 500, false);
     
      res.status(500).json({ message: 'Internal server error',code:1 });
    }
  }


  module.exports ={contactController};