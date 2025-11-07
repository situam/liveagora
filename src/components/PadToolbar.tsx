import { memo, useCallback, useEffect, useState } from 'react';
import { NodeToolbar, Position } from 'reactflow';
import type { Editor, EditorEvents } from '@tiptap/react';

import { backstageEnabled } from '../AgoraApp';

const _PadToolbarClassName = 'PadToolbar'

export const PadToolbar = memo(({editor}: {editor: Editor}) => {
  const [showToolbar, setShowToolbar] = useState(false)
  const toolbarLinkEnabled = backstageEnabled;

  useEffect(()=>{
    if (!editor)
      return

    // show/hide toolbar when selection changes
    const onUpdate = (({transaction}: EditorEvents['selectionUpdate'])=>{
      const selectionActive = transaction.selection.from - transaction.selection.to != 0
      setShowToolbar(selectionActive)
    })

    // hide toolbar when editor loses focus and the related target is not the toolbar
    const onEditorLoseFocus = (data: EditorEvents['blur']) => {
      const relatedTargetIsToolbar = data.event.relatedTarget instanceof HTMLElement
        && (data.event.relatedTarget.closest(`.${_PadToolbarClassName}`) !== null) 

      setShowToolbar(relatedTargetIsToolbar)
    }

    editor.on('selectionUpdate', onUpdate)
    editor.on('blur', onEditorLoseFocus)

    return () => {
      editor.off('selectionUpdate', onUpdate)
      editor.off('blur', onEditorLoseFocus)
    }
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
      <NodeToolbar className={_PadToolbarClassName} isVisible={true} position={Position.Top} offset={5} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
