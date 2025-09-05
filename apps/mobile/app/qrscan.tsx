import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// You need to install expo-barcode-scanner for QR scanning
// import { BarCodeScanner } from 'expo-barcode-scanner';

export default function QRScanScreen() {
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Placeholder for QR scan logic
  // Replace with actual BarCodeScanner implementation
  const handleFakeScan = async () => {
    // Simulate scanning a QR code with anchor/hash or wallet address
    const fakeWallet = "0x1234567890abcdef1234567890abcdef12345678";
    setScanned(true);
    // Call backend to verify
    try {
      const res = await fetch(`http://localhost:3001/api/verify?walletAddress=${fakeWallet}`);
      const data = await res.json();
      if (data.match) {
        setResult("Verified! PII exists and matches anchor.");
      } else {
        setResult("Verification failed: Anchor mismatch or not found.");
      }
    } catch (e) {
      setResult("Network error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR to Verify</Text>
      {/* Replace this with actual QR scanner */}
      <TouchableOpacity style={styles.button} onPress={handleFakeScan} disabled={scanned}>
        <Text style={styles.buttonText}>{scanned ? "Scanned" : "Simulate Scan"}</Text>
      </TouchableOpacity>
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, width: "100%", alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  result: { marginTop: 24, fontSize: 18, fontWeight: "bold" },
});
