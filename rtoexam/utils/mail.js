// utils/email.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config()


// /**
//  * Read an HTML file and return its content
//  * @param {string} filePath - Path to the HTML file
//  * @returns {Promise<string>} - HTML content of the file
//  */
const readHTMLFile = (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding: 'utf-8' }, (err, html) => {
        if (err) {
          reject(err);
        } else {
          resolve(html);
        }
      });
    });
  };
  

// /**
//  * Replace placeholders in an HTML string with actual data
//  * @param {string} html - HTML content with placeholders
//  * @param {object} replacements - Key-value pairs for placeholders
//  * @returns {string} - HTML content with replaced values
//  */
const replacePlaceholders = (html, replacements) => {
    let finalHTML = html;
    for (const key in replacements) {
      finalHTML = finalHTML.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
    }
    return finalHTML;
  };


const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: process.env.EMAIL_SERVICE || 'smtp.gmail.com', // Replace with your SMTP server
    port: 465,// Common port for SMTP
    secure: true, // Set to true if you're using port 465
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
    debug: true
  });


// /**
//  * Send an email
//  * @param {string} to - Recipient email address
//  * @param {string} subject - Email subject
//  * @param {string} text - Plain text version of the email
//  * @param {string} html - HTML version of the email (optional)
//  * @returns {Promise} - Resolves if email is sent successfully, rejects otherwise
//  */
const sendEmail = async (to, subject, text,templateName,replacements) => {
  try {

         // Construct the path to the HTML template
         const filePath = path.join(__dirname, '..', 'emailTemplates', `${templateName}.html`);

         // Read the HTML file
         const htmlContent = await readHTMLFile(filePath);

         
     
         // Replace placeholders with actual data
         const finalHTML = replacePlaceholders(htmlContent, replacements);
     
         console.log("file path =>>",filePath);
         console.log("file html =>>",finalHTML);
        JSON.stringify(finalHTML)

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to, // Recipient email
      subject, // Email subject
      html:finalHTML, // HTML body (optional)
    };


    console.log("trying to connect transport",process.env.EMAIL_PASSWORD);

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};







module.exports = sendEmail;