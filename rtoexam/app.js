const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const questionsRouter = require('./routes/question.js');
const contactRouter = require('./routes/contact.js');
const examRouter = require('./routes/exam.js');
const feedbackRouter = require('./routes/feedback.js')
const paymentRoutes = require('./routes/payment.js')

const app = express();

dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// 2. Cookie parser (to parse cookies in incoming requests)
app.use(cookieParser());

// 3. CORS (to enable Cross-Origin Resource Sharing)
app.use(cors());

// Routes
// Use the questions router

app.use('/api/question', questionsRouter);
app.use('/api', contactRouter);
app.use('/api', examRouter);
app.use('/api', feedbackRouter);
// Routes
app.use('/api/payments', paymentRoutes);

module.exports = app;