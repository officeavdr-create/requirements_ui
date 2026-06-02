
// // import React, { useState, useEffect } from 'react'

// // const SAMPLE_DOMAINS = [
// //   {
// //     name: 'Audio',
// //     version: '1.0',
// //     input: 'Audio Processing Domain: This domain handles all audio-related functionality including audio file ingestion, processing, transformation, encoding, decoding, streaming, and playback. The system must support multiple audio formats (MP3, WAV, FLAC, AAC), provide real-time audio processing capabilities, manage audio metadata, and ensure high-quality audio output with minimal latency.'
// //   },
// // ]

// // export default function DomainForm({ onSubmit, error }) {
// //   const [formData, setFormData] = useState({
// //     domain_name: '',
// //     domain_version: '',
// //     domain_input: '',
// //     model: 'gemma3:9b'
// //   })
// //   const [models, setModels] = useState([])
// //   const [loadingModels, setLoadingModels] = useState(true)
// //   const [showSamples, setShowSamples] = useState(false)
// //   const [validationErrors, setValidationErrors] = useState({})

// //   // Fetch available models on component mount
// //   useEffect(() => {
// //     fetchModels()
// //   }, [])

// //   const fetchModels = async () => {
// //     try {
// //       const response = await fetch('/models')
// //       if (response.ok) {
// //         const data = await response.json()
// //         setModels(data.models)
// //       } else {
// //         console.error('Failed to fetch models')
// //         // Fallback models
// //         setModels([
// //           { name: 'gemma3:27b', size: null, details: {} },
// //           { name: 'gemma3:9b', size: null, details: {} },
// //           { name: 'gemma3:2b', size: null, details: {} }
// //         ])
// //       }
// //     } catch (err) {
// //       console.error('Error fetching models:', err)
// //       // Fallback models
// //       setModels([
// //         { name: 'gemma3:27b', size: null, details: {} },
// //         { name: 'gemma3:9b', size: null, details: {} },
// //         { name: 'gemma3:2b', size: null, details: {} }
// //       ])
// //     } finally {
// //       setLoadingModels(false)
// //     }
// //   }

// //   const handleInputChange = (field, value) => {
// //     setFormData(prev => ({ ...prev, [field]: value }))
// //     // Clear validation error for this field
// //     if (validationErrors[field]) {
// //       setValidationErrors(prev => ({ ...prev, [field]: null }))
// //     }
// //   }

// //   const validateForm = () => {
// //     const errors = {}

// //     if (!formData.domain_name.trim()) {
// //       errors.domain_name = 'Domain name is required'
// //     } else if (formData.domain_name.length > 100) {
// //       errors.domain_name = 'Domain name must be less than 100 characters'
// //     }

// //     if (!formData.domain_version.trim()) {
// //       errors.domain_version = 'Version is required'
// //     } else if (formData.domain_version.length > 20) {
// //       errors.domain_version = 'Version must be less than 20 characters'
// //     }

// //     if (!formData.domain_input.trim()) {
// //       errors.domain_input = 'Domain information is required'
// //     } else if (formData.domain_input.length < 10) {
// //       errors.domain_input = 'Domain information must be at least 10 characters'
// //     } else if (formData.domain_input.length > 10000) {
// //       errors.domain_input = 'Domain information must be less than 10,000 characters'
// //     }

// //     setValidationErrors(errors)
// //     return Object.keys(errors).length === 0
// //   }

// //   const handleSubmit = (e) => {
// //     e.preventDefault()
// //     if (validateForm()) {
// //       onSubmit(formData)
// //     }
// //   }

// //   const handleSampleSelect = (sample) => {
// //     setFormData({
// //       domain_name: sample.name,
// //       domain_version: sample.version,
// //       domain_input: sample.input,
// //       model: formData.model
// //     })
// //     setShowSamples(false)
// //     setValidationErrors({})
// //   }

// //   const formatModelSize = (bytes) => {
// //     if (!bytes) return 'Unknown size'
// //     const gb = bytes / (1024 * 1024 * 1024)
// //     return `${gb.toFixed(1)} GB`
// //   }

// //   const wordCount = formData.domain_input.trim().split(/\s+/).filter(word => word.length > 0).length

// //   return (
// //     <div className="space-y-6">
// //       {/* Sample Data Toggle */}
// //       <div className="flex items-center justify-between">
// //         <h3 className="text-lg font-medium">Domain Information</h3>
// //         <button
// //           type="button"
// //           onClick={() => setShowSamples(!showSamples)}
// //           className="text-blue-600 hover:text-blue-700 text-sm font-medium"
// //         >
// //           {showSamples ? 'Hide' : 'Show'} Sample Data
// //         </button>
// //       </div>

// //       {/* Sample Data Cards */}
// //       {showSamples && (
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
// //           {SAMPLE_DOMAINS.map((sample, index) => (
// //             <button
// //               key={index}
// //               onClick={() => handleSampleSelect(sample)}
// //               className="text-left p-3 bg-white rounded border hover:border-blue-300 hover:shadow-sm transition-all"
// //             >
// //               <div className="font-medium text-gray-900">{sample.name}</div>
// //               <div className="text-sm text-gray-600">v{sample.version}</div>
// //               <div className="text-xs text-gray-500 mt-1 line-clamp-2">
// //                 {sample.input.substring(0, 100)}...
// //               </div>
// //             </button>
// //           ))}
// //         </div>
// //       )}

// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         {/* Domain Name and Version Row */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           <div className="md:col-span-2">
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Domain Name *
// //             </label>
// //             <input
// //               type="text"
// //               value={formData.domain_name}
// //               onChange={(e) => handleInputChange('domain_name', e.target.value)}
// //               className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
// //                 validationErrors.domain_name ? 'border-red-300' : 'border-gray-300'
// //               }`}
// //               placeholder="e.g., Audio, VIP, AOSP"
// //               maxLength={100}
// //             />
// //             {validationErrors.domain_name && (
// //               <p className="mt-1 text-sm text-red-600">{validationErrors.domain_name}</p>
// //             )}
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Version *
// //             </label>
// //             <input
// //               type="text"
// //               value={formData.domain_version}
// //               onChange={(e) => handleInputChange('domain_version', e.target.value)}
// //               className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
// //                 validationErrors.domain_version ? 'border-red-300' : 'border-gray-300'
// //               }`}
// //               placeholder="e.g., 1.0, 2.1"
// //               maxLength={20}
// //             />
// //             {validationErrors.domain_version && (
// //               <p className="mt-1 text-sm text-red-600">{validationErrors.domain_version}</p>
// //             )}
// //           </div>
// //         </div>

// //         {/* Domain Input */}
// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">
// //             Domain Information *
// //           </label>
// //           <textarea
// //             value={formData.domain_input}
// //             onChange={(e) => handleInputChange('domain_input', e.target.value)}
// //             className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
// //               validationErrors.domain_input ? 'border-red-300' : 'border-gray-300'
// //             }`}
// //             rows={6}
// //             placeholder="Describe your domain's functionality, responsibilities, constraints, and requirements..."
// //             maxLength={10000}
// //           />
// //           <div className="flex justify-between items-center mt-1">
// //             <div className="text-xs text-gray-500">
// //               Words: {wordCount} | Characters: {formData.domain_input.length}/10,000
// //             </div>
// //             {formData.domain_input && (
// //               <button
// //                 type="button"
// //                 onClick={() => handleInputChange('domain_input', '')}
// //                 className="text-xs text-gray-400 hover:text-gray-600"
// //               >
// //                 Clear
// //               </button>
// //             )}
// //           </div>
// //           {validationErrors.domain_input && (
// //             <p className="mt-1 text-sm text-red-600">{validationErrors.domain_input}</p>
// //           )}
// //         </div>

// //         {/* Model Selection */}
// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">
// //             AI Model {loadingModels && <span className="text-gray-400">(Loading...)</span>}
// //           </label>
// //           <select
// //             value={formData.model}
// //             onChange={(e) => handleInputChange('model', e.target.value)}
// //             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             disabled={loadingModels}
// //           >
// //             {models.map((model) => (
// //               <option key={model.name} value={model.name}>
// //                 {model.name} {model.size && `(${formatModelSize(model.size)})`}
// //               </option>
// //             ))}
// //           </select>

// //           {/* Model Performance Info */}
// //           <div className="mt-2 text-xs text-gray-600">
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
// //               <div>
// //                 <strong>Large models (27B):</strong> Best quality, slower
// //               </div>
// //               <div>
// //                 <strong>Medium models (9B):</strong> Balanced quality/speed
// //               </div>
// //               <div>
// //                 <strong>Small models (2B):</strong> Fastest, good quality
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Submit Button */}
// //         <div className="flex justify-end">
// //           <button
// //             type="submit"
// //             disabled={loadingModels}
// //             className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //           >
// //             Generate Domain Analysis
// //           </button>
// //         </div>
// //       </form>

// //       {/* Processing Time Estimate */}
// //       {formData.domain_input && (
// //         <div className="bg-blue-50 rounded-lg p-4">
// //           <div className="flex items-start">
// //             <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
// //               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
// //             </svg>
// //             <div className="text-sm text-blue-800">
// //               <div className="font-medium mb-1">Estimated Processing Time</div>
// //               <div>
// //                 Based on your input length ({wordCount} words) and selected model, 
// //                 analysis will take approximately{' '}
// //                 <strong>
// //                   {formData.model.includes('27b') ? '8-12 minutes' :
// //                    formData.model.includes('9b') ? '5-8 minutes' : '3-5 minutes'}
// //                 </strong>.
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* API Error */}
// //       {error && (
// //         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
// //           <div className="flex items-start">
// //             <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
// //               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
// //             </svg>
// //             <div>
// //               <div className="font-medium text-red-800 mb-1">Analysis Failed</div>
// //               <div className="text-sm text-red-700">{error}</div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }


// import React, { useState, useEffect } from 'react'

// const SAMPLE_DOMAINS = [
//   {
//     name: 'Audio',
//     version: '1.0',
//     input: 'Audio Processing Domain: This domain handles all audio-related functionality including audio file ingestion, processing, transformation, encoding, decoding, streaming, and playback. The system must support multiple audio formats (MP3, WAV, FLAC, AAC), provide real-time audio processing capabilities, manage audio metadata, and ensure high-quality audio output with minimal latency.'
//   },
// ]

// export default function DomainForm({ onSubmit, error }) {
//   const [formData, setFormData] = useState({
//     domain_name: '',
//     domain_version: '',
//     domain_input: '',
//     model: 'gemma3:9b'
//   })
//   const [models, setModels] = useState([])
//   const [loadingModels, setLoadingModels] = useState(true)
//   const [showSamples, setShowSamples] = useState(false)
//   const [validationErrors, setValidationErrors] = useState({})

//   // Fetch available models on component mount
//   useEffect(() => {
//     fetchModels()
//   }, [])

//   const fetchModels = async () => {
//     try {
//       const response = await fetch('/models')
//       if (response.ok) {
//         const data = await response.json()
//         setModels(data.models)
//       } else {
//         console.error('Failed to fetch models')
//         // Fallback models
//         setModels([
//           { name: 'gemma3:27b', size: null, details: {} },
//           { name: 'gemma3:9b', size: null, details: {} },
//           { name: 'gemma3:2b', size: null, details: {} }
//         ])
//       }
//     } catch (err) {
//       console.error('Error fetching models:', err)
//       // Fallback models
//       setModels([
//         { name: 'gemma3:27b', size: null, details: {} },
//         { name: 'gemma3:9b', size: null, details: {} },
//         { name: 'gemma3:2b', size: null, details: {} }
//       ])
//     } finally {
//       setLoadingModels(false)
//     }
//   }

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//     // Clear validation error for this field
//     if (validationErrors[field]) {
//       setValidationErrors(prev => ({ ...prev, [field]: null }))
//     }
//   }

//   const validateForm = () => {
//     const errors = {}

//     if (!formData.domain_name.trim()) {
//       errors.domain_name = 'Domain name is required'
//     } else if (formData.domain_name.length > 100) {
//       errors.domain_name = 'Domain name must be less than 100 characters'
//     }

//     if (!formData.domain_version.trim()) {
//       errors.domain_version = 'Version is required'
//     } else if (formData.domain_version.length > 20) {
//       errors.domain_version = 'Version must be less than 20 characters'
//     }

//     if (!formData.domain_input.trim()) {
//       errors.domain_input = 'Domain information is required'
//     } else if (formData.domain_input.length < 10) {
//       errors.domain_input = 'Domain information must be at least 10 characters'
//     } else if (formData.domain_input.length > 10000) {
//       errors.domain_input = 'Domain information must be less than 10,000 characters'
//     }

//     setValidationErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (validateForm()) {
//       onSubmit(formData)
//     }
//   }

//   const handleSampleSelect = (sample) => {
//     setFormData({
//       domain_name: sample.name,
//       domain_version: sample.version,
//       domain_input: sample.input,
//       model: formData.model
//     })
//     setShowSamples(false)
//     setValidationErrors({})
//   }

//   const formatModelSize = (bytes) => {
//     if (!bytes) return 'Unknown size'
//     const gb = bytes / (1024 * 1024 * 1024)
//     return `${gb.toFixed(1)} GB`
//   }

//   const wordCount = formData.domain_input.trim().split(/\s+/).filter(word => word.length > 0).length

//   return (
//     <div className="space-y-6">
//       {/* Sample Data Toggle */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-medium text-white">Domain Information</h3>
//         <button
//           type="button"
//           onClick={() => setShowSamples(!showSamples)}
//           className="text-white hover:text-blue-200 text-sm font-medium"
//         >
//           {showSamples ? 'Hide' : 'Show'} Sample Data
//         </button>
//       </div>

//       {/* Sample Data Cards */}
//       {showSamples && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#111827' }}>
//           {SAMPLE_DOMAINS.map((sample, index) => (
//             <button
//               key={index}
//               onClick={() => handleSampleSelect(sample)}
//               className="text-left p-3 rounded border hover:bg-blue-800 transition-all"
//               style={{ backgroundColor: '#1F2937', borderColor: 'white' }}
//             >
//               <div className="font-medium text-white">{sample.name}</div>
//               <div className="text-sm text-white">v{sample.version}</div>
//               <div className="text-xs text-white mt-1 line-clamp-2">
//                 {sample.input.substring(0, 100)}...
//               </div>
//             </button>
//           ))}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Domain Name and Version Row */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-white mb-2">
//               Domain Name *
//             </label>
//             <input
//               type="text"
//               value={formData.domain_name}
//               onChange={(e) => handleInputChange('domain_name', e.target.value)}
//               className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC] ${
//                 validationErrors.domain_name ? 'border-red-300' : 'border-white'
//               }`}
//               style={{ backgroundColor: '#283241', color: 'white' }}
//               placeholder="e.g., Audio, VIP, AOSP"
//               maxLength={100}
//             />
//             {validationErrors.domain_name && (
//               <p className="mt-1 text-sm text-red-400">{validationErrors.domain_name}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-white mb-2">
//               Version *
//             </label>
//             <input
//               type="text"
//               value={formData.domain_version}
//               onChange={(e) => handleInputChange('domain_version', e.target.value)}
//               className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC] ${
//                 validationErrors.domain_version ? 'border-red-300' : 'border-white'
//               }`}
//               style={{ backgroundColor: '#283241', color: 'white' }}
//               placeholder="e.g., 1.0, 2.1"
//               maxLength={20}
//             />
//             {validationErrors.domain_version && (
//               <p className="mt-1 text-sm text-red-400">{validationErrors.domain_version}</p>
//             )}
//           </div>
//         </div>

//         {/* Domain Input */}
//         <div>
//           <label className="block text-sm font-medium text-white mb-2">
//             Domain Information *
//           </label>
//           <textarea
//             value={formData.domain_input}
//             onChange={(e) => handleInputChange('domain_input', e.target.value)}
//             className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC] ${
//               validationErrors.domain_input ? 'border-red-300' : 'border-white'
//             }`}
//             style={{ backgroundColor: '#283241', color: 'white' }}
//             rows={6}
//             placeholder="Describe your domain's functionality, responsibilities, constraints, and requirements..."
//             maxLength={10000}
//           />
//           <div className="flex justify-between items-center mt-1">
//             <div className="text-xs text-white">
//               Words: {wordCount} | Characters: {formData.domain_input.length}/10,000
//             </div>
//             {formData.domain_input && (
//               <button
//                 type="button"
//                 onClick={() => handleInputChange('domain_input', '')}
//                 className="text-xs text-white hover:text-blue-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//           {validationErrors.domain_input && (
//             <p className="mt-1 text-sm text-red-400">{validationErrors.domain_input}</p>
//           )}
//         </div>

//         {/* Model Selection */}
//         <div>
//           <label className="block text-sm font-medium text-white mb-2">
//             AI Model {loadingModels && <span className="text-white">(Loading...)</span>}
//           </label>
//           <select
//             value={formData.model}
//             onChange={(e) => handleInputChange('model', e.target.value)}
//             className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC]"
//             style={{ backgroundColor: '#111827', color: 'white', borderColor: 'white' }}
//             disabled={loadingModels}
//           >
//             {models.map((model) => (
//               <option key={model.name} value={model.name} style={{ backgroundColor: '#111827', color: 'white' }}>
//                 {model.name} {model.size && `(${formatModelSize(model.size)})`}
//               </option>
//             ))}
//           </select>

//           {/* Model Performance Info */}
//           <div className="mt-2 text-xs text-white">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//               <div>
//                 <strong>Large models (27B):</strong> Best quality, slower
//               </div>
//               <div>
//                 <strong>Medium models (9B):</strong> Balanced quality/speed
//               </div>
//               <div>
//                 <strong>Small models (2B):</strong> Fastest, good quality
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             disabled={loadingModels}
//             className="text-white px-6 py-3 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-[#1E52DC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             style={{ backgroundColor: '#1E52DC' }}
//           >
//             Generate Domain Analysis
//           </button>
//         </div>
//       </form>

//       {/* Processing Time Estimate */}
//       {formData.domain_input && (
//         <div className="rounded-lg p-4" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
//           <div className="flex items-start">
//             <svg className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//             </svg>
//             <div className="text-sm text-white">
//               <div className="font-medium mb-1">Estimated Processing Time</div>
//               <div>
//                 Based on your input length ({wordCount} words) and selected model, 
//                 analysis will take approximately{' '}
//                 <strong>
//                   {formData.model.includes('27b') ? '8-12 minutes' :
//                    formData.model.includes('9b') ? '5-8 minutes' : '3-5 minutes'}
//                 </strong>.
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* API Error */}
//       {error && (
//         <div className="rounded-lg p-4" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
//           <div className="flex items-start">
//             <svg className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//             </svg>
//             <div>
//               <div className="font-medium text-white mb-1">Analysis Failed</div>
//               <div className="text-sm text-white">{error}</div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


import React, { useState, useEffect } from 'react'
import { domainService } from '@/services/domainService'

const SAMPLE_DOMAINS = [
  {
    name: 'audio',
    version: 'bluetooth_v1.0',
    input: 'Audio Processing Domain: This domain handles all audio-related functionality including audio file ingestion, processing, transformation, encoding, decoding, streaming, and playback. The system must support multiple audio formats (MP3, WAV, FLAC, AAC), provide real-time audio processing capabilities, manage audio metadata, and ensure high-quality audio output with minimal latency.'
  },
  {
    name: 'vip',
    version: 'camera_v2.1',
    input: 'VIP (Video Image Processing) Domain: This domain manages all video and image processing operations including video encoding/decoding, image filtering, format conversion, compression, and enhancement. The system handles multiple video codecs (H.264, H.265, VP9), supports real-time video streaming, provides GPU-accelerated processing, and ensures efficient memory management for high-resolution content.'
  },
]

