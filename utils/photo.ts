export function makePhotoUri(photo?: string) {
  if (!photo) return undefined;
  if (/^https?:\/\//.test(photo)) return photo;
  const base = (process.env.EXPO_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  return `${base}/${photo.replace(/^\/?/, "")}`;
}
