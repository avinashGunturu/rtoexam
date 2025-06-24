const Question = require('../models/question');
const { encryptData } = require('../utils/helper');
const { v4: uuidv4, validate: validateUUID } = require('uuid'); // Import UUID v4
const logger = require('../utils/logger');
const Exam = require('../models/exam');

const getExamQuestion = async (req, res) => {
    try { 
        const secretKey = process.env.SECRET_KEY
        const { userId,userName, query } = req.body; // Query object to filter questions
        // Fetch 20 random questions from the database
        const questions = await Question.aggregate([
            { $match: query || {} },
            { $sample: { size: 20 } }, // Randomly select 20 questions
            { $project: { correctOptionId: 0 } } // Exclude the answer key
        ]);  

       // Extract question IDs from the fetched questions
       const questionIds = questions.map(question => question.id);

       // Fetch the correct answers for these questions
       const correctAnswers = await Question.find(
           { id: { $in: questionIds } }, // Filter by question IDs
           { id: 1, correctOptionId: 1 } // Only fetch question ID and correct answer
       );

       // Create a map of questionId to correctOptionId for quick lookup
       const correctAnswersMap = correctAnswers.reduce((map, question) => {
           map[question.id] = question.correctOptionId;
           return map;
       }, {});

       // Combine questions with their correct answers
       const questionsWithAnswer = questions.map((question) => {
           return {
               ...question, // Include all question fields
               correctOptionId: correctAnswersMap[question.id] // Add the correct answer
           };
       });  

        let examId =  uuidv4()
        // Create exam data
        const examData = {
            examId:examId , // Generate a unique exam ID
            createdBy: {
                userId: userId || "userID", // Assuming user ID is available in the request
                username: userName || "user" // Assuming username is available in the request
            },
            status:"INPROGRESS",
            questions: questionsWithAnswer ,// Include the selected questions
            userAnswers:[], // when exam start there will be no answers for questions
        };

        // Insert the exam data into the Exam collection
        const exam = new Exam(examData);
        await exam.save();

       // Encrypt the data before sending
       let encryptedData = encryptData(questions, secretKey);

        // Log the Data with user data, route, and request type
       
       await logger(req, { type: 'getExamQuestions' }, 200, true); 

       return res.status(200).json({
            success: true,
            code: 0,
            data: {
                questions,
                examId:examId,
                size:questions.length,
                encryptedData: encryptedData,
            }
        });
       
    } catch (error) {
        console.error('Error fetching exam questions:', error);
         // Log the Data with user data, route, and request type
         
       await logger(req, { type: 'getExamQuestions' }, 500, false); 

        res.status(500).json({
            success: false,
            code: 1,
            error: 'Internal server error'
        });
    }
}


const getExamResults = async (req, res) => {
    try {    
            
        const {examId,userAnswers,userId} = req.body; // Array of { questionId, selectedOptionId }

        // Validate the request body
        if (!examId || !userAnswers || userAnswers.length === 0) {
            return res.status(400).json({
                success: false,
                code: 1,
                error: 'examId and userAnswers are required'
            });
        }
        if(userAnswers.length > 20){
            return res.status(400).json({
                success: false,
                code: 1,
                error: 'userAnswers should be at less than 20 '
            });
        }

          // Validate userAnswers as an array
          if (!Array.isArray(userAnswers)) {
            return res.status(400).json({
                success: false,
                code: 1,
                error: 'userAnswers must be an array'
            });
        }

         // Validate examId as a UUID
         if (!validateUUID(examId)) {
            return res.status(400).json({
                success: false,
                code: 1,
                error: 'Invalid examId'
            });
        }

        // Fetch the exam data from the Exam collection
        const exam = await Exam.findOne({ examId });

        if (!exam) {
            return res.status(404).json({
                success: false,
                code: 1,
                error: 'Exam not found'
            });
        } 

        if(exam?.createdBy?.userId !== userId){
            return res.status(404).json({
                success: false,
                code: 1,
                error: 'Access denied'
            });
        }

        // Create a map of questionId to correctOptionId for quick lookup
        const correctAnswersMap = {}
        
        exam.questions.forEach((question) => {
            correctAnswersMap[question._id] = question.correctOptionId;
        });

        // Evaluate the user's answers
        let correctCount = 0;
        const results = userAnswers.map(answer => {  
            const isCorrect = correctAnswersMap[answer.questionId] === answer.selectedOptionId;
            if (isCorrect) correctCount++;
            return {
                questionId: answer.questionId,
                selectedOptionId: answer.selectedOptionId,
                answerOption:correctAnswersMap[answer.questionId],
                isCorrect
            };
        });
         
        let resultCount = results?.filter(each => each.isCorrect).length
         // Update the exam status and save the user's answers
         exam.status = resultCount >= 12 ? 'PASS':"FAIL";
         exam.userAnswers = results;
         await exam.save();

        // Log the Data with user data, route, and request type
       
       await logger(req, { type: 'examResults' }, 200, true); 


        res.json({
            success: true,
            code: 0,
            data: {
                totalQuestions: userAnswers.length,
                correctAnswers: correctCount,
                status:resultCount >= 12 ? 'PASS':"FAIL",
                results // Detailed results for each question
            }
        });
    } catch (error) {
        console.error('Error evaluating answers:', error);
         // Log the Data with user data, route, and request type
       await logger(req, { type: 'examResults' }, 500, false); 
        res.status(500).json({
            success: false,
            code: 1,
            error: 'Internal server error'
        });
    }
}




module.exports = {getExamQuestion,getExamResults};