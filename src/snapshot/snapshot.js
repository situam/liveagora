import { html2tiptap, tiptap2html } from "./padtransform"
import { Space } from "../agoraHatcher"
import { generateNewNodeId } from "../util/utils"

const SNAPSHOT_VERSION = 1

/**
 * An archivable snapshot of nodes
 * - so far, PadNodes are transformed to/from html/yfragment
 * @property {number} agoraSnapshotVersion
 * @property {Array} nodes
 */
export class NodesSnapshot{
  constructor(agoraSnapshotVersion, nodes) {
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
  }

  /**
   * Snapshot from all nodes in a space 
   * @param {Space} space 
   */
  static fromSpace(space) {
    const allNodesInYkv = Array.from(space.ykv.map.keys())
    return this.fromNodes(space, allNodesInYkv)
  }

  /**
   * Snapshot from array of nodes in a space 
   * @param {Space} space 
   * @param {string[]} nodeIds - array of nodeIds
   */
  static fromNodes(space, nodeIds) {
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
        snapshotNode.data.html = tiptap2html(space.agora.ydoc, node.id)
      }
    
      return snapshotNode
    })
    return new NodesSnapshot(SNAPSHOT_VERSION, snapshotNodes)
  }

  static fromJSON(jsonObject) {
    if (typeof jsonObject.agoraSnapshotVersion !== 'number' || !Array.isArray(jsonObject.nodes)) {
      throw new Error('Invalid JSON format for NodesSnapshot');
    }
    return new NodesSnapshot(jsonObject.agoraSnapshotVersion, jsonObject.nodes);
  }

  /**
   * Converts the snapshot to a JSON object
   * @returns {Object} the JSON object
   */
  toJSON() {
    return {
      agoraSnapshotVersion: this.agoraSnapshotVersion,
      nodes: this.nodes
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
        html2tiptap(n.data.html, space.agora.ydoc, processedNode.id) // convert html to a yfragment for this agora  
        delete processedNode.data.html
      }
      
      return processedNode
    })
  
    space.nodeActions.addNodes(processedNodes)
  }
}