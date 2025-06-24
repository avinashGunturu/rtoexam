const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  payer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
