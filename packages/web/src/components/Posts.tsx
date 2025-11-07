import { useSpaceAccessControl } from "../context/AccessControlContext"
import { SIDEBAR_EXTENSIONS, Pad } from "./Pad"
import { useSpace } from "../context/SpaceContext"
import { useYkv, useYkvEntry } from "../hooks/useYkv"
import { NodeMetadataLabel } from "./NodeMetadataLabel";
import { TagNavigator } from "./SpaceNavigator";
import { NodeMetadataControls } from "../nodeComponents/SharedNodeToolbar";
import { usePersistedNodeActions } from "../hooks/usePersistedNodeActions";
import { useCallback } from "react";
import { useSidebar } from "./Sidebar";

function RenderObjectEntries({ metadata }) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };
  
  // return <pre style={{
  //   fontSize: '10px',
  //   fontFamily: 'monospace',
  // }}>{JSON.stringify(metadata, null, 2)}</pre>

  return <>{Object.entries(metadata).map(([key, value]) => {
    return <>
      <div style={{
        // fontWeight: '600',
        // color: '#495057',
        // marginBottom: '4px',
        textTransform: 'lowercase'
      }}>
        {formatKey(key)}
      </div>
      <div style={{
        // color: '#6c757d',
        marginBottom: '0.5em',
        wordBreak: 'break-word',
        backgroundColor: '#ffffff',
        // padding: '8px 12px',
        // borderRadius: '4px',
        // border: '1px solid rgb(0, 255, 0)'
      }}>
        {formatValue(value)}
      </div>
    </>
  })}</>
}

export const TagPost = ({ tagKey }) => {
  const { currentRole } = useSpaceAccessControl()
  const space = useSpace()
  return <div>
    <h2>{tagKey}</h2>
    <div style={{ background: 'white' }}>
      <Pad
        ydoc={space!.ydoc}
        id={`tag.${tagKey}.post`}
        outsideFlow={true}
        editable={currentRole.canEdit}
      />
    </div>
  </div>
}

export const TagPosts = () => {
  const { currentRole } = useSpaceAccessControl()
  const space = useSpace()
  const tagKv = useYkv(space.tags)

  if (!tagKv) return null

  return <div>
    <h2>tags</h2>
    <TagNavigator/>
    {Object.entries(tagKv.state).filter(([key, data])=>data.val!=true).sort().map(([tagKey, tagData]) => (
      <div key={tagKey} style={{ marginBottom: '16px' }}>
        <TagPost tagKey={tagKey} />
        {/* <RenderObjectEntries metadata={tagData} /> */}
      </div>
    ))}
    <Pad
      ydoc={space!.ydoc}
      id={`tag.posts`}
      outsideFlow={true}
      editable={currentRole.canEdit}
    />
  </div>
}

export const NodeSidebarContent = ({ nodeId }) => {
  const { currentRole } = useSpaceAccessControl()
  const space = useSpace()
  const node = useYkvEntry(space!.ykv, nodeId)
  const { updateNodeData } = usePersistedNodeActions()
  const { closeSidebar } = useSidebar()

  const onClickDisableSidebar = useCallback(()=>{
    let data = node?.data
    delete data.sidebar
    console.log("onClickDisableSidebar", data)
    updateNodeData(nodeId, data)
    closeSidebar()
  }, [node, nodeId])

  if (!node) {
    // if node doesn't exist (i.e. is deleted), close the sidebar
    closeSidebar()
    return null
  }

  const padId = `post-for-node.${nodeId}`
  return <div>
    { currentRole.canEdit && <>
      <button onClick={onClickDisableSidebar}>disable sidebar</button>
      {/* <NodeMetadataControls id={nodeId} data={node?.data} type={node?.type}/> */}
    </>
    }
    <div style={ { background: currentRole.canEdit ? 'white' : '' }}>
      <Pad
        ydoc={space!.ydoc}
        id={padId}
        outsideFlow={true}
        editable={currentRole.canEdit}
        extensions={SIDEBAR_EXTENSIONS}
      />
    </div>
    {/* { currentRole.canEdit && <>
      <br/>
      <hr></hr>
      <p>node data: </p>
      <br/>
      <RenderObjectEntries metadata={node} />
      </>
    } */}
  </div>
}