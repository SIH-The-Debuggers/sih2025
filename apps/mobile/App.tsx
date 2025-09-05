import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import KYCFormScreen from "./app/kyc";
import QRScreen from "./app/qr";
import QRScanScreen from "./app/qrscan";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { StackNavigationProp } from "@react-navigation/stack";

const Stack = createStackNavigator();

type RootStackParamList = {
  Home: undefined;
  KYCForm: undefined;
  QRScreen: undefined;
  QRScanScreen: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
type HomeScreenProps = { navigation: HomeScreenNavigationProp };

function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeJourney</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("KYCForm")}>
        <Text style={styles.buttonText}>Submit KYC</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("QRScreen")}>
        <Text style={styles.buttonText}>Generate QR</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("QRScanScreen")}>
        <Text style={styles.buttonText}>Scan & Verify QR</Text>
      </TouchableOpacity>
    </View>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="KYCForm" component={KYCFormScreen} />
        <Stack.Screen name="QRScreen" component={QRScreen} />
        <Stack.Screen name="QRScanScreen" component={QRScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 32 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, width: "80%", alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
