import { Link } from 'react-router-dom'
import { useAgora } from '../context/AgoraContext'
import PropTypes from 'prop-types'
import { useYkv } from '../hooks/useYkv'


function _commaSeparatedStringToArray(str) {
    if (!str) return []
    return str
        .split(',')
        .map(el=>
            el.trim()
        )
}

/**
 * 
 * @returns AgoraLinks in tab view, or null if less than 2 links
 */
export const AgoraLinks = () => {
    const agora = useAgora()
    const agoraMetadata = useYkv(agora.metadata)

    let agoraNames = _commaSeparatedStringToArray(
        agoraMetadata?.state?.linkedAgoras?.val
    )

    if (agoraNames.length < 2)
        return null

    return <>
        <hr className='tab-hr'/>
        <div className="app-tab-list">
            {agoraNames.map((agoraName)=>
                <AgoraLink agoraName={agoraName} key={agoraName}/>
            )}
        </div>
    </>
}

export const AgoraLink = ({ agoraName }) => {
    const {name} = useAgora()
    const isCurrent = agoraName === name

    return (
        <Link
            className={`app-tab ${isCurrent ? 'app-tab-selected' : ''}`}
            to={isCurrent ? '' : `/agora/${agoraName}`}
        >
            {agoraName}
        </Link>
    )
}
AgoraLink.propTypes = {
    agoraName: PropTypes.string.isRequired,
}