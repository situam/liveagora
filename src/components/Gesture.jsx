import { useCallback, memo } from 'react'
import { gestureControlsEnabled } from '../AgoraApp'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'

/**
 * Renders a GestureLabel from JSON gesture:
 * {
 *   "title": string,
 *   "body": string || undefined,
 *   "date": string,
 *   "contributors": Array<string>,
 *   "published": bool // set true on post success
 * }
 */
export const GestureLabel = memo(({ id, gesture }) => {
    if (!id) throw new Error('Missing id')
    if (!gesture || !gesture.title || !gesture.date || !Array.isArray(gesture.contributors)) return null

    const { updateNodeData } = usePersistedNodeActions()

    const editField = useCallback((field, promptMessage, currentValue, processValue) => {
        if (!gestureControlsEnabled || gesture.published) return

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

    return (
        <div style={{ background: `${!gesture.published ? 'rgba(255,255,0,0.3)' : 'transparent'}` }}>
            <p onClick={editTitle}>{gesture.title}</p>
            {gesture.body && <p onClick={editBody}>{gesture.body}</p>}
            <p>
                <em>
                    <span onClick={editContributors}>{gesture.contributors.join(', ')}</span>
                    {gesture.contributors.length > 0 && gesture.date && ', '}
                    <span onClick={editDate}>{gesture.date}</span>
                </em>
            </p>
        </div>
    )
})