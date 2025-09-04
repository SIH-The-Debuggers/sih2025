import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList } from '../../App';
import { useLocation } from '../hooks/useLocation';
import StorageService from '../services/storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface UserData {
  id: string;
  email: string;
  phone: string;
  digitalTouristId: string;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
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
      // In a real app, you would navigate to login or reset the navigation stack
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </Text>
          {userData && (
            <Text className="text-gray-600">
              Digital Tourist ID: {userData.digitalTouristId}
            </Text>
          )}
        </View>

        {/* QR Code Section */}
        <View className="bg-white rounded-lg p-6 mb-6 items-center shadow-sm border border-gray-200">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
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
            <View className="w-52 h-52 bg-gray-200 rounded-lg justify-center items-center">
              <Text className="text-gray-500">QR Code Unavailable</Text>
            </View>
          )}

          <Text className="text-sm text-gray-600 text-center mt-4">
            Show this QR code to authorities or service providers for
            identification
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Panic')}
              className="bg-red-500 p-4 rounded-lg active:bg-red-600"
            >
              <Text className="text-white text-center font-semibold text-base">
                🚨 Emergency Alert
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Safety')}
              className="bg-green-500 p-4 rounded-lg active:bg-green-600"
            >
              <Text className="text-white text-center font-semibold text-base">
                🛡️ Check Safety Score
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              className="bg-blue-500 p-4 rounded-lg active:bg-blue-600"
            >
              <Text className="text-white text-center font-semibold text-base">
                ⚙️ Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Status */}
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="font-semibold text-gray-800 mb-2">
            Location Status
          </Text>
          {location ? (
            <Text className="text-green-600 text-sm">
              ✓ Location tracking active
            </Text>
          ) : (
            <Text className="text-yellow-600 text-sm">
              ⚠️ Location not available
            </Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-gray-500 p-4 rounded-lg active:bg-gray-600"
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
