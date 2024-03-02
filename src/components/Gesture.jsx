import { useCallback, memo } from 'react'
import { gestureControlsEnabled } from '../AgoraApp'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'

/**
 * Renders a GestureLabel from JSON gesture:
 * {
 *   "title": string,
 *   "body": string || undefined,
 *   "date": string,
 *   "contributors": Array<string>
 * }
 */
export const GestureLabel = memo(({ id, gesture }) => {
    if (!id)
        throw('missing id')

    if (!gesture || !gesture.title || !gesture.date || !Array.isArray(gesture.contributors))
        return null

    const { updateNodeData } = usePersistedNodeActions()

    const editTitle = useCallback(()=>{
        if (!gestureControlsEnabled) return
        let title = prompt('Enter gesture title:', gesture.title)
        if (!title)
            return
            
        updateNodeData(id, {gesture: {...gesture,title}})
    }, [gesture])
    const editBody = useCallback(()=>{
        if (!gestureControlsEnabled) return
        let body = prompt('Enter gesture body:', gesture.body)
        if (body == null)
            return
            
        updateNodeData(id, {gesture: {...gesture, body}})
    }, [gesture])
    const editDate = useCallback(()=>{
        if (!gestureControlsEnabled) return
        const getValidatedDate = (inputDate) => {
            let tempDate = inputDate;
            while (true) {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Basic format check
              if (dateRegex.test(tempDate)) {
                return tempDate;
              }
              tempDate = prompt('Invalid date. Enter gesture date (YYYY-MM-DD):', tempDate);
              if (tempDate == null) throw new Error('Date input cancelled');
            }
          };
        let date = prompt('Enter gesture date (YYYY-MM-DD):', gesture.date);
        try {
            date = getValidatedDate(date);
        } catch (error) {
            return;
        }
        
        updateNodeData(id, {gesture: {...gesture, date}})  
    }, [gesture])
    const editContributors = useCallback(()=>{
        if (!gestureControlsEnabled) return
        let contributorsString = prompt('Enter gesture contributors (comma separated list)', gesture.contributors)
        if (contributorsString == null)
            return
        let contributors = contributorsString.split(/\s*,+\s*/)
            
        updateNodeData(id, {gesture: {...gesture, contributors}})
    }, [gesture])
    
    return <>
        <p onClick={editTitle}>{gesture.title}</p>
        {gesture.body && <p onClick={editBody}>{gesture.body}</p>}
        <p><em>
            <span onClick={editContributors}>
                {gesture.contributors.join(', ')}
            </span>
            {gesture.contributors.length > 0 && gesture.date ? ', ' : ''}
            <span onClick={editDate}>
                {gesture.date}
            </span>
        </em></p>
    </>
})