import { useCallback, useEffect, useState, memo } from 'react'
import { NodeToolbar, Position } from 'reactflow'
import { useAgora } from "../context/AgoraContext"
import { useSpace } from "../context/SpaceContext"
import { backstageEnabled } from "../AgoraApp"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import './Pad.css'

export const PAD_TIPTAP_EXTENSIONS = [
  Link,
  TextStyle,
  Color
];

const PadToolbar = memo(({editor}) => {
  const [showToolbar, setShowToolbar] = useState(false)
  const toolbarLinkEnabled = backstageEnabled;

  useEffect(()=>{
    if (!editor)
      return

    const onUpdate = (({transaction})=>{
      let selectionActive = (transaction?.curSelection?.ranges[0]['$from']?.pos - transaction?.curSelection?.ranges[0]['$to']?.pos) != 0
  
      setShowToolbar(selectionActive)
    })
      
    editor.on('selectionUpdate', onUpdate)

    return () => editor.off('selectionUpdate', onUpdate)
  }, [editor, setShowToolbar])

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run()

      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url })
      .run()
  }, [editor])

  if (showToolbar) {
    return (
      <NodeToolbar isVisible={true} position={Position.Top} offset={5} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <input
          type="color"
          onInput={event => editor.chain().focus().setColor(event.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
        />
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          strike
        </button>
        {
          toolbarLinkEnabled &&
          <button
            onClick={setLink}
            className={editor.isActive('link') ? 'is-active' : ''}
          >
            set link
          </button>
        }
        {
          toolbarLinkEnabled && editor.isActive('link') &&
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            unset link
          </button>
        }
      </NodeToolbar>
    )
  }
  
  return null
})

export const TablePad = ({id, publicEditable='true'}) => {
  const { ydoc } = useAgora()

  const editor = useEditor({
    editable: backstageEnabled || publicEditable,
    extensions: [
      StarterKit.configure({
        history: false,
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

export const Pad = ({id, outsideFlow, editable}) => {
  const { ydoc } = useAgora()

  const editor = useEditor({
    editable: editable,
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: id
      }),
      ...PAD_TIPTAP_EXTENSIONS,
    ],
  })

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