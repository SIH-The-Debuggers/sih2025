// Panic Screen for Expo Router
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { useLocation } from '../../src/hooks/useLocation';
import ApiService from '../../src/services/api';

export default function PanicScreen() {
  const [isAlertSent, setIsAlertSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { getCurrentLocation, hasPermission, requestPermission } =
    useLocation();

  const handlePanicPress = async () => {
    try {
      setIsSending(true);

      // Vibrate to provide immediate feedback
      Vibration.vibrate([0, 500, 200, 500]);

      // Get current location
      let location = null;
      if (hasPermission) {
        location = await getCurrentLocation();
      } else {
        const granted = await requestPermission();
        if (granted) {
          location = await getCurrentLocation();
        }
      }

      // Prepare panic alert payload
      const payload = {
        lat: location?.latitude || 0,
        lng: location?.longitude || 0,
        ts: Date.now(),
        userId: 'current-user-id',
      };

      // Send panic alert
      const response = await ApiService.sendPanicAlert(payload);

      if (response.success) {
        setIsAlertSent(true);
        Alert.alert(
          'Alert Sent Successfully',
          'Emergency services have been notified. Help is on the way.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending panic alert:', error);
      Alert.alert(
        'Alert Failed',
        'There was an error sending your emergency alert. Please try again or call emergency services directly.',
        [
          { text: 'Retry', onPress: handlePanicPress },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 24 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Emergency Info */}
        <View
          style={{
            marginBottom: 32,
            padding: 16,
            backgroundColor: '#fef2f2',
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: '#991b1b',
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            Emergency Assistance
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: '#dc2626',
              fontSize: 14,
            }}
          >
            Press the SOS button to alert emergency services and share your
            location
          </Text>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          onPress={handlePanicPress}
          disabled={isSending || isAlertSent}
          style={{
            width: 192,
            height: 192,
            borderRadius: 96,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 32,
            backgroundColor: isSending || isAlertSent ? '#9ca3af' : '#ef4444',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {isSending ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <>
              <Text
                style={{
                  color: 'white',
                  fontSize: 32,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}
              >
                SOS
              </Text>
              <Text
                style={{
                  color: 'white',
                  fontSize: 14,
                  textAlign: 'center',
                  paddingHorizontal: 16,
                }}
              >
                {isAlertSent ? 'Alert Sent!' : 'Emergency\nAlert'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Status Message */}
        {isAlertSent && (
          <View
            style={{
              marginBottom: 24,
              padding: 16,
              backgroundColor: '#f0fdf4',
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: '#166534',
                fontWeight: '600',
              }}
            >
              ✓ Emergency alert sent successfully
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: '#16a34a',
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Help is on the way
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
