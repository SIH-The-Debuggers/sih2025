import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from "react-native";

export default function QRScreen() {
  const [wallet, setWallet] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!wallet) {
      Alert.alert("Error", "Enter wallet address");
      return;
    }
    setLoading(true);
    setQr(null);
    try {
      const res = await fetch(`http://localhost:3001/api/qr/${wallet.toLowerCase()}`);
      const data = await res.json();
      if (data.png) {
        setQr(data.png);
      } else {
        Alert.alert("Error", data.error || "QR not found");
      }
    } catch (e) {
      Alert.alert("Error", "Network error");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Your QR</Text>
      <TextInput style={styles.input} placeholder="Wallet Address" value={wallet} onChangeText={setWallet} autoCapitalize="none" />
      <TouchableOpacity style={styles.button} onPress={handleGenerate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Generate QR"}</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 16 }} />}
      {qr && (
        <Image source={{ uri: qr }} style={styles.qr} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  qr: { width: 240, height: 240, marginTop: 24 },
});
