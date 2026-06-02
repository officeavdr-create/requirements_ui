

// import React, { useState, useEffect } from 'react'

// export default function SavedScopes({ onViewAnalysis }) {
//   const [scopes, setScopes] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [sortBy, setSortBy] = useState('created_at')
//   const [sortOrder, setSortOrder] = useState('desc')

//   useEffect(() => {
//     fetchSavedScopes()
//   }, [])

//   const fetchSavedScopes = async () => {
//     try {
//       setLoading(true)
//       const response = await fetch('/saved-scopes') // or `${API}/saved-scopes`
//       if (response.ok) {
//         const data = await response.json()
//         setScopes(data.scopes)
//       } else {
//         throw new Error('Failed to fetch saved scopes')
//       }
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDelete = async (scopeId, domainName, version) => {
//     const ok = window.confirm(`Delete "${domainName}" v${version}? This cannot be undone.`)
//     if (!ok) return

//     const prev = scopes
//     // optimistic removal
//     setScopes(prev => prev.filter(s => s.id === scopeId ? false : true))

//     try {
//       const res = await fetch(`/scopes/${scopeId}`, { method: 'DELETE' }) // or `${API}/scopes/${scopeId}`
//       if (!res.ok) throw new Error(`HTTP ${res.status}`)
//       // success: nothing else needed
//     } catch (err) {
//       // rollback on failure
//       setScopes(prev)
//       alert(`Delete failed: ${err.message}`)
//     }
//   }

//   const filteredAndSortedScopes = scopes
//     .filter(scope =>
//       scope.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       scope.domain_version.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       const aVal = a[sortBy]
//       const bVal = b[sortBy]
//       const multiplier = sortOrder === 'asc' ? 1 : -1

//       if (sortBy === 'created_at' || sortBy === 'completed_at') {
//         return multiplier * (new Date(aVal || 0) - new Date(bVal || 0))
//       }
//       return multiplier * (aVal || '').localeCompare(bVal || '')
//     })

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A'
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const getStatusBadge = (status) => {
//     const badges = {
//       completed: 'bg-green-100 text-green-800',
//       processing: 'bg-blue-100 text-blue-800',
//       failed: 'bg-red-100 text-red-800'
//     }
//     return badges[status] || 'bg-gray-100 text-gray-800'
//   }

//   const handleDownload = async (scopeId, format, domainName, version) => {
//     try {
//       const response = await fetch(`/analysis/${scopeId}/download/${format}`) // or `${API}/analysis/${scopeId}/download/${format}`
//       if (response.ok) {
//         const blob = await response.blob()
//         const url = window.URL.createObjectURL(blob)
//         const link = document.createElement('a')
//         link.href = url
//         link.download = `${domainName}_v${version}_analysis.${format === 'markdown' ? 'md' : 'xlsx'}`
//         document.body.appendChild(link)
//         link.click()
//         link.remove()
//         window.URL.revokeObjectURL(url)
//       } else {
//         throw new Error(`Failed to download ${format}`)
//       }
//     } catch (err) {
//       alert(`Error downloading ${format}: ${err.message}`)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
//         <p className="text-gray-600">Loading saved scopes...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//         <div className="flex items-center text-red-800">
//           <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//           </svg>
//           Error loading saved scopes: {error}
//         </div>
//         <button
//           onClick={fetchSavedScopes}
//           className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//         >
//           Retry
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-sm border">
//       {/* Header with Search and Sort */}
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">Saved Domain Scopes</h2>
//             <p className="text-gray-600">Total: {scopes.length} scopes</p>
//           </div>

//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Search */}
//             <div className="relative">
//               <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search domains..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Sort */}
//             <div className="flex gap-2">
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="created_at">Created Date</option>
//                 <option value="domain_name">Domain Name</option>
//                 <option value="domain_version">Version</option>
//                 <option value="status">Status</option>
//               </select>

//               <button
//                 onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
//                 className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {sortOrder === 'asc' ? '↑' : '↓'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Scopes List */}
//       <div className="divide-y divide-gray-200">
//         {filteredAndSortedScopes.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             {searchTerm ? 'No scopes found matching your search.' : 'No saved scopes yet. Create your first domain analysis!'}
//           </div>
//         ) : (
//           filteredAndSortedScopes.map((scope) => (
//             <div key={scope.id} className="p-6 hover:bg-gray-50">
//               <div className="flex items-center justify-between">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-3 mb-2">
//                     <h3 className="text-lg font-medium text-gray-900 truncate">
//                       {scope.domain_name}
//                     </h3>
//                     <span className="text-sm text-gray-500">v{scope.domain_version}</span>
//                     <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(scope.status)}`}>
//                       {scope.status}
//                     </span>
//                   </div>

//                   <div className="flex items-center gap-4 text-sm text-gray-600">
//                     <span>Model: {scope.model_used}</span>
//                     <span>Created: {formatDate(scope.created_at)}</span>
//                     {scope.completed_at && (
//                       <span>Completed: {formatDate(scope.completed_at)}</span>
//                     )}
//                     {scope.status === 'processing' && (
//                       <span>Progress: {scope.progress}/11</span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {scope.status === 'completed' && (
//                     <>
//                       <button
//                         onClick={() => onViewAnalysis(scope.id)}
//                         className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//                       >
//                         View
//                       </button>
//                       <button
//                         onClick={() => handleDownload(scope.id, 'markdown', scope.domain_name, scope.domain_version)}
//                         className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
//                       >
//                         MD
//                       </button>
//                       <button
//                         onClick={() => handleDownload(scope.id, 'excel', scope.domain_name, scope.domain_version)}
//                         className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
//                       >
//                         Excel
//                       </button>
//                       <button
//                         onClick={() => handleDelete(scope.id, scope.domain_name, scope.domain_version)}
//                         className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
//                       >
//                         Delete
//                       </button>
//                     </>
//                   )}

//                   {scope.status === 'processing' && (
//                     <>
//                       <button
//                         onClick={() => onViewAnalysis(scope.id)}
//                         className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded"
//                       >
//                         Monitor
//                       </button>
//                       <button
//                         onClick={() => handleDelete(scope.id, scope.domain_name, scope.domain_version)}
//                         className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
//                         title="Cancel and delete this processing analysis"
//                       >
//                         Delete
//                       </button>
//                     </>
//                   )}

//                   {scope.status === 'failed' && (
//                     <button
//                       onClick={() => handleDelete(scope.id, scope.domain_name, scope.domain_version)}
//                       className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }


import React, { useState, useEffect } from 'react'

export default function SavedScopes({ onViewAnalysis }) {
  const [scopes, setScopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchSavedScopes()
  }, [])

  const fetchSavedScopes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/scope-gen/scope-gen-/saved-scopes')
      if (response.ok) {
        const data = await response.json()
        setScopes(data.scopes)
      } else {
        throw new Error('Failed to fetch saved scopes')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scopeId, domainName, version) => {
    const ok = window.confirm(`Delete "${domainName}" v${version}? This cannot be undone.`)
    if (!ok) return

    const prev = scopes
    // optimistic removal
    setScopes(prev => prev.filter(s => s.id === scopeId ? false : true))

    try {
      const res = await fetch(`/api/v1/scope-gen/scopes/${scopeId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      // rollback on failure
      setScopes(prev)
      alert(`Delete failed: ${err.message}`)
    }
  }

  const filteredAndSortedScopes = scopes
    .filter(scope =>
      scope.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scope.domain_version.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const multiplier = sortOrder === 'asc' ? 1 : -1

      if (sortBy === 'created_at' || sortBy === 'completed_at') {
        return multiplier * (new Date(aVal || 0) - new Date(bVal || 0))
      }
      return multiplier * (aVal || '').localeCompare(bVal || '')
    })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-900 text-white',
      processing: 'bg-blue-900 text-white',
      failed: 'bg-red-900 text-white'
    }
    return badges[status] || 'bg-gray-900 text-white'
  }

  const handleDownload = async (scopeId, format, domainName, version) => {
    try {
      const response = await fetch(`/api/v1/scope-gen/analysis/${scopeId}/download/${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${domainName}_v${version}_analysis.${format === 'markdown' ? 'md' : 'xlsx'}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error(`Failed to download ${format}`)
      }
    } catch (err) {
      alert(`Error downloading ${format}: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg shadow-sm border p-8 text-center" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1E52DC] border-t-transparent mx-auto mb-4"></div>
        <p className="text-white">Loading saved scopes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
        <div className="flex items-center text-white">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Error loading saved scopes: {error}
        </div>
        <button
          onClick={fetchSavedScopes}
          className="mt-3 text-white px-4 py-2 rounded hover:bg-blue-800"
          style={{ backgroundColor: '#1E52DC' }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg shadow-sm border" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
      {/* Header with Search and Sort */}
      <div className="p-6 border-b bg-[var(--accent-blue)]" style={{ borderColor: 'white' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Saved Domain Scopes</h2>
            <p className="text-white">Total: {scopes.length} scopes</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E52DC]"
                style={{ backgroundColor: '#111827', color: 'white', borderColor: 'white' }}
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E52DC]"
                style={{ backgroundColor: '#111827', color: 'white', borderColor: 'white' }}
              >
                <option value="created_at" style={{ backgroundColor: '#111827', color: 'white' }}>Created Date</option>
                <option value="domain_name" style={{ backgroundColor: '#111827', color: 'white' }}>Domain Name</option>
                <option value="domain_version" style={{ backgroundColor: '#111827', color: 'white' }}>Version</option>
                <option value="status" style={{ backgroundColor: '#111827', color: 'white' }}>Status</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-[#1E52DC]"
                style={{ backgroundColor: '#1F2937', color: 'white', borderColor: 'white' }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scopes List */}
      <div className="divide-y" style={{ borderColor: 'white' }}>
        {filteredAndSortedScopes.length === 0 ? (
          <div className="p-8 text-center text-white">
            {searchTerm ? 'No scopes found matching your search.' : 'No saved scopes yet. Create your first domain analysis!'}
          </div>
        ) : (
          filteredAndSortedScopes.map((scope) => (
            <div key={scope.id} className="p-6 hover:bg-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-white truncate">
                      {scope.domain_name}
                    </h3>
                    <span className="text-sm text-white">v{scope.domain_version}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(scope.status)}`}>
                      {scope.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white">
                    <span>Model: {scope.model_used}</span>
                    <span>Created: {formatDate(scope.created_at)}</span>
                    {scope.completed_at && (
                      <span>Completed: {formatDate(scope.completed_at)}</span>
                    )}
                    {scope.status === 'processing' && (
                      <span>Progress: {scope.progress}/11</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {scope.status === 'completed' && (
                    <>
                      <button
                        onClick={() => onViewAnalysis(scope.id)}
                        className="px-3 py-1 text-sm text-white rounded hover:bg-blue-800"
                        style={{ backgroundColor: '#1E52DC' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(scope.id, 'markdown', scope.domain_name, scope.domain_version)}
                        className="px-3 py-1 text-sm text-white rounded hover:bg-blue-800"
                        style={{ backgroundColor: '#1E52DC' }}
                      >
                        MD
                      </button>
                      <button
                        onClick={() => handleDownload(scope.id, 'excel', scope.domain_name, scope.domain_version)}
                        className="px-3 py-1 text-sm text-white rounded hover:bg-blue-800"
                        style={{ backgroundColor: '#1E52DC' }}
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => handleDelete(scope.id, scope.domain_name, scope.domain_version)}
                        className="px-3 py-1 text-sm text-white rounded hover:bg-red-800"
                        style={{ backgroundColor: '#991b1b' }}
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {scope.status === 'processing' && (
                    <>
                      <button
                        onClick={() => onViewAnalysis(scope.id)}
                        className="px-3 py-1 text-sm text-white rounded hover:bg-blue-800"
                        style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}
                      >
                        Monitor
                      </button>
                      <button
                        onClick={() => handleDelete(scope.id, scope.domain_name, scope.domain_version)}
                        className="px-3 py-1 text-sm text-white rounded hover:bg-red-800"
                        style={{ backgroundColor: '#991b1b', borderColor: 'white', borderWidth: '1px' }}
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {scope.status === 'failed' && (
                    <button
                      onClick={() => handleDelete(scope.id, scope.domain_name, scope.domain_version)}
                      className="px-3 py-1 text-sm text-white rounded hover:bg-red-800"
                      style={{ backgroundColor: '#991b1b' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}