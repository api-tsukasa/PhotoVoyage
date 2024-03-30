const axios = require('axios');
require('dotenv').config();

const webhookURL = process.env.DISCORD_LOGGER_WEBHOOK_URL;
const logsEnabled = process.env.DISCORD_LOGS_ENABLED === 'true';
const interval = parseInt(process.env.DISCORD_LOG_INTERVAL) || 5000;

let lastMessageId = null;

async function sendDiscordLog(message) {
    if (logsEnabled) {
        try {
            const response = await axios.post(webhookURL, {
                embeds: [
                    {
                        title: "Log Message",
                        description: message.description,
                        color: 3447003,
                        fields: [
                            {
                                name: "Event",
                                value: message.event,
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

            if (lastMessageId) {
                // If there's a previous message, edit it with the new log
                await axios.patch(`${webhookURL}/messages/${lastMessageId}`, {
                    embeds: [
                        {
                            title: "Log Message",
                            description: message.description,
                            color: 3447003,
                            fields: [
                                {
                                    name: "Event",
                                    value: message.event,
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
            } else {
                lastMessageId = response.data.id;
            }
        } catch (error) {
            console.error('Error sending or editing the log message on Discord:', error);
        }
    }
}

function logMiddleware(req, res, next) {
    const timestamp = new Date().toISOString();
    let logMessage = null;

    // Determine the event type based on the request path
    if (req.url === '/register' && req.method === 'POST' && req.body && req.body.username) {
        logMessage = {
            event: "User Registration",
            description: `[${timestamp}] New user registered: ${req.body.username}`,
            timestamp: timestamp
        };
    } else if (req.url === '/login' && req.method === 'POST' && req.body && req.body.username) {
        logMessage = {
            event: "User Login",
            description: `[${timestamp}] User logged in: ${req.body.username}`,
            timestamp: timestamp
        };
    } else if (req.url === '/upload' && req.method === 'POST') {
        logMessage = {
            event: "Photo Upload",
            description: `[${timestamp}] User uploaded a photo`,
            timestamp: timestamp
        };
    } else if (req.url.startsWith('/admin/delete/') && req.method === 'POST') {
        const photoId = req.url.split('/').pop();
        logMessage = {
            event: "Photo Deletion",
            description: `[${timestamp}] User deleted photo with ID: ${photoId}`,
            timestamp: timestamp
        };
    }

    // Send log if it's relevant
    if (logMessage) {
        sendDiscordLog(logMessage);
    }

    next();
}

module.exports = {
    logMiddleware
};
