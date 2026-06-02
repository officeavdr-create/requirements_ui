import React, { useState, useEffect } from 'react';
import DomainForm from '../components/scope-gen/DomainForm';
import AnalysisProgress from '../components/scope-gen/AnalysisProgress';
import AnalysisResults from '../components/scope-gen/AnalysisResults';
import SavedScopes from '../components/scope-gen/SavedScopes';

type ViewMode = 'form' | 'analyzing' | 'results' | 'saved';

interface AnalysisData {
    id?: string;
    status?: string;
    progress?: number;
    total_sections?: number;
    domain_name?: string;
    domain_version?: string;
    model?: string;
    sections?: any;
    domain_input?: string;
    use_rag?: boolean;
    current_step?: string;
}

const ScopeGeneratorPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('form');
    const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    const handleSubmit = async (formData: any) => {
        try {
            setError(null);
            const response = await fetch('/api/v1/scope-gen/scope-gen-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to start analysis');
            }

            const data = await response.json();
            setCurrentAnalysisId(data.analysis_id);
            setViewMode('analyzing');

            // Start polling for progress
            const interval = setInterval(() => {
                fetchAnalysisStatus(data.analysis_id);
            }, 2000);
            setPollingInterval(interval);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchAnalysisStatus = async (analysisId: string) => {
        try {
            const response = await fetch(`/api/v1/scope-gen/analysis/${analysisId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch analysis status');
            }

            const data = await response.json();
            setAnalysisData(data);

            if (data.status === 'completed') {
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                }
                setViewMode('results');
            } else if (data.status === 'failed') {
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                }
                setError('Analysis failed');
                setViewMode('form');
            }
        } catch (err: any) {
            console.error('Error fetching analysis status:', err);
        }
    };

    const handleReset = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
        setViewMode('form');
        setCurrentAnalysisId(null);
        setAnalysisData(null);
        setError(null);
    };

    const handleViewSaved = () => {
        setViewMode('saved');
    };

    const handleViewAnalysis = async (analysisId: string) => {
        try {
            const response = await fetch(`/api/v1/scope-gen/analysis/${analysisId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch analysis');
            }

            const data = await response.json();
            setAnalysisData(data);
            setCurrentAnalysisId(analysisId);
            setViewMode('results');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Domain Scope Generator</h1>
                <p className="text-lg text-gray-400 mt-1">
                    Generate comprehensive domain analysis with AI-powered insights
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => handleReset()}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${viewMode === 'form' || viewMode === 'analyzing' || viewMode === 'results'
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            New Analysis
                        </button>
                        <button
                            onClick={handleViewSaved}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${viewMode === 'saved'
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                                }`}
                        >
                            Saved Scopes
                        </button>
                    </nav>
                </div>
            </div>

            {/* View Content */}
            <div className="bg-gray-800/70 border border-gray-700 rounded-xl shadow-lg backdrop-blur-sm p-6">
                {viewMode === 'form' && <DomainForm onSubmit={handleSubmit} error={error} />}

                {viewMode === 'analyzing' && analysisData && (
                    <AnalysisProgress data={analysisData} />
                )}

                {viewMode === 'results' && analysisData && (
                    <AnalysisResults data={analysisData} onReset={handleReset} />
                )}

                {viewMode === 'saved' && (
                    <SavedScopes onViewAnalysis={handleViewAnalysis} />
                )}
            </div>
        </div>
    );
};

export default ScopeGeneratorPage;
