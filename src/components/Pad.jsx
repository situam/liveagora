import { useAgora } from "../context/AgoraContext"
import { backstageEnabled, padOptions } from "../AgoraApp"
import { PadToolbar } from './PadToolbar'

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { TextStyle, Color } from "@tiptap/extension-text-style";

import './Pad.css'

export const PAD_TIPTAP_EXTENSIONS = [
  TextStyle,
  Color
];

export const TablePad = ({id, publicEditable='true'}) => {
  const { ydoc } = useAgora()

  const editor = useEditor({
    editable: backstageEnabled || publicEditable,
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: id
      }),
      // OrderedList,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
  })

  if (!editor) 
    return null

  return <EditorContent editor={editor} className={`pad`}/>
}

export const Pad = ({id, outsideFlow, editable, extensions = []}) => {
  const { ydoc } = useAgora()

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