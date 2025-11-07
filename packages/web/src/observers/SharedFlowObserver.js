/* Nest SharedFlowListener within a SharedFlowProvider and ReactFlowProvider */

import { useContext, useEffect, useCallback } from 'react'

import { useSpace } from '../context/SpaceContext'
import { useStoreApi } from 'reactflow'
import { isValidNode } from '../util/validators'

import { internalsSymbol } from 'reactflow'

function transformYkvNodeToRfNode(ykvNode) {
  let rfNode = { ...ykvNode}

  if (rfNode.hasOwnProperty('data'))
    if (rfNode.data.hasOwnProperty('frozen'))
      if (rfNode.data.frozen === true)
        rfNode.draggable = false // only set draggable property false if node is 'frozen'

  if (rfNode.hasOwnProperty('position'))
    rfNode.positionAbsolute = {
      x: rfNode.position.x,
      y: rfNode.position.y
    }

  if (rfNode.hasOwnProperty('width') && rfNode.hasOwnProperty('height'))
    rfNode.style = {
      ...rfNode.style,
      width: rfNode.width,
      height: rfNode.height
    }

  if (rfNode.hasOwnProperty('z'))
    rfNode[internalsSymbol] = { z: rfNode.z }

  if (rfNode.hasOwnProperty('selected'))
    delete rfNode.selected
  
  return rfNode
}

export const SharedFlowObserver = () => {
  const { ykv } = useSpace()
  const rfStore = useStoreApi()

  const observer = useCallback((changes) => {
    rfStore.setState((current)=>{
      let next = new Map(current.nodeInternals)

      changes.forEach((change)=> {
        //console.log('[ykv observed] ', change.action,
        //  change.action === 'delete' ? change.oldValue.id : change.newValue.id) 

        if (change.action === 'add' ||
            change.action === 'update')
        {
          let update = transformYkvNodeToRfNode(change.newValue)
          if (isValidNode(update)) {
            next.set(change.newValue.id, {
              ...next.get(change.newValue.id),
              ...update
            })
          }
        } 
        else if (change.action === 'delete')
        {
          next.delete(change.oldValue.id)
        }
      })

      return { nodeInternals: next}
    })
  }, [rfStore])

  useEffect(() => {
    // init
    console.log("[SharedFlowObserver] init ", ykv.map)
    rfStore.setState((current)=>{
      let nextNodeInternals = new Map(current.nodeInternals)
      ykv.map.forEach(({key, val})=>{
        if (isValidNode(val)) {
          let rfNode = transformYkvNodeToRfNode(val)
          //console.log('init node', val, rfNode)
          nextNodeInternals.set(rfNode.id, rfNode)
        }
        else {
          //clean up invalid nodes - they don't belong in the ykv!
          ykv.delete(key)
        }
      })
      return { nodeInternals: nextNodeInternals}
    }) 
    
    // register observer
    ykv.on('change', observer)

    // remove observer
    return () => {
      console.log("[SharedFlowObserver] unobserving", ykv)
      ykv.off('change', observer)
    };
  }, [ykv, rfStore]);

  return null
}
