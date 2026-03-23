/*
20260320
Migrating media from Pocketbase to Bunny Stream and S3

Connects to each Yjs document for all spaces in all agoras,
finds media stored in Pocketbase (images, videos, sounds),
and migrates the media to S3 (for images and sounds) or Bunny Stream (for videos),
and updates the Yjs documents with the new URLs

Usage:

1. Copy .env.example to .env and set values
2. Run migration: node --env-file=.env 20260323_yjs_media_migrate.ts
*/

import { hc } from 'hono/client'
import type { ApiType } from '@liveagora/server/src/routes/routes.index.ts'
import { DocumentNames, VALID_SPACE_IDS, type AgoraPasswordsRow } from '@liveagora/common'
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue';
import { BunnyStreamAPI } from '../common/BunnyStreamAPI.ts';

const client = hc<ApiType>(process.env.LIVEAGORA_SERVER_URL)
export const apiClient = client[process.env.LIVEAGORA_SERVER_BASE]

const bunnyStreamApi = new BunnyStreamAPI(
  process.env.BUNNY_VIDEO_LIBRARY_ID!,
  process.env.BUNNY_VIDEO_LIBRARY_API_KEY!,
  process.env.BUNNY_VIDEO_LIBRARY_PULL_ZONE!
)

async function main() {
  let res = await apiClient.admin.agoras.$get({}, {
    headers: {
      Authorization: `Basic ${btoa(`admin:${process.env.ADMIN_PASSWORD}`)}`
    }
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  let agoraRows: AgoraPasswordsRow[] = await res.json()
  for (const row of agoraRows) {
    const agoraId = DocumentNames.parseAgoraIdFromDocName(row.id)
    
    console.log(agoraId)

    const promises = VALID_SPACE_IDS.map((spaceId) => {
      const spaceDocName = DocumentNames.buildSpaceDoc(agoraId, spaceId)
      return processSpace(spaceDocName)
    })

    await Promise.all(promises)
  }
}

async function processSpace(spaceDocName: string) {
  return new Promise<void>((resolve, reject) => {
    const ydoc = new Y.Doc()

    const provider = new HocuspocusProvider({
      document: ydoc,
      name: spaceDocName,
      token: process.env.ADMIN_PASSWORD,
      url: process.env.LIVEAGORA_SERVER_URL + process.env.LIVEAGORA_SERVER_BASE + '/hocuspocus',
      onSynced: async () => {
        //console.log(ydoc.toJSON())
        const ykv = new YKeyValue(ydoc.getArray('nodes'))

        await ydoc.transact(async () => {
          
          // migrate media referenced in image and video and sound nodes
          for (const [key, value] of ykv.map) {
            const node = ykv.get(key)

            if ((node?.type === 'sound' || node?.type === 'image') && node.data?.link) {
              if (!node.data?.link.includes('https://s3.nl-ams.scw.cloud')) {
                console.log(`  ${spaceDocName}/${key}: ${node.data.link}`)
                const newUrl = await migrateUrlToS3(node.data.link)
                node.data.link = newUrl
                ykv.set(key, node)
              }
            }

            if (node?.type === 'video' && node.data?.link) {
              console.log(`  ${spaceDocName}/${key}: ${node.data.link}`)

              // migrate to bunny stream
              const filename = node.data.link.split("/").pop() || `video-${Date.now()}`
              const bunnyVideoId = await bunnyStreamApi.fetchVideo(node.data?.link, filename)
              console.log(`      Migrated video to Bunny Stream with ID ${bunnyVideoId}`)
              if (bunnyVideoId) {
                console.log(`      Generated Bunny Stream HLS URL: ${bunnyStreamApi.buildHlsUrl(bunnyVideoId)}`)
                // update node
                delete node.data.link
                node.data.hls = bunnyStreamApi.buildHlsUrl(bunnyVideoId)
                ykv.set(key, node)
              }
            }
          }
        })

        provider.destroy()
        resolve()
      },
      onAuthenticationFailed: () => reject(new Error('Authentication failed for ' + spaceDocName)),
    })
  })
}


async function migrateUrlToS3(url: string, filename: string | undefined = undefined): Promise<string> {
  if (!filename) {
    filename = url.split("/").pop() || `file-${Date.now()}`
  }
  
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed: ${res.status}`);
  }

  const mimeType = res.headers.get("content-type")?.split(";")[0]

  console.log(`    [migrateUrlToS3] Migrating ${url} to S3; filename: ${filename}, mimeType: ${mimeType}`)

  const buffer = Buffer.from(await res.arrayBuffer());

  const agoraUploadReq = await fetch(`${process.env.LIVEAGORA_SERVER_URL}${process.env.LIVEAGORA_SERVER_BASE}/getObjectStorageUploadUrl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: filename,
      contentType: mimeType
    }),
  })
  if (!agoraUploadReq.ok) throw new Error(`getUploadUrl failed with status ${agoraUploadReq.status}`)
  const { uploadUrl, objectUrl } = await agoraUploadReq.json()

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType
    },
    body: buffer
  })
  if (!uploadRes.ok) throw new Error(`Upload failed with status ${uploadRes.status}`)
  
  return objectUrl
}


main()