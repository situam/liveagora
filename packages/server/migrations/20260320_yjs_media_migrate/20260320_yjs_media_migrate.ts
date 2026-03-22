/*
20260320
Migrating media from Cloudflare Stream/Images to Bunny Stream and S3

Connects to each Yjs document for all spaces in all agoras,
finds media nodes (images and videos) that stored in Cloudflare Stream or Images
and migrates the media to S3 (for images) or Bunny Stream (for videos),
and updates the Yjs documents with the new URLs

Usage:

1. Copy .env.example to .env and set values
2. Run migration: node --env-file=.env 20260320_yjs_media_migrate.ts
*/

import { hc } from 'hono/client'
import type { ApiType } from '@liveagora/server/src/routes/routes.index.ts'
import { DocumentNames, VALID_SPACE_IDS, type AgoraPasswordsRow } from '@liveagora/common'
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue';
import { CloudflareStreamAPI } from '../common/CloudflareStreamAPI.ts';
import { BunnyStreamAPI } from '../common/BunnyStreamAPI.ts';
import { modifyProsemirrorJSON } from '../../src/util/tiptap.ts';

const client = hc<ApiType>(process.env.LIVEAGORA_SERVER_URL)
export const apiClient = client[process.env.LIVEAGORA_SERVER_BASE]

const cloudflareStreamApi = new CloudflareStreamAPI(
  process.env.CF_ACCOUNT_ID!,
  process.env.CF_API_TOKEN!
)
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

    for (const spaceId of VALID_SPACE_IDS) {
      console.log(`  ${spaceId}`)
      const spaceDocName = DocumentNames.buildSpaceDoc(agoraId, spaceId)
    
      await processSpace(spaceDocName)
    }
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
        console.log(ydoc.toJSON())
        const ykv = new YKeyValue(ydoc.getArray('nodes'))

        await ydoc.transact(async () => {
          
          // migrate images referenced in prosemirror JSON (sidebar images)
          for (const key of Object.keys(ydoc.toJSON())) {
            if (key.includes('post-for-node.')) {
              console.log(`  Found sidebar: ${key}`)
              //logProsemirrorJSON(ydoc, key)
              await modifyProsemirrorJSON(async (json) => {
                console.log(JSON.stringify(json, null, 2))
                let changed = false

                for (const el of json.content || []) {
                  if (el.type === 'image' && typeof el.attrs?.src === 'string' && el.attrs.src.includes(process.env.CF_ACCOUNT_HASH!)) {
                    console.log(`    Found Cloudflare image in sidebar ${key}: ${el.attrs.src}`)

                    const newUrl = await migrateCloudflareImageToS3(el.attrs.src)

                    el.attrs.src = newUrl
                    console.log(`      Migrated Cloudflare image to ${newUrl}`)
                    changed = true
                  }
                }
                
                if (!changed) return false
                return json
              }, ydoc, key)
            }
          }

          // migrate media referenced in image and video nodes
          for (const [key, value] of ykv.map) {
            const node = ykv.get(key)

            if (node?.type === 'image') {
              if (node.data.link.includes(process.env.CF_ACCOUNT_HASH)) {
                const newUrl = await migrateCloudflareImageToS3(node.data.link, key)
                console.log(`      Migrated Cloudflare image from ${node.data.link} to ${newUrl}`)

                node.data.link = newUrl
                ykv.set(key, node)
              }
            }

            if (node?.type === 'video' && node.data?.hls) {
              const hls = node.data.hls as string

              // match https://customer-zfntyssyigsp3hnq.cloudflarestream.com/<videoId>/manifest/video.m3u8
              const match = hls.match(/cloudflarestream\.com\/([a-f0-9]{32})\//)
              if (match) {
                const cfVideoId = match[1]
                
                // first pass:
                // generate video link and get video name from cloudflare stream
                console.log(`    ${key}: Found Cloudflare Stream video with ID ${cfVideoId}`)
                const mp4Url = await cloudflareStreamApi.generateMp4Download(cfVideoId)
                console.log(`      Generated MP4 URL: ${mp4Url}`)

                // second pass:
                const videoName = await cloudflareStreamApi.getVideoName(cfVideoId)
                console.log(`    ${key}: ${videoName} (${mp4Url})`)

                // migrate to bunny stream
                const bunnyVideoId = await bunnyStreamApi.fetchVideo(mp4Url, videoName)
                console.log(`      Migrated video to Bunny Stream with ID ${bunnyVideoId}`)
                if (bunnyVideoId) {
                  console.log(`      Generated Bunny Stream HLS URL: ${bunnyStreamApi.buildHlsUrl(bunnyVideoId)}`)
                  // update node
                  node.data.hls = bunnyStreamApi.buildHlsUrl(bunnyVideoId)
                  ykv.set(key, node)
                }
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


async function migrateCloudflareImageToS3(url: string, filename: string | undefined = undefined): Promise<string> {
  function getCfImageId(url) {
    const { pathname } = new URL(url);
    const parts = pathname.split("/").filter(Boolean);
    return parts[1]; // [account_hash, image_id, variant]
  }

  const id = getCfImageId(url);
  console.log(`      Migrating Cloudflare image ${id} from ${url}`)
  
  //const res = await fetch(url)
  
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/images/v1/${id}/blob`,
    {
      headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`},
    }
  );
  if (!res.ok) {
    throw new Error(`Failed: ${res.status}`);
  }

  const mimeType = res.headers.get("content-type")?.split(";")[0];
  //const fileExtension = mimeType ? mimeType.split("/")[1] : "jpg";

  const buffer = Buffer.from(await res.arrayBuffer());
  //const actualFilename = `${filename}.${fileExtension}`
  //await writeFile(actualFilename, buffer);


  //console.log(`      Downloaded Cloudflare image to ${actualFilename}`)

  const agoraUploadReq = await fetch(`${process.env.LIVEAGORA_SERVER_URL}${process.env.LIVEAGORA_SERVER_BASE}/getObjectStorageUploadUrl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: filename || id,
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