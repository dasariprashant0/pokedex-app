import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Get the Expo push token
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        // Set up Android notification channel
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#DC0A2D',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token: Permission not granted');
            return null;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.warn('No projectId found for push notifications');
                return null;
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('Push token:', token);
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    } else {
        console.log('Push notifications require a physical device');
    }

    return token;
}

// Schedule a local notification
export async function scheduleLocalNotification(title, body, data = {}, triggerSeconds = 1) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
            sound: true,
        },
        trigger: { seconds: triggerSeconds },
    });
}

// Send notification when a new Pokemon is added to team
export async function notifyPokemonAddedToTeam(pokemonName) {
    await scheduleLocalNotification(
        '🎉 Team Updated!',
        `${pokemonName} has been added to your team!`,
        { type: 'team_update' }
    );
}

// Send notification for daily Pokemon reminder
export async function scheduleDailyPokemonReminder() {
    // Cancel any existing daily reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for next day at 10 AM
    const trigger = new Date();
    trigger.setHours(10, 0, 0, 0);
    if (trigger <= new Date()) {
        trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🔴 Catch \'em all!',
            body: 'Your Pokemon are waiting for you! Open the Pokedex to explore.',
            data: { type: 'daily_reminder' },
        },
        trigger: {
            hour: 10,
            minute: 0,
            repeats: true,
        },
    });
}

// Add notification listeners
export function addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}
