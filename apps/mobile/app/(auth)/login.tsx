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
import { router } from 'expo-router';
import ApiService from '../../src/services/api';
import StorageService from '../../src/services/storage';

export default function LoginScreen() {
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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOtpSent(true);
      Alert.alert(
        'OTP Sent',
        'Please check your email for the verification code'
      );
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

        // Navigate to tabs
        router.replace('/(tabs)');
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
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: 8,
            }}
          >
            Tourist Safety
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>
            Secure login with email verification
          </Text>
        </View>

        {/* Login Form */}
        <View style={{ gap: 16 }}>
          <View>
            <Text
              style={{ color: '#374151', marginBottom: 8, fontWeight: '500' }}
            >
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!otpSent}
              style={{
                borderWidth: 1,
                borderColor: otpSent ? '#d1d5db' : '#d1d5db',
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                backgroundColor: otpSent ? '#f3f4f6' : 'white',
              }}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ color: 'white', fontWeight: '600', fontSize: 16 }}
                >
                  Send OTP
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <View>
                <Text
                  style={{
                    color: '#374151',
                    marginBottom: 8,
                    fontWeight: '500',
                  }}
                >
                  Verification Code
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 16,
                    fontSize: 16,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{ color: 'white', fontWeight: '600', fontSize: 16 }}
                  >
                    Verify & Login
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setOtpSent(false)}
                style={{ padding: 8 }}
              >
                <Text style={{ color: '#3b82f6', textAlign: 'center' }}>
                  Change Email Address
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Demo Info */}
        <View
          style={{
            marginTop: 32,
            padding: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: '#92400e',
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 4,
            }}
          >
            Demo Mode
          </Text>
          <Text style={{ color: '#b45309', fontSize: 14 }}>
            Use any email and OTP "123456" to login
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
