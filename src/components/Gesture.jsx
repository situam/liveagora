import { memo } from 'react'

/**
 * Renders a GestureLabel from JSON gesture:
 * {
 *   "title": string,
 *   "body": string || undefined,
 *   "date": string,
 *   "contributors": Array<string>
 * }
 */
export const GestureLabel = memo(({ gesture }) => {
    let title = gesture
    let contributors = []
    let date
    let body

    console.log("[GestureLabel]", gesture)

    try {
        const parsedGesture = JSON.parse(gesture)
        title = parsedGesture.title || gesture
        date = parsedGesture.date
        body = parsedGesture.body
        if (Array.isArray(parsedGesture.contributors)) {
            contributors = parsedGesture.contributors
        } else if (parsedGesture.contributors !== undefined) {
            contributors = [parsedGesture.contributors]
        }
    } catch (error) {
        //
    }

    return <RenderedGesture title={title} body={body} contributors={contributors} date={date} />
})


export function RenderedGesture({title, body, contributors, date}) {
    return (
        <div style={{marginTop: '11px', padding: '15px', width: 'fit-content', background: 'var(--theme-background)', border: '1px solid #000', borderRadius: '5px'}}>
            <h2>{title}</h2>
            {body && <p>{body}</p>}
            {(contributors.length>0 || date) &&
                <p style={{marginTop: '1em'}}><em>{contributors.map((el,idx)=>(idx>0?', ':'')+el)}{date ? ', date: '+date : ''}</em></p>
            }
        </div>
    )
}