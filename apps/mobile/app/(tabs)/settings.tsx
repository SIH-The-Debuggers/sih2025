// Settings Screen for Expo Router
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          // Clear any stored auth tokens here
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const SettingItem = ({
    title,
    subtitle,
    onPress,
    rightComponent,
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500' }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent && (
        <View style={{ marginLeft: 16 }}>{rightComponent}</View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ padding: 16 }}>
        {/* Profile Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16,
              color: '#111827',
            }}
          >
            Profile
          </Text>

          <SettingItem
            title="Personal Information"
            subtitle="Update your profile details"
            onPress={() => {
              // Navigate to profile edit screen
            }}
            rightComponent={<Text style={{ color: '#6b7280' }}>›</Text>}
          />

          <SettingItem
            title="Emergency Contacts"
            subtitle="Manage your emergency contacts"
            onPress={() => {
              // Navigate to emergency contacts screen
            }}
            rightComponent={<Text style={{ color: '#6b7280' }}>›</Text>}
          />
        </View>

        {/* Privacy & Security */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16,
              color: '#111827',
            }}
          >
            Privacy & Security
          </Text>

          <SettingItem
            title="Notifications"
            subtitle="Enable push notifications"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            }
          />

          <SettingItem
            title="Location Sharing"
            subtitle="Share location with emergency contacts"
            rightComponent={
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
              />
            }
          />

          <SettingItem
            title="Emergency Alerts"
            subtitle="Receive emergency alerts in your area"
            rightComponent={
              <Switch
                value={emergencyAlerts}
                onValueChange={setEmergencyAlerts}
              />
            }
          />
        </View>

        {/* App Settings */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16,
              color: '#111827',
            }}
          >
            App Settings
          </Text>

          <SettingItem
            title="Language"
            subtitle="English"
            onPress={() => {
              // Navigate to language selection
            }}
            rightComponent={<Text style={{ color: '#6b7280' }}>›</Text>}
          />

          <SettingItem
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => {
              // Navigate to help screen
            }}
            rightComponent={<Text style={{ color: '#6b7280' }}>›</Text>}
          />

          <SettingItem
            title="About"
            subtitle="App version and information"
            onPress={() => {
              // Navigate to about screen
            }}
            rightComponent={<Text style={{ color: '#6b7280' }}>›</Text>}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: 16,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
