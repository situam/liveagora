import * as Y from 'yjs'
import { TiptapTransformer } from '@hocuspocus/transformer'
import { prosemirrorJSONToYDoc } from 'y-prosemirror'
import { getSchema, type Extensions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'

// TODO: pull these from frontend
const PAD_TIPTAP_EXTENSIONS = [
  TextStyle,
  Color
];
const SIDEBAR_EXTENSIONS = [
  Image.configure({
    HTMLAttributes: {
      class: 'sidebar-image',
    },
  }),
]
const TABLE_EXTENSIONS = [
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
]
const tiptapExtensions = [
  StarterKit,
  ...PAD_TIPTAP_EXTENSIONS,
  ...SIDEBAR_EXTENSIONS,
  ...TABLE_EXTENSIONS
]

export function logProsemirrorJSON(
  ydoc: Y.Doc,
  field: string,
) {
  const prosemirrorJSON = TiptapTransformer.fromYdoc(ydoc, field)
  console.log(JSON.stringify(prosemirrorJSON, null, 2))
}

export async function modifyProsemirrorJSON(
  mutate: (json) => Promise<any>,
  ydoc: Y.Doc,
  field: string,
  extensions: Extensions = tiptapExtensions
) {
  const prosemirrorJSON = TiptapTransformer.fromYdoc(ydoc, field)

  const modifiedJSON = await mutate(prosemirrorJSON)
  
  // false or null indicates no changes -> skip applying the update
  if (!modifiedJSON) {
    return
  }

  // clear existing content
  ydoc.getXmlFragment(field).delete(0, ydoc.getXmlFragment(field).length)

  // apply update with modified content
  const update = Y.encodeStateAsUpdate(
    prosemirrorJSONToYDoc(
      getSchema(extensions),
      modifiedJSON,
      field
    )
  )
  Y.applyUpdate(ydoc, update)
}

export function clonePadData(
  fromDoc: Y.Doc,
  fromField: string,
  toDoc: Y.Doc,
  toField: string,
  extensions: Extensions = tiptapExtensions
) {
  const prosemirrorJSON = TiptapTransformer.fromYdoc(fromDoc, fromField)
  const update = Y.encodeStateAsUpdate(
    prosemirrorJSONToYDoc(
      getSchema(extensions),
      prosemirrorJSON,
      toField
    )
  )
  Y.applyUpdate(toDoc, update)
}