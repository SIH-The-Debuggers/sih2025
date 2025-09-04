import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useLocation } from '../hooks/useLocation';
import ApiService from '../services/api';

type PanicScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Panic'
>;

interface Props {
  navigation: PanicScreenNavigationProp;
}

const PanicScreen: React.FC<Props> = ({ navigation }) => {
  const [isAlertSent, setIsAlertSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { getCurrentLocation, hasPermission, requestPermission } = useLocation();

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
        userId: 'current-user-id', // This should come from auth context
      };

      // Send panic alert
      const response = await ApiService.sendPanicAlert(payload);

      if (response.success) {
        setIsAlertSent(true);
        Alert.alert(
          'Alert Sent Successfully',
          'Emergency services have been notified. Help is on the way.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
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
          {
            text: 'Retry',
            onPress: handlePanicPress,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleCallEmergency = () => {
    Alert.alert(
      'Call Emergency Services',
      'This will call local emergency services directly.',
      [
        {
          text: 'Call Now',
          onPress: () => {
            // In a real app, you would use Linking.openURL('tel:emergency-number')
            Alert.alert('Calling Emergency Services...', 'Feature not available in demo');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center items-center">
        {/* Emergency Info */}
        <View className="mb-8 p-4 bg-red-50 rounded-lg">
          <Text className="text-center text-red-800 text-lg font-semibold mb-2">
            Emergency Assistance
          </Text>
          <Text className="text-center text-red-600 text-sm">
            Press the SOS button to alert emergency services and share your location
          </Text>
        </View>

        {/* SOS Button */}
        <TouchableOpacity
          onPress={handlePanicPress}
          disabled={isSending || isAlertSent}
          className={`w-48 h-48 rounded-full justify-center items-center mb-8 ${
            isSending || isAlertSent
              ? 'bg-gray-400'
              : 'bg-red-500 active:bg-red-600'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {isSending ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <>
              <Text className="text-white text-4xl font-bold mb-2">SOS</Text>
              <Text className="text-white text-sm text-center px-4">
                {isAlertSent ? 'Alert Sent!' : 'Emergency\nAlert'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Status Message */}
        {isAlertSent && (
          <View className="mb-6 p-4 bg-green-50 rounded-lg">
            <Text className="text-center text-green-800 font-semibold">
              ✓ Emergency alert sent successfully
            </Text>
            <Text className="text-center text-green-600 text-sm mt-1">
              Help is on the way
            </Text>
          </View>
        )}

        {/* Alternative Actions */}
        <View className="w-full max-w-xs">
          <TouchableOpacity
            onPress={handleCallEmergency}
            className="bg-blue-500 p-4 rounded-lg mb-3 active:bg-blue-600"
          >
            <Text className="text-white text-center font-semibold">
              Call Emergency Services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-gray-500 p-4 rounded-lg active:bg-gray-600"
          >
            <Text className="text-white text-center font-semibold">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Instructions */}
      <View className="bg-gray-50 p-4 rounded-lg">
        <Text className="text-gray-700 text-sm text-center">
          In case of extreme emergency, also consider calling local emergency numbers directly
        </Text>
      </View>
    </View>
  );
};

export default PanicScreen;
