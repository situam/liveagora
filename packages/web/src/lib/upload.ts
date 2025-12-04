import { Env } from "../config/env";
import { compressImageFile } from "../util/compressor";
import { uploadFormData } from "../util/upload";

export type UploadImageResult = {
  link: string;
  fileName: string;
}

/**
 * Upload a single image file.
 * @param file - the image File
 * @param onProgress - callback reporting progress 0-100
 * @returns object containing the uploaded file's ID and server info
 */
export const uploadImage = async (
  file: File,
  onProgress: (percentComplete: number) => void
): Promise<UploadImageResult> => {
  let fileToUpload: File | Blob;
  try {
    fileToUpload = await compressImageFile(file);
    console.log("[Uploader] compress", file.size, (fileToUpload as File).size || fileToUpload.size);
  } catch (err) {
    fileToUpload = file;
    console.error(err);
  }

  const res = await fetch(`${Env.serverUrl}/getImageUploadUrl`);
  if (res.status !== 200) throw new Error("getUploadUrl failed");

  const { id, uploadURL } = (await res.json()).result;
  const link = `https://imagedelivery.net/B7Du2acbdC64cz50SK5nLg/${id}/public`// TODO: decouple from cloudflare and account id
  console.log("link", link);

  const formData = new FormData();
  formData.append("file", fileToUpload, fileToUpload instanceof File ? fileToUpload.name : file.name);

  await uploadFormData(uploadURL, formData, onProgress, undefined, (err) => console.error("Upload failed", err));

  return { 
    link,
    fileName: fileToUpload instanceof File ? fileToUpload.name : file.name
  };
};
