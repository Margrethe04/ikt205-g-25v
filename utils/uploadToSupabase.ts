import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../lib/supabase";
import { PickedImage } from "./imagePicker";

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function simpleId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function uploadImageAndGetPublicUrl(opts: {
  bucket: string;
  userId: string;
  img: PickedImage;
}) {
  const { bucket, userId, img } = opts;

  const ext = extFromMime(img.mimeType);
  const path = `${userId}/${simpleId()}.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(img.uri, {
    encoding: "base64" as any,
  });

  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: img.mimeType,
      upsert: false,
    });

  if (upErr) throw new Error(`Opplasting feilet: ${upErr.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error("Kunne ikke hente public URL fra storage.");

  return { publicUrl, path };
}