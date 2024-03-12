import { useSpace } from '../context/SpaceContext'
import { useYkv } from '../hooks/useYkv'
import { usePan } from '../hooks/usePan'
import './SpaceNavigator.css'
import { updateUrlParam, UrlParam } from '../lib/navigate'

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
      <h2>SpaceNavigator</h2>
      <table>
        <tbody>
          <tr>
            <td>title</td>
            <td>date</td>
            {/*<td>type</td>*/}
          </tr>
        {
          ...filteredNodes.map((node)=>
            <tr onClick={()=>navigateToNode(node)}>
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
