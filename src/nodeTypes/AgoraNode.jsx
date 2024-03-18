import { memo } from 'react'
import { BaseNode } from './BaseNode'
import styles from './AgoraNode.module.css'

/**
 * @param data.agora - agora id
 * @param data.space - space id (optional)
 * @param data.href - link to agora
 * @param data.link - image src
 */
export const AgoraNode = memo(({ data, id, type, selected}) => {
  const agoraId = data?.agora || data?.title
  const opts = data?.space ? { space: data?.space } : undefined
  return (
    <BaseNode data={data} id={id} type={type} selected={selected}>
      <div style={{height: '100%'}}>
        <div style={{height: '15px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000'}}>
          {agoraId}
        </div>
        <a title={`go to agora/${agoraId}`} href={data?.href} onClick={(e)=>{
          e.preventDefault()
          window.loadAgora(agoraId, opts)
        }}>
          <div className={styles.borderHover} style={{height: 'calc(100% - 15px)', padding: '15px', boxSizing: 'border-box', borderRadius: '5px', ...data?.style}}>
            <img src={data?.link} className="cover-img"></img>
          </div>
        </a>
      </div>
    </BaseNode>
  )
})