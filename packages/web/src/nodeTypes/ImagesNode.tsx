import { memo, useEffect } from "react";
import { NodeMetadataLabel } from "../components/NodeMetadataLabel";
import { BaseNode } from "./BaseNode";
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions";
import { useSpaceAccessControl } from "../context/AccessControlContext";
// import { SidebarSide, useSidebar } from "../components/Sidebar";
// import { NodeSidebarContent } from "../components/Posts";

interface ImagesNodeData {
  links: string[];
  style?: React.CSSProperties;
  sidebar?: boolean;
}

// TODO: ImagesNodeProps extends NodeProps<ImagesNodeData>
interface ImagesNodeProps {
  data: ImagesNodeData;
  id: string;
  type: string;
  selected?: boolean;
}

const _preloadEnabled = true

export const useImagesNodeController = (id: string, max: num) => {
  const { getNode, updateNodeData } = usePersistedNodeActions()

  const getCurrentIndex = () => getNode(id)?.data?.currentIndex || 0
  const setCurrentIndex = (idx: num) => updateNodeData(id, {
    currentIndex: idx,
  })

  return {
    getCurrentIndex,
    setCurrentIndex,
    nextPage: () => {
      let next = getCurrentIndex() + 1
      if (next > max) next = 0 // wrap around
      setCurrentIndex(next)
    },
    prevPage: () => {
      let prev = getCurrentIndex() - 1
      if (prev < 0) prev = max // wrap around
      setCurrentIndex(prev)
    }
  }
}

export const ImagesNode = memo(({ data, id, type, selected }: ImagesNodeProps) => {
  const accessControl = useSpaceAccessControl()
  const {getCurrentIndex, nextPage, prevPage, setCurrentIndex } = useImagesNodeController(id, data?.links.length - 1 || 0) // TODO: make this update when data.links changes?
  
  //const { openSidebar } = useSidebar();
  /*const handleClick = useCallback(() => {
    if (data?.sidebar) {
      openSidebar({
        children: <NodeSidebarContent nodeId={id} />,
        side: SidebarSide.right,
        showCloseButton: true,
      });
    }
  }, [id, data, openSidebar]);*/

  if (!data?.links || data.links.length === 0)
    return null;

  useEffect(() => {
    const linkElements: HTMLLinkElement[] = [];

    if (_preloadEnabled) {
      // Preload all images with <link rel="preload">

      data.links.forEach((link) => {
        const linkEl = document.createElement("link");
        linkEl.rel = "preload";
        linkEl.as = "image";
        linkEl.href = link;
        document.head.appendChild(linkEl);
        linkElements.push(linkEl);
      });
    }

    return () => {
      // cleanup
      linkElements.forEach((el) => document.head.removeChild(el));
    };
  }, [data.links]);

  const backToStart = (e) => {
    e.stopPropagation();
    setCurrentIndex(0)
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    prevPage();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    nextPage();
  };

  return (
    <>
      <BaseNode data={data} id={id} type={type} selected={selected}>
        <img
          src={data.links[getCurrentIndex()]}
          style={data?.style}
          // onClick={handleClick}
          className={`cover-img ${data?.sidebar ? 'wiggle' : ''}`}
        />
      </BaseNode>

      {
        /**
         * Only show the controls if authScope.canEdit
         * (since the currentIndex state is stored in the ydoc)
         */
        accessControl.authScope.canEdit &&

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            Page {getCurrentIndex() + 1} / {data?.links.length}
          </div>
          <button onClick={handlePrev}>prev</button>
          <button onClick={handleNext}>next</button>
          <button onClick={backToStart}>back to start</button>
        </div>
      }

      <NodeMetadataLabel data={data} id={id} />
    </>
  );
});

export default ImagesNode;
