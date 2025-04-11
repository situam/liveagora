import { memo, useEffect, useRef, useState } from "react";
import { BaseNode } from './BaseNode'
import { loadPdfDocument } from "../lib/pdfLoader";
import { NodeMetadataLabel } from '../components/NodeMetadataLabel.jsx';

import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions"

const usePdfNodeController = (id) => {
    const { getNode, updateNodeData } = usePersistedNodeActions()

    const getPageNum = () => getNode(id)?.data?.pageNum || 1
    const getPageCount = () => getNode(id)?.data?.pageCount || 1

    return {
        getPageNum,
        getPageCount,
        setPageCount: (pageCount) => {
            if (pageCount != getPageCount()) {
                updateNodeData(id, {
                    pageCount: pageCount
                })
            }
        },
        nextPage: () => {
            let next = getPageNum() + 1;
            if (next > getPageCount()) next = 1; // Wrap around to the first page
            updateNodeData(id, { pageNum: next });
        },
        prevPage: () => {
            let prev = getPageNum() - 1;
            if (prev < 1) prev = getPageCount(); // Wrap around to the last page
            updateNodeData(id, { pageNum: prev });
        }
    }
}


export const PdfNode = memo(({ data, id, type, selected }) => {
  const canvasRef = useRef(null);
  const controller = usePdfNodeController(id)
  const [pdfDoc, setPdfDoc] = useState(null);

  const pageNum = controller.getPageNum(); // Get pageNum from controller
  const pageCount = controller.getPageCount(); // Get pageCount from controller

  useEffect(() => {
    if (!data?.link) return;

    const loadPdf = async () => {
      try {
        const doc = await loadPdfDocument(data.link);
        console.log("loaded doc", doc)
        setPdfDoc(doc);
        controller.setPageCount(doc.numPages)
        console.log("render page on doc loaded")
        renderPage(doc, controller.getPageNum());
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPdf();
  }, [data?.link]);

  useEffect(() => {
    if (pdfDoc) {
        console.log("Re-render page on pageNum change")
      renderPage(pdfDoc, pageNum);
    }
  }, [pageNum, pdfDoc]); 

  const renderPage = async (doc, num) => {
    if (!canvasRef.current) return;
    const page = await doc.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    controller.prevPage();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    controller.nextPage();
  };

  return (
    <>
      <BaseNode data={data} id={id} type={type} selected={selected}>
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
            <canvas style={{width: '100%', height: '100%', objectFit: 'contain'}} ref={canvasRef}></canvas>
        </div>
      </BaseNode>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div>
          Page {pageNum} / {pageCount}
        </div>
        <button onClick={handlePrev} disabled={pageNum <= 1}>
            prev
        </button>
        <button onClick={handleNext} disabled={pageNum >= pageCount}>
            next
        </button>
      </div>
      <NodeMetadataLabel data={data} id={id} />
    </>
  );
});

export default PdfNode;
