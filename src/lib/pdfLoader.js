import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min?url";

GlobalWorkerOptions.workerSrc = workerUrl;

const pdfCache = new Map();

export const loadPdfDocument = async (url) => {
  if (pdfCache.has(url)) return pdfCache.get(url);

  const loadingTask = getDocument(url);
  const doc = await loadingTask.promise;
  pdfCache.set(url, doc);
  return doc;
};
