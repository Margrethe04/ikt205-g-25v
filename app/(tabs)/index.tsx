import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function HomeScreen() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Feil", "E-post og passord kan ikke være tomme.");
      return false;
    }
    return true;
  };

  const signUp = async () => {
  try {

    const e = email.trim();
    const p = password.trim();

    if (!e || !p) {
      alert("Tomme felt!");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: e,
      password: p,
    });

    if (error) {
      alert("SIGNUP FEIL: " + error.message);
      return;
    }

  } catch (err: any) {
    alert("CRASH: " + (err?.message ?? String(err)));
  }
};


  const signIn = async () => {
  try {
    

    const e = email.trim();
    const p = password.trim();

    if (!e || !p) {
      alert("E-post/passord kan ikke være tomt");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: e,
      password: p,
    });

    if (error) {
      alert("FEIL: " + error.message);
      return;
    }

    
  } catch (err: any) {
    alert("CRASH: " + (err?.message ?? String(err)));
  }
};


  const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Feil", error.message);
      return;
    }
    Alert.alert("OK", "Du er logget ut.");
  } catch (err: any) {
    Alert.alert("CRASH", err?.message ?? String(err));
  }
};

  if (session) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Du er innlogget</Text>
        <Pressable onPress={signOut} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
          <Text>Logg ut</Text>
        </Pressable>
      </View>
    );
  }

 return (
  <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12, pointerEvents: "box-none" as any }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Cloud Notes</Text>

      <TextInput
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <TextInput
        placeholder="Passord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <Pressable
        onPress={signIn}
        style={{ padding: 12, borderRadius: 10, borderWidth: 1, cursor: "pointer" as any, borderColor: "#af4ca8" }}
      >
        <Text>Logg inn</Text>
      </Pressable>


      <Pressable 
        onPress={signUp} 
        style={{ padding: 12, borderRadius: 10, borderWidth: 1, cursor: "pointer" as any, borderColor: "#af4ca8" }}
        >
        <Text>Opprett konto</Text>
      </Pressable>
    </View>
  );
}
