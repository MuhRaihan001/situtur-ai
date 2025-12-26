const { GoogleGenerativeAI } = require('@google/generative-ai');
const adjustedSettings = require('./setting');
const configuration = require('./config/config.json');


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

    async response(message) {
        if (!message)
            throw new Error('Prompt Empty');

        try {

            const chat = this.model.startChat({
                generationConfig: this.generationConfig,
                safetySettings: this.safetySettings,
                history: []
            });

            const result = await chat.sendMessage(message);
            return result.response

        } catch (error) {
            throw error;
        }
    }
}

module.exports = Model