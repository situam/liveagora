/*
Usage:

1. Copy .env.example to .env and set passwords
2. Run migration: node --env-file=.env migrate.ts

*/

import * as Y from 'yjs'
import { YKeyValue } from 'y-utility/y-keyvalue'
import sqlite3 from 'sqlite3'
import { setAgoraPasswordsRow } from '../../repo/agoraPasswords.ts'
import { initializeDatabase } from '../../db.ts'
import { setSpacePasswordsRow } from '../../repo/spacePasswords.ts'
import { clonePadData } from '../../util/tiptap.ts'
import { DocumentNames } from '@liveagora/common'

if (
  typeof process.env.DEFAULT_AGORA_READ_PASSWORD !== 'string'
  || typeof process.env.DEFAULT_AGORA_EDIT_PASSWORD !== 'string'
  || typeof process.env.DEFAULT_SPACE_EDIT_PASSWORD !== 'string'
) {
  console.error("Missing required environment variables!")
  process.exit(1)
}

const INPUT_PATH = '../db_backup_20251113.sqlite'
const OUTPUT_PATH = 'db.sqlite'

// Delete existing migrated DB file if it exists
const fs = await import('fs')
try {
  fs.unlinkSync(OUTPUT_PATH)
} catch (err) {
  // ignore
}

const db = new sqlite3.Database(INPUT_PATH)
const migratedDb = new sqlite3.Database(OUTPUT_PATH)

function loadYDocFromDb(documentName: string): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT data FROM documents WHERE name = ?', [documentName], (err, row: { data: Uint8Array } | undefined) => {
      if (err) return reject(err)
      if (!row) return resolve(null)
      resolve(row.data)
    })
  })
}

function saveYDocToMigratedDb(documentName: string, ydoc: Y.Doc): Promise<void> {
  console.log(`[saveYDocToMigratedDb] ${documentName}`)
  return new Promise((resolve, reject) => {
    const data = Y.encodeStateAsUpdate(ydoc)
    migratedDb.run(
      `INSERT OR REPLACE INTO documents (name, data) VALUES (?, ?)`,
      [documentName, data],
      err => (err ? reject(err) : resolve())
    )
  })  
}

// Ensure the migrated DB has the same schema
migratedDb.serialize(() => {
  migratedDb.run(`CREATE TABLE IF NOT EXISTS documents (
    name TEXT PRIMARY KEY,
    data BLOB
  )`)
})

