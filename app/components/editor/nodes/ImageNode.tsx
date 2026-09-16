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

export type SerializedImageNode = Spread<
  { src: string; alt: string; width?: number | undefined },
  SerializedLexicalNode
>

function convertImageElement(domNode: Node): DOMConversionOutput | null {
  if (!(domNode instanceof HTMLImageElement)) return null
  const src = domNode.getAttribute('src') ?? ''
  const alt = domNode.getAttribute('alt') ?? ''
  const width = domNode.width || undefined
  return { node: $createImageNode({ src, alt, width }) }
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __alt: string
  __width?: number | undefined

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__width, node.__key)
  }

  static importJSON(serialized: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serialized.src,
      alt: serialized.alt,
      width: serialized.width,
    })
  }

  static importDOM(): DOMConversionMap {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    }
  }

  constructor(src: string, alt: string, width?: number | undefined, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__alt = alt
    this.__width = width
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
    }
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img')
    img.src = this.__src
    img.alt = this.__alt
    if (this.__width) img.width = this.__width
    return { element: img }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    return span
  }

  updateDOM(): false {
    return false
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        style={{ maxWidth: '100%', display: 'block' }}
      />
    )
  }

  isInline(): false {
    return false
  }
}

export function $createImageNode({ src, alt, width }: { src: string; alt: string; width?: number | undefined }): ImageNode {
  return new ImageNode(src, alt, width)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
