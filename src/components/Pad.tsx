import { padOptions } from "../AgoraApp"
import { PadToolbar } from './PadToolbar'
import * as Y from 'yjs';

import { AnyExtension, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { TextStyle, Color } from "@tiptap/extension-text-style";

import './Pad.css'
import Image from "@tiptap/extension-image";

export const PAD_TIPTAP_EXTENSIONS = [
  TextStyle,
  Color
];

export const SIDEBAR_EXTENSIONS = [
  Image.configure({
    HTMLAttributes: {
      class: 'sidebar-image',
    },
  }),
]

export const TABLE_EXTENSIONS = [
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
]

type TablePadProps = {
  ydoc: Y.Doc
  id: string
  editable: boolean
}
export const TablePad = ({ydoc, id, editable}: TablePadProps) => {
  const editor = useEditor({
    editable: editable,
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: id
      }),
      // OrderedList,
      ...TABLE_EXTENSIONS,
    ],
  })

  if (!editor) 
    return null

  return <EditorContent editor={editor} className={`pad`}/>
}

type PadProps = {
  ydoc: Y.Doc
  id: string
  outsideFlow: boolean
  editable: boolean
  extensions?: AnyExtension[]
}
export const Pad = ({ydoc, id, outsideFlow, editable, extensions = []}: PadProps) => {
  const editor = useEditor({
    editable: editable,
    extensions: [
      ...extensions,
      StarterKit.configure({
        undoRedo: false,
        paragraph: {
          HTMLAttributes: {
            class: 'nodrag nopan' // let text be selected, not node dragged
          }
        },
        link: {
          autolink: padOptions.autolink
        }
      }),
      Collaboration.configure({
        document: ydoc,
        field: id
      }),
      ...PAD_TIPTAP_EXTENSIONS
    ],
  }, [id])

  if (!editor)
    return null

  if (editor.isEditable !== editable) {
    editor.setEditable(editable) // needed since not reactive
  }

  return <>
    {(!outsideFlow && editable) && <PadToolbar editor={editor}/>}
    <EditorContent
      editor={editor}
      className={`pad`}
    />
  </>
}