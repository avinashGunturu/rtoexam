const Question = require('../models/question');
const { encryptData } = require('../utils/helper');
const logger = require('../utils/logger');

const getQuestionController = async (req, res) => {

    try {
        const { pageNo, pageSize, query} = req.body;
        const secretKey = process.env.SECRET_KEY
        let encryptedData ;

        // If pageNo or pageSize is not provided, return all data
        if (!pageNo || !pageSize) {
            const questions = await Question.find(query || {}).sort({ createdAt: -1 });
            // Encrypt the data before sending
             encryptedData = encryptData(questions, secretKey);
            return res.status(200).json({
                success: true,
                code: 0,
                data: {
                    questions,
                    size:questions?.length,
                    encryptedData: encryptedData,
                    pagination: null // No pagination when fetching all data
                }
            });
        }

        // Pagination logic
        const page = parseInt(pageNo) || 1;
        const limit = parseInt(pageSize) || 10;
        const skip = (page - 1) * limit;

        const totalDocs = await Question.countDocuments(query || {});
        const totalPages = Math.ceil(totalDocs / limit);

        // If the requested page number exceeds total pages, return an empty array
        if (page > totalPages) {
            return res.status(200).json({
                success: true,
                code: 0,
                data: {
                    questions: [],
                    size:questions?.length,
                    encryptedData:{},
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalDocs,
                        limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            });
        }

        // Fetch paginated data
        const questions = await Question.find(query || {})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
         encryptedData = encryptData(questions, secretKey);


         // Log the Data with user data, route, and request type
         await logger(req, { type: 'getQuestions' }, 200, true); 

        res.status(200).json({
            success: true,
            code: 0,
            data: {
                 questions,
                size:questions.length,
                encryptedData: encryptedData,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalDocs,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error(error); // Log the error for debugging

         // Log the error with user data, route, and request type
       await logger(req, { type: 'getQuestions' }, 500, false); 


        res.status(500).json({
            success: false,
            code: 1,
            error: 'Internal server error'
        });
    }
}

module.exports ={getQuestionController};