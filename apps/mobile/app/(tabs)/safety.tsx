// Safety Screen for Expo Router
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
} from 'react-native';

export default function SafetyScreen() {
  const [emergencyContacts] = useState([
    { id: '1', name: 'Emergency Services', number: '911' },
    { id: '2', name: 'Police', number: '100' },
    { id: '3', name: 'Fire Department', number: '101' },
    { id: '4', name: 'Ambulance', number: '102' },
    { id: '5', name: 'Tourist Helpline', number: '1363' },
  ]);

  const [safetyTips] = useState([
    'Always inform someone about your travel plans',
    'Keep important documents in a secure place',
    'Carry emergency contact numbers',
    'Stay aware of your surroundings',
    'Avoid displaying expensive items',
    'Use official transportation services',
    'Keep emergency cash hidden',
    'Research local customs and laws',
  ]);

  const handleCallEmergency = (number: string, name: string) => {
    Alert.alert(`Call ${name}`, `Are you sure you want to call ${number}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => {
          Linking.openURL(`tel:${number}`);
        },
      },
    ]);
  };

  const renderEmergencyContact = ({
    item,
  }: {
    item: { id: string; name: string; number: string };
  }) => (
    <TouchableOpacity
      onPress={() => handleCallEmergency(item.number, item.name)}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View>
        <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
          {item.name}
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 14 }}>{item.number}</Text>
      </View>
      <View
        style={{
          backgroundColor: '#ef4444',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Call</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSafetyTip = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <View
      style={{
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 14, lineHeight: 20 }}>
        {index + 1}. {item}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <View style={{ padding: 16 }}>
            {/* Emergency Contacts Section */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 16,
                color: '#111827',
              }}
            >
              Emergency Contacts
            </Text>

            {emergencyContacts.map((contact) => (
              <View key={contact.id}>
                {renderEmergencyContact({ item: contact })}
              </View>
            ))}

            {/* Safety Tips Section */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginTop: 24,
                marginBottom: 16,
                color: '#111827',
              }}
            >
              Safety Tips
            </Text>

            {safetyTips.map((tip, index) => (
              <View key={index}>{renderSafetyTip({ item: tip, index })}</View>
            ))}

            {/* Additional Safety Features */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginTop: 24,
                marginBottom: 16,
                color: '#111827',
              }}
            >
              Safety Features
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                padding: 16,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Share Live Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#10b981',
                padding: 16,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                View Safe Zones
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#f59e0b',
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
                }}
              >
                Report Incident
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
