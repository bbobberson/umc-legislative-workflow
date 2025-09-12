'use client'

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

interface BodParagraphPreviewProps {
  selectedParagraph: BodParagraph | null
  modifiedText: string
  changes: Change[]
}

export default function BodParagraphPreview({ selectedParagraph, modifiedText, changes }: BodParagraphPreviewProps) {
  if (!selectedParagraph || changes.length === 0) {
    return null
  }

  const generateDiffHtml = () => {
    const diff = diffWords(selectedParagraph.current_text, modifiedText)
    
    return diff.map((part, index) => {
      if (part.removed) {
        return (
          <span key={index} className="bg-red-100 text-red-800 line-through px-1 rounded">
            {part.value}
          </span>
        )
      } else if (part.added) {
        return (
          <span key={index} className="bg-green-100 text-green-800 underline px-1 rounded font-medium">
            {part.value}
          </span>
        )
      } else {
        return <span key={index}>{part.value}</span>
      }
    })
  }

  const hasChanges = changes.length > 0

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h4 className="font-medium text-gray-900">Preview of Changes</h4>
        </div>
        
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Text */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                Current Text
              </h5>
              <div className="p-3 bg-gray-50 rounded text-sm leading-relaxed border text-gray-900">
                {selectedParagraph.current_text}
              </div>
            </div>

            {/* Proposed Text */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Proposed Text
              </h5>
              <div className="p-3 bg-blue-50 rounded text-sm leading-relaxed border text-gray-900">
                <div>{generateDiffHtml()}</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 line-through px-2 py-1 rounded">deleted text</span>
                <span className="text-gray-600">= text to be removed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 underline px-2 py-1 rounded font-medium">added text</span>
                <span className="text-gray-600">= text to be inserted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}