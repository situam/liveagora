import { html2tiptap, tiptap2html } from "./padtransform"
import { Space } from "../agoraHatcher"
import { generateNewNodeId } from "../util/utils"
import { jsonObjToYKeyValue, yKeyValueToJsonObj } from "../util/yutil"

const SNAPSHOT_VERSION = 1

/**
 * An archivable snapshot of nodes
 * - so far, PadNodes are transformed to/from html/yfragment
 * @property {number} agoraSnapshotVersion
 * @property {Array} nodes
 * @property {Object} metadata - space metadata
 */
export class NodesSnapshot{
  constructor(agoraSnapshotVersion, nodes, metadata = {}) {
    if (typeof agoraSnapshotVersion !== 'number') {
      throw new Error('agoraSnapshotVersion must be a number')
    }
    if (agoraSnapshotVersion !== SNAPSHOT_VERSION) {
      throw new Error('unhandled snapshot version')
    }
    if (!Array.isArray(nodes)) {
      throw new Error('nodes must be an array')
    }
    this.agoraSnapshotVersion = SNAPSHOT_VERSION
    this.nodes = nodes
    this.metadata = metadata
  }

  /**
   * Snapshot from all nodes in a space 
   * @param {Space} space 
   */
  static fromSpace(space) {
    const allNodesInYkv = Array.from(space.ykv.map.keys())
    const metadata = yKeyValueToJsonObj(space.metadata)
    return this.fromNodes(space, allNodesInYkv, metadata)
  }

  /**
   * Snapshot from array of nodes in a space 
   * @param {Space} space 
   * @param {string[]} nodeIds - array of nodeIds
   * @param {Object} metadata - space metadata
   */
  static fromNodes(space, nodeIds, metadata) {
    const snapshotNodes = nodeIds.map(id=>{
      const node = space.ykv.get(id)
  
      const snapshotNode = {
        ...node,
        data: {
          ...(node.data || {})
        },
      }
    
      if (node.type === 'PadNode') {
        /// get html from pads and save in snapshot
        snapshotNode.data.html = tiptap2html(space.ydoc, node.id)
      }
    
      return snapshotNode
    })
    return new NodesSnapshot(SNAPSHOT_VERSION, snapshotNodes, metadata)
  }

  static fromJSON(jsonObject) {
    if (typeof jsonObject.agoraSnapshotVersion !== 'number' || !Array.isArray(jsonObject.nodes)) {
      throw new Error('Invalid JSON format for NodesSnapshot');
    }
    const metadata = (typeof jsonObject.metadata === 'object' && jsonObject.metadata !== null && !Array.isArray(jsonObject.metadata))
      ? jsonObject.metadata : {};
    return new NodesSnapshot(jsonObject.agoraSnapshotVersion, jsonObject.nodes, metadata);
  }

  /**
   * Converts the snapshot to a JSON object
   * @returns {Object} the JSON object
   */
  toJSON() {
    return {
      agoraSnapshotVersion: this.agoraSnapshotVersion,
      metadata: this.metadata,
      nodes: this.nodes,
    }
  }

  /**
   * Loads the snapshot into the space
   * - a new id is generated for node
   * - pad nodes with data.html content are converted to yfragments
   * @param {Space} space 
   * @param {Function} nodeTransformFn Optional custom node transformation function
   */
  loadIntoSpace(space, nodeTransformFn = (n)=>n) {
    const processedNodes = this.nodes.map(n => {
      let transformedNode = nodeTransformFn(n)
      let processedNode = {
        ...transformedNode,
        id: generateNewNodeId(n.type),
        data: { ...n.data } // deep clone node to avoid mutating the original node's data
      } 

      if (n.type === 'PadNode' && typeof n.data?.html === 'string') {
        html2tiptap(n.data.html, space.ydoc, processedNode.id) // convert html to a yfragment for this agora  
        delete processedNode.data.html
      }
      
      return processedNode
    })
  
    space.nodeActions.addNodes(processedNodes)

    // load metadata
    jsonObjToYKeyValue(this.metadata, space.metadata)
  }
}