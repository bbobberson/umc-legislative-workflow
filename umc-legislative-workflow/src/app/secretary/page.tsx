'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPetitions, setSelectedPetitions] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'assigned'>('all')
  
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
        setLoading(false)
      })
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

  // Advanced filtering logic
  const filteredPetitions = petitions.filter(petition => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'submitted' && petition.status !== 'submitted') return false
      if (statusFilter === 'under_review' && petition.status !== 'under_review') return false  
      if (statusFilter === 'assigned' && petition.status !== 'assigned') return false
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const searchableFields = [
        petition.title,
        petition.submitter_name,
        petition.submitter_organization || '',
        petition.bod_paragraph,
        petition.rationale || '',
        petition.committee_name || '',
        petition.original_paragraph_text || '',
        petition.modified_paragraph_text || ''
      ].join(' ').toLowerCase()
      
      if (!searchableFields.includes(query)) return false
    }
    
    return true
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

  const visibleUnassigned = filteredPetitions.filter(p => p.status !== 'assigned')
  const allVisibleUnassignedSelected = visibleUnassigned.length > 0 && visibleUnassigned.every(p => selectedPetitions.has(p.id))
  const suggestedCommittee = getCommitteeSuggestion(selectedPetitions)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading petitions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Abby!</h1>
              <p className="text-gray-600 mt-2">Search, filter, and assign petitions to committees</p>
            </div>
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
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

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
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
                <div className="md:w-48">
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
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Petitions Table */}
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 w-8">
                          {visibleUnassigned.length > 0 && (
                            <input
                              type="checkbox"
                              checked={allVisibleUnassignedSelected}
                              onChange={(e) => selectAllVisible(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          )}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Petition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          BoD Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Committee
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPetitions.map((petition) => (
                        <tr 
                          key={petition.id} 
                          className={`hover:bg-gray-50 ${selectedPetitions.has(petition.id) ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            {petition.status !== 'assigned' && (
                              <input
                                type="checkbox"
                                checked={selectedPetitions.has(petition.id)}
                                onChange={() => togglePetitionSelection(petition.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 max-w-sm">
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(petition.status)}`}>
                              {petition.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {petition.bod_paragraph || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {petition.committee_name || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Assignment Panel */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Assign to Committee</h3>
                </div>
                
                <div className="p-6">
                  {selectedPetitions.size === 0 ? (
                    <p className="text-gray-500 text-sm">
                      Select petitions to assign them to committees.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        {selectedPetitions.size} petition{selectedPetitions.size > 1 ? 's' : ''} selected
                      </div>
                      
                      {suggestedCommittee && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-blue-900 mb-2">
                            Suggested Committee
                          </div>
                          <button
                            onClick={() => showConfirmationModal(suggestedCommittee.id)}
                            disabled={assigning}
                            className="w-full text-left px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium"
                          >
                            Assign to {suggestedCommittee.name}
                          </button>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-3">
                          All Committees
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {committees.map(committee => (
                            <button
                              key={committee.id}
                              onClick={() => showConfirmationModal(committee.id)}
                              disabled={assigning}
                              className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 text-sm flex justify-between items-center"
                            >
                              <span>{committee.name}</span>
                              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                                {committee.petition_count || 0}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Committee Workload */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Committee Workload</h3>
                </div>
                
                <div className="p-6">
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
            </div>
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
                  Are you sure you want to assign {confirmationModal.petitionCount} petition{confirmationModal.petitionCount > 1 ? 's' : ''} to <strong>{confirmationModal.committeeName}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmationModal({ isOpen: false, committeeId: '', committeeName: '', petitionCount: 0 })}
                    disabled={assigning}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAssignment}
                    disabled={assigning}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium"
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