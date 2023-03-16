import { createContext, useContext, useEffect } from 'react'
import { useRef } from 'react'

import { createStore, useStore } from 'zustand'
import { shallow } from 'zustand/shallow';

import { useStoreApi } from 'reactflow'
import { isValidNode } from '../components/utils'

import throttle from 'lodash.throttle'

const createSyncedFlowStore = (props) => {
  return createStore()((set, get) => ({
    ...props,
    addNode: (node) => {
      if (!isValidNode(node))
        return

      console.log("addNode: ", node)
      props.ykv.set(node.id, {...node})
    },
    updateNodes: (updates) => {
      updates.forEach( ({id, update}) => get().updateNode(id, update))
      // @todo batch updates...
    },
    updateNode: (id, update) => {
      let node = get().ykv.get(id)
      let newNode = {
        ...node,
        ...update
      }
      console.log("broadcasting update: id, update, node, newNode", id, update, node, newNode)
      props.ykv.set(id, {...newNode})
    },
    updateNodeData: (id, update) => {
      let data = props.ykv.get(id).data
      if (!data) return
      let newData = {
        ...data,
        ...update
      }
      get().updateNode(id, { data: newData })
    },
    deleteNode: (id) => {
      if (props.ykv.has(id))
        props.ykv.delete(id)
    },
    deleteAllNodes: ()=>{
      if (!confirm("are you sure?")) return
      props.ykv.map.forEach(({key, _})=>{
        props.ykv.delete(key)
      })
    }
  }))
}

const FlowContext = createContext(null)

/*
* YkvToFlowListener observes the Ykv and transforms the updates for the internal Rf node store
* it needs to be nested in the YkvProvider and ReactFlowProvider 
*/
export const YkvFlowListener = () => {
  const { ykv } = useYkvContext()
  const rfStore = useStoreApi()

  useEffect(() => {
    const observer = (changes) => {
      rfStore.setState((current)=>{
        let next = new Map(current.nodeInternals)

        changes.forEach((change)=> {
          console.log('[ykv observed] ', change.action,
            change.action === 'delete' ? change.oldValue.id : change.newValue.id) 

          if (change.action === 'add' ||
              change.action === 'update')
          {
            // make a copy! mutating change.newValue has side effects on the ydoc
            let update = { ...change.newValue }
            
            // now transform it for reactflow 
            if (update.hasOwnProperty('position'))
              update.positionAbsolute = {
                x: update.position.x,
                y: update.position.y
              }

            if (update.hasOwnProperty('width') && update.hasOwnProperty('height'))
              update.style = {
                width: update.width,
                height: update.height
              }
  
            next.set(change.newValue.id, {
              ...next.get(change.newValue.id),
              ...update
            })
          } 
          else if (change.action === 'delete')
          {
            next.delete(change.oldValue.id)
          }
        })

        return { nodeInternals: next}
      })
    }
     
    console.log("Observing", ykv)
    ykv.on('change', observer)

    return () => {
      console.log("Unobserving", ykv)
      ykv.off('change', observer)
    };
  }, [ykv]);

  return null
}

export function YkvProvider({ children, ...props }) {
  const storeRef = useRef()
  if (!storeRef.current) {
    storeRef.current = createSyncedFlowStore(props)
  }

  return (
    <FlowContext.Provider value={storeRef.current}>
      {children}
    </FlowContext.Provider>
  )
}

const selector = (state) => ({
  ykv: state.ykv,
  addNode: state.addNode,
  updateNode: state.updateNode,
  updateNodeData: state.updateNodeData,
  updateNodes: state.updateNodes,
  deleteNode: state.deleteNode,
  deleteAllNodes: state.deleteAllNodes,
})

export function useYkvContext(selectors=selector, compareFn=shallow) {
  const store = useContext(FlowContext)
  
  return useStore(store, selectors, compareFn);
}

export function useYkvFlowActions() {
  const ykvContext = useYkvContext()

  const throttledUpdateNode = throttle(ykvContext.updateNode, 50)
  const throttledUpdateNodes = throttle(ykvContext.updateNodes, 50)

  return {
    ...ykvContext,
    throttledUpdateNode,
    throttledUpdateNodes
  }
}