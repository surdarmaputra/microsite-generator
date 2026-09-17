'use client'
import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { JSX } from 'react'

export type SerializedYouTubeNode = Spread<
  { videoId: string },
  SerializedLexicalNode
>

function extractVideoId(url: string): string | null {
  const match = url.match(/youtube-nocookie\.com\/embed\/([^?&"]+)/)
    ?? url.match(/youtube\.com\/embed\/([^?&"]+)/)
  return match?.[1] ?? null
}

function convertIframeElement(domNode: Node): DOMConversionOutput | null {
  if (!(domNode instanceof HTMLIFrameElement)) return null
  const src = domNode.getAttribute('src') ?? ''
  const videoId = extractVideoId(src)
  if (!videoId) return null
  return { node: $createYouTubeNode(videoId) }
}

export class YouTubeNode extends DecoratorNode<JSX.Element> {
  __videoId: string

  static getType(): string {
    return 'youtube'
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__videoId, node.__key)
  }

  static importJSON(serialized: SerializedYouTubeNode): YouTubeNode {
    return $createYouTubeNode(serialized.videoId)
  }

  static importDOM(): DOMConversionMap {
    return {
      iframe: () => ({
        conversion: convertIframeElement,
        priority: 1,
      }),
    }
  }

  constructor(videoId: string, key?: NodeKey) {
    super(key)
    this.__videoId = videoId
  }

  exportJSON(): SerializedYouTubeNode {
    return { type: 'youtube', version: 1, videoId: this.__videoId }
  }

  exportDOM(): DOMExportOutput {
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube-nocookie.com/embed/${this.__videoId}`
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute('frameborder', '0')
    iframe.style.width = '100%'
    iframe.style.aspectRatio = '16/9'
    return { element: iframe }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.style.position = 'relative'
    div.style.paddingBottom = '56.25%'
    div.style.height = '0'
    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${this.__videoId}`}
          allowFullScreen
          frameBorder="0"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      </div>
    )
  }

  isInline(): false {
    return false
  }
}

export function $createYouTubeNode(videoId: string): YouTubeNode {
  return new YouTubeNode(videoId)
}

export function $isYouTubeNode(node: LexicalNode | null | undefined): node is YouTubeNode {
  return node instanceof YouTubeNode
}
