import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function ensureLocalNotificationPermissions() {
  const perms = await Notifications.getPermissionsAsync();
  if (!perms.granted) {
    const req = await Notifications.requestPermissionsAsync();
    if (!req.granted) throw new Error("Du må tillate varsler for notifikasjoner.");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function localNotifyNewNote(noteTitle: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Nytt notat: ${noteTitle}`,
      body: "Et nytt notat ble lagret.",
    },
    trigger: null,
  });
}