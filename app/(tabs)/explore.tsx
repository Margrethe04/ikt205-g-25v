import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

import {
  PickedImage,
  pickFromGallery,
  requestImagePermissions,
  takePhoto,
} from "../../utils/imagePicker";
import { validateImageOrThrow } from "../../utils/imageValidation";
import { ensureLocalNotificationPermissions, localNotifyNewNote } from "../../utils/notifications";
import { uploadImageAndGetPublicUrl } from "../../utils/uploadToSupabase";

type Note = {
  id: number | string;
  title: string;
  content: string;
  user_id: string | null;
  updated_at: string;
  created_at: string;
  image_url?: string | null;
};

const BUCKET = "note-images";
const PAGE_SIZE = 5;

export default function ExploreScreen() {
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showNoteValidation, setShowNoteValidation] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [notesLoading, setNotesLoading] = useState(false);
  
  const [stagedImage, setStagedImage] = useState<PickedImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const setStatusMsg = (msg: string) => setStatus(msg);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const validate = () => !!title.trim() && !!content.trim();

  const refreshUser = async () => {
    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setUserId(null);
        setStatusMsg(error.message);
        setAuthLoading(false);
        return;
      }

      setUserId(data.user?.id ?? null);
      setAuthLoading(false);
    } catch (e: any) {
      setUserId(null);
      setStatusMsg(e?.message ?? "Kunne ikke hente bruker.");
      setAuthLoading(false);
    }
  };

  const loadNotes = async (pageToLoad = 0, append = false) => {
    setNotesLoading(true);
    try {
      const from = pageToLoad * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("notes")
        .select("id,title,content,user_id,updated_at,created_at,image_url")
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) {
        setStatusMsg(error.message);
        return;
      }

      const fetchedNotes = data ?? [];
      setNotes((prev) => (append ? [...prev, ...fetchedNotes] : fetchedNotes));
      setHasMore(fetchedNotes.length === PAGE_SIZE);
      setNotesLoading(false);
    } catch (e: any) {
      setStatusMsg(e?.message ?? "Kunne ikke hente notater.");
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    await loadNotes(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  useEffect(() => {
    let alive = true;

    const init = async () => {
      if (!alive) return;
      setPage(0);
      await refreshUser();
      await ensureLocalNotificationPermissions();
      if (!alive) return;
      await loadNotes(0, false);
};

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      if (!alive) return;

      setEditingId(null);
      setTitle("");
      setContent("");
      setStagedImage(null);
      setPage(0);

      await refreshUser();
      if (!alive) return;
      await loadNotes(0, false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isOwner = (note: Note) => !!userId && note.user_id === userId;

  const startEdit = async (note: Note) => {
    await refreshUser();
    if (!userId) return setStatusMsg("Du må være logget inn.");
    if (note.user_id !== userId) return setStatusMsg("Du kan bare redigere notater du selv har laget.");

    setEditingId(String(note.id));
    setTitle(note.title ?? "");
    setContent(note.content ?? "");
    setStagedImage(null);
    setStatusMsg("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setStagedImage(null);
    setStatusMsg("");
  };

  const onPickGallery = async () => {
    Alert.alert(
      "Tilgang til bilder",
      "Appen trenger tilgang til bilder for å kunne legge ved et bilde i notatet.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Ja",
          onPress: async () => {
            try {
              await requestImagePermissions();
              const img = await pickFromGallery();
              if (!img) return;
              await validateImageOrThrow(img);
              setStagedImage(img);
            } catch (e: any) {
              Alert.alert("Bilde", e?.message ?? "Noe gikk galt.");
            }
          },
        },
      ]
    );
  };

  const onTakePhoto = async () => {
    try {
      await requestImagePermissions();
      const img = await takePhoto();
      if (!img) return;
      await validateImageOrThrow(img);
      setStagedImage(img);
    } catch (e: any) {
      Alert.alert("Bilde", e?.message ?? "Noe gikk galt.");
    }
  };

  const createNote = async () => {
    setShowNoteValidation(true);
    if (!validate()) return;

    try {
      setUploading(true);

      const { data, error } = await supabase.auth.getUser();
      if (error) return setStatusMsg(error.message);

      const uid = data.user?.id;
      if (!uid) return setStatusMsg("Du må være logget inn.");

      let imageUrl: string | null = null;

      if (stagedImage) {
        const { publicUrl } = await uploadImageAndGetPublicUrl({
          bucket: BUCKET,
          userId: uid,
          img: stagedImage,
        });
        imageUrl = publicUrl;
      }

      const { error: insErr } = await supabase.from("notes").insert([
        {
          title: title.trim(),
          content: content.trim(),
          user_id: uid,
          updated_at: new Date().toISOString(),
          image_url: imageUrl,
        },
      ]);

      if (insErr) return setStatusMsg(insErr.message);
      
      await ensureLocalNotificationPermissions();
      await localNotifyNewNote(title.trim());

      showSuccess("Notat lagret.");
      setShowNoteValidation(false);
      cancelEdit();
      setPage(0);
      await loadNotes(0, false);
    } catch (e: any) {
      Alert.alert("Lagre", e?.message ?? "Noe gikk galt.");
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async () => {
    setShowNoteValidation(true);
    if (!isEditing || editingId === null) return;
    if (!validate()) return;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return setStatusMsg(error.message);

      const uid = data.user?.id;
      if (!uid) return setStatusMsg("Du må være logget inn.");

      const note = notes.find((n) => String(n.id) === String(editingId));
      if (!note) return setStatusMsg("Fant ikke notatet.");
      if (note.user_id !== uid) return setStatusMsg("Du kan bare oppdatere notater du selv har laget.");

      const { data: updData, error: updErr } = await supabase
        .from("notes")
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number.isFinite(Number(editingId)) ? Number(editingId) : editingId)
        .select("id");

      if (updErr) return setStatusMsg(updErr.message);
      if (!updData || updData.length === 0) {
        return setStatusMsg("Ingen rader ble oppdatert (RLS blokkerer).");
      }

      showSuccess("Notat oppdatert.");
      setShowNoteValidation(false);
      cancelEdit();
      setPage(0);
      await loadNotes(0, false);
    } catch (e: any) {
      setStatusMsg(e?.message ?? "Kunne ikke oppdatere notatet.");
    }
  };

  const deleteNote = async (note: Note) => {
    await refreshUser();
    if (!userId) return setStatusMsg("Du må være logget inn.");
    if (note.user_id !== userId) return setStatusMsg("Du kan bare slette notater du selv har laget.");
    setConfirmDeleteNote(note);
  };

  const doDeleteConfirmed = async () => {
    if (!confirmDeleteNote) return;

    try {
      const note = confirmDeleteNote;
      const idValue = Number.isFinite(Number(note.id)) ? Number(note.id) : String(note.id);

      const { data: delData, error: delErr } = await supabase
        .from("notes")
        .delete()
        .eq("id", idValue as any)
        .select("id");

      if (delErr) return setStatusMsg(delErr.message);
      if (!delData || delData.length === 0) {
        return setStatusMsg("Ingen rader ble slettet (RLS blokkerer).");
      }

      if (editingId === String(note.id)) cancelEdit();
      setConfirmDeleteNote(null);

      showSuccess("Notat slettet.");
      setPage(0);
      await loadNotes(0, false);
    } catch (e: any) {
      setStatusMsg(e?.message ?? "Kunne ikke slette notatet.");
    }
  };

  if (!authLoading && !userId) {
    return (
      <View style={{ flex: 1, padding: 16, paddingTop: 40, gap: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Jobb Notater</Text>
        <Text style={{ color: "red" }}>Du må logge inn for å bruke appen.</Text>
        <Text>Gå til Home og logg inn.</Text>
      </View>
    );
  }
if (!authLoading && !userId) {
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 40, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Jobb Notater</Text>
      <Text style={{ color: "red" }}>Du må logge inn for å bruke appen.</Text>
      <Text>Gå til Home og logg inn.</Text>
    </View>
  );
}

if (notesLoading && notes.length === 0) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Laster...</Text>
    </View>
  );
}
  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 40, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Jobb Notater</Text>

      {successMsg ? (
        <View style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}>
          <Text>{successMsg}</Text>
        </View>
      ) : null}

      {status ? (
        <View style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}>
          <Text>{status}</Text>
        </View>
      ) : null}

      {authLoading ? <Text>Laster...</Text> : null}

      {confirmDeleteNote ? (
        <View style={{ borderWidth: 1, borderRadius: 10, padding: 12, gap: 10 }}>
          <Text>Vil du slette notatet?</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => setConfirmDeleteNote(null)}
              style={{ borderWidth: 1, padding: 10, borderRadius: 10, flex: 1 }}
            >
              <Text style={{ textAlign: "center" }}>Nei</Text>
            </Pressable>
            <Pressable
              onPress={doDeleteConfirmed}
              style={{ borderWidth: 1, padding: 10, borderRadius: 10, flex: 1 }}
            >
              <Text style={{ textAlign: "center" }}>Ja</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={onPickGallery} style={{ borderWidth: 1, padding: 12, borderRadius: 10, flex: 1 }}>
          <Text style={{ textAlign: "center" }}>Velg bilde</Text>
        </Pressable>
        <Pressable onPress={onTakePhoto} style={{ borderWidth: 1, padding: 12, borderRadius: 10, flex: 1 }}>
          <Text style={{ textAlign: "center" }}>Ta bilde</Text>
        </Pressable>
      </View>

      {stagedImage ? (
        <View style={{ borderWidth: 1, borderRadius: 12, padding: 10 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Forhåndsvisning</Text>
          <Image
            source={{ uri: stagedImage.uri }}
            style={{ width: "100%", height: 220, borderRadius: 10 }}
            resizeMode="contain"
          />
          <Pressable onPress={() => setStagedImage(null)} style={{ marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 10 }}>
            <Text style={{ textAlign: "center" }}>Fjern bilde</Text>
          </Pressable>
        </View>
      ) : null}

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

      {showNoteValidation && (!title.trim() || !content.trim()) ? (
        <Text style={{ color: "red" }}>Tittel og tekst kan ikke være tomme.</Text>
      ) : null}

      {!isEditing ? (
        <Pressable
          onPress={createNote}
          disabled={uploading}
          style={{ borderWidth: 1, padding: 12, borderRadius: 10, opacity: uploading ? 0.5 : 1 }}
        >
          {uploading ? (
            <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator />
              <Text>Lagrer...</Text>
            </View>
          ) : (
            <Text style={{ textAlign: "center" }}>Lagre nytt notat</Text>
          )}
        </Pressable>
      ) : (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={saveEdit} style={{ borderWidth: 1, padding: 12, borderRadius: 10, flex: 1 }}>
            <Text style={{ textAlign: "center" }}>Lagre endringer</Text>
          </Pressable>
          <Pressable onPress={cancelEdit} style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}>
            <Text style={{ textAlign: "center" }}>Avbryt</Text>
          </Pressable>
        </View>
      )}

<FlatList
  data={notes}
  keyExtractor={(item) => String(item.id)}
  style={{ flex: 1, marginTop: 10 }}
  contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
  renderItem={({ item }) => {
    const mine = isOwner(item);

    return (
      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "700" }}>{item.title}</Text>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>{mine ? "Ditt notat" : "Annen bruker"}</Text>
        </View>

        {!!item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={{ width: "100%", height: 220, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : null}

        <Text>{item.content}</Text>

        <Text style={{ opacity: 0.6, fontSize: 12 }}>
          Sist endret: {new Date(item.updated_at).toLocaleString()}
        </Text>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Pressable
            onPress={() => startEdit(item)}
            disabled={!mine}
            style={{ borderWidth: 1, padding: 10, borderRadius: 10, opacity: mine ? 1 : 0.4 }}
          >
            <Text>{editingId === String(item.id) ? "Redigerer..." : "Rediger"}</Text>
          </Pressable>

          <Pressable
            onPress={() => deleteNote(item)}
            disabled={!mine}
            style={{ borderWidth: 1, padding: 10, borderRadius: 10, opacity: mine ? 1 : 0.4 }}
          >
            <Text>Slett</Text>
          </Pressable>
        </View>
      </View>
    );
  }}
  ListFooterComponent={
    hasMore ? (
      <Pressable
        onPress={loadMore}
        disabled={loadingMore}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 10,
          marginTop: 10,
          opacity: loadingMore ? 0.5 : 1,
        }}
      >
        {loadingMore ? (
          <Text style={{ textAlign: "center" }}>Laster flere...</Text>
        ) : (
          <Text style={{ textAlign: "center" }}>Last mer</Text>
        )}
      </Pressable>
    ) : notes.length > 0 ? (
      <Text style={{ textAlign: "center", marginTop: 10, opacity: 0.6 }}>
        Ingen flere notater
      </Text>
    ) : null
  }
/>
      
    </View>
  );
}