import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useLocation } from '../hooks/useLocation';
import ApiService, { SafetyScore } from '../services/api';

type SafetyScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Safety'
>;

interface Props {
  navigation: SafetyScreenNavigationProp;
}

const SafetyScreen: React.FC<Props> = () => {
  const [safetyData, setSafetyData] = useState<SafetyScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { location, getCurrentLocation } = useLocation();

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      const currentLocation = location || (await getCurrentLocation());

      if (currentLocation) {
        const data = await ApiService.getSafetyScore(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setSafetyData(data);
      } else {
        // Use default coordinates if location is not available
        const data = await ApiService.getSafetyScore(28.7041, 77.1025); // Delhi coordinates
        setSafetyData(data);
      }
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSafetyData();
    setRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Moderate';
    return 'Caution';
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">
          Loading safety information...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-6">
        {/* Overall Safety Score */}
        {safetyData && (
          <>
            <View
              className={`p-6 rounded-lg mb-6 border ${getScoreBackground(safetyData.score)}`}
            >
              <Text className="text-center text-lg font-semibold text-gray-800 mb-2">
                Current Area Safety Score
              </Text>
              <Text
                className={`text-center text-4xl font-bold ${getScoreColor(safetyData.score)}`}
              >
                {safetyData.score}
              </Text>
              <Text
                className={`text-center text-lg font-medium ${getScoreColor(safetyData.score)}`}
              >
                {getScoreLabel(safetyData.score)}
              </Text>
              <Text className="text-center text-sm text-gray-600 mt-2">
                Last updated:{' '}
                {new Date(safetyData.lastUpdated).toLocaleTimeString()}
              </Text>
            </View>

            {/* Safety Factors */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Safety Factors
              </Text>

              <View className="space-y-4">
                <View className="bg-white p-4 rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-medium text-gray-800">
                      Crowd Density
                    </Text>
                    <Text className="text-gray-600">
                      {safetyData.factors.crowdDensity}%
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-2 rounded-full">
                    <View
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${safetyData.factors.crowdDensity}%` }}
                    />
                  </View>
                </View>

                <View className="bg-white p-4 rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-medium text-gray-800">
                      Weather Conditions
                    </Text>
                    <Text className="text-gray-600">
                      {safetyData.factors.weatherConditions}%
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-2 rounded-full">
                    <View
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${safetyData.factors.weatherConditions}%`,
                      }}
                    />
                  </View>
                </View>

                <View className="bg-white p-4 rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-medium text-gray-800">
                      Security Level
                    </Text>
                    <Text className="text-gray-600">
                      {100 - safetyData.factors.criminalActivity}%
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-2 rounded-full">
                    <View
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${100 - safetyData.factors.criminalActivity}%`,
                      }}
                    />
                  </View>
                </View>

                <View className="bg-white p-4 rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-medium text-gray-800">
                      Emergency Services
                    </Text>
                    <Text className="text-gray-600">
                      {safetyData.factors.emergencyServices}%
                    </Text>
                  </View>
                  <View className="bg-gray-200 h-2 rounded-full">
                    <View
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${safetyData.factors.emergencyServices}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Recommendations */}
            <View className="bg-blue-50 p-4 rounded-lg">
              <Text className="font-semibold text-blue-800 mb-2">
                Safety Recommendations
              </Text>
              <View className="space-y-1">
                {safetyData.score >= 80 ? (
                  <>
                    <Text className="text-blue-700 text-sm">
                      • Area is generally safe for tourists
                    </Text>
                    <Text className="text-blue-700 text-sm">
                      • Normal precautions recommended
                    </Text>
                    <Text className="text-blue-700 text-sm">
                      • Enjoy your visit!
                    </Text>
                  </>
                ) : safetyData.score >= 60 ? (
                  <>
                    <Text className="text-yellow-700 text-sm">
                      • Exercise normal caution
                    </Text>
                    <Text className="text-yellow-700 text-sm">
                      • Stay in well-lit areas
                    </Text>
                    <Text className="text-yellow-700 text-sm">
                      • Keep emergency contacts handy
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-red-700 text-sm">
                      • Exercise increased caution
                    </Text>
                    <Text className="text-red-700 text-sm">
                      • Avoid isolated areas
                    </Text>
                    <Text className="text-red-700 text-sm">
                      • Consider traveling in groups
                    </Text>
                    <Text className="text-red-700 text-sm">
                      • Keep emergency services accessible
                    </Text>
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SafetyScreen;
