import { useSpace } from '../context/SpaceContext'
import { useYkv } from '../hooks/useYkv'
import { usePan } from '../hooks/usePan'
import './SpaceNavigator.css'
import { updateUrlParam, UrlParam } from '../lib/navigate'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { useStoreApi } from 'reactflow'
import { useCallback } from 'react'
import { TagPost } from './Posts'

const _sortNodesByTitle = (a, b) => a.data?.title?.localeCompare(b.data?.title, undefined, { sensitivity: 'base' })
const _sortNodesByDate = (a, b) => a.data?.date?.localeCompare(b.data?.date, undefined, { sensitivity: 'base' })

/**
 * SpaceNavigator as a directory of Nodes with metadata
 * 
 * status: a table of nodes is displayed, sorted by title
 * 
 * | title | date |
 * 
 * clicking on a row pans the viewport to that node and updates the url
 */
export const SpaceNavigator = () => {
  const { ykv } = useSpace()
  const { state } = useYkv(ykv) /** subscribe to space nodes ykv */
  const { panToNode } = usePan()

  const selectedSortFn = _sortNodesByTitle // TODO make dynamic

  const filteredNodes =
    Array.from(Object.values(state))
      .map(el=>el.val)
      .filter(node=>node.data?.title)
      .sort(selectedSortFn)

  const navigateToNode = (node) => {
    updateUrlParam(UrlParam.Node, node.id)
    panToNode(node, 0)
  }

  return (
    <div className="SpaceNavigator">
      <h2>Gestures</h2>
      <table>
        <tbody>
        {
          filteredNodes.map((node,i)=>
            <tr key={i} onClick={()=>navigateToNode(node)}>
              <td>{node.data?.title}</td>
              <td><em>{node.data?.date}</em></td>
              {/*<td><em>{node.type}</em></td>*/}
            </tr>
          )
        }
        </tbody>
      </table>
    </div>
  )
}


export const TagVisibilityToggle = ({ tagKey }) => {
  const space = useSpace()
  const tagKv = useYkv(space.tags)

  return <input type="checkbox" checked={!tagKv.state[tagKey]?.val} onChange={(e)=>{
    console.log("TagVisibilityToggle: onChange", e.target.checked)
    tagKv.ykv.set(tagKey, !e.target.checked)
  }}/>
}

/**
 * TagNavigator as a directory of tags
 * 
 * status: a list of tags is displayed, and a show/hide checkbox next to it
 * 
 * clicking on the checkbox toggles visibility
 */
export const TagNavigator = () => {
  const { ykv } = useSpace()
  const { state } = useYkv(ykv) /** subscribe to space nodes ykv */

  const tags = Array.from(Object.values(state))
    .map(el => el.val)
    .flatMap(node => node.data?.tags ?? []) // flatten
    .filter((tag, index, self) => self.indexOf(tag) === index) // deduplicate
    .sort()

  if (tags.length < 1)
    return null

  return (
      <ul>
        {
          tags.map((tag,i)=>
            <li key={i} onClick={()=>{}}>
              {tag} <TagVisibilityToggle tagKey={tag}/>
            </li>
          )
        }
      </ul>
  )
}