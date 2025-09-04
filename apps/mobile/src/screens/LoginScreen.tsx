import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import ApiService from '../services/api';
import StorageService from '../services/storage';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Mock OTP sending - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Please check your email for the verification code');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !otp.trim()) {
      Alert.alert('Error', 'Please enter both email and OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.login(email, otp);
      
      if (response.success && response.token && response.user) {
        await StorageService.saveAuthToken(response.token);
        await StorageService.saveUserData(response.user);
        
        // Navigate to home screen - in a real app, you might use a state management solution
        // or navigation reset to prevent going back to login
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => {
              // Force app to re-check auth status
              // In a real app, you might use a context or state management
            },
          },
        ]);
      } else {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center p-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-primary-600 mb-2">
            Tourist Safety
          </Text>
          <Text className="text-gray-600 text-center">
            Secure login with email verification
          </Text>
        </View>

        {/* Login Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!otpSent}
              className={`border rounded-lg p-4 text-base ${
                otpSent ? 'bg-gray-100 border-gray-300' : 'border-gray-300'
              }`}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isLoading}
              className={`p-4 rounded-lg ${
                isLoading ? 'bg-gray-400' : 'bg-primary-500 active:bg-primary-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  Send OTP
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <View>
                <Text className="text-gray-700 mb-2 font-medium">
                  Verification Code
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="border border-gray-300 rounded-lg p-4 text-base"
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`p-4 rounded-lg ${
                  isLoading ? 'bg-gray-400' : 'bg-primary-500 active:bg-primary-600'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    Verify & Login
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setOtpSent(false)}
                className="p-2"
              >
                <Text className="text-primary-500 text-center">
                  Change Email Address
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Demo Info */}
        <View className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <Text className="text-yellow-800 text-sm font-medium mb-1">
            Demo Mode
          </Text>
          <Text className="text-yellow-700 text-sm">
            Use any email and OTP "123456" to login
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
