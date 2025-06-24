const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    text: {
        en: { type: String, required: true }
    }
});

const questionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    question: {
        en: { type: String, required: true }
    },
    options: [optionSchema],
    correctOptionId: { type: Number, required: true },
    imageUrl: { type: String, default: null },
    stateId: [{ type: String }],
    questionType:{type: String, required: true},
    language: { type: String, default: 'en' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;