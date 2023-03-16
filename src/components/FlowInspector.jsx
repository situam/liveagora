import { useStoreApi } from "reactflow";

export function FlowInspector() {
  const rfStore = useStoreApi()
  
  return <button onClick={()=>console.log(rfStore.getState())}>inspect flow</button>
}