const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./env');

const genAI = new GoogleGenerativeAI(env.gemini.apiKey);

const getChatModel = (modelName = env.gemini.model) => genAI.getGenerativeModel({ model: modelName });

module.exports = {
  genAI,
  getChatModel
};
