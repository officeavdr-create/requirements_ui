/**
 * Enhanced Interface Specifications Tab - EPIC 7C Implementation
 * Production-scale interface management with advanced UI/UX
 */
import React, { useState, useEffect } from 'react';
import {
  RefreshCw, BrainCircuit, Plus, Maximize2, Settings,
  CheckCircle, Package, AlertTriangle, Database, FileSpreadsheet
} from 'lucide-react';
import {
  Domain,
  unifiedInterfaceService,
  VersionedInterfaceProcessingRequest,
  EnhancedInterfaceProcessingResponse,
  InterfaceVersion,
  InterfaceSpecification
} from '@/services';
 
// Enhanced Components
import HorizontalProgressBar from './HorizontalProgressBar';
import EnhancedSaveWindow from './EnhancedSaveWindow';
import ProductionInterfaceList from './ProductionInterfaceList';
import InlineInterfaceEditor from './InlineInterfaceEditor';
import FullScreenInterfaceModal from './FullScreenInterfaceModal';
import ExcelInterfaceUpload from './ExcelInterfaceUpload';
import EnhancementComparisonModal from './EnhancementComparisonModal';
 
interface EnhancedInterfaceSpecificationsTabProps {
  domains: Domain[];
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}
 
type WorkflowStage = 'select' | 'process' | 'review' | 'save' | 'completed';
type ViewMode = 'standard' | 'fullscreen';
 
const EnhancedInterfaceSpecificationsTab: React.FC<EnhancedInterfaceSpecificationsTabProps> = ({
  domains,
  showNotification
}) => {
  // Core State
  const [selectedDomain, setSelectedDomain] = useState('');
  const [rawInterface, setRawInterface] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<EnhancedInterfaceProcessingResponse | null>(null);
  const [interfaceSpecs, setInterfaceSpecs] = useState<InterfaceSpecification[]>([]);
  const [loadingInterfaces, setLoadingInterfaces] = useState(false);
 
  // Enhanced UI State
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('select');
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [editingInterface, setEditingInterface] = useState<InterfaceSpecification | null>(null);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [contextPreservation, setContextPreservation] = useState<any>({});
 
  // Processing Configuration
  const [interfaceSpecName, setInterfaceSpecName] = useState('');
  const [interfaceSpecVersion, setInterfaceSpecVersion] = useState('v1.0');
  const [interfaceSpecDescription, setInterfaceSpecDescription] = useState('');
  const [showNamingModal, setShowNamingModal] = useState(false);
 
  // Excel Upload State
  const [showExcelUpload, setShowExcelUpload] = useState(false);
 
  // Review Mode State (for Excel extracted interfaces)
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewInterfaces, setReviewInterfaces] = useState<any[]>([]);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
 
  // Enhancement Comparison State
  const [showEnhancementComparison, setShowEnhancementComparison] = useState(false);
  const [enhancementInterfaces, setEnhancementInterfaces] = useState<any[]>([]);
 
  // AI Processing Progress State
  const [processingStages, setProcessingStages] = useState([
    { name: 'analysis', status: 'pending' as const, description: 'Analyzing document structure and content', progress: 0 },
    { name: 'extraction', status: 'pending' as const, description: 'Extracting interface definitions', progress: 0 },
    { name: 'parameters', status: 'pending' as const, description: 'Processing parameters and types', progress: 0 },
    { name: 'generation', status: 'pending' as const, description: 'Generating structured specifications', progress: 0 },
    { name: 'validation', status: 'pending' as const, description: 'Validating output quality', progress: 0 }
  ]);
 
  // Auto-load interfaces when domains are available
  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      const firstDomain = domains[0];
      setSelectedDomain(firstDomain.id);
    }
  }, [domains, selectedDomain]);
 
  useEffect(() => {
    if (selectedDomain) {
      loadInterfaces();
    }
  }, [selectedDomain]);
 
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
 
  // Handle domain selection with context preservation
  const handleDomainChange = async (domainId: string) => {
    // Preserve current context
    setContextPreservation({
      previousDomain: selectedDomain,
      workflowStage,
      rawInterface,
      timestamp: Date.now()
    });
 
    setSelectedDomain(domainId);
    setWorkflowStage('select');
    setProcessedResult(null);
    setEditingInterface(null);
   
    if (domainId) {
      await loadInterfaces();
    }
  };
 
  // Update processing stages based on AI progress
  const updateProcessingStages = (progress: EnhancedInterfaceProcessingResponse) => {
    setProcessingStages(prev => prev.map(stage => {
      const stageInfo = progress.stage_progress?.[stage.name];
      if (stageInfo) {
        return {
          ...stage,
          status: stageInfo.status,
          progress: stageInfo.progress || 0
        };
      }
      return stage;
    }));
  };
 
  // Handle interface processing with enhanced progress
  const handleProcessInterface = async () => {
    if (!selectedDomain || !rawInterface.trim() || !interfaceSpecName || !interfaceSpecVersion) {
      showNotification('Please fill all required fields', 'error');
      return;
    }
 
    setProcessing(true);
    setWorkflowStage('process');
   
    // Reset processing stages
    setProcessingStages(prev => prev.map(stage => ({
      ...stage,
      status: 'pending' as const,
      progress: 0
    })));
   
    try {
      const request: VersionedInterfaceProcessingRequest = {
        raw_interface: rawInterface,
        domain_id: selectedDomain,
        interface_spec_name: interfaceSpecName,
        interface_spec_version: interfaceSpecVersion,
        interface_spec_description: interfaceSpecDescription
      };
 
      const result = await unifiedInterfaceService.processVersionedScopeDocumentWithProgress(
        request,
        (progress) => {
          setProcessedResult(progress);
          updateProcessingStages(progress);
         
          // Show stage completion notifications
          if (progress.current_stage && progress.progress_percentage !== undefined) {
            const stageName = progress.current_stage.charAt(0).toUpperCase() + progress.current_stage.slice(1);
            showNotification(
              `${stageName}: ${progress.progress_percentage}%`,
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
 
  // Handle saving with enhanced feedback (works for both regular processing and review mode)
  const handleSaveInterfaces = async () => {
    // Determine session ID and interface source
    const sessionId = reviewMode ? reviewSessionId : processedResult?.session_id;
    const interfaceCount = reviewMode ? reviewInterfaces.length : processedResult?.interfaces?.length;
    const sourceType = reviewMode ? 'Excel extracted interfaces' : 'processed interfaces';
   
    if (!sessionId || !selectedDomain) {
      showNotification(`No ${sourceType.toLowerCase()} to save`, 'error');
      return;
    }
 
    if (!interfaceCount || interfaceCount === 0) {
      showNotification(`No interfaces found in ${sourceType.toLowerCase()}`, 'warning');
      return;
    }
 
    try {
      const saveResult = await unifiedInterfaceService.saveInterfacesFromSession(
        sessionId,
        selectedDomain
      );
 
      if (saveResult.success) {
        showNotification(
          `Successfully saved ${saveResult.saved_count} ${sourceType.toLowerCase()} with embeddings`,
          'success'
        );
       
        if (reviewMode) {
          // Exit review mode and return to normal state
          setReviewMode(false);
          setReviewInterfaces([]);
          setReviewSessionId(null);
          setWorkflowStage('select');
        } else {
          setWorkflowStage('completed');
        }
       
        await loadInterfaces(); // Reload to show new interfaces
      } else {
        showNotification(`Save failed: ${saveResult.errors?.join(', ')}`, 'error');
      }
    } catch (error) {
      console.error('Error saving interfaces:', error);
      showNotification('Failed to save interfaces', 'error');
    }
  };
 
  // Handle interface editing
  const handleEditInterface = (interface_: InterfaceSpecification) => {
    setEditingInterface(interface_);
  };
 
  const handleSaveEditedInterface = async (updatedInterface: InterfaceSpecification) => {
    try {
      // Update the interface in the list
      setInterfaceSpecs(prev => prev.map(iface =>
        iface.interface_id === updatedInterface.interface_id ? updatedInterface : iface
      ));
     
      setEditingInterface(null);
      showNotification('Interface updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update interface:', error);
      showNotification('Failed to update interface', 'error');
    }
  };
 
  // Handle bulk operations
  const handleBulkAction = async (action: string, interfaces: InterfaceSpecification[]) => {
    if (action === 'delete' && confirm(`Delete ${interfaces.length} interfaces?`)) {
      try {
        let deletedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];
 
        for (const iface of interfaces) {
          if (iface.interface_id) {
            try {
              await unifiedInterfaceService.deleteInterface(iface.interface_id);
              deletedCount++;
            } catch (error) {
              console.error(`Failed to delete interface ${iface.interface_name}:`, error);
              errors.push(`${iface.interface_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          } else {
            console.warn(`Interface ${iface.interface_name} has no ID, skipping delete`);
            skippedCount++;
          }
        }
 
        await loadInterfaces(); // Reload to reflect changes
 
        // Provide detailed feedback
        if (deletedCount > 0 && errors.length === 0) {
          showNotification(`Successfully deleted ${deletedCount} interfaces`, 'success');
        } else if (deletedCount > 0 && errors.length > 0) {
          showNotification(`Deleted ${deletedCount} interfaces, ${errors.length} failed`, 'info');
        } else if (skippedCount > 0) {
          showNotification(`Skipped ${skippedCount} interfaces (no ID)`, 'info');
        } else {
          showNotification('No interfaces were deleted', 'error');
        }
 
        if (errors.length > 0) {
          console.error('Delete errors:', errors);
        }
      } catch (error) {
        console.error('Bulk delete failed:', error);
        showNotification('Bulk delete operation failed', 'error');
      }
    }
  };
 
  // Handle Excel upload
  const handleExcelUploadSuccess = async (result: any) => {
    try {
      setShowExcelUpload(false);
     
      if (result.ready_for_review) {
        showNotification(`Excel extraction complete! ${result.interfaces_count} interfaces ready for review.`, 'success');
       
        // Load extracted interfaces from session for enhancement review
        try {
          const response = await fetch(`/api/v1/interfaces/session/${result.session_id}/interfaces`);
          if (response.ok) {
            const sessionData = await response.json();
            if (sessionData.interface_count > 0) {
              // Check if any interfaces have AI enhancements
              const hasEnhancements = sessionData.interfaces.some((iface: any) =>
                iface.enhancement_applied && iface.original_interface
              );
             
              if (hasEnhancements) {
                // Show enhancement comparison modal first
                setEnhancementInterfaces(sessionData.interfaces);
                setReviewSessionId(result.session_id);
                setShowEnhancementComparison(true);
                showNotification(
                  `${sessionData.interface_count} interfaces extracted with AI enhancements. Review AI improvements before saving.`,
                  'info'
                );
              } else {
                // No enhancements, go directly to review mode
                setReviewMode(true);
                setReviewInterfaces(sessionData.interfaces);
                setReviewSessionId(result.session_id);
                setWorkflowStage('review');
                showNotification(
                  `${sessionData.interface_count} interfaces extracted and ready for review. Review and click "Save Interfaces" when ready.`,
                  'info'
                );
              }
            } else {
              showNotification('No interfaces found in extraction results', 'warning');
            }
          } else {
            throw new Error('Failed to fetch session interfaces');
          }
        } catch (error) {
          console.error('Failed to load extracted interfaces for review:', error);
          showNotification('Interfaces extracted but failed to load for review', 'error');
        }
      } else {
        showNotification(`Excel upload successful! Processing ${result.interfaces_count} interfaces...`, 'success');
        // Fallback: reload interfaces after delay
        setTimeout(async () => {
          await loadInterfaces();
        }, 2000);
      }
     
    } catch (error) {
      console.error('Excel upload success handler error:', error);
      showNotification('Excel upload completed but failed to refresh interfaces', 'error');
    }
  };
 
  // Handle enhancement comparison completion
  const handleEnhancementDecisions = async (finalInterfaces: any[]) => {
    setShowEnhancementComparison(false);
   
    // Enter review mode with user-approved interfaces
    setReviewMode(true);
    setReviewInterfaces(finalInterfaces);
    setWorkflowStage('review');
   
    const enhancedCount = finalInterfaces.filter(iface => iface.enhancement_applied).length;
    const originalCount = finalInterfaces.length - enhancedCount;
   
    showNotification(
      `Enhancement review complete! ${enhancedCount} enhanced and ${originalCount} original interfaces ready for final save.`,
      'success'
    );
  };
 
  // Calculate overall processing progress
  const overallProgress = processingStages.reduce((acc, stage) => acc + stage.progress, 0) / processingStages.length;
  const currentStage = processingStages.find(s => s.status === 'in_progress')?.name;
 
  const selectedDomainObj = domains.find(d => d.id === selectedDomain);
 
  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Enhanced Interface Specifications</h2>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30">
            Production-Scale Management
          </span>
        </div>
       
        <div className="flex space-x-2">
          {selectedDomain && (
            <>
              <button
                onClick={() => setShowFullScreenModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Full Management</span>
              </button>
             
              <button
                onClick={() => setShowExcelUpload(true)}
                disabled={processing}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Excel</span>
              </button>
             
              <button
                onClick={() => setShowNamingModal(true)}
                disabled={processing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Processing</span>
              </button>
            </>
          )}
         
          <button
            onClick={loadInterfaces}
            disabled={!selectedDomain || loadingInterfaces}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingInterfaces ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
 
      {/* Domain Selection */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Domain for Interface Management
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a domain...</option>
              {domains
                .filter((domain) => domain && domain.id) // Filter out domains with null/undefined IDs
                .map((domain, index) => (
                <option key={domain.id || `domain-${index}`} value={domain.id}>
                  {domain.name} ({domain.domain_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
 
      {/* Main Content Area */}
      {selectedDomain && (
        <div className="space-y-6">
         
          {/* Enhanced AI Processing Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
            {workflowStage === 'select' && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI Interface Processing</h3>
                <p className="text-gray-400 mb-4">Ready to process interface specifications with advanced AI analysis</p>
                <div className="text-xs text-gray-500 mb-6">
                  Use the "New Processing" button in the header to start interface processing
                </div>
              </div>
            )}
 
            {workflowStage === 'process' && (
              <div className="space-y-6">
                {/* Interface Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interface Specification Content
                  </label>
                  <textarea
                    value={rawInterface}
                    onChange={(e) => setRawInterface(e.target.value)}
                    placeholder="Paste your interface specification document here..."
                    className="w-full h-40 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 resize-y"
                    disabled={processing}
                  />
                </div>
 
                {/* Enhanced Horizontal Progress */}
                {processing && (
                  <HorizontalProgressBar
                    stages={processingStages}
                    currentStage={currentStage}
                    overallProgress={overallProgress}
                    className="mb-4"
                  />
                )}
 
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleProcessInterface}
                    disabled={processing || !rawInterface.trim()}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4" />
                        <span>Process with Enhanced AI</span>
                      </>
                    )}
                  </button>
 
                  <button
                    onClick={() => setWorkflowStage('select')}
                    disabled={processing}
                    className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
 
            {workflowStage === 'review' && (processedResult || reviewMode) && (
              <>
                {reviewMode && (
                  <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <FileSpreadsheet className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-green-300">
                        Excel Interfaces Ready for Review
                      </h3>
                    </div>
                    <p className="text-green-200 mb-3">
                      {reviewInterfaces.length} interfaces have been extracted from your Excel file.
                      Please review them below and click "Save Interfaces" when ready.
                    </p>
                    <div className="text-sm text-green-300">
                      📄 Session ID: {reviewSessionId}
                    </div>
                  </div>
                )}
               
                <EnhancedSaveWindow
                  processedResult={processedResult || {
                    interfaces: reviewInterfaces,
                    session_id: reviewSessionId || '',
                    domain_name: domains.find(d => d.id === selectedDomain)?.name || 'Unknown',
                    interface_spec_name: reviewMode ? 'Excel Upload' : processedResult?.interface_spec_name || '',
                    interface_spec_version: reviewMode ? 'v1.0' : processedResult?.interface_spec_version || '',
                    interface_spec_description: reviewMode ? 'Interfaces extracted from Excel file' : processedResult?.interface_spec_description || '',
                    processing_timestamp: new Date().toISOString(),
                    status: 'completed',
                    stages_completed: ['extraction'],
                    current_stage: null,
                    current_stage_description: null,
                    progress_percentage: 100,
                    total_stages: 1,
                    stage_progress: null,
                    validation_results: null,
                    errors: [],
                    analysis_data: null,
                    extraction_data: null,
                    parameter_data: null,
                    embedding_status: 'pending',
                    success: true
                  }}
                  onSave={handleSaveInterfaces}
                  onCancel={() => {
                    if (reviewMode) {
                      setReviewMode(false);
                      setReviewInterfaces([]);
                      setReviewSessionId(null);
                    }
                    setWorkflowStage('select');
                  }}
                  className="w-full"
                />
              </>
            )}
 
            {workflowStage === 'completed' && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">Processing Completed!</h3>
                <p className="text-gray-400 mb-4">Interfaces saved successfully with embeddings updated</p>
                <button
                  onClick={() => setWorkflowStage('select')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Process Another
                </button>
              </div>
            )}
          </div>
 
          {/* Enhanced Interface List or Editor */}
          {editingInterface ? (
            <InlineInterfaceEditor
              interface_={editingInterface}
              onSave={handleSaveEditedInterface}
              onCancel={() => setEditingInterface(null)}
              onDelete={() => {
                if (editingInterface.interface_id && confirm('Delete this interface?')) {
                  unifiedInterfaceService.deleteInterface(editingInterface.interface_id)
                    .then(() => {
                      setEditingInterface(null);
                      loadInterfaces();
                      showNotification('Interface deleted successfully', 'success');
                    })
                    .catch(() => showNotification('Failed to delete interface', 'error'));
                }
              }}
            />
          ) : (
            <ProductionInterfaceList
              interfaces={interfaceSpecs}
              onEdit={handleEditInterface}
              onView={(iface) => showNotification(`Viewing ${iface.interface_name}`, 'info')}
              onBulkAction={handleBulkAction}
              className="min-h-[500px]"
            />
          )}
        </div>
      )}
 
      {/* Full-Screen Modal */}
      {showFullScreenModal && selectedDomainObj && (
        <FullScreenInterfaceModal
          isOpen={showFullScreenModal}
          onClose={() => setShowFullScreenModal(false)}
          domain={selectedDomainObj}
          onSave={(interfaces) => {
            loadInterfaces();
            showNotification(`Updated ${interfaces.length} interfaces`, 'success');
          }}
        />
      )}
 
      {/* Naming Modal */}
      {showNamingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
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
                  placeholder="e.g., Bluetooth Core APIs v2"
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
                onClick={() => {
                  if (interfaceSpecName.trim() && interfaceSpecVersion.trim()) {
                    setShowNamingModal(false);
                    setWorkflowStage('process');
                  }
                }}
                disabled={!interfaceSpecName.trim() || !interfaceSpecVersion.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => setShowNamingModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Excel Upload Modal */}
      {showExcelUpload && (
        <ExcelInterfaceUpload
          domains={domains}
          selectedDomain={selectedDomain}
          onUploadSuccess={handleExcelUploadSuccess}
          onClose={() => setShowExcelUpload(false)}
          showNotification={showNotification}
        />
      )}
 
      {/* Enhancement Comparison Modal */}
      {showEnhancementComparison && (
        <EnhancementComparisonModal
          isOpen={showEnhancementComparison}
          interfaces={enhancementInterfaces}
          onSaveEnhancements={handleEnhancementDecisions}
          onClose={() => {
            setShowEnhancementComparison(false);
            // If user cancels enhancement review, go to regular review mode
            setReviewMode(true);
            setReviewInterfaces(enhancementInterfaces);
            setWorkflowStage('review');
            showNotification('Enhancement review cancelled. Using original interfaces.', 'info');
          }}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};
 
export default EnhancedInterfaceSpecificationsTab;