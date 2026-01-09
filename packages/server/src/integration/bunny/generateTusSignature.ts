import crypto from "crypto";

// https://docs.bunny.net/reference/tus-resumable-uploads
export function generateTusSignature({ libraryId, apiKey, videoId, expiresIn = 3600 }) {
  const expireAt = Math.floor(Date.now() / 1000) + expiresIn;
  const raw = `${libraryId}${apiKey}${expireAt}${videoId}`;

  const signature = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");

  return { signature, expireAt };
}