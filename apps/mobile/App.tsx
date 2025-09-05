import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import KYCFormScreen from "./app/kyc";
import QRScreen from "./app/qr";
import QRScanScreen from "./app/qrscan";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
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

export default function AppNavigator() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Home">
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="KYCForm" component={KYCFormScreen} options={{ title: "KYC Form" }} />
				<Stack.Screen name="QRScreen" component={QRScreen} options={{ title: "Your QR" }} />
				<Stack.Screen name="QRScanScreen" component={QRScanScreen} options={{ title: "Scan & Verify" }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
	title: { fontSize: 32, fontWeight: "bold", marginBottom: 32 },
	button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, width: "80%", alignItems: "center", marginBottom: 16 },
	buttonText: { color: "#fff", fontWeight: "bold" },
});
