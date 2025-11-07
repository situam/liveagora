import throttle from 'lodash.throttle'
import { isValidNode } from '../util/validators'

const throttleMs = 20

function addNode(ykv, node) {
  if (!isValidNode(node)) {
    console.log('[addNode] detected invalid node', node)
    return
  }

  ykv.set(node.id, {...node})
}

/**
 * add nodes to space ykv
 * @param {Ykv} ykv 
 * @param {Object[]} nodes 
 */
export function addNodes(ykv, nodes) {
  ykv.doc.transact(()=>{
    nodes.forEach((node)=>addNode(ykv, node))
  })
}

function getNode(ykv, id) {
  return ykv.get(id)
}

function updateNodes(ykv, updates) {
  ykv.doc.transact(()=>{
    updates.forEach( ({id, update}) => updateNode(ykv, id, update))
  })
}

function updateNode(ykv, id, update) {
  let node = ykv.get(id)
  let newNode = {
    ...node,
    ...update
  }

  ykv.set(id, {...newNode})
}

function updateNodeData(ykv, id, update) {
  let data = ykv.get(id).data
  let newData = {
    ...data,
    ...update
  }

  updateNode(ykv, id, { data: newData })
}

function deleteNode(ykv, id) {
  if (ykv.has(id))
    ykv.delete(id)
}

function deleteAllNodes(ykv) {
  if (!confirm("are you sure?"))
    return

  ykv.map.forEach(({key, _})=>{
    ykv.delete(key)
  })
}

const updateNodeThrottled = throttle(updateNode, throttleMs)
const updateNodeDataThrottled = throttle(updateNodeData, throttleMs)
const updateNodesThrottled = throttle(updateNodes, throttleMs)

export const nodeActionsWithYkv = (ykv) => {
  return {
    addNode: (...args) => addNode(ykv, ...args),
    addNodes: (...args) => addNodes(ykv, ...args),
    getNode: (...args) => getNode(ykv, ...args),
    updateNodes: (...args) => updateNodes(ykv, ...args),
    updateNodesThrottled: (...args) => updateNodesThrottled(ykv, ...args),
    updateNode: (...args) => updateNode(ykv, ...args),
    updateNodeThrottled: (...args) => updateNodeThrottled(ykv, ...args),
    updateNodeData: (...args) => updateNodeData(ykv, ...args),
    updateNodeDataThrottled: (...args) => updateNodeDataThrottled(ykv, ...args),
    deleteNode: (...args) => deleteNode(ykv, ...args),
    deleteAllNodes: (...args) => deleteAllNodes(ykv, ...args), 
  }
}