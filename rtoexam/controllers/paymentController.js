const Razorpay = require('razorpay');
const crypto = require('crypto');

const dotenv = require('dotenv');
const Payment = require("../models/payment.js");
const logger = require('../utils/logger');

const sendEmail = require('../utils/mail.js');

dotenv.config()

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


 const createOrder = async (req, res) => {
    try {
      const { name, email, phone, amount, currency = 'INR' } = req.body;
  
      // Validate input
      if (!name || !email || !amount) {
        return res.status(400).json({ success: false, message: 'All fields are required!' });
      }
  
      // Create Razorpay order
      const options = {
        amount: (+amount) * 100, // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
      };
  
      const order = await razorpay.orders.create(options);
  
      // Save order details along with payer info to DB
      const payment = await Payment.create({
        razorpayOrderId: order.id,
        amount: order.amount / 100, // Convert back to rupees
        status: 'Pending',
        payer: {
          name,
          email,
          phone,
        },
      });

        // Log the Data with user data, route, and request type
       await logger(req, { type: 'createOrder' }, 200, true); 

  
      res.status(201).json({
        code:0,
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error) {
          // Log the Data with user data, route, and request type
       await logger(req, { type: 'createOrder' }, 500, false); 
       
      res.status(500).json({ success: false, message: error.message,code:1 });
    }
  };
  


const verifyPayment = async (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, payerDetails, amount } = req.body;
  
      // Validate input
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment details' });
      }
  
      // Generate the signature to compare with razorpay_signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
  
      // Check if the generated signature matches the provided signature
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
  
      // Update payment status in the database
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'Paid', razorpayPaymentId: razorpay_payment_id },
        { new: true }
      );
  
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
        

        let email = payerDetails?.email
        let emailSubject = "Payment Received";
        let emailText = "Payment Received: \n\n";

        let replacements = {
            name: payerDetails?.name,
            email: payerDetails?.email,
            id: razorpay_order_id,
            amount:amount,
            mobile: payerDetails?.phone,
        }

        await sendEmail(email, emailSubject, emailText,"payments",replacements);

         // Log the Data with user data, route, and request type
       await logger(req, { type: 'verifyPayment' }, 200, true);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment,
      });
    } catch (error) {
       
      // Log the Data with user data, route, and request type
       await logger(req, { type: 'verifyPayment' }, 500, false); 
        
       res.status(500).json({ success: false, message: error.message });
    }
  };
  
  
  

  module.exports = {createOrder,verifyPayment}