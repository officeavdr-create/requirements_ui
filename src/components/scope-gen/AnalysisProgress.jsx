
// // import React from 'react'

// // export default function AnalysisProgress({ data }) {
// //   const progressPercentage = (data.progress / data.total_sections) * 100

// //   return (
// //     <div className="bg-white rounded-lg shadow-sm border p-6">
// //       <div className="flex items-center justify-between mb-6">
// //         <div className="flex items-center">
// //           <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mr-3"></div>
// //           <div>
// //             <h2 className="text-xl font-semibold text-gray-900">
// //               Analyzing {data.domain_name} v{data.domain_version}
// //             </h2>
// //             <p className="text-gray-600">Using {data.model} model</p>
// //           </div>
// //         </div>
// //         <div className="text-right">
// //           <div className="text-2xl font-bold text-blue-600">
// //             {data.progress}/{data.total_sections}
// //           </div>
// //           <div className="text-sm text-gray-600">sections</div>
// //         </div>
// //       </div>

// //       {/* Progress Bar */}
// //       <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
// //         <div 
// //           className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
// //           style={{ width: `${progressPercentage}%` }}
// //         ></div>
// //       </div>

// //       {/* Stats Grid */}
// //       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //         <div className="text-center p-4 bg-blue-50 rounded-lg">
// //           <div className="text-2xl font-bold text-blue-600">{data.progress}</div>
// //           <div className="text-sm text-blue-700">Completed</div>
// //         </div>
// //         <div className="text-center p-4 bg-gray-50 rounded-lg">
// //           <div className="text-2xl font-bold text-gray-600">
// //             {data.total_sections - data.progress}
// //           </div>
// //           <div className="text-sm text-gray-700">Remaining</div>
// //         </div>
// //         <div className="text-center p-4 bg-purple-50 rounded-lg">
// //           <div className="text-2xl font-bold text-purple-600">{data.model}</div>
// //           <div className="text-sm text-purple-700">Model</div>
// //         </div>
// //         <div className="text-center p-4 bg-green-50 rounded-lg">
// //           <div className="text-2xl font-bold text-green-600">
// //             {Math.round(progressPercentage)}%
// //           </div>
// //           <div className="text-sm text-green-700">Progress</div>
// //         </div>
// //       </div>

// //       <div className="mt-6 text-center text-gray-600">
// //         <p className="text-sm">
// //           Please wait while we generate your comprehensive domain analysis. 
// //           This process typically takes 5-10 minutes depending on the model complexity.
// //         </p>
// //       </div>
// //     </div>
// //   )
// // }

// import React from 'react'

// export default function AnalysisProgress({ data }) {
//   const progressPercentage = (data.progress / data.total_sections) * 100

//   return (
//     <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1E52DC] border-t-transparent mr-3"></div>
//           <div>
//             <h2 className="text-xl font-semibold text-white">
//               Analyzing {data.domain_name} v{data.domain_version}
//             </h2>
//             <p className="text-white">Using {data.model} model</p>
//           </div>
//         </div>
//         <div className="text-right">
//           <div className="text-2xl font-bold text-white">
//             {data.progress}/{data.total_sections}
//           </div>
//           <div className="text-sm text-white">sections</div>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="w-full rounded-full h-4 mb-6" style={{ backgroundColor: '#111827' }}>
//         <div 
//           className="h-4 rounded-full transition-all duration-500 ease-out"
//           style={{ width: `${progressPercentage}%`, backgroundColor: '#1E52DC' }}
//         ></div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
//           <div className="text-2xl font-bold text-white">{data.progress}</div>
//           <div className="text-sm text-white">Completed</div>
//         </div>
//         <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
//           <div className="text-2xl font-bold text-white">
//             {data.total_sections - data.progress}
//           </div>
//           <div className="text-sm text-white">Remaining</div>
//         </div>
//         <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
//           <div className="text-2xl font-bold text-white">{data.model}</div>
//           <div className="text-sm text-white">Model</div>
//         </div>
//         <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
//           <div className="text-2xl font-bold text-white">
//             {Math.round(progressPercentage)}%
//           </div>
//           <div className="text-sm text-white">Progress</div>
//         </div>
//       </div>

//       <div className="mt-6 text-center text-white">
//         <p className="text-sm">
//           Please wait while we generate your comprehensive domain analysis. 
//           This process typically takes 5-10 minutes depending on the model complexity.
//         </p>
//       </div>
//     </div>
//   )
// }


import React from 'react'

export default function AnalysisProgress({ data }) {
  const progressPercentage = (data.progress / data.total_sections) * 100
  const isRAGEnabled = data.use_rag
  const currentStep = data.current_step || 'Processing...'

  return (
    <div className="rounded-lg p-6 border"
         style={{
           backgroundColor: 'var(--brand-800)',
           borderColor: 'color-mix(in oklab, var(--brand-600) 80%, transparent)',
           color: '#f1f5f9'
         }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 mr-3"
               style={{
                 borderColor: isRAGEnabled ? 'var(--accent-violet)' : 'var(--accent-indigo)',
                 borderTopColor: 'transparent'
               }} />
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Analyzing {data.domain_name} v{data.domain_version}
              {isRAGEnabled && <span className="text-sm  bg-[var(--accent-blue)] px-2 py-1 rounded text-white">🚀 RAG</span>}
            </h2>
            <p className="muted">Using {data.model} model</p>
            <p className="text-sm mt-1" style={{color: isRAGEnabled ? 'var(--accent-progress)' : 'white'}}>
              {currentStep}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{color: isRAGEnabled ? 'var(--brand-500)' : 'var(--accent-indigo)'}}>
            {data.progress}/{data.total_sections}
          </div>
          <div className="text-sm muted">
            {isRAGEnabled ? 'steps' : 'sections'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full rounded-full h-4 mb-6"
           style={{backgroundColor:'color-mix(in oklab, var(--brand-600) 60%, transparent)'}}>
        <div
          className="h-4 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundImage: isRAGEnabled 
              ? 'linear-gradient(90deg,var(--accent-indigo),var(--accent-violet),var(--accent-blue))'
              : 'linear-gradient(90deg,var(--accent-indigo),var(--accent-violet))'
          }}
        />
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg border"
            //  style={{backgroundColor:'color-mix(in oklab, var(--brand-700) 80%, transparent)'}}>
             style={{backgroundColor:'#2f3b4a',borderColor: 'white'}}>
          <div className="text-2xl font-bold" style={{color:'white'}}>{data.progress}</div>
          <div className="text-sm muted">Completed</div>
        </div>
        <div className="text-center p-4 rounded-lg border"
            //  style={{backgroundColor:'color-mix(in oklab, var(--brand-700) 70%, transparent)'}}>
             style={{backgroundColor:'#2f3b4a',borderColor: 'white'}}>
          <div className="text-2xl font-bold" style={{color:'#ffffffff'}}>
            {data.total_sections - data.progress}
          </div>
          <div className="text-sm muted">Remaining</div>
        </div>
        <div className="text-center p-4 rounded-lg border"
            //  style={{backgroundColor:'color-mix(in oklab, var(--brand-700) 80%, transparent)'}}>
             style={{backgroundColor:'#2f3b4a',borderColor: 'white'}}>
          <div className="text-2xl font-bold" style={{color:'white'}}>{data.model}</div>
          <div className="text-sm muted">Model</div>
        </div>
        <div className="text-center p-4 rounded-lg border"
             style={{backgroundColor:'#2f3b4a',borderColor: 'white'}}>
          <div className="text-2xl font-bold" style={{color: isRAGEnabled ? 'var(--progress)' : '#22c55e'}}>
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-sm muted">Progress</div>
        </div>
      </div>

      {/* RAG Process Indicator */}
      {isRAGEnabled && (
        <div className="mt-6 p-4 rounded-lg" 
             style={{backgroundColor:'#4c5a6dff'}}>
          <div className="flex items-start">
            <div className="text-2xl mr-3">🚀</div>
            <div>
              <div className="font-medium text-white mb-2">RAG Enhancement Active</div>
              <div className="text-sm muted mb-2">
                Enhanced generation with Android documentation context
              </div>

              {/* RAG Steps Indicator */}
              <div className="flex items-center space-x-4 text-xs">
                <div className={`flex items-center space-x-1 ${data.progress >= 1 ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${data.progress >= 1 ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span>Domain ID</span>
                </div>
                <div className={`flex items-center space-x-1 ${data.progress >= 2 ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${data.progress >= 2 ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span>Context Search</span>
                </div>
                <div className={`flex items-center space-x-1 ${data.progress > 2 ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${data.progress > 2 ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span>Enhanced Generation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center muted">
        <p className="text-sm">
          Please wait while we generate your comprehensive domain analysis.
          {isRAGEnabled 
            ? ' RAG enhancement adds 2-3 minutes for context retrieval and takes 7-15 minutes total.'
            : ' This process typically takes 5-10 minutes depending on the model complexity.'
          }
        </p>
      </div>
    </div>
  )
}
