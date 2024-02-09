import { html2tiptap, tiptap2html } from "./padtransform"
import { addNodes } from "../nodeActions/index"

const SNAPSHOT_VERSION = 1

/**
 * transform an array of nodes to a snapshot object
 * @param {Ydoc} ydoc - agora ydoc
 * @param {YKeyValue} ykv - space ykv
 * @param {string[]} ids - node id
 * @returns {Object[]} snapshot
 */
export function saveNodesToSnapshot(ydoc, ykv, ids) {
  const snapshotNodes = ids.map(id=>{
    const node = ykv.get(id)

    const snapshotNode = {
      ...node,
      data: {
        ...(node.data || {})
      },
    }
  
    if (node.type === 'PadNode') {
      snapshotNode.data.html = tiptap2html(ydoc, node.id)
    }
  
    return snapshotNode
  })
  
  const snapshot = {
    version: SNAPSHOT_VERSION,
    nodes: snapshotNodes
  }
  
  return snapshot
}

/**
 * load a snapshot object to an array of nodes
 * * Snapshot schema: { version: snapshotVersion, nodes: [] }
 * @param {Object} snapshot
 * @param {Ydoc} ydoc - agora ydoc, where pads are hosted as yfragments
 * @param {YKeyValue} ykv - space ykv, where nodes are spawned
 */
export function loadNodesFromSnapshot(snapshot, ydoc, ykv) {
  if (!snapshot.version || !snapshot.nodes || !Array.isArray(snapshot.nodes)) {
    throw("Invalid schema")
  }
  if (snapshot.version !== SNAPSHOT_VERSION) {
    throw("Unknown version")
  }

  const processedNodes = snapshot.nodes.map(n => {
    let convertedNode = {
      ...n,
      id: `${n.type}_${+new Date()}`, // generate a new ID
      data: { ...n.data } // deep clone node to avoid mutating the original node's data
    } 
    if (n.type === 'PadNode' && typeof n.data?.html === 'string') {
      html2tiptap(n.data.html, ydoc, convertedNode.id) // convert html to a yfragment for this agora
      
      delete convertedNode.data.html
      return convertedNode
    }
    
    return n
  })

  addNodes(ykv, processedNodes)
}