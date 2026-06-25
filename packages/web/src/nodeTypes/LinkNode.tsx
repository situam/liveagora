import { memo } from 'react'
import { BaseNode } from './BaseNode'
import { Link } from 'react-router-dom'
import { useSpace } from '../context/SpaceContext'
import { UrlParam } from '../lib/navigate'

export type LinkNodeData = {
  href: string,
}

/**
 * @param data.href
 */
export const LinkNode = memo(({ data, id, type, selected}: {
  data: LinkNodeData,
  id: string,
  type: string,
  selected: boolean,
}) => {
  const space = useSpace()

  let href = data?.href
  // if presence is enabled here, also enable it there
  if (!space?.enableArchiveView && href) {
    const url = new URL(href, window.location.origin)
    url.searchParams.set(UrlParam.Presence, '')
    href = url.pathname + url.search + url.hash
  }

  return (
    <BaseNode data={data} id={id} type={type} selected={selected}>
      <div style={{height: '100%'}}>
        <Link to={href}>
          {data?.href}
        </Link>
      </div>
    </BaseNode>
  )
})