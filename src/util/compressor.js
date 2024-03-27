import Compressor from 'compressorjs'

/**
 * @param {File} file image file to compress
 * @returns {Promise<File | Blob>} compressed image file, or original if gif
 */
export async function compressImageFile(file) {
  if (file.type === 'image/gif') {
    // don't compress image/gif
    return file
  }

  return await new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 2000,
      maxHeight: 2000,
      success: resolve,
      error: reject
    })
  })
}