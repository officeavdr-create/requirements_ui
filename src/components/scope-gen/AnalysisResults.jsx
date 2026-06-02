
// import { useState } from 'react'

// export default function AnalysisResults({ data, onReset }) {
//   const [expandedSections, setExpandedSections] = useState({})

//   const toggleSection = (sectionId) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [sectionId]: !prev[sectionId]
//     }))
//   }

//   const expandAll = () => {
//     const allExpanded = {}
//     Object.keys(data.sections).forEach(id => {
//       allExpanded[id] = true
//     })
//     setExpandedSections(allExpanded)
//   }

//   const collapseAll = () => {
//     setExpandedSections({})
//   }

//   const handleDownload = async (format) => {
//     try {
//       const response = await fetch(`/analysis/${data.id}/download/${format}`)
//       if (response.ok) {
//         const blob = await response.blob()
//         const url = window.URL.createObjectURL(blob)
//         const link = document.createElement('a')
//         link.href = url
//         link.download = `${data.domain_name}_v${data.domain_version}_analysis.${format === 'markdown' ? 'md' : 'xlsx'}`
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

//   const totalWords = Object.values(data.sections).reduce((sum, section) => 
//     sum + (section.error ? 0 : section.word_count), 0
//   )

//   const successfulSections = Object.values(data.sections).filter(s => !s.error).length

//   return (
//     <div className="space-y-6">
//       {/* Header with Actions */}
//       <div className="bg-white rounded-lg shadow-sm border p-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h2 className="text-2xl font-semibold text-gray-900">
//               {data.domain_name} v{data.domain_version} - Analysis Complete
//             </h2>
//             <p className="text-gray-600">
//               Generated using {data.model} • {totalWords} total words
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => handleDownload('markdown')}
//               className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
//             >
//               Download Markdown
//             </button>
//             <button
//               onClick={() => handleDownload('excel')}
//               className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
//             >
//               Download Excel
//             </button>
//             <button
//               onClick={onReset}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               New Analysis
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//           <div className="text-center p-3 bg-blue-50 rounded">
//             <div className="text-xl font-bold text-blue-600">{Object.keys(data.sections).length}</div>
//             <div className="text-sm text-blue-700">Total Sections</div>
//           </div>
//           <div className="text-center p-3 bg-green-50 rounded">
//             <div className="text-xl font-bold text-green-600">{successfulSections}</div>
//             <div className="text-sm text-green-700">Successful</div>
//           </div>
//           <div className="text-center p-3 bg-purple-50 rounded">
//             <div className="text-xl font-bold text-purple-600">{totalWords}</div>
//             <div className="text-sm text-purple-700">Total Words</div>
//           </div>
//           <div className="text-center p-3 bg-orange-50 rounded">
//             <div className="text-xl font-bold text-orange-600">
//               {Math.round((successfulSections / Object.keys(data.sections).length) * 100)}%
//             </div>
//             <div className="text-sm text-orange-700">Success Rate</div>
//           </div>
//         </div>
//       </div>

//       {/* Domain Input Summary */}
//       <div className="bg-white rounded-lg shadow-sm border p-6">
//         <h3 className="text-lg font-semibold mb-3">Original Domain Information</h3>
//         <div className="bg-gray-50 rounded p-4">
//           <p className="text-gray-700 whitespace-pre-wrap">{data.domain_input}</p>
//         </div>
//       </div>

//       {/* Sections */}
//       <div className="bg-white rounded-lg shadow-sm border">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-xl font-semibold text-gray-900">
//               Analysis Results ({Object.keys(data.sections).length} sections)
//             </h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={expandAll}
//                 className="text-sm text-blue-600 hover:text-blue-700"
//               >
//                 Expand All
//               </button>
//               <span className="text-gray-300">|</span>
//               <button
//                 onClick={collapseAll}
//                 className="text-sm text-blue-600 hover:text-blue-700"
//               >
//                 Collapse All
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="divide-y divide-gray-200">
//           {Object.entries(data.sections).map(([sectionId, section]) => {
//             const isExpanded = expandedSections[sectionId]

//             return (
//               <div key={sectionId}>
//                 <button
//                   onClick={() => toggleSection(sectionId)}
//                   className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center flex-1">
//                       <div className="mr-3">
//                         {isExpanded ? (
//                           <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                           </svg>
//                         ) : (
//                           <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                           </svg>
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="text-lg font-medium text-gray-900">{section.title}</h4>
//                         <p className="text-sm text-gray-500">
//                           {section.error ? 'Error generating content' : `${section.word_count} words`}
//                         </p>
//                       </div>
//                     </div>

//                     <div className={`px-2 py-1 rounded text-xs font-medium ${
//                       section.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
//                     }`}>
//                       {section.error ? 'Error' : 'Success'}
//                     </div>
//                   </div>
//                 </button>

//                 {isExpanded && (
//                   <div className="px-6 pb-6">
//                     <div className="ml-8">
//                       <div className={`rounded p-4 ${
//                         section.error ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
//                       }`}>
//                         <div className="prose prose-sm max-w-none">
//                           <div className="whitespace-pre-wrap text-gray-800">
//                             {section.content}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { domainService } from '@/services/domainService'

export default function AnalysisResults({ data, onReset }) {
  const [expandedSections, setExpandedSections] = useState({})
  const [isAddingToDb, setIsAddingToDb] = useState(false)
  const [dbStatus, setDbStatus] = useState(null) // null, 'success', 'error'
  const [dbMessage, setDbMessage] = useState('')

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const expandAll = () => {
    const allExpanded = {}
    Object.keys(data.sections).forEach(id => {
      allExpanded[id] = true
    })
    setExpandedSections(allExpanded)
  }

  const collapseAll = () => {
    setExpandedSections({})
  }

  const handleDownload = async (format) => {
    try {
      const response = await fetch(`/api/v1/scope-gen/analysis/${data.id}/download/${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${data.domain_name}_v${data.domain_version}_analysis.${format === 'markdown' ? 'md' : 'xlsx'}`
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

  const handleAddInstanceToDb = async () => {
    setIsAddingToDb(true)
    setDbStatus(null)
    setDbMessage('')
    
    try {
      // 1. Fetch markdown from existing route
      const response = await fetch(`/api/v1/scope-gen/analysis/${data.id}/download/markdown`)
      if (!response.ok) {
        throw new Error('Failed to retrieve generated markdown content.')
      }
      const markdownContent = await response.text()
      
      // 2. Create the instance in the DB
      // Note: form mapped domain_type -> data.domain_name and instance_name -> data.domain_version
      const domainType = data.domain_name
      const instanceName = data.domain_version
      
      const newDomain = await domainService.createDomainInstance(domainType, {
        name: instanceName,
        description: `AI Generated Scope Analysis for ${domainType} domain`,
        configurations: markdownContent
      })
      
      // 3. Generate embeddings for the new instance
      if (newDomain && newDomain.id) {
        await domainService.generateEmbedding(newDomain.id, 'ollama')
      }
      
      setDbStatus('success')
      setDbMessage(`Instance "${instanceName}" created successfully with embeddings!`)
    } catch (err) {
      setDbStatus('error')
      setDbMessage(err.message || 'An error occurred while adding to DB')
    } finally {
      setIsAddingToDb(false)
    }
  }

  const totalWords = Object.values(data.sections).reduce((sum, section) =>
    sum + (section.error ? 0 : section.word_count), 0
  )

  const successfulSections = Object.values(data.sections).filter(s => !s.error).length

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {data.domain_name} - {data.domain_version} - Analysis Complete
            </h2>
            <p className="text-white">
              Generated using {data.model} • {totalWords} total words
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDownload('markdown')}
              className="text-white px-4 py-2 rounded hover:bg-blue-800"
              style={{ backgroundColor: '#1E52DC' }}
            >
              Download Markdown
            </button>
            {/* <button
              onClick={() => handleDownload('excel')}
              className="text-white px-4 py-2 rounded hover:bg-blue-800"
              style={{ backgroundColor: '#1E52DC' }}
            >
              Download Excel
            </button> */}
            <button
              onClick={handleAddInstanceToDb}
              disabled={isAddingToDb || dbStatus === 'success'}
              className="text-white px-4 py-2 rounded focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
              style={{ backgroundColor: dbStatus === 'success' ? '#059669' : '#8b5cf6' }}
            >
              {isAddingToDb ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : dbStatus === 'success' ? (
                '✓ Added to DB'
              ) : (
                'Add Domain Instance'
              )}
            </button>
            <button
              onClick={onReset}
              className="text-white px-4 py-2 rounded hover:bg-blue-800"
              style={{ backgroundColor: '#1E52DC' }}
            >
              New Analysis
            </button>
          </div>
        </div>
        
        {/* DB Status Message */}
        {dbMessage && (
          <div className={`mt-4 p-3 rounded-md border flex items-start ${
            dbStatus === 'success' 
              ? 'bg-green-500/10 border-green-500/50 text-green-200' 
              : 'bg-red-500/10 border-red-500/50 text-red-200'
          }`}>
            <div className="text-sm">{dbMessage}</div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 rounded" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
            <div className="text-xl font-bold text-white">{Object.keys(data.sections).length}</div>
            <div className="text-sm text-white">Total Sections</div>
          </div>
          <div className="text-center p-3 rounded" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
            <div className="text-xl font-bold text-white">{successfulSections}</div>
            <div className="text-sm text-white">Successful</div>
          </div>
          <div className="text-center p-3 rounded" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
            <div className="text-xl font-bold text-white">{totalWords}</div>
            <div className="text-sm text-white">Total Words</div>
          </div>
          <div className="text-center p-3 rounded" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
            <div className="text-xl font-bold text-white">
              {Math.round((successfulSections / Object.keys(data.sections).length) * 100)}%
            </div>
            <div className="text-sm text-white">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Domain Input Summary */}
      <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
        <h3 className="text-lg font-semibold text-white mb-3">Original Domain Information</h3>
        <div className="rounded p-4" style={{ backgroundColor: '#111827' }}>
          <p className="text-white whitespace-pre-wrap">{data.domain_input}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
        <div className="p-6 border-b" style={{ borderColor: 'white' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Analysis Results ({Object.keys(data.sections).length} sections)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-sm text-white hover:text-blue-200"
              >
                Expand All
              </button>
              <span className="text-white">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-white hover:text-blue-200"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: 'white' }}>
          {Object.entries(data.sections).map(([sectionId, section]) => {
            const isExpanded = expandedSections[sectionId]

            return (
              <div key={sectionId}>
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="w-full px-6 py-4 text-left hover:bg-blue-800 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="mr-3">
                        {isExpanded ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-white">{section.title}</h4>
                        <p className="text-sm text-white">
                          {section.error ? 'Error generating content' : `${section.word_count} words`}
                        </p>
                      </div>
                    </div>

                    <div className={`px-2 py-1 rounded text-xs font-medium ${section.error ? 'bg-red-900 text-white' : 'bg-green-900 text-white'
                      }`}>
                      {section.error ? 'Error' : 'Success'}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="ml-8">
                      <div className={`rounded p-4 ${section.error ? 'border' : ''
                        }`} style={{ backgroundColor: '#111827', borderColor: section.error ? 'white' : undefined }}>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-white">
                            {section.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}