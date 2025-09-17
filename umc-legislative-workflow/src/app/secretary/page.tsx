'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useVirtualizer } from '@tanstack/react-virtual'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Amendment {
  type: 'insert' | 'delete'
  originalText?: string
  newText?: string
  position: number
}

interface Petition {
  id: string
  title: string
  submitter_name: string
  submitter_email: string
  submitter_organization: string
  petition_type: string
  bod_paragraph: string
  financial_impact: boolean
  status: string
  submission_date: string
  committee_id?: string
  committee_name?: string
  rationale: string
  amendment_data: Amendment[] | null
  original_paragraph_text: string | null
  modified_paragraph_text: string | null
}

interface Committee {
  id: string
  name: string
  abbreviation: string
  petition_count?: number
}

export default function SecretaryDashboard() {
  const searchParams = useSearchParams()
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPetitions, setSelectedPetitions] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)
  
  // Toast state for success messages
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  })
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'assigned'>('all')
  
  // Sorting state
  const [sortField, setSortField] = useState<'title' | 'submitter_name' | 'petition_type' | 'status' | 'bod_paragraph' | 'committee_name' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Popover state
  const [showWorkloadPopover, setShowWorkloadPopover] = useState(false)
  const [showAssignPopover, setShowAssignPopover] = useState(false)
  
  // Virtual scrolling
  const parentRef = useRef<HTMLDivElement>(null)
  
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    committeeId: string
    committeeName: string
    petitionCount: number
  }>({ isOpen: false, committeeId: '', committeeName: '', petitionCount: 0 })


  useEffect(() => {
    Promise.all([
      fetch('/api/petitions').then(res => res.json()),
      fetch('/api/committees').then(res => res.json())
    ])
      .then(([petitionsData, committeesData]) => {
        const petitionsArray = petitionsData.petitions || []
        const committeesArray = committeesData.committees || []
        
        // Remove duplicate committees first
        const uniqueCommittees = committeesArray.filter((committee: Committee, index: number, self: Committee[]) => 
          self.findIndex(c => c.id === committee.id) === index
        )
        
        // Calculate petition counts per unique committee
        const committeeCounts = uniqueCommittees.map((committee: Committee) => ({
          ...committee,
          petition_count: petitionsArray.filter((p: Petition) => p.committee_id === committee.id).length
        }))
        
        setPetitions(petitionsArray)
        setCommittees(committeeCounts)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading data:', err)
        setError('Failed to load petitions. Please try again.')
        setLoading(false)
      })
  }, [])

  // Check for success message from petition save
  useEffect(() => {
    const saved = searchParams.get('saved')
    const title = searchParams.get('title')
    
    if (saved === 'true') {
      setToast({
        show: true,
        message: title ? `Petition "${decodeURIComponent(title)}" saved successfully!` : 'Petition saved successfully!'
      })
      
      // Auto-hide toast after 4 seconds
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' })
      }, 4000)
      
      // Clear URL parameters
      window.history.replaceState({}, '', '/secretary')
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        setShowWorkloadPopover(false)
        setShowAssignPopover(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-green-100 text-green-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type: string) => {
    const types = {
      'D': 'Disciplinary',
      'C': 'Constitutional',
      'R': 'Resolution',
      'O': 'Other'
    }
    return types[type as keyof typeof types] || '—'
  }

  // Advanced filtering and sorting logic
  const filteredPetitions = petitions
    .filter(petition => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'submitted' && petition.status !== 'submitted') return false
        if (statusFilter === 'under_review' && petition.status !== 'under_review') return false  
        if (statusFilter === 'assigned' && petition.status !== 'assigned') return false
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        
        // Special handling for financial impact search
        if (query.includes('financial') || 'financial'.includes(query)) {
          return petition.financial_impact === true
        }
        
        // Build searchable content
        const searchableFields = [
          petition.title,
          petition.submitter_name,
          petition.submitter_organization || '',
          petition.bod_paragraph,
          petition.committee_name || '',
          petition.original_paragraph_text || '',
          petition.modified_paragraph_text || ''
        ]
        
        // Add petition type search (both codes and full names)
        const typeSearchTerms = []
        if (petition.petition_type === 'D') typeSearchTerms.push('d', 'disciplinary', 'discipline')
        if (petition.petition_type === 'C') typeSearchTerms.push('c', 'constitutional', 'constitution')
        if (petition.petition_type === 'R') typeSearchTerms.push('r', 'resolution')
        if (petition.petition_type === 'O') typeSearchTerms.push('o', 'other')
        
        const searchableContent = [...searchableFields, ...typeSearchTerms].join(' ').toLowerCase()
        
        if (!searchableContent.includes(query)) return false
      }
      
      return true
    })
    .sort((a, b) => {
      if (!sortField) return 0
      
      let aValue: string | number = ''
      let bValue: string | number = ''
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'submitter_name':
          aValue = a.submitter_name.toLowerCase()
          bValue = b.submitter_name.toLowerCase()
          break
        case 'petition_type':
          aValue = getTypeLabel(a.petition_type)
          bValue = getTypeLabel(b.petition_type)
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'bod_paragraph':
          // Extract numeric value from paragraph references like "¶415" -> 415
          const aNum = parseInt(a.bod_paragraph?.replace('¶', '') || '0')
          const bNum = parseInt(b.bod_paragraph?.replace('¶', '') || '0')
          aValue = aNum
          bValue = bNum
          break
        case 'committee_name':
          aValue = a.committee_name || ''
          bValue = b.committee_name || ''
          break
        default:
          return 0
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })


  const togglePetitionSelection = (petitionId: string) => {
    const newSelection = new Set(selectedPetitions)
    if (newSelection.has(petitionId)) {
      newSelection.delete(petitionId)
    } else {
      newSelection.add(petitionId)
    }
    setSelectedPetitions(newSelection)
  }

  const selectAllVisible = (selectAll: boolean) => {
    if (selectAll) {
      const visibleUnassigned = filteredPetitions.filter(p => p.status !== 'assigned').map(p => p.id)
      setSelectedPetitions(new Set(visibleUnassigned))
    } else {
      setSelectedPetitions(new Set())
    }
  }

  const handleCommitteeSelection = (committeeId: string, committeeName: string) => {
    setShowAssignPopover(false)
    showConfirmationModal(committeeId)
  }

  const showConfirmationModal = (committeeId: string) => {
    const committee = committees.find(c => c.id === committeeId)
    if (!committee || selectedPetitions.size === 0) return
    
    setConfirmationModal({
      isOpen: true,
      committeeId,
      committeeName: committee.name,
      petitionCount: selectedPetitions.size
    })
  }

  const confirmAssignment = async () => {
    const { committeeId } = confirmationModal
    if (selectedPetitions.size === 0) return
    
    setAssigning(true)
    try {
      const promises = Array.from(selectedPetitions).map(petitionId =>
        fetch(`/api/petitions/${petitionId}/assign`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ committeeId })
        })
      )
      
      const results = await Promise.all(promises)
      const allSuccessful = results.every(r => r.ok)
      
      if (allSuccessful) {
        const committee = committees.find(c => c.id === committeeId)
        
        // Update petitions
        setPetitions(prev => prev.map(p => 
          selectedPetitions.has(p.id)
            ? { ...p, committee_id: committeeId, committee_name: committee?.name, status: 'assigned' }
            : p
        ))
        
        // Update committee counts
        setCommittees(prev => prev.map(c => 
          c.id === committeeId 
            ? { ...c, petition_count: (c.petition_count || 0) + selectedPetitions.size }
            : c
        ))
        
        setSelectedPetitions(new Set())
        setConfirmationModal({ isOpen: false, committeeId: '', committeeName: '', petitionCount: 0 })
      } else {
        alert('Some assignments failed. Please try again.')
      }
    } catch (error) {
      console.error('Error assigning petitions:', error)
      alert('Error assigning petitions')
    } finally {
      setAssigning(false)
    }
  }

  const getCommitteeSuggestion = (selectedPetitionIds: Set<string>): Committee | null => {
    const selectedPetitionsList = petitions.filter(p => selectedPetitionIds.has(p.id))
    if (selectedPetitionsList.length === 0) return null
    
    // Simple suggestion logic based on first petition
    const firstPetition = selectedPetitionsList[0]
    const { bod_paragraph, petition_type } = firstPetition
    
    if (bod_paragraph?.includes('161') || bod_paragraph?.includes('415')) {
      return committees.find(c => c.name === 'Higher Education and Ministry') || null
    }
    if (bod_paragraph?.includes('213') || bod_paragraph?.includes('304')) {
      return committees.find(c => c.name === 'Faith and Order') || null
    }
    if (bod_paragraph?.includes('702')) {
      return committees.find(c => c.name === 'Church and Society') || null
    }
    if (petition_type === 'R') {
      return committees.find(c => c.name === 'Church and Society') || null
    }
    if (petition_type === 'C') {
      return committees.find(c => c.name === 'Faith and Order') || null
    }
    
    return committees.find(c => c.name === 'Faith and Order') || null
  }

  // Sorting function
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sort icon component
  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) {
      // Unsorted - show both arrows
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    }
    
    if (sortDirection === 'asc') {
      // Ascending - up arrow
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      )
    } else {
      // Descending - down arrow
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )
    }
  }

  const visibleUnassigned = filteredPetitions.filter(p => p.status !== 'assigned')
  const allVisibleUnassignedSelected = visibleUnassigned.length > 0 && visibleUnassigned.every(p => selectedPetitions.has(p.id))
  const suggestedCommittee = getCommitteeSuggestion(selectedPetitions)

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: filteredPetitions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // Row height as documented in CLAUDE.md
    overscan: 10,
  })

  // Virtual table row component
  const VirtualTableRow = ({ petition, index }: { petition: Petition; index: number }) => (
    <div
      className={`flex items-center border-b border-gray-200 hover:bg-gray-50 ${
        selectedPetitions.has(petition.id) ? 'bg-blue-50' : 'bg-white'
      }`}
      style={{ height: '73px' }}
    >
      {/* Checkbox column */}
      <div className="flex-shrink-0 w-14 px-6 py-4 flex justify-center">
        {petition.status !== 'assigned' && (
          <input
            type="checkbox"
            checked={selectedPetitions.has(petition.id)}
            onChange={() => togglePetitionSelection(petition.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        )}
      </div>
      
      {/* Petition column */}
      <div className="flex-1 px-6 py-4 min-w-0 max-w-md">
        <div className="text-sm font-medium text-gray-900 truncate">
          <Link 
            href={`/secretary/petition/${petition.id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
            title={petition.title}
          >
            {petition.title}
          </Link>
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
          <span className="truncate">
            {petition.submitter_name}
          </span>
          {petition.submitter_organization && (
            <>
              <span>•</span>
              <span className="truncate text-gray-400">
                {petition.submitter_organization}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Type column */}
      <div className="flex-shrink-0 w-36 px-6 py-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-900">
            {getTypeLabel(petition.petition_type)}
          </span>
          {petition.financial_impact && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              $
            </span>
          )}
        </div>
      </div>
      
      {/* Status column */}
      <div className="flex-shrink-0 w-32 px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(petition.status)}`}>
          {petition.status.replace('_', ' ')}
        </span>
      </div>
      
      {/* BoD Reference column */}
      <div className="flex-shrink-0 w-28 px-6 py-4 text-center">
        <span className="text-sm text-gray-900">
          {petition.bod_paragraph || '—'}
        </span>
      </div>
      
      {/* Committee column */}
      <div className="flex-shrink-0 w-44 px-6 py-4">
        <span className="text-sm text-gray-500 truncate">
          {petition.committee_name || '—'}
        </span>
      </div>
    </div>
  )

  const retryLoad = () => {
    setError(null)
    setLoading(true)
    loadData()
  }

  if (loading) {
    return <LoadingSpinner message="Loading petitions..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retryLoad} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Abby!</h1>
          <p className="text-gray-600 mt-2">Search, filter, and assign petitions to committees</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{petitions.length}</div>
            <div className="text-sm text-gray-600">Total Petitions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {petitions.filter(p => p.status === 'submitted' || p.status === 'under_review').length}
            </div>
            <div className="text-sm text-gray-600">Need Assignment</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {petitions.filter(p => p.status === 'assigned').length}
            </div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {petitions.filter(p => p.financial_impact).length}
            </div>
            <div className="text-sm text-gray-600">Financial Impact</div>
          </div>
        </div>

        <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Petitions
                  </label>
                  <input
                    type="text"
                    placeholder="Search by title, submitter, BoD paragraph, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned</option>
                  </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowWorkloadPopover(!showWorkloadPopover)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium whitespace-nowrap cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Committee Workload
                    </button>
                    
                    {/* Workload Popover */}
                    {showWorkloadPopover && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Committee Workload</h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            {committees
                              .sort((a, b) => (b.petition_count || 0) - (a.petition_count || 0))
                              .map(committee => {
                                const count = committee.petition_count || 0
                                const maxCount = Math.max(...committees.map(c => c.petition_count || 0))
                                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                                
                                return (
                                  <div key={committee.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-700 truncate">{committee.name}</span>
                                      <span className="text-gray-900 font-medium">{count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          percentage > 80 ? 'bg-red-500' : 
                                          percentage > 60 ? 'bg-yellow-500' : 
                                          'bg-green-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowAssignPopover(!showAssignPopover)}
                      disabled={selectedPetitions.size === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed font-medium whitespace-nowrap cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Assign to Committee
                      {selectedPetitions.size > 0 && (
                        <span className="bg-white text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                          {selectedPetitions.size}
                        </span>
                      )}
                    </button>
                    
                    {/* Assignment Popover */}
                    {showAssignPopover && selectedPetitions.size > 0 && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">
                            Assign {selectedPetitions.size} Petition{selectedPetitions.size !== 1 ? 's' : ''}
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            {committees.map(committee => (
                              <button
                                key={committee.id}
                                onClick={() => handleCommitteeSelection(committee.id, committee.name)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                              >
                                {committee.name}
                                <span className="text-xs text-gray-500 ml-2">
                                  ({committee.petition_count || 0} petitions)
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {(searchQuery || statusFilter !== 'all') && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    Showing {filteredPetitions.length} of {petitions.length} petitions
                    {searchQuery && <span> matching "{searchQuery}"</span>}
                    {statusFilter !== 'all' && <span> with status "{statusFilter.replace('_', ' ')}"</span>}
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setSelectedPetitions(new Set())
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>


            {/* Petitions Table - Virtual Scrolling */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Petitions {filteredPetitions.length !== petitions.length && `(${filteredPetitions.length})`}
                  </h2>
                  {selectedPetitions.size > 0 && (
                    <div className="text-sm text-blue-600">
                      {selectedPetitions.size} selected
                    </div>
                  )}
                </div>
              </div>
              
              {filteredPetitions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No petitions match your search criteria.' 
                    : 'No petitions submitted yet.'
                  }
                </div>
              ) : (
                <div className="overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center" style={{ height: '48px' }}>
                      <div className="flex-shrink-0 w-14 px-6 py-3 flex justify-center">
                        {visibleUnassigned.length > 0 && (
                          <input
                            type="checkbox"
                            checked={allVisibleUnassignedSelected}
                            onChange={(e) => selectAllVisible(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleSort('title')}
                        className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-md hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Petition
                        <SortIcon field="title" />
                      </button>
                      <button
                        onClick={() => handleSort('petition_type')}
                        className="flex-shrink-0 w-36 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Type
                        <SortIcon field="petition_type" />
                      </button>
                      <button
                        onClick={() => handleSort('status')}
                        className="flex-shrink-0 w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Status
                        <SortIcon field="status" />
                      </button>
                      <button
                        onClick={() => handleSort('bod_paragraph')}
                        className="flex-shrink-0 w-28 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        BoD Ref
                        <SortIcon field="bod_paragraph" />
                      </button>
                      <button
                        onClick={() => handleSort('committee_name')}
                        className="flex-shrink-0 w-44 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        Committee
                        <SortIcon field="committee_name" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Virtual Scrolling Container */}
                  <div
                    ref={parentRef}
                    className="overflow-auto"
                    style={{ height: '600px' }}
                  >
                    <div
                      style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {virtualizer.getVirtualItems().map((virtualItem) => {
                        const petition = filteredPetitions[virtualItem.index]
                        return (
                          <div
                            key={virtualItem.key}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualItem.size}px`,
                              transform: `translateY(${virtualItem.start}px)`,
                            }}
                          >
                            <VirtualTableRow petition={petition} index={virtualItem.index} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Confirmation Modal */}
        {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Confirm Assignment
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to assign {confirmationModal.petitionCount} petitions to {confirmationModal.committeeName}?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmationModal({ isOpen: false, committeeId: '', committeeName: '', petitionCount: 0 })}
                    disabled={assigning}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAssignment}
                    disabled={assigning}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium cursor-pointer"
                  >
                    {assigning ? 'Assigning...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}