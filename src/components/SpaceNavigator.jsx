import { useSpace } from '../context/SpaceContext'
import { useYkv } from '../hooks/useYkv'
import { usePan } from '../hooks/usePan'

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

  return (
    <div className="form">
      <h2>Gesture Navigator</h2>
      <table>
      {
        ...sortedGestures.map((node)=>
          <tr onClick={()=>panToNode(node, 0)}>
            <td>{node.data?.gesture.title}</td>
            <td><em>{node.data?.gesture.date}</em></td>
          </tr>
        )
      }
      </table>
    </div>
  )
}
