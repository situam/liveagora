import { TiptapTransformer } from '@hocuspocus/transformer'
import { generateHTML, generateJSON } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { PAD_TIPTAP_EXTENSIONS } from './components/Pad.jsx'
import { applyUpdate, encodeStateAsUpdate } from 'yjs'
import { prosemirrorJSONToYDoc } from 'y-prosemirror'
import { getSchema } from '@tiptap/core'

export const tiptap2json = (ydoc, fieldName) => TiptapTransformer.fromYdoc(ydoc, fieldName)

/*
  Output HTML from a Tiptap Ydoc.
  Params:
  - ydoc: Ydoc
  - fieldName: string
  - extensions: list of valid tiptap extensions
*/
export const tiptap2html = (ydoc, fieldName, extensions=[StarterKit, ...PAD_TIPTAP_EXTENSIONS]) => generateHTML(tiptap2json(ydoc, fieldName), extensions)

/*
  Generate a Tiptap Yxmlfragment from HTML
  Params:
  - html: string
  - ydoc: Agora Ydoc
  - fieldName: string
  Usage: html2tiptap("<p>example content</p>", AGORA_YDOC, PAD_ID)
*/
export const html2tiptap = (html, ydoc, fieldName, extensions=[StarterKit, ...PAD_TIPTAP_EXTENSIONS]) => {
  const json = generateJSON(html, extensions)

  const update = encodeStateAsUpdate(
    prosemirrorJSONToYDoc(getSchema(extensions), json, fieldName),
  )

  applyUpdate(ydoc, update)
}