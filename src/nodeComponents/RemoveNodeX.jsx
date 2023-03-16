import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'

export function RemoveNodeX({id}) {
  const { deleteNode } = usePersistedNodeActions()
  return <a style={{float: 'right', paddingRight: 5, color: '#0f0'}} onClick={()=>deleteNode(id)}>x</a>    
}