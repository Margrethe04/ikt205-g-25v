import * as FileSystem from "expo-file-system";
import { PickedImage } from "./imagePicker";

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function validateImageOrThrow(img: PickedImage) {
  // Nytt API i SDK 54+
  const f = new FileSystem.File(img.uri);
  const info = await f.info();
  const size = info.size ?? 0;

  if (size <= 0) throw new Error("Kunne ikke lese bildestørrelse.");
  if (size > MAX_BYTES) throw new Error("Bildet er for stort. Maks 15MB.");

  if (!ALLOWED.has(img.mimeType)) {
    throw new Error("Ugyldig format. Kun JPG, PNG eller WebP.");
  }
}