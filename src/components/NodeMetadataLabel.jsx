import { useCallback, memo } from 'react'
import { usePersistedNodeActions } from '../hooks/usePersistedNodeActions'
import { useAccessControl } from '../context/AccessControlContext'

export const NodeMetadataLabel = memo(({ id, data }) => {
  if (!id) throw new Error('Missing id')
  if (!data) return null
  if (!data.title && !data.body && !data.contributors && !data.date) return null // nothing to show

  const { updateNodeData } = usePersistedNodeActions()
  const { currentRole } = useAccessControl()

  const canEditField = currentRole.canEdit

  const editField = useCallback((field, promptMessage, currentValue, processValue) => {
      if (!canEditField) return

      let value = prompt(promptMessage, currentValue)
      if (value == null) return
      if (processValue) value = processValue(value)
      updateNodeData(id, { [field]: value })
  }, [data, canEditField])

  const editTitle = () => editField('title', 'Enter title:', data.title)
  const editBody = () => editField('body', 'Enter body:', data.body)
  const editDate = () => {
      const getValidatedDate = (inputDate) => {
          let tempDate = inputDate;
          while (true) {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (dateRegex.test(tempDate)) return tempDate;
              tempDate = prompt('Invalid date. Enter date (YYYY-MM-DD):', tempDate);
              if (tempDate == null) throw new Error('Date input cancelled');
          }
      }
      editField('date', 'Enter date (YYYY-MM-DD):', data.date, getValidatedDate);
  }
  const editContributors = () => editField('contributors', 'Enter contributors (comma separated list)', data.contributors, (value) => value.split(/\s*,+\s*/))

  return (
    <div>
      {
        data.title &&
        <h2 onClick={editTitle}>
          {
            data.href
              ? <a href={data.href} target="_blank">{data.title}</a>
              : data.title
          }
        </h2>
      }
      {
        data.body &&
        <p onClick={editBody}>
          {data.body}
        </p>
      }
      {
        (data.contributors || data.date) &&
        <p>
          <em>
            {
              data.contributors && <>
                <span onClick={editContributors}>{data.contributors.join(', ')}</span>
                {data.contributors.length > 0 && data.date && ', '}
              </>
            }
            {
              data.date &&
                <span onClick={editDate}>{data.date}</span>
            }
          </em>
        </p>
      }
    </div>
  )
})