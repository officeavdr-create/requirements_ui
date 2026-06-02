
import React, { useState, useEffect } from 'react'
import DomainForm from '@/components/scope-gen/DomainForm'
import AnalysisProgress from '@/components/scope-gen/AnalysisProgress'
import AnalysisResults from '@/components/scope-gen/AnalysisResults'
import SavedScopes from '@/components/scope-gen/SavedScopes'
import { Upload, Search, Zap, Settings, ChevronDown, ChevronRight, Download, Brain } from 'lucide-react';

export default function DomainScopeGen() {
  const [activeTab, setActiveTab] = useState('create')
  const [analysisId, setAnalysisId] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  // Poll for analysis results
  useEffect(() => {
    let interval
    if (analysisId && isLoading) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/v1/scope-gen/analysis/${analysisId}`)
          if (response.ok) {
            const data = await response.json()
            setAnalysisData(data)

            if (data.status === 'completed') {
              setIsLoading(false)
              clearInterval(interval)
            } else if (data.status === 'failed') {
              setIsLoading(false)
              setError(data.error || 'Analysis failed')
              clearInterval(interval)
            }
          }
        } catch (err) {
          console.error('Error polling analysis:', err)
        }
      }, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [analysisId, isLoading])

  const handleAnalysisStart = async (formData) => {
    setIsLoading(true)
    setError(null)
    setAnalysisData(null)
    setAnalysisId(null)

    try {
      const response = await fetch('/api/v1/scope-gen/scope-gen-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisId(data.analysis_id)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to start analysis')
      }
    } catch (err) {
      setIsLoading(false)
      setError(err.message)
    }
  }

  const handleReset = () => {
    setAnalysisId(null)
    setAnalysisData(null)
    setIsLoading(false)
    setError(null)
  }

  const handleViewAnalysis = (scopeId) => {
    setAnalysisId(scopeId)
    setActiveTab('create')
    fetch(`/api/v1/scope-gen/analysis/${scopeId}`)
      .then(res => res.json())
      .then(data => {
        setAnalysisData(data)
        setIsLoading(false)
      })
      .catch(err => setError(err.message))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111827' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-left mb-8">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl border border-gray-600 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Domain Scope Generator</h2>
                <p className="text-gray-300 text-xs">
                  Generate comprehensive Domain scope using AI
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="rounded-lg p-1 shadow-sm" style={{ backgroundColor: '#1F2937', borderColor: 'white', borderWidth: '1px' }}>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'create'
                  ? 'text-white'
                  : 'text-white hover:bg-blue-800'
                }`}
              style={{ backgroundColor: activeTab === 'create' ? '#1E52DC' : 'transparent' }}
            >
              Create Analysis
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'saved'
                  ? 'text-white'
                  : 'text-white hover:bg-blue-800'
                }`}
              style={{ backgroundColor: activeTab === 'saved' ? '#1E52DC' : 'transparent' }}
            >
              Saved Scopes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Domain Form */}
            {!analysisData && !isLoading && (
              <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
                <h2 className="text-xl font-semibold text-white mb-4 ">Create New Domain Analysis</h2>
                <DomainForm onSubmit={handleAnalysisStart} error={error} />
              </div>
            )}

            {/* Analysis Progress */}
            {isLoading && analysisData && (
              <AnalysisProgress data={analysisData} />
            )}

            {/* Error Display */}
            {error && (
              <div className="border rounded-lg p-4" style={{ backgroundColor: '#1F2937', borderColor: 'white' }}>
                <div className="flex items-center text-white">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
                <button
                  onClick={handleReset}
                  className="mt-3 text-white px-4 py-2 rounded"
                  style={{ backgroundColor: '#1E52DC' }}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Analysis Results */}
            {analysisData && analysisData.status === 'completed' && (
              <AnalysisResults data={analysisData} onReset={handleReset} />
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <SavedScopes onViewAnalysis={handleViewAnalysis} />
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-white">
          <p className="text-sm">
            Domain Scope Generator v2.0 • Enhanced with Supabase Database
          </p>
        </footer>
      </div>
    </div>
  )
}