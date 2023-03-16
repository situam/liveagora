import { useAgora } from "../context/AgoraContext"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'

import './Pad.css'

export const Pad = ({id}) => {
  const { ydoc } = useAgora()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: id
      }),
    ],
  })

  if (!editor)
    return null

  return (
    <EditorContent
      editor={editor}
      className={`pad`}
    />
  )
}