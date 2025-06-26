import { useAccessControl } from "../context/AccessControlContext"
import { Pad } from "./Pad"
import { useSpace } from "../context/SpaceContext"
import { useYkv, useYkvEntry } from "../hooks/useYkv"
import { NodeMetadataLabel } from "./NodeMetadataLabel";
import { TagNavigator } from "./SpaceNavigator";

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
  
  return <pre style={{
    fontSize: '10px',
    fontFamily: 'monospace',
  }}>{JSON.stringify(metadata, null, 2)}</pre>

  return <>{Object.entries(metadata).map(([key, value]) => {
    return <>
      <div style={{
        fontWeight: '600',
        color: '#495057',
        marginBottom: '4px',
        textTransform: 'capitalize'
      }}>
        {formatKey(key)}:
      </div>
      <div style={{
        color: '#6c757d',
        marginBottom: '16px',
        wordBreak: 'break-word',
        backgroundColor: '#ffffff',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #e9ecef'
      }}>
        <pre>{formatValue(value)}</pre>
      </div>
    </>
  })}</>
}


export const TagPost = ({ tagKey }) => {
  const { currentRole } = useAccessControl()
  return <div>
    <h2>{tagKey}</h2>
    <div style={{ background: 'white' }}>
      <Pad
        id={`tag.${tagKey}.post`}
        outsideFlow={true}
        editable={currentRole.canEdit}
      />
    </div>
  </div>
}

export const TagPosts = () => {
  const { currentRole } = useAccessControl()
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
      id={`tag.posts`}
      outsideFlow={true}
      editable={currentRole.canEdit}
    />
  </div>
}

export const Post = ({ nodeId }) => {
  const { currentRole } = useAccessControl()
  const space = useSpace()
  const node = useYkvEntry(space.ykv, nodeId)

  console.log('Post nodeData', node)

  if (!node) return null

  const padId = `post-for-node.${nodeId}`
  return <div>
    <RenderObjectEntries metadata={node} />

    <NodeMetadataLabel id={nodeId} data={node.data} />

    <div style={{ background: 'white' }}>
      <Pad
        id={padId}
        outsideFlow={true}
        editable={currentRole.canEdit}
      />
    </div>
  </div>
}