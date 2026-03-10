import * as ImagePicker from "expo-image-picker";

export type PickedImage = {
  uri: string;
  mimeType: string;
  width?: number;
  height?: number;
};

export async function requestImagePermissions() {
  const cam = await ImagePicker.requestCameraPermissionsAsync();
  const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!cam.granted || !lib.granted) {
    throw new Error("Du må gi tilgang til kamera og bildebibliotek.");
  }
}

function assetToPicked(asset: ImagePicker.ImagePickerAsset): PickedImage {
  const uri = asset.uri;
  const ext = uri.split(".").pop()?.toLowerCase();
  const fallbackMime =
    ext === "png" ? "image/png" :
    ext === "webp" ? "image/webp" :
    "image/jpeg";

  return {
    uri,
    mimeType: asset.mimeType ?? fallbackMime,
    width: asset.width,
    height: asset.height,
  };
}

export async function pickFromGallery(): Promise<PickedImage | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (res.canceled) return null;
  return assetToPicked(res.assets[0]);
}

export async function takePhoto(): Promise<PickedImage | null> {
  const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
  if (res.canceled) return null;
  return assetToPicked(res.assets[0]);
}