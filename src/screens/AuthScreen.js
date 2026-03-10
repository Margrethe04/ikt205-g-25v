import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Manglende felt", "E-post og passord kan ikke være tomme.");
      return false;
    }
    return true;
  };

  const signUp = async () => {
    if (!validate()) return;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert("Feil", error.message);

    Alert.alert("Suksess", "Konto opprettet! Sjekk e-posten din for bekreftelse.");
  };

  const signIn = async () => {
    if (!validate()) return;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return Alert.alert("Feil", error.message);

    Alert.alert("Suksess", "Du er logget inn.");
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Cloud Notes</Text>

      <TextInput
        placeholder="E-post"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <TextInput
        placeholder="Passord"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <Pressable onPress={signIn} style={{ backgroundColor: "#333", padding: 12, borderRadius: 10 }}>
        <Text style={{ color: "white", textAlign: "center" }}>Logg inn</Text>
      </Pressable>

      <Pressable onPress={signUp} style={{ backgroundColor: "#666", padding: 12, borderRadius: 10 }}>
        <Text style={{ color: "white", textAlign: "center" }}>Opprett konto</Text>
      </Pressable>
    </View>
  );
}
