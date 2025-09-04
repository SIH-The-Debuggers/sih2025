import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useLocation } from '../../src/hooks/useLocation';
import StorageService from '../../src/services/storage';

interface UserData {
  id: string;
  email: string;
  phone: string;
  digitalTouristId: string;
}

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { location, getCurrentLocation, hasPermission, requestPermission } =
    useLocation();

  useEffect(() => {
    loadUserData();
    initializeLocation();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await StorageService.getUserData();
      setUserData(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeLocation = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
    await getCurrentLocation();
  };

  const handleLogout = async () => {
    try {
      await StorageService.clearAllData();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 24 }}>
        {/* Welcome Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: 8,
            }}
          >
            Welcome Back!
          </Text>
          {userData && (
            <Text style={{ color: '#6b7280' }}>
              Digital Tourist ID: {userData.digitalTouristId}
            </Text>
          )}
        </View>

        {/* QR Code Section */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 16,
            }}
          >
            Your Digital Tourist ID
          </Text>

          {userData ? (
            <QRCode
              value={JSON.stringify({
                id: userData.digitalTouristId,
                name: userData.email.split('@')[0],
                type: 'tourist',
                timestamp: Date.now(),
              })}
              size={200}
              backgroundColor="white"
              color="black"
            />
          ) : (
            <View
              style={{
                width: 208,
                height: 208,
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#6b7280' }}>QR Code Unavailable</Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Show this QR code to authorities or service providers for
            identification
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/panic')}
              style={{
                backgroundColor: '#ef4444',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                🚨 Emergency Alert
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/safety')}
              style={{
                backgroundColor: '#10b981',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                🛡️ Check Safety Score
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/settings')}
              style={{
                backgroundColor: '#3b82f6',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                ⚙️ Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Status */}
        <View
          style={{
            backgroundColor: '#f9fafb',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <Text
            style={{ fontWeight: '600', color: '#1f2937', marginBottom: 8 }}
          >
            Location Status
          </Text>
          {location ? (
            <Text style={{ color: '#059669', fontSize: 14 }}>
              ✓ Location tracking active
            </Text>
          ) : (
            <Text style={{ color: '#d97706', fontSize: 14 }}>
              ⚠️ Location not available
            </Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#6b7280',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
