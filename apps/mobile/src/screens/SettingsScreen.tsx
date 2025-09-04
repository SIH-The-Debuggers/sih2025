import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import StorageService, { EmergencyContact } from '../services/storage';

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = () => {
  const [locationTracking, setLocationTracking] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const trackingEnabled = await StorageService.isLocationTrackingEnabled();
      const contacts = await StorageService.getEmergencyContacts();
      
      setLocationTracking(trackingEnabled);
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    try {
      await StorageService.setLocationTrackingEnabled(value);
      setLocationTracking(value);
    } catch (error) {
      console.error('Error updating location setting:', error);
      Alert.alert('Error', 'Failed to update location tracking setting');
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        name: newContact.name.trim(),
        phone: newContact.phone.trim(),
        relationship: newContact.relationship.trim() || 'Emergency Contact',
      };

      await StorageService.addEmergencyContact(contact);
      setEmergencyContacts([...emergencyContacts, contact]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddContact(false);
      Alert.alert('Success', 'Emergency contact added successfully');
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add emergency contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeEmergencyContact(contactId);
              setEmergencyContacts(
                emergencyContacts.filter((contact) => contact.id !== contactId)
              );
              Alert.alert('Success', 'Emergency contact removed');
            } catch (error) {
              console.error('Error removing contact:', error);
              Alert.alert('Error', 'Failed to remove emergency contact');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* Location Settings */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Location Settings
          </Text>
          
          <View className="bg-white p-4 rounded-lg border border-gray-200">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-medium text-gray-800">
                  Location Tracking
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Allow the app to track your location for safety features
                </Text>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={handleLocationToggle}
                trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
                thumbColor={locationTracking ? '#ffffff' : '#f9fafb'}
              />
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Emergency Contacts
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddContact(true)}
              className="bg-primary-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Add</Text>
            </TouchableOpacity>
          </View>

          {emergencyContacts.length === 0 ? (
            <View className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <Text className="text-center text-gray-600">
                No emergency contacts added yet
              </Text>
              <Text className="text-center text-sm text-gray-500 mt-1">
                Add contacts to notify in case of emergency
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {emergencyContacts.map((contact) => (
                <View
                  key={contact.id}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-800">
                        {contact.name}
                      </Text>
                      <Text className="text-gray-600">{contact.phone}</Text>
                      <Text className="text-sm text-gray-500">
                        {contact.relationship}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveContact(contact.id)}
                      className="bg-red-500 px-3 py-1 rounded"
                    >
                      <Text className="text-white text-sm">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* About Section */}
        <View className="bg-gray-50 p-4 rounded-lg">
          <Text className="font-semibold text-gray-800 mb-2">
            About Tourist Safety
          </Text>
          <Text className="text-gray-600 text-sm leading-5">
            Tourist Safety is part of the Smart Tourist Safety Monitoring system. 
            Your safety is our priority. For support or emergencies, please contact 
            local authorities or use the panic button feature.
          </Text>
          <Text className="text-gray-500 text-xs mt-2">
            Version 1.0.0
          </Text>
        </View>
      </View>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddContact}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-semibold">Add Emergency Contact</Text>
              <TouchableOpacity
                onPress={() => setShowAddContact(false)}
                className="p-2"
              >
                <Text className="text-primary-500">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 mb-2 font-medium">Name *</Text>
                <TextInput
                  value={newContact.name}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, name: text })
                  }
                  placeholder="Full name"
                  className="border border-gray-300 rounded-lg p-4"
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2 font-medium">Phone *</Text>
                <TextInput
                  value={newContact.phone}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, phone: text })
                  }
                  placeholder="+91 9876543210"
                  keyboardType="phone-pad"
                  className="border border-gray-300 rounded-lg p-4"
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2 font-medium">
                  Relationship
                </Text>
                <TextInput
                  value={newContact.relationship}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, relationship: text })
                  }
                  placeholder="e.g., Family, Friend, Colleague"
                  className="border border-gray-300 rounded-lg p-4"
                />
              </View>

              <TouchableOpacity
                onPress={handleAddContact}
                className="bg-primary-500 p-4 rounded-lg mt-6"
              >
                <Text className="text-white text-center font-semibold">
                  Add Contact
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default SettingsScreen;
