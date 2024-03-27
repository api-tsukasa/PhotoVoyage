const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env

// Variable for storing the status of notifications, defaulting to false if not specified in .env
let notificationsEnabled = process.env.NOTIFICATIONS_ENABLED === 'true';

// Your Discord Webhook
const discordWebhookURL = process.env.DISCORD_WEBHOOK_URL;

// Function to enable or disable notifications
function setNotifications(enabled) {
    notificationsEnabled = enabled;
}

// Function to send a notification to the Discord Webhook
async function sendDiscordNotification(photoName, photoURL) {
    try {
        if (!notificationsEnabled) return;

        const message = {
            content: `New image uploaded: ${photoName}`,
            embeds: [
                {
                    title: 'New Image',
                    image: {
                        url: photoURL
                    }
                }
            ]
        };

        await axios.post(discordWebhookURL, message);
    } catch (error) {
        console.error('Error sending notification to Discord:', error);
    }
}

module.exports = {
    sendDiscordNotification,
    setNotifications
};