export default function DomainForm({ onSubmit, error }) {
  const [formData, setFormData] = useState({
    domain_type: '',
    instance_name: '',
    domain_input: '',
    generate_model: 'gemma3:27b',
    use_rag: false
  })
  
  const [domainTypes, setDomainTypes] = useState([])
  const [existingInstances, setExistingInstances] = useState([])
  const [duplicateError, setDuplicateError] = useState(null)
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [showSamples, setShowSamples] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Fetch available models and domain data on component mount
  useEffect(() => {
    fetchModels()
    fetchDomainData()
  }, [])

  const fetchDomainData = async () => {
    try {
      const types = await domainService.getDomainTypes()
      setDomainTypes(types)
      
      const instances = await domainService.getAllDomains()
      setExistingInstances(instances)
    } catch (err) {
      console.error('Failed to fetch domain data:', err)
    }
  }

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/v1/scope-gen/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data.models)
      } else {
        console.error('Failed to fetch models')
        // Fallback models
        setModels([
          { name: 'gemma3:27b', size: null, details: {} },
          { name: 'gemma3:9b', size: null, details: {} },
          { name: 'gemma2:2b', size: null, details: {} }
        ])
      }
    } catch (err) {
      console.error('Error fetching models:', err)
      // Fallback models
      setModels([
        { name: 'gemma3:27b', size: null, details: {} },
        { name: 'gemma3:9b', size: null, details: {} },
        { name: 'gemma2:2b', size: null, details: {} }
      ])
    } finally {
      setLoadingModels(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.domain_type.trim()) {
      errors.domain_type = 'Domain type is required'
    }

    if (!formData.instance_name.trim()) {
      errors.instance_name = 'Instance name is required'
    } else if (formData.instance_name.length > 50) {
      errors.instance_name = 'Instance name must be less than 50 characters'
    }

    if (!formData.domain_input.trim()) {
      errors.domain_input = 'Domain information is required'
    } else if (formData.domain_input.length < 10) {
      errors.domain_input = 'Domain information must be at least 10 characters'
    } else if (formData.domain_input.length > 10000) {
      errors.domain_input = 'Domain information must be less than 10,000 characters'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setDuplicateError(null)

    if (validateForm()) {
      // Check for duplicates
      const isDuplicate = existingInstances.some(
        inst => inst.domain_type === formData.domain_type && inst.name === formData.instance_name
      )

      if (isDuplicate) {
        const instancesInType = existingInstances
          .filter(inst => inst.domain_type === formData.domain_type)
          .map(inst => inst.name)
          .join(', ')

        setDuplicateError(`Instance name "${formData.instance_name}" is already used in domain type "${formData.domain_type}". Existing instances: ${instancesInType}`)
        return
      }

      // Map our cleaner UI state to what the backend expects
      onSubmit({
        domain_name: formData.domain_type,
        domain_version: formData.instance_name,
        domain_input: formData.domain_input,
        generate_model: formData.generate_model,
        use_rag: formData.use_rag,
      })
    }
  }

  const handleSampleSelect = (sample) => {
    setFormData({
      domain_type: sample.name,
      instance_name: sample.version,
      domain_input: sample.input,
      generate_model: formData.generate_model,
      use_rag: formData.use_rag
    })
    setShowSamples(false)
    setValidationErrors({})
    setDuplicateError(null)
  }

  const formatModelSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  const wordCount = formData.domain_input.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <div className="space-y-6">
      {/* Sample Data Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Domain Information</h3>
        <button
          type="button"
          onClick={() => setShowSamples(!showSamples)}
          className="text-white hover:text-blue-200 text-sm font-medium"
        >
          {showSamples ? 'Hide' : 'Show'} Sample Data
        </button>
      </div>

      {/* Sample Data Cards */}
      {showSamples && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#111827' }}>
          {SAMPLE_DOMAINS.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleSelect(sample)}
              className="text-left p-3 rounded border hover:bg-blue-800 transition-all"
              style={{ backgroundColor: '#1F2937', borderColor: 'white' }}
            >
              <div className="font-medium text-white">{sample.name}</div>
              <div className="text-sm text-white">v{sample.version}</div>
              <div className="text-xs text-white mt-1 line-clamp-2">
                {sample.input.substring(0, 100)}...
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Duplicate Error Alert */}
      {duplicateError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium text-red-200 mb-1">Instance Already Exists</div>
              <div className="text-sm text-red-300">{duplicateError}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain Type and Instance Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Domain Type *
            </label>
            <select
              value={formData.domain_type}
              onChange={(e) => handleInputChange('domain_type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC] ${validationErrors.domain_type ? 'border-red-300' : 'border-white'
                }`}
              style={{ backgroundColor: '#283241', color: 'white' }}
            >
              <option value="" disabled>Select a Domain Type</option>
              {domainTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {validationErrors.domain_type && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.domain_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Instance Name *
            </label>
            <input
              type="text"
              value={formData.instance_name}
              onChange={(e) => handleInputChange('instance_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC] ${validationErrors.instance_name ? 'border-red-300' : 'border-white'
                }`}
              style={{ backgroundColor: '#283241', color: 'white' }}
              placeholder="e.g., bluetooth_v1.0"
              maxLength={50}
            />
            {validationErrors.instance_name && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.instance_name}</p>
            )}
          </div>
        </div>

        {/* RAG Enhancement Checkbox */}
        <div className="bg-[var(--accent-blue)] p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="use_rag"
                name="use_rag"
                type="checkbox"
                checked={formData.use_rag}
                onChange={(e) => handleInputChange('use_rag', e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="use_rag" className="text-sm font-medium text-white cursor-pointer">
                🚀 Enhanced RAG Generation
              </label>
              <p className="text-xs text-white/90 mt-1">
                Enable AI-powered domain identification and Android documentation context retrieval.
                Uses fast LLM (gemma2:2b) to identify domain type, generate similarity search queries,
                and enhance generation with relevant Android documentation context.
              </p>
              <div className="mt-2 text-xs text-white/80">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>✓ Automatic domain identification</div>
                  <div>✓ Android documentation context</div>
                  <div>✓ Technical accuracy enhancement</div>
                  <div>✓ Keyword extraction</div>
                </div>
              </div>
            </div>
          </div>

          {formData.use_rag && (
            <div className="mt-3 p-3 bg-black/20 rounded text-xs text-white/90">
              <div className="font-medium mb-1">🔄 RAG Process Flow:</div>
              <div className="space-y-1">
                <div>1. Fast LLM identifies domain type and generates search query</div>
                <div>2. Similarity search retrieves relevant Android documentation</div>
                <div>3. Enhanced prompts include technical context for accuracy</div>
                <div>4. Sections marked as "RAG Enhanced" in outputs</div>
              </div>
            </div>
          )}
        </div>

        {/* Domain Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Domain Information *
          </label>
          <textarea
            value={formData.domain_input}
            onChange={(e) => handleInputChange('domain_input', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC] ${validationErrors.domain_input ? 'border-red-300' : 'border-white'
              }`}
            style={{ backgroundColor: '#283241', color: 'white' }}
            rows={6}
            placeholder="Describe your domain's functionality, responsibilities, constraints, and requirements..."
            maxLength={10000}
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-white">
              Words: {wordCount} | Characters: {formData.domain_input.length}/10,000
            </div>
            {formData.domain_input && (
              <button
                type="button"
                onClick={() => handleInputChange('domain_input', '')}
                className="text-xs text-white hover:text-blue-200"
              >
                Clear
              </button>
            )}
          </div>
          {validationErrors.domain_input && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.domain_input}</p>
          )}
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            AI Model {loadingModels && <span className="text-white">(Loading...)</span>}
          </label>
          <select
            value={formData.generate_model}
            onChange={(e) => handleInputChange('generate_model', e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E52DC]"
            style={{ backgroundColor: '#111827', color: 'white', borderColor: 'white' }}
            disabled={loadingModels}
          >
            {models.map((model) => (
              <option key={model.name} value={model.name} style={{ backgroundColor: '#111827', color: 'white' }}>
                {model.name} {model.size && `(${formatModelSize(model.size)})`}
              </option>
            ))}
          </select>

          {/* Model Performance Info */}
          <div className="mt-2 text-xs text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <strong>Large models (27B):</strong> Best quality, slower
              </div>
              <div>
                <strong>Medium models (9B):</strong> Balanced quality/speed
              </div>
              <div>
                <strong>Small models (2B):</strong> Fastest, good quality
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loadingModels}
            className="text-white px-6 py-3 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-[#1E52DC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#1E52DC' }}
          >
            Generate Domain Analysis {formData.use_rag && '🚀'}
          </button>
        </div>
      </form>

      {/* Processing Time Estimate */}
      {formData.domain_input && (
        <div className="rounded-lg p-4" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-white">
              <div className="font-medium mb-1">Estimated Processing Time</div>
              <div>
                Based on your input length ({wordCount} words), selected model, and{' '}
                {formData.use_rag ? 'RAG enhancement enabled' : 'standard processing'},
                analysis will take approximately{' '}
                <strong>
                  {/* {formData.use_rag 
                    ? (formData.model.includes('27b') ? '10-15 minutes' : 
                       formData.model.includes('9b') ? '7-11 minutes' : '5-8 minutes')
                    : (formData.model.includes('27b') ? '8-12 minutes' :
                       formData.model.includes('9b') ? '5-8 minutes' : '3-5 minutes')
                  } */}
                  {formData.use_rag
                    ? (formData.generate_model.includes('27b') ? '10-15 minutes' :
                      formData.generate_model.includes('9b') ? '7-11 minutes' : '5-8 minutes')
                    : (formData.generate_model.includes('27b') ? '8-12 minutes' :
                      formData.generate_model.includes('9b') ? '5-8 minutes' : '3-5 minutes')
                  }
                </strong>.
                {formData.use_rag && (
                  <div className="text-xs mt-1 text-white/80">
                    RAG enhancement adds 2-3 minutes for domain identification and context retrieval.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Error */}
      {error && (
        <div className="rounded-lg p-4" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
          <div className="flex items-start">
            <svg className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium text-white mb-1">Analysis Failed</div>
              <div className="text-sm text-white">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
