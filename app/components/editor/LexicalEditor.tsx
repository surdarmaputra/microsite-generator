'use client'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  EditorState,
  LexicalEditor as LexicalEditorType,
} from 'lexical'
import { $createHeadingNode } from '@lexical/rich-text'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import { ImageNode, $createImageNode } from './nodes/ImageNode'
import { YouTubeNode, $createYouTubeNode } from './nodes/YouTubeNode'
import { uploadImageFn } from '~/server/fns/upload'
import { cn } from '~/components/ui/cn'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function InitPlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    if (!value) return
    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(value, 'text/html')
      const nodes = $generateNodesFromDOM(editor, dom)
      $getRoot().clear()
      $getRoot().select()
      $insertNodes(nodes)
    })
  }, [editor, value])

  return null
}

function Toolbar() {
  const [editor] = useLexicalComposerContext()

  const format = (f: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, f)
  }

  const insertHeading = (tag: 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = $createHeadingNode(tag)
        selection.insertNodes([node])
      }
    })
  }

  const insertUl = () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  const insertOl = () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)

  const insertLink = () => {
    const url = prompt('URL:')
    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
  }

  const insertImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1] ?? ''
        try {
          const result = await uploadImageFn({ data: { filename: file.name, mimeType: file.type, base64 } })
          editor.update(() => {
            const node = $createImageNode({ src: result.url, alt: file.name })
            $getRoot().selectEnd()
            $insertNodes([node])
          })
        } catch {
          alert('Image upload failed')
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const insertYouTube = () => {
    const url = prompt('YouTube URL or video ID:')
    if (!url) return
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/) ?? [null, url]
    const videoId = match[1]
    if (!videoId) return
    editor.update(() => {
      const node = $createYouTubeNode(videoId)
      $getRoot().selectEnd()
      $insertNodes([node])
    })
  }

  const btnClass = 'px-2 py-1 text-xs rounded hover:bg-gray-100 border border-transparent hover:border-gray-200 font-medium'

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-gray-200 p-1.5">
      <button type="button" onClick={() => format('bold')} className={cn(btnClass, 'font-bold')}>B</button>
      <button type="button" onClick={() => format('italic')} className={cn(btnClass, 'italic')}>I</button>
      <button type="button" onClick={() => format('underline')} className={cn(btnClass, 'underline')}>U</button>
      <button type="button" onClick={() => format('strikethrough')} className={cn(btnClass, 'line-through')}>S</button>
      <div className="mx-1 w-px bg-gray-200" />
      <button type="button" onClick={() => insertHeading('h2')} className={btnClass}>H2</button>
      <button type="button" onClick={() => insertHeading('h3')} className={btnClass}>H3</button>
      <div className="mx-1 w-px bg-gray-200" />
      <button type="button" onClick={insertUl} className={btnClass}>UL</button>
      <button type="button" onClick={insertOl} className={btnClass}>OL</button>
      <div className="mx-1 w-px bg-gray-200" />
      <button type="button" onClick={insertLink} className={btnClass}>Link</button>
      <button type="button" onClick={insertImage} className={btnClass}>Image</button>
      <button type="button" onClick={insertYouTube} className={btnClass}>YouTube</button>
    </div>
  )
}

export function LexicalEditor({ value, onChange, placeholder }: Props) {
  const handleChange = useCallback(
    (state: EditorState, editor: LexicalEditorType) => {
      state.read(() => {
        const html = $generateHtmlFromNodes(editor)
        onChange(html)
      })
    },
    [onChange]
  )

  const initialConfig = useMemo(() => ({
    namespace: 'editor',
    theme: {
      root: 'min-h-[120px] p-3 text-sm text-gray-900 focus:outline-none',
      link: 'text-blue-600 underline cursor-pointer',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
      },
      heading: {
        h2: 'text-xl font-bold mt-3 mb-1',
        h3: 'text-lg font-semibold mt-2 mb-1',
      },
      list: {
        ul: 'list-disc pl-5',
        ol: 'list-decimal pl-5',
      },
    },
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode, YouTubeNode],
    onError: (error: Error) => console.error(error),
  }), [])

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable className="min-h-[120px] p-3 text-sm text-gray-900 focus:outline-none" />}
            placeholder={
              <div className="pointer-events-none absolute top-3 left-3 text-sm text-gray-400">{placeholder ?? ''}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <AutoFocusPlugin />
      <ListPlugin />
      <LinkPlugin />
      <OnChangePlugin onChange={handleChange} />
      <InitPlugin value={value} />
    </LexicalComposer>
  )
}
