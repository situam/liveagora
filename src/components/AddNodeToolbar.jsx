import { useCallback, useState } from "react";
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions";
import { useNewNodePosition } from "../hooks/useNewNodePosition";
import { Uploader } from "./Uploader";
import { SpaceSettings } from "./SpaceSettings";

export function AddNodeToolbar() {
  const [uploaderVisible, setUploaderVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { addNode } = usePersistedNodeActions();
  const getNewNodePos = useNewNodePosition();

  const addCollectionEntry = useCallback((idType) => {
    let entryId = parseInt(prompt("Enter ID#", "1"));
    if (isNaN(entryId)) return;

    const collectionData = {};
    if (idType === "file") {
      collectionData.fileId = entryId;
    } else if (idType === "contribution") {
      collectionData.contributionId = entryId;
    } else {
      throw "unhandled idType";
    }

    addNode({
      id: `co_${+new Date()}`,
      type: "embed",
      data: {
        collection: collectionData,
      },
      z: 50,
      position: getNewNodePos(120, 120),
      width: 120,
      height: 120,
    });
  }, []);

  const addPadNode = useCallback(() => {
    addNode({
      id: `pad_${+new Date()}`,
      type: "PadNode",
      data: {
        style: {
          background: "#EFEFEF",
        },
      },
      z: 100,
      position: getNewNodePos(120, 120),
      width: 120,
      height: 120,
    });
  }, []);

  /**
   * Adds a video, image, or sound node
   * @param {string} type - video | image | sound
   * @param {Object} data - { link: <link> } or { hls: <link> }s
   * @param {int} bulkAddIndex - grid position
   */
  const addMediaNode = useCallback((type, data, bulkAddIndex = 0) => {
    if (type !== "video" && type !== "image" && type !== "sound") return;
    if (!data) return;

    let node = {
      id: `${type}_${+new Date()}`,
      type: type,
      data,
      position: getNewNodePos(300, 180),
      z: 500,
    };

    //if (type=='video'||type=='image'){
    node.width = 240;
    node.height = 180;
    //}

    if (bulkAddIndex > 0) {
      node.position.y += node.height * bulkAddIndex;
    }

    addNode(node);
  }, []);

  return (
    <>
      {uploaderVisible && (
        <div
          onClick={() => setUploaderVisible(false)}
          style={{
            background: "var(--theme-alpha-color)",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Uploader
            isVisible={uploaderVisible}
            onUploaded={(url, type, nUploaded) =>
              addMediaNode(url, type, nUploaded)
            }
            onClose={() => setUploaderVisible(false)}
          />
        </div>
      )}
      {settingsVisible && (
        <div
          onClick={() => setSettingsVisible(false)}
          style={{
            background: "var(--theme-alpha-color)",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <form onClick={(e) => e.stopPropagation()}>
            <SpaceSettings />
          </form>
        </div>
      )}
      {import.meta.env.VITE_ENABLE_COLLECTION_INTEGRATION === "1" && (
        <>
          <button onClick={() => addCollectionEntry("contribution")}>
            +collection/contribution
          </button>
          <br />
          <button onClick={() => addCollectionEntry("file")}>
            +collection/file
          </button>
          <br />
        </>
      )}
      <button onClick={addPadNode}>+pad</button>
      <br />
      {import.meta.env.VITE_ENABLE_COLLECTION_INTEGRATION !== "1" && (
        <>
          <button onClick={() => setUploaderVisible(true)}>
            +image/video/sound
          </button>
          <br />
          <button onClick={() => setSettingsVisible(!settingsVisible)}>
            settings
          </button>
        </>
      )}
    </>
  );
}
