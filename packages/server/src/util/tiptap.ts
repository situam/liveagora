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