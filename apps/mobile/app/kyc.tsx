import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

export default function KYCFormScreen() {
  const [form, setForm] = useState({
    walletAddress: "",
    fullName: "",
    destination: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.walletAddress || !form.fullName || !form.destination || !form.startDate || !form.endDate) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: form.walletAddress,
          fullName: form.fullName,
          destination: form.destination,
          startDate: form.startDate,
          endDate: form.endDate,
          minimal: {},
        }),
      });
      const data = await res.json();
      if (data.ok) {
        Alert.alert("Success", "KYC submitted and anchored!");
      } else {
        Alert.alert("Error", data.error || "Submission failed");
      }
    } catch (e) {
      Alert.alert("Error", "Network error");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tourist KYC Form</Text>
      <TextInput style={styles.input} placeholder="Wallet Address" value={form.walletAddress} onChangeText={v => handleChange("walletAddress", v)} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Full Name" value={form.fullName} onChangeText={v => handleChange("fullName", v)} />
      <TextInput style={styles.input} placeholder="Destination" value={form.destination} onChangeText={v => handleChange("destination", v)} />
      <TextInput style={styles.input} placeholder="Start Date (YYYY-MM-DD)" value={form.startDate} onChangeText={v => handleChange("startDate", v)} />
      <TextInput style={styles.input} placeholder="End Date (YYYY-MM-DD)" value={form.endDate} onChangeText={v => handleChange("endDate", v)} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Submitting..." : "Submit KYC"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
