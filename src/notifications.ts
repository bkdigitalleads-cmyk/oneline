import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REMINDER_ID = 'daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Schedule (or reschedule) the daily reminder at hour:minute local time. */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'One line before bed ✏️',
      body: 'How was today? Capture it in one line — it takes 30 seconds.',
    },
    trigger:
      Platform.OS === 'ios'
        ? {
            // DAILY triggers are Android-only; iOS uses a repeating calendar trigger.
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            repeats: true,
            hour,
            minute,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
  });
  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
}
