import { getUploadUrl } from "../api/getObjectStorageUploadUrl"
import { compressImageFile } from "../util/compressor"
import { putWithProgress } from "../util/upload"

type Callbacks = {
  onSize?: (bytes: number) => void
  onProgress?: (percent: number) => void
}

export async function uploadImage(file: File, callbacks: Callbacks) {
  let fileToUpload: File
  try {
    fileToUpload = await compressImageFile(file)
    console.log("[Uploader:onSubmit] file.size, fileToUpload.size", file.size, fileToUpload.size)
  } catch (err) {
    fileToUpload = file
    console.error(err)
  }

  // get upload URL from server
  const uploadUrlRes = await getUploadUrl({
    filename: file.name,
    contentType: fileToUpload.type
  });
  if (!uploadUrlRes) {
    alert(`Error getting upload URL for ${file.name}`)
    throw new Error("getUploadUrl failed");
  }

  const blob = new Blob([new Uint8Array(await fileToUpload.arrayBuffer())], { type: fileToUpload.type });
  if (callbacks?.onSize) {
    callbacks.onSize(blob.size)
  }

  await putWithProgress(decodeURI(uploadUrlRes.uploadUrl), {
    body: blob,
    headers: {
      'Content-Type': blob.type,
    },
    onProgress: (percent) => {
      if (callbacks?.onProgress) {
        callbacks.onProgress(percent)
      }
    }
  })
  return uploadUrlRes.objectUrl
}

// async function delay(ms: number) {
//   return new Promise((resolve, reject)=>{
//     setTimeout(resolve, ms)
//   })
// }
// export async function uploadImage(file: File, callbacks: Callbacks) {
//   console.log("uploadImage", file)
//   callbacks?.onSize?.(123)
//   await delay(500)
//   callbacks?.onProgress?.(50)
//   await delay(500)
//   callbacks?.onProgress?.(100)
//   return "http://example.com/example-image.jpg"
// }