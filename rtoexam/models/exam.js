const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    examId: { type: String, required: true, unique: true }, // Unique exam ID
    createdBy: {
        userId: { type: String, required: true }, // User ID of the creator
        username: { type: String, required: true } // Username of the creator
    },
    questions: [{
        id: { type: String, required: true }, // Question ID
        question: {
            en: { type: String, required: true } // Question text
        },
        correctOptionId: { type: Number, required: true },
        options: [{
            id: { type: Number, required: true }, // Option ID
            text: {
                en: { type: String, required: true } // Option text
            }
        }], 
        questionType:{type: String, required: true},
        imageUrl: { type: String, default: null },
        stateId: [{ type: String }],
        language: { type: String, default: 'en' },
    }],
    status: { type: String, required: true },
    userAnswers: [{
        questionId: { type:String, required: true},
        selectedOptionId: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true }
    }] ,
    createdAt: { type: Date, default: Date.now } // Timestamp
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;