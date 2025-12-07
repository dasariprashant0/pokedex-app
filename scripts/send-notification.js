/**
 * Push Notification Sender Script
 * 
 * Usage:
 * 1. Install expo-server-sdk: npm install expo-server-sdk
 * 2. Run: node scripts/send-notification.js
 * 
 * Or use cURL (no installation needed):
 * curl -X POST https://exp.host/--/api/v2/push/send \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "to": "ExponentPushToken[YOUR_TOKEN]",
 *     "title": "Hello!",
 *     "body": "Your message here"
 *   }'
 */

// Option 1: Using cURL (easiest - no code needed)
// Just run this in terminal:
const curlExample = `
curl -X POST https://exp.host/--/api/v2/push/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "ExponentPushToken[3ySHsqEikwkCUrwDZTLWC_]",
    "title": "🔴 New Pokemon!",
    "body": "A wild Pikachu appeared!",
    "data": { "pokemonId": 25 }
  }'
`;

console.log('📱 PUSH NOTIFICATION SENDER\n');
console.log('=== Option 1: cURL Command (Easiest) ===');
console.log(curlExample);

// Option 2: Using Node.js with expo-server-sdk
console.log('\n=== Option 2: Node.js Script ===\n');

const sendPushNotification = async () => {
    // Check if expo-server-sdk is installed
    let Expo;
    try {
        Expo = require('expo-server-sdk').Expo;
    } catch (e) {
        console.log('expo-server-sdk not installed. Install with: npm install expo-server-sdk');
        console.log('Or use the cURL command above instead.\n');
        return;
    }

    const expo = new Expo();

    // Your push token(s) - in production, get these from your database
    const pushTokens = [
        'ExponentPushToken[3ySHsqEikwkCUrwDZTLWC_]', // Replace with actual tokens
    ];

    const messages = [];
    for (const pushToken of pushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not valid`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title: '🔴 Pokedex Update!',
            body: 'New Pokemon have been discovered!',
            data: { type: 'update', version: '1.1' },
        });
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log('✅ Notification sent!', ticketChunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('❌ Error sending notification:', error);
        }
    }

    return tickets;
};

// Run the sender
sendPushNotification();

// Option 3: Send to multiple users (production pattern)
console.log('\n=== Option 3: Production Pattern ===\n');
console.log(`
// In your backend (Node.js/Express example):

const express = require('express');
const { Expo } = require('expo-server-sdk');
const app = express();
const expo = new Expo();

// Store tokens (use a real database in production)
const userTokens = {};

// Endpoint to register tokens
app.post('/api/register-token', (req, res) => {
  const { userId, token } = req.body;
  userTokens[userId] = token;
  res.json({ success: true });
});

// Endpoint to send notification to specific user
app.post('/api/send-notification', async (req, res) => {
  const { userId, title, body } = req.body;
  const token = userTokens[userId];
  
  if (!token || !Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  const tickets = await expo.sendPushNotificationsAsync([{
    to: token,
    title,
    body,
    sound: 'default',
  }]);
  
  res.json({ success: true, tickets });
});

// Endpoint to send to ALL users
app.post('/api/broadcast', async (req, res) => {
  const { title, body } = req.body;
  const tokens = Object.values(userTokens);
  
  const messages = tokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({ to: token, title, body, sound: 'default' }));
  
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
  
  res.json({ success: true, sent: tokens.length });
});
`);
