import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from "./src/lib/supabase";
import AuthScreen from "./src/screens/AuthScreen";
import NotesScreen from "./src/screens/NotesScreen";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return session ? <NotesScreen session={session} /> : <AuthScreen />;
}
