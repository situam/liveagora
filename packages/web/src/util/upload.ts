type Options = {
  body?: any;
  headers?: Record<string, string>;
  onProgress?: (percent: number) => void;
}
export function putWithProgress(url: string, opts: Options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // progress event
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && typeof opts.onProgress === "function") {
        const percent = (evt.loaded / evt.total) * 100;
        opts.onProgress(percent);
      }
    };

    xhr.onload = () => {
      const success = xhr.status >= 200 && xhr.status < 300;
      if (success) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.open("PUT", url, true);

    // apply headers
    if (opts.headers) {
      for (const [key, value] of Object.entries(opts.headers)) {
        xhr.setRequestHeader(key, value);
      }
    }    

    xhr.send(opts.body);
  });
}