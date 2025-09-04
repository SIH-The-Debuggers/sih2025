import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface UserPreferences {
  locationTrackingEnabled: boolean;
  emergencyContacts: EmergencyContact[];
  lastKnownLocation?: {
    lat: number;
    lng: number;
    timestamp: number;
  };
}

class StorageService {
  private static readonly KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    PREFERENCES: 'user_preferences',
    EMERGENCY_CONTACTS: 'emergency_contacts',
    LOCATION_TRACKING: 'location_tracking_enabled',
  };

  // Authentication
  async saveAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(StorageService.KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(StorageService.KEYS.AUTH_TOKEN);
  }

  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(StorageService.KEYS.AUTH_TOKEN);
  }

  // User Data
  async saveUserData(userData: any): Promise<void> {
    await AsyncStorage.setItem(
      StorageService.KEYS.USER_DATA,
      JSON.stringify(userData)
    );
  }

  async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(StorageService.KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  // Emergency Contacts
  async saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
    await AsyncStorage.setItem(
      StorageService.KEYS.EMERGENCY_CONTACTS,
      JSON.stringify(contacts)
    );
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const contacts = await AsyncStorage.getItem(
      StorageService.KEYS.EMERGENCY_CONTACTS
    );
    return contacts ? JSON.parse(contacts) : [];
  }

  async addEmergencyContact(contact: EmergencyContact): Promise<void> {
    const existing = await this.getEmergencyContacts();
    const updated = [...existing, contact];
    await this.saveEmergencyContacts(updated);
  }

  async removeEmergencyContact(contactId: string): Promise<void> {
    const existing = await this.getEmergencyContacts();
    const updated = existing.filter((contact) => contact.id !== contactId);
    await this.saveEmergencyContacts(updated);
  }

  // Location Tracking
  async setLocationTrackingEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(
      StorageService.KEYS.LOCATION_TRACKING,
      JSON.stringify(enabled)
    );
  }

  async isLocationTrackingEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(
      StorageService.KEYS.LOCATION_TRACKING
    );
    return enabled ? JSON.parse(enabled) : true; // Default to enabled
  }

  // User Preferences
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    await AsyncStorage.setItem(
      StorageService.KEYS.PREFERENCES,
      JSON.stringify(preferences)
    );
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    const preferences = await AsyncStorage.getItem(
      StorageService.KEYS.PREFERENCES
    );
    return preferences ? JSON.parse(preferences) : null;
  }

  // Clear all data (logout)
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      StorageService.KEYS.AUTH_TOKEN,
      StorageService.KEYS.USER_DATA,
      StorageService.KEYS.PREFERENCES,
    ]);
  }
}

export default new StorageService();
