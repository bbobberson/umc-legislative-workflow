'use client'

import { useState, useEffect, useMemo } from 'react'

interface BodParagraph {
  id: string
  number: string
  title: string
  current_text: string
  section: string
}

interface BodParagraphSearchProps {
  onSelect: (paragraph: BodParagraph) => void
  selectedParagraph: BodParagraph | null
}

export default function BodParagraphSearch({ onSelect, selectedParagraph }: BodParagraphSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [paragraphs, setParagraphs] = useState<BodParagraph[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load BoD paragraphs on mount
  useEffect(() => {
    setIsLoading(true)
    fetch('/api/bod-paragraphs')
      .then(res => res.json())
      .then(data => {
        setParagraphs(data.paragraphs || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error loading BoD paragraphs:', err)
        setIsLoading(false)
      })
  }, [])

  // Filter paragraphs based on search term
  const filteredParagraphs = useMemo(() => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()
    return paragraphs.filter(p => 
      p.number.toLowerCase().includes(term) ||
      p.title.toLowerCase().includes(term) ||
      p.section.toLowerCase().includes(term) ||
      p.current_text.toLowerCase().includes(term) ||
      // Handle paragraph number variations: "41", "¶41", "paragraph 41"
      p.number.replace('¶', '').includes(term.replace(/[¶paragraph\s]/g, ''))
    ).slice(0, 8) // Limit to 8 results for clean UI
  }, [paragraphs, searchTerm])

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    setShowResults(value.trim().length > 0)
  }

  const handleSelectParagraph = (paragraph: BodParagraph) => {
    onSelect(paragraph)
    setSearchTerm(`${paragraph.number} - ${paragraph.title} - Section: ${paragraph.section}`)
    setShowResults(false)
  }

  const getSearchSnippet = (text: string, term: string) => {
    if (!term.trim()) return text.substring(0, 120) + (text.length > 120 ? '...' : '')
    
    const lowerText = text.toLowerCase()
    const lowerTerm = term.toLowerCase()
    const matchIndex = lowerText.indexOf(lowerTerm)
    
    if (matchIndex === -1) {
      // No match found in text, show beginning
      return text.substring(0, 120) + (text.length > 120 ? '...' : '')
    }
    
    // Show context around the match
    const contextLength = 60
    const start = Math.max(0, matchIndex - contextLength)
    const end = Math.min(text.length, matchIndex + term.length + contextLength)
    
    let snippet = text.substring(start, end)
    
    // Add ellipsis if we truncated
    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'
    
    return snippet
  }

  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text
    
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">
          {part}
        </span>
      ) : part
    )
  }

  // Set initial display when paragraph is selected externally
  useEffect(() => {
    if (selectedParagraph && !searchTerm) {
      setSearchTerm(`${selectedParagraph.number} - ${selectedParagraph.title} - Section: ${selectedParagraph.section}`)
    }
  }, [selectedParagraph])

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Book of Discipline Paragraph *
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(searchTerm.trim().length > 0)}
          placeholder="Search by paragraph number, title, or keyword..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          required
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-3 text-sm text-gray-500">
            Loading paragraphs...
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {filteredParagraphs.length > 0 ? (
            <div className="py-1">
              {filteredParagraphs.map((paragraph) => (
                <button
                  key={paragraph.id}
                  type="button"
                  onClick={() => handleSelectParagraph(paragraph)}
                  className="w-full px-3 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {highlightMatch(paragraph.number, searchTerm)} - {highlightMatch(paragraph.title, searchTerm)}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {paragraph.section}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {highlightMatch(
                          getSearchSnippet(paragraph.current_text, searchTerm),
                          searchTerm
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-gray-500">
              No paragraphs found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}

    </div>
  )
}