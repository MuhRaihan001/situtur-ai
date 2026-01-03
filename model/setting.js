const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

const safetySettings = require('./config/safety.json');

const adjustedSettings = safetySettings.map(setting => ({
    category: HarmCategory[setting.category],
    threshold: HarmBlockThreshold[setting.threshold],
}));

module.exports = adjustedSettings;