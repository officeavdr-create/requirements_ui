import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, AlertTriangle, CheckCircle, Package, Plus, 
  Edit, Trash2, Download, Search, ChevronRight, Star,
  FileText, Clock, Database, Settings, BrainCircuit
} from 'lucide-react';
import { 
  Domain, 
  unifiedInterfaceService,
  VersionedInterfaceProcessingRequest,
  EnhancedInterfaceProcessingResponse,
  InterfaceVersion,
  InterfaceSpecification,
  EmbeddingStatus
} from '@/services';

interface UnifiedInterfaceSpecificationsTabProps {
  domains: Domain[];
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const UnifiedInterfaceSpecificationsTab: React.FC<UnifiedInterfaceSpecificationsTabProps> = ({
  domains,
  showNotification
}) => {
  // State management
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<InterfaceVersion | null>(null);
  const [rawInterface, setRawInterface] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<EnhancedInterfaceProcessingResponse | null>(null);
  const [interfaceSpecs, setInterfaceSpecs] = useState<InterfaceSpecification[]>([]);
  const [loadingInterfaces, setLoadingInterfaces] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal and workflow states
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<'select' | 'process' | 'review' | 'save'>('select');
  const [interfaceSpecName, setInterfaceSpecName] = useState('');
  const [interfaceSpecVersion, setInterfaceSpecVersion] = useState('v1.0');
  const [interfaceSpecDescription, setInterfaceSpecDescription] = useState('');

  // Load interfaces for selected domain
  const loadInterfaces = async () => {
    if (!selectedDomain) return;
    
    setLoadingInterfaces(true);
    try {
      const result = await unifiedInterfaceService.getInterfacesByDomain(selectedDomain);
      setInterfaceSpecs(result.interfaces);
      showNotification(`Loaded ${result.count} interfaces`, 'success');
    } catch (error) {
      console.error('Error loading interfaces:', error);
      showNotification('Failed to load interfaces', 'error');
      setInterfaceSpecs([]);
    } finally {
      setLoadingInterfaces(false);
    }
  };

  // Handle domain selection
  const handleDomainChange = async (domainId: string) => {
    setSelectedDomain(domainId);
    setSelectedVersion(null);
    setWorkflowStage('select');
    setProcessedResult(null);
    
    if (domainId) {
      await loadInterfaces();
    }
  };

  // Handle interface processing with versioning
  const handleProcessInterface = async () => {
    if (!selectedDomain || !rawInterface.trim() || !interfaceSpecName || !interfaceSpecVersion) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    setProcessing(true);
    setWorkflowStage('process');
    
    try {
      const request: VersionedInterfaceProcessingRequest = {
        raw_interface: rawInterface,
        domain_id: selectedDomain,
        interface_spec_name: interfaceSpecName,
        interface_spec_version: interfaceSpecVersion,
        interface_spec_description: interfaceSpecDescription
      };

      // Use versioned processing with real-time progress
      const result = await unifiedInterfaceService.processVersionedScopeDocumentWithProgress(
        request,
        (progress) => {
          setProcessedResult(progress);
          // Show live progress updates
          if (progress.current_stage && progress.progress_percentage !== undefined) {
            showNotification(
              `${progress.current_stage}: ${progress.progress_percentage}%`, 
              'info'
            );
          }
        }
      );

      setProcessedResult(result);
      setWorkflowStage('review');
      showNotification('Interface processing completed successfully!', 'success');
      
    } catch (error) {
      console.error('Error processing interfaces:', error);
      showNotification(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setWorkflowStage('select');
    } finally {
      setProcessing(false);
    }
  };

  // Handle saving interfaces to database
  const handleSaveInterfaces = async () => {
    if (!processedResult?.session_id || !selectedDomain) {
      showNotification('No processing result to save', 'error');
      return;
    }

    try {
      const saveResult = await unifiedInterfaceService.saveInterfacesFromSession(
        processedResult.session_id,
        selectedDomain
      );

      if (saveResult.success) {
        showNotification(
          `Successfully saved ${saveResult.saved_count} interfaces`, 
          'success'
        );
        setWorkflowStage('save');
        await loadInterfaces(); // Reload to show new interfaces
      } else {
        showNotification(`Save failed: ${saveResult.errors?.join(', ')}`, 'error');
      }
    } catch (error) {
      console.error('Error saving interfaces:', error);
      showNotification('Failed to save interfaces', 'error');
    }
  };

  // Handle starting new processing workflow
  const handleStartNewProcessing = () => {
    setShowNamingModal(true);
  };

  // Handle naming modal confirmation
  const handleNamingConfirm = (name: string, version: string, description?: string) => {
    setInterfaceSpecName(name);
    setInterfaceSpecVersion(version);
    setInterfaceSpecDescription(description || '');
    setShowNamingModal(false);
    setWorkflowStage('process');
  };

  // Get stage progress indicator
  const getStageIndicator = (stage: string) => {
    if (!processedResult?.stage_progress) return '⏳';
    
    const stageInfo = processedResult.stage_progress[stage];
    if (!stageInfo) return '⏳';
    
    switch (stageInfo.status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  // Filter interfaces based on search
  const filteredInterfaces = interfaceSpecs.filter(spec =>
    !searchQuery || 
    spec.interface_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spec.interface_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-load interfaces when domains are available and no domain is selected yet
  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      // Auto-select the first domain
      const firstDomain = domains[0];
      setSelectedDomain(firstDomain.id);
      // loadInterfaces will be called by the next useEffect
    }
  }, [domains, selectedDomain]);

  // Load interfaces when selectedDomain changes and is not empty
  useEffect(() => {
    if (selectedDomain) {
      loadInterfaces();
    }
  }, [selectedDomain]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Interface Specifications</h2>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
            Unified AI Processing
          </span>
        </div>
        
        <div className="flex space-x-2">
          {selectedDomain && (
            <button
              onClick={handleStartNewProcessing}
              disabled={processing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Process New Interface</span>
            </button>
          )}
          
          <button
            onClick={loadInterfaces}
            disabled={!selectedDomain || loadingInterfaces}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingInterfaces ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Domain Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a domain...</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name} ({domain.domain_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedDomain && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Processing Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Processing</h3>
            
            {workflowStage === 'select' && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Ready to process interface specifications</p>
                <button
                  onClick={handleStartNewProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Processing
                </button>
              </div>
            )}

            {workflowStage === 'process' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interface Specification Content
                  </label>
                  <textarea
                    value={rawInterface}
                    onChange={(e) => setRawInterface(e.target.value)}
                    placeholder="Paste your interface specification document here..."
                    className="w-full h-40 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    disabled={processing}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleProcessInterface}
                    disabled={processing || !rawInterface.trim()}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4" />
                        <span>Process with AI</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setWorkflowStage('select')}
                    disabled={processing}
                    className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {workflowStage === 'review' && processedResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Processing Results</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                    processedResult.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {processedResult.status}
                  </span>
                </div>

                {/* Progress indicators */}
                <div className="bg-gray-700 rounded p-4">
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {['analysis', 'extraction', 'parameters', 'generation', 'validation'].map((stage) => (
                      <div key={stage} className="text-center">
                        <div className="text-lg mb-1">{getStageIndicator(stage)}</div>
                        <div className="capitalize text-gray-400">{stage}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results summary */}
                <div className="bg-gray-700 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Interfaces Found:</span>
                      <span className="ml-2 text-white font-semibold">
                        {processedResult.interfaces?.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Processing Time:</span>
                      <span className="ml-2 text-white font-semibold">
                        {new Date(processedResult.processing_timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveInterfaces}
                    disabled={!processedResult.success}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Database className="w-4 h-4" />
                    <span>Save to Database</span>
                  </button>

                  <button
                    onClick={() => setWorkflowStage('select')}
                    className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Start New
                  </button>
                </div>
              </div>
            )}

            {workflowStage === 'save' && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-400 mb-4">Interfaces saved successfully!</p>
                <button
                  onClick={() => setWorkflowStage('select')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Process Another
                </button>
              </div>
            )}
          </div>

          {/* Interfaces List Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Saved Interfaces</h3>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                {filteredInterfaces.length} interfaces
              </span>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search interfaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Interfaces list */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loadingInterfaces ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                  <p className="text-gray-400">Loading interfaces...</p>
                </div>
              ) : filteredInterfaces.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    {searchQuery ? 'No interfaces match your search' : 'No interfaces found'}
                  </p>
                </div>
              ) : (
                filteredInterfaces.map((spec) => (
                  <div key={spec.interface_id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white">{spec.interface_name}</h4>
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {spec.interface_version}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{spec.interface_description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>
                            {unifiedInterfaceService.formatConfidenceScore(spec.ai_confidence_score)}
                          </span>
                          <span>{spec.parameters?.length || 0} params</span>
                          {spec.created_at && (
                            <span>{new Date(spec.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Naming Modal */}
      {showNamingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Interface Specification Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specification Name *
                </label>
                <input
                  type="text"
                  value={interfaceSpecName}
                  onChange={(e) => setInterfaceSpecName(e.target.value)}
                  placeholder="e.g., Bluetooth API v2"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Version *
                </label>
                <input
                  type="text"
                  value={interfaceSpecVersion}
                  onChange={(e) => setInterfaceSpecVersion(e.target.value)}
                  placeholder="e.g., v1.0, v2.1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={interfaceSpecDescription}
                  onChange={(e) => setInterfaceSpecDescription(e.target.value)}
                  placeholder="Brief description of this interface specification..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleNamingConfirm(interfaceSpecName, interfaceSpecVersion, interfaceSpecDescription)}
                disabled={!interfaceSpecName.trim() || !interfaceSpecVersion.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
              <button
                onClick={() => setShowNamingModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedInterfaceSpecificationsTab;