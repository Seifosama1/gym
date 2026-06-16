import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur'; // Make sure to install: npx expo install expo-blur
import * as Notifications from 'expo-notifications';

// Handles foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HydrationTracker() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [intervalHours, setIntervalHours] = useState(2);

  // Ask for permission and schedule/cancel notifications when toggled
  const toggleSwitch = async () => {
    if (!isEnabled) {
      // 1. Request OS Permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable notifications in your phone settings to receive automated reminders.');
        return;
      }

      // 2. Schedule the OS-level background timer
      await Notifications.cancelAllScheduledNotificationsAsync(); // Clear duplicates
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Hydration Reminder",
          body: "Time to drink up and log your water intake!",
        },
        trigger: {
          seconds: intervalHours * 3600, // Converts hours to seconds
          repeats: true,
        },
      });
      
      setIsEnabled(true);
      Alert.alert('Reminders Set!', `You will be automatically reminded every ${intervalHours} hours.`);
    } else {
      // 3. Cancel everything if turned off
      await Notifications.cancelAllScheduledNotificationsAsync();
      setIsEnabled(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark Translucent Glassmorphism Card */}
      <BlurView intensity={25} tint="dark" style={styles.glassCard}>
        <Text style={styles.cardTitle}>Water Tracker</Text>
        <Text style={styles.subtitle}>Automated Hydration Reminders</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Enable Reminders</Text>
          <Switch
            trackColor={{ false: '#2c2c2e', true: '#0a84ff' }}
            thumbColor={isEnabled ? '#ffffff' : '#8e8e93'}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>

        {/* Interval Selector */}
        <View style={styles.intervalContainer}>
          <Text style={styles.label}>Remind me every:</Text>
          <View style={styles.buttonGroup}>
            {[1, 2, 3, 4].map((hours) => (
              <TouchableOpacity
                key={hours}
                disabled={isEnabled} // Lock it if active to protect the running trigger
                style={[
                  styles.timeButton,
                  intervalHours === hours && styles.activeButton,
                  isEnabled && { opacity: 0.5 }
                ]}
                onPress={() => setIntervalHours(hours)}
              >
                <Text style={styles.buttonText}>{hours}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Add this right before the closing </BlurView> tag */}
<TouchableOpacity 
  style={[styles.timeButton, { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }]} 
  onPress={trigger5SecondTest}
>
  <Text style={styles.buttonText}>🧪 Test Notification (5s)</Text>
</TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Deep dark backdrop
  },
  glassCard: {
    width: '90%',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle glass highlight border
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Translucent fill
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#e5e5ea',
  },
  intervalContainer: {
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeButton: {
    backgroundColor: '#0a84ff',
    borderColor: '#30a2ff',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

// Add this helper function inside your HydrationTracker component
const trigger5SecondTest = async () => {
  // Check permission first
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Hold up', 'Please enable notification permissions first!');
    return;
  }

  // Schedule an instant 5-second trigger
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Test Hydration Alert!",
      body: "This is what your automatic reminder looks like!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5, // Fires in 5 seconds
    },
  });

  Alert.alert("Test Triggered", "Lock your screen or exit the app now! Waiting 5 seconds...");
};

