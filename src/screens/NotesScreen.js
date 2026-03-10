import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function NotesScreen({ session }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, user_id, updated_at, created_at")
      .order("updated_at", { ascending: false });

    if (error) return Alert.alert("Feil", error.message);
    setNotes(data ?? []);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const validateNote = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Manglende felt", "Tittel og tekst kan ikke være tomme.");
      return false;
    }
    return true;
  };

  const createNote = async () => {
    if (!validateNote()) return;

    const user_id = session.user.id;
    const { error } = await supabase.from("notes").insert([
      { title: title.trim(), content: content.trim(), user_id, updated_at: new Date().toISOString() },
    ]);

    if (error) return Alert.alert("Feil", error.message);

    setTitle("");
    setContent("");
    Alert.alert("Suksess", "Notat lagret.");
    loadNotes();
  };

  const updateNote = async (note) => {
    // super-enkel update: spør om bekreftelse og oppdater til det som står i inputfeltene
    if (!validateNote()) return;

    const { error } = await supabase
      .from("notes")
      .update({ title: title.trim(), content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", note.id);

    if (error) return Alert.alert("Feil", error.message);

    Alert.alert("Suksess", "Notat oppdatert.");
    loadNotes();
  };

  const deleteNote = async (note) => {
    Alert.alert("Bekreft", "Vil du slette notatet?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("notes").delete().eq("id", note.id);
          if (error) return Alert.alert("Feil", error.message);

          Alert.alert("Suksess", "Notat slettet.");
          loadNotes();
        },
      },
    ]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 10, paddingTop: 50 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Jobb Notater</Text>
        <Pressable onPress={logout} style={{ padding: 10, borderRadius: 10, borderWidth: 1 }}>
          <Text>Logg ut</Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Tittel"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />
      <TextInput
        placeholder="Tekst"
        value={content}
        onChangeText={setContent}
        multiline
        style={{ borderWidth: 1, padding: 12, borderRadius: 10, minHeight: 80 }}
      />

      <Pressable onPress={createNote} style={{ backgroundColor: "#333", padding: 12, borderRadius: 10 }}>
        <Text style={{ color: "white", textAlign: "center" }}>Lagre nytt notat</Text>
      </Pressable>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 10, paddingTop: 10 }}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 }}>
            <Text style={{ fontWeight: "700" }}>{item.title}</Text>
            <Text>{item.content}</Text>
            <Text style={{ opacity: 0.6, fontSize: 12 }}>
              Sist endret: {new Date(item.updated_at).toLocaleString()}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => updateNote(item)}
                style={{ padding: 10, borderRadius: 10, borderWidth: 1 }}
              >
                <Text>Oppdater (bruk input)</Text>
              </Pressable>

              <Pressable
                onPress={() => deleteNote(item)}
                style={{ padding: 10, borderRadius: 10, borderWidth: 1 }}
              >
                <Text>Slett</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
