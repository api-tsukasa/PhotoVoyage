const axios = require('axios');
require('dotenv').config();

const webhookURL = process.env.DISCORD_LOGGER_WEBHOOK_URL;
const logsEnabled = process.env.DISCORD_LOGS_ENABLED === 'true';
const interval = parseInt(process.env.DISCORD_LOG_INTERVAL) || 5000;

async function sendDiscordLog(messages) {
    if (logsEnabled) {
        try {
            for (const message of messages) {
                await axios.post(webhookURL, {
                    embeds: [
                        {
                            title: "Log Message",
                            description: message.description,
                            color: 3447003,
                            fields: [
                                {
                                    name: "Request Method",
                                    value: message.method,
                                    inline: true
                                },
                                {
                                    name: "Request URL",
                                    value: message.url,
                                    inline: true
                                },
                                {
                                    name: "Timestamp",
                                    value: message.timestamp
                                }
                            ]
                        }
                    ]
                });
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        } catch (error) {
            console.error('Error sending the logs to Discord:', error);
        }
    } else {
    }
}

const logQueue = [];

function logMiddleware(req, res, next) {
    const timestamp = new Date().toISOString();
    const logMessage = {
        description: `[${timestamp}] ${req.method} ${req.url}`,
        method: req.method,
        url: req.url,
        timestamp: timestamp
    };

    logQueue.push(logMessage);

    if (logQueue.length === 1) {
        sendLogs();
    }

    next();
}

async function sendLogs() {
    if (logQueue.length > 0) {
        const logsToSend = logQueue.splice(0, logQueue.length);
        await sendDiscordLog(logsToSend);
    }
}

module.exports = {
    logMiddleware
};
