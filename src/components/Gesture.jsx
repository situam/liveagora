import { useCallback, memo } from 'react'
import { gestureControlsEnabled } from '../AgoraApp'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'

/**
 * Enum for gesture status values.
 * 
 * @enum {string}
 * @property {string} draft
 * @property {string} archiving
 * @property {string} archived
 */
export const GestureStatus = {
    draft: 'draft',
    archiving: 'archiving',
    archived: 'archived'
}

/**
 * Renders a GestureLabel from JSON gesture:
 * {
 *   "title": string,
 *   "body": string || undefined,
 *   "date": string,
 *   "contributors": Array<string>,
 *   "status": GestureStatus
 * }
 */
export const GestureLabel = memo(({ id, gesture }) => {
    if (!id) throw new Error('Missing id')
    if (!gesture || !gesture.title || !gesture.date || !Array.isArray(gesture.contributors)) return null

    const { updateNodeData } = usePersistedNodeActions()

    const editField = useCallback((field, promptMessage, currentValue, processValue) => {
        if (!gestureControlsEnabled || gesture.status==GestureStatus.archived) return

        let value = prompt(promptMessage, currentValue)
        if (value == null) return
        if (processValue) value = processValue(value)
        updateNodeData(id, { gesture: { ...gesture, [field]: value } })
    }, [gesture])

    const editTitle = () => editField('title', 'Enter gesture title:', gesture.title)
    const editBody = () => editField('body', 'Enter gesture body:', gesture.body)
    const editDate = () => {
        const getValidatedDate = (inputDate) => {
            let tempDate = inputDate;
            while (true) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (dateRegex.test(tempDate)) return tempDate;
                tempDate = prompt('Invalid date. Enter gesture date (YYYY-MM-DD):', tempDate);
                if (tempDate == null) throw new Error('Date input cancelled');
            }
        }
        editField('date', 'Enter gesture date (YYYY-MM-DD):', gesture.date, getValidatedDate);
    }
    const editContributors = () => editField('contributors', 'Enter gesture contributors (comma separated list)', gesture.contributors, (value) => value.split(/\s*,+\s*/))

    const divStyle = gesture.status==GestureStatus.archived ? { borderLeft : '1px solid #00ff00', paddingLeft: '4px'} : {}
    return (
        <div style={divStyle}>
            <p onClick={editTitle}>{gesture.title}</p>
            {gesture.body && <p onClick={editBody}>{gesture.body}</p>}
            <p>
                <em>
                    <span onClick={editContributors}>{gesture.contributors.join(', ')}</span>
                    {gesture.contributors.length > 0 && gesture.date && ', '}
                    <span onClick={editDate}>{gesture.date}</span>
                </em>
            </p>
            {
                gesture.status != GestureStatus.archived &&
                <em style={{fontSize: '0.8em', borderRadius: '5px', background: 'rgba(255,255,0,0.6)'}}>
                    GestureStatus: {gesture.status}
                </em>
            }
        </div>
    )
})