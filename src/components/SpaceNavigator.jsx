import { useSpace } from '../context/SpaceContext'
import { useYkv } from '../hooks/useYkv'
import { usePan } from '../hooks/usePan'
import './SpaceNavigator.css'
import { updateUrlParam, UrlParam } from '../lib/navigate'

const _sortNodeGestureByTitle = (a, b) => a.data?.gesture?.title?.localeCompare(b.data?.gesture?.title, undefined, { sensitivity: 'base' })
const _sortNodeGestureByDate = (a, b) => a.data?.gesture?.date?.localeCompare(b.data?.gesture?.date, undefined, { sensitivity: 'base' })

/**
 * SpaceNavigator as a directory of Gestures
 * 
 * status: a table of gestures is displayed, sorted by date
 * 
 * | gesture.title | gesture.date |
 * 
 * clicking on the row of a gesture pans the viewport to that gesture
 */
export const SpaceNavigator = () => {
  const { ykv } = useSpace()
  const { state } = useYkv(ykv) /** subscribe to space nodes ykv */
  const { panToNode } = usePan()

  const sortedGestures =
    Array.from(Object.values(state))
      .map(el=>el.val)
      .filter(node=>node.data?.gesture)
      .sort(_sortNodeGestureByDate)

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
          ...sortedGestures.map((node)=>
            <tr onClick={()=>navigateToNode(node)}>
              <td>{node.data?.gesture.title}</td>
              <td><em>{node.data?.gesture.date}</em></td>
            </tr>
          )
        }
        </tbody>
      </table>
    </div>
  )
}
