const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const adjustedSettings = require('./setting');
const configuration = require('./config/config.json');
const conversation = require('./memory');

dotenv.config();

class Model {

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.KEY);
        this.model = this.genAI.getGenerativeModel({ model: process.env.MODEL_NAME });
        this.generationConfig = {
            temperature: configuration.temperature,
            topK: configuration.topK,
            topP: configuration.topP,
            maxOutputTokens: configuration.max_output,
        };
        this.safetySettings = adjustedSettings;
        this.isOwnerEnabled = false;

    }

    async response(message, id) {
        if (!message)
            throw new Error('Prompt Empty');

        try {

            const chat = this.model.startChat({
                generationConfig: this.generationConfig,
                safetySettings: this.safetySettings,
                history: []
            });

            const result = await chat.sendMessage(message);
            await conversation.add(id, { from: 'Ai', time: new Date, message: result.response.text() });
            return result.response

        } catch (error) {
            throw error;
        }
    }
}

module.exports = Model