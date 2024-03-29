const axios = require('axios');
require('dotenv').config();

async function sendDiscordLog(message) {
    const webhookURL = process.env.DISCORD_LOGGER_WEBHOOK_URL;
    const logsEnabled = process.env.DISCORD_LOGS_ENABLED === 'true';

    if (logsEnabled) {
        try {
            await axios.post(webhookURL, { content: message });
        } catch (error) {
            console.error('Error sending the log to Discord:', error);
        }
    } else {
        
    }
}

function logMiddleware(req, res, next) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${req.method} ${req.url}`;

    sendDiscordLog(logMessage);

    next();
}

module.exports = {
    logMiddleware
};