// Main migration logic
async function migrateAgora(agoraDocName: string) {
  // TODO: we should probably pre-process/clean up any docs that are not valid Agoras
  console.log(`Migrating Agora: ${agoraDocName}`)

  const data = await loadYDocFromDb(agoraDocName)
  if (!data) {
    console.warn(`No data found for ${agoraDocName}`)
    return
  }

  const ydoc = new Y.Doc()
  Y.applyUpdate(ydoc, data)
/*
  // Log all top-level keys and their types
  for (const [key, value] of ydoc.share.entries()) {
    console.log(`Key: ${key}, Type: ${value.constructor.name}`)
  }

  // Log Agora metadata (if present)
  if (ydoc.share.has('metadata')) {
    const meta = ydoc.getArray('metadata')
    console.log('Agora metadata:', meta.toJSON())
  }

  // Log all spaceXX.metadata and spaceXX.nodes
  for (const [key, value] of ydoc.share.entries()) {
    if (/^space\d\d\.metadata$/.test(key) || /^space\d\d\.nodes$/.test(key)) {
      const newKey = key.split('.').pop() // 'metadata' or 'nodes'
      console.log(`Space doc candidate: ${key} (will become '${newKey}')`)
      
      const data = ydoc.getArray(key)
      console.log(data.toJSON())
    }
  }

  // For each spaceXX.nodes, parse for referenced PadNode_/pad_ keys
  for (const [key, value] of ydoc.share.entries()) {
    if (/^space\d\d\.nodes$/.test(key)) {
      const nodesArr = ydoc.getArray(key)
      const nodes = nodesArr.toJSON() as any[]
      const padNodeIds: string[] = []
      for (const node of nodes) {
        if (node && node.val && node.val.type === 'PadNode' && typeof node.val.id === 'string') {
          padNodeIds.push(node.val.id)
        }
      }
      if (padNodeIds.length > 0) {
        console.log(`In ${key}, found referenced PadNode ids:`, padNodeIds)
      }
    }
  }
*/

  // Get a set of spaceIds used (i.e. "00".."05")
  const spaceIds = new Set<string>()
  for (const key of ydoc.share.keys()) {
    const match = key.match(/^space(\d\d)\./)
    if (match) spaceIds.add(match[1])
  }

  // 1. Migrate Agora metadata doc (if present)
  if (ydoc.share.has('metadata')) {
    const newAgoraId = DocumentNames.buildAgoraDoc(agoraDocName)

    const metaArr = ydoc.getArray<{key: string, val: unknown}>('metadata')
    const metadataYkv = new YKeyValue(metaArr)

    // Migrate "passwordEnabled" 
    await setAgoraPasswordsRow({
      id: newAgoraId,
      read_password: metadataYkv.get("passwordEnabled") === true
        ? process.env.DEFAULT_AGORA_READ_PASSWORD
        : null,
      edit_password: process.env.DEFAULT_AGORA_EDIT_PASSWORD
    })

    // cleanup
    metadataYkv.delete("passwordEnabled")

    for (const spaceId of spaceIds) {
      const editPw = metadataYkv.get(`space${spaceId}-publicEditable`)
        ? null
        : (metadataYkv.get(`space${spaceId}-editPw`) || process.env.DEFAULT_SPACE_EDIT_PASSWORD)

      setSpacePasswordsRow({
        id: DocumentNames.buildSpaceDoc(agoraDocName, `space${spaceId}`),
        edit_password: editPw as string
      })

      // cleanup
      metadataYkv.delete(`space${spaceId}-publicEditable`)
      metadataYkv.delete(`space${spaceId}-editPw`)
    }

    // Build and save agora ydoc row
    const agoraDoc = new Y.Doc()

    // Migrate infopage pads
    for (const field of ["infopage.0", "infopage.1"]) {
      if (ydoc.share.has(field)) {
        clonePadData(ydoc, field, agoraDoc, field)
      }
    }
    
    console.log('New agora metadata:', metaArr.toJSON())
    agoraDoc.getArray('metadata').push(metaArr.toArray())
    await saveYDocToMigratedDb(
      newAgoraId,
      agoraDoc
    )
  }

  // 2. For each spaceXX, save a new doc with metadata, nodes, and referenced pads
  for (const spaceId of spaceIds) {
    const spaceDoc = new Y.Doc()
    // Copy metadata
    const metaKey = `space${spaceId}.metadata`
    if (ydoc.share.has(metaKey)) {
      const arr = ydoc.getArray(metaKey)
      spaceDoc.getArray('metadata').push(arr.toArray())
    }
    // Copy nodes
    const nodesKey = `space${spaceId}.nodes`
    let tiptapIds: string[] = []

    if (ydoc.share.has(nodesKey)) {
      const arr = ydoc.getArray(nodesKey)

      spaceDoc.getArray('nodes').push(arr.toArray())
      // Find referenced PadNode ids
      const nodes = arr.toJSON() as any[]
      tiptapIds = nodes.filter(n => n && n.val && n.val.type === 'PadNode' && typeof n.val.id === 'string').map(n => n.val.id)
    
      // Also find referenced "post-for-node" (node sidebar)
      const nodeSidebarPads = nodes.filter(n => n && n.val && typeof n.val.id === 'string' && ydoc.share.has(`post-for-node.${n.val.id}`)).map(n => `post-for-node.${n.val.id}`)
      tiptapIds = [...tiptapIds, ...nodeSidebarPads]
    }
    // Copy referenced pads (only handle Y.XmlFragment)
    for (const padId of tiptapIds) {
      if (ydoc.share.has(padId)) {
        console.log(`Copy tiptap id: ${padId}`)
        clonePadData(ydoc, padId, spaceDoc, padId)
      }
    }
    // Copy tags (i.e. "space00.tags" to "tags")
    const tagsKey = `space${spaceId}.tags`
    if (ydoc.share.has(tagsKey)) {
      const arr = ydoc.getArray(tagsKey)
      spaceDoc.getArray("tags").push(arr.toArray())
    }

    // Migrate sidebar (i.e. "pad.space-sidebar.space00")
    const padSpaceSidebarId = `pad.space-sidebar.space${spaceId}`
    const newPadSpaceSidebarId = "pad.space-sidebar"
    if (ydoc.share.has(padSpaceSidebarId)) {
      console.log(`Found padSpaceSidebar: ${padSpaceSidebarId}`)
      clonePadData(ydoc, padSpaceSidebarId, spaceDoc, newPadSpaceSidebarId)
    }

    await saveYDocToMigratedDb(
      DocumentNames.buildSpaceDoc(agoraDocName, `space${spaceId}`),
      spaceDoc)
  }

  console.log('--- End of migration log for', agoraDocName, '---')
}


async function migrateAll() {
  db.all('SELECT name FROM documents', async (err, rows: { name: string }[]) => {
    if (err) throw err
    for (const row of rows) {
      await migrateAgora(row.name)
    }
    db.close()
    console.log('Migration complete.')
  })
}


initializeDatabase(OUTPUT_PATH)

//migrateAgora("residencies")
migrateAll().catch(console.error)