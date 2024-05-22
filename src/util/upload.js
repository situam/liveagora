/**
 * Uploads form data to a specified URL with progress tracking.
 *
 * @param {string} uploadURL - The URL to upload the form data to.
 * @param {FormData} formData - The form data to upload.
 * @param {function(number):void} [onProgress] - Optional callback function called with the upload progress percentage.
 * @param {function(string):void} [onSuccess] - Optional callback function called with the response text upon a successful upload.
 * @param {function(Error):void} [onError] - Optional callback function called with an error object upon a failed upload.
 * @returns {Promise<string>} - A promise that resolves with the response text upon a successful upload, or rejects with an error upon failure.
 */
export function uploadFormData(uploadURL, formData, onProgress, onSuccess, onError) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            if (onProgress) {
            onProgress(percentComplete);
            }
        }
        };

        xhr.onload = function() {
        if (xhr.status === 200) {
            if (onSuccess) {
            onSuccess(xhr.responseText);
            }
            resolve(xhr.responseText);
        } else {
            const error = new Error("Upload failed");
            if (onError) {
            onError(error);
            }
            reject(error);
        }
        };

        xhr.onerror = function() {
        const error = new Error("Upload failed");
        if (onError) {
            onError(error);
        }
        reject(error);
        };

        xhr.open("POST", uploadURL, true);
        xhr.send(formData);
    });
}