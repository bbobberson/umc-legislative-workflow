'use client'

import { useState, useEffect, useRef } from 'react'
import { diffWords } from 'diff'

interface BodParagraph {
  id: string
  number: string
  title: string
  current_text: string
  section: string
}

interface Change {
  type: 'delete' | 'insert'
  originalText?: string
  newText?: string
  position: number
}

interface BodParagraphEditorProps {
  selectedParagraph: BodParagraph | null
  onChangesUpdate: (changes: Change[], modifiedText: string) => void
}

export default function BodParagraphEditor({ selectedParagraph, onChangesUpdate }: BodParagraphEditorProps) {
  const [modifiedText, setModifiedText] = useState('')
  const [originalText, setOriginalText] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  // Reset when paragraph changes
  useEffect(() => {
    if (selectedParagraph) {
      const text = selectedParagraph.current_text
      setOriginalText(text)
      setModifiedText(text)
      if (editorRef.current) {
        editorRef.current.innerHTML = text
      }
    }
  }, [selectedParagraph])

  // Handle text changes and calculate diff
  const handleTextChange = () => {
    if (!editorRef.current) return
    
    const currentText = editorRef.current.innerText || ''
    setModifiedText(currentText)
    
    // Calculate changes using diff
    const diff = diffWords(originalText, currentText)
    const changes: Change[] = []
    let position = 0
    
    diff.forEach((part) => {
      if (part.removed) {
        changes.push({
          type: 'delete',
          originalText: part.value,
          position
        })
      } else if (part.added) {
        changes.push({
          type: 'insert',
          newText: part.value,
          position
        })
        position += part.value.length
      } else {
        position += part.value.length
      }
    })
    
    onChangesUpdate(changes, currentText)
  }


  const clearFormatting = () => {
    if (editorRef.current && selectedParagraph) {
      editorRef.current.innerHTML = selectedParagraph.current_text
      setModifiedText(selectedParagraph.current_text)
      onChangesUpdate([], selectedParagraph.current_text)
    }
  }

  if (!selectedParagraph) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">Select a Book of Discipline paragraph to begin editing</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Rich Text Editor */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 border-b">
          Edit the paragraph text below
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleTextChange}
          className="p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset text-gray-900 bg-white"
          style={{
            lineHeight: '1.6',
            fontSize: '16px',
            color: '#111827'
          }}
          suppressContentEditableWarning={true}
        />
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearFormatting}
          className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-3 text-sm">
        <p className="text-blue-800">
          Edit the text like a Word document - delete unwanted words and type new ones. The preview will show your changes automatically.
        </p>
      </div>
    </div>
  )
}