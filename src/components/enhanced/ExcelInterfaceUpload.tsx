/**
 * Excel Interface Upload Component
 * AI-driven Excel interface specification upload with drag-and-drop support
 */
import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle, 
  X, Play, Loader2, FileCheck, Database, BrainCircuit, Zap
} from 'lucide-react';
import AIFailureDialog from '../AIFailureDialog';

interface ExcelUploadProps {
  domains: Array<{id: string; name: string;}>;
  selectedDomain: string;
  onUploadSuccess: (result: any) => void;
  onClose: () => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ExcelValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  interface_count: number;
  columns_found: string[];
  parameter_columns_found: number;
}

interface UploadProgress {
  stage: string;
  progress: number;
  description: string;
}

const ExcelInterfaceUpload: React.FC<ExcelUploadProps> = ({
  domains,
  selectedDomain,
  onUploadSuccess,
  onClose,
  showNotification
}) => {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [interfaceSpecName, setInterfaceSpecName] = useState('');
  const [interfaceSpecVersion, setInterfaceSpecVersion] = useState('v1.0');
  const [interfaceSpecDescription, setInterfaceSpecDescription] = useState('');
  const [validation, setValidation] = useState<ExcelValidation | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // AI failure handling state
  const [showAIFailureDialog, setShowAIFailureDialog] = useState(false);
  const [aiFailureReason, setAIFailureReason] = useState('');
  const [aiFailureDetails, setAIFailureDetails] = useState<Array<{interface: string; reason: string}>>([]);
  const [scriptInterfaceCount, setScriptInterfaceCount] = useState(0);
  const [scriptInterfaces, setScriptInterfaces] = useState<any[]>([]);
  
  // AI prompt editing state
  const [showAIPromptEditor, setShowAIPromptEditor] = useState(false);
  
  // EPIC 20: AI processing toggle state
  const [skipAIProcessing, setSkipAIProcessing] = useState(false);
  const [aiPrompt, setAIPrompt] = useState(`You are an expert software engineer specializing in interface specifications and API documentation.

Your task is to enhance and refine interface specifications extracted from Excel documents to ensure they are technically accurate, complete, and follow industry best practices.

For each interface, analyze and enhance:
1. **Interface Name**: Ensure it follows naming conventions
2. **Description**: Make it clear, technical, and comprehensive
3. **Parameters**: Validate types, add missing details, ensure completeness
4. **Return Types**: Specify exact return types and descriptions
5. **Error Handling**: Add appropriate error conditions
6. **Technical Accuracy**: Ensure all technical details are correct

Maintain the original intent while improving technical precision and completeness.`);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Get selected domain info
  const selectedDomainInfo = domains.find(d => d.id === selectedDomain);

  // File validation
  const validateFile = (file: File): boolean => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      showNotification('Please select an Excel file (.xlsx or .xls)', 'error');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showNotification('File size must be less than 10MB', 'error');
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setValidation(null);
      
      // Auto-generate interface spec name from filename
      if (!interfaceSpecName) {
        const baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setInterfaceSpecName(baseName.replace(/[^a-zA-Z0-9_]/g, '_'));
      }
    }
  }, [interfaceSpecName, showNotification]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // File input click handler
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Poll upload progress
  const pollProgress = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/interfaces/upload-excel/progress/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get progress');
      }
      
      const progress = await response.json();
      
      // Update progress
      if (progress.stage_progress) {
        const currentStage = Object.keys(progress.stage_progress).find(
          stage => progress.stage_progress[stage].status === 'in_progress'
        );
        
        if (currentStage) {
          setUploadProgress({
            stage: currentStage,
            progress: progress.stage_progress[currentStage].progress || 0,
            description: progress.stage_progress[currentStage].description || 'Processing...'
          });
        }
      }
      
      // Check for AI failure first
      if (progress.ai_failure || progress.requires_user_decision) {
        setUploading(false);
        setUploadProgress(null);
        
        if (progressPollingRef.current) {
          clearInterval(progressPollingRef.current);
        }
        
        console.log('AI failure detected in progress polling:', {
          ai_failure_reason: progress.ai_failure_reason,
          script_interfaces_count: progress.script_interfaces_count
        });
        
        setAIFailureReason(progress.ai_failure_reason || 'Unknown AI failure');
        setAIFailureDetails(progress.ai_failure_details || []);
        setScriptInterfaceCount(progress.script_interfaces_count || 0);
        setScriptInterfaces(progress.script_interfaces || []);
        setShowAIFailureDialog(true);
        
        return; // Don't proceed with normal flow
      }
      
      // Check if extraction is complete and ready for review
      if (progress.status === 'completed' && progress.success && progress.extraction_complete) {
        setUploading(false);
        setUploadProgress(null);
        
        if (progressPollingRef.current) {
          clearInterval(progressPollingRef.current);
        }
        
        const enhancementApplied = progress.enhancement_applied || false;
        const enhancementMessage = enhancementApplied 
          ? `Successfully extracted and enhanced ${progress.interfaces_extracted} interfaces with AI improvements!` 
          : `Successfully extracted ${progress.interfaces_extracted} interfaces from Excel file. Ready for review!`;
        
        showNotification(enhancementMessage, 'success');
        
        onUploadSuccess({
          session_id: sessionId,
          interfaces_count: progress.interfaces_extracted,
          source_type: 'excel_upload',
          ready_for_review: true,
          enhancement_applied: enhancementApplied
        });
        
      } else if (progress.status === 'error') {
        setUploading(false);
        setUploadProgress(null);
        
        if (progressPollingRef.current) {
          clearInterval(progressPollingRef.current);
        }
        
        const errorMessage = progress.errors?.length > 0 
          ? progress.errors.join('; ') 
          : 'Excel processing failed';
        showNotification(`Upload failed: ${errorMessage}`, 'error');
      }
      
    } catch (error) {
      console.error('Progress polling error:', error);
    }
  }, [onUploadSuccess, showNotification]);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !selectedDomain || !interfaceSpecName.trim()) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    console.log('Starting Excel upload...', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      domain: selectedDomain,
      specName: interfaceSpecName.trim(),
      specVersion: interfaceSpecVersion
    });

    setUploading(true);
    setUploadProgress({ stage: 'upload', progress: 0, description: 'Uploading Excel file...' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('domain_id', selectedDomain);
      formData.append('interface_spec_name', interfaceSpecName.trim());
      formData.append('interface_spec_version', interfaceSpecVersion);
      if (interfaceSpecDescription.trim()) {
        formData.append('interface_spec_description', interfaceSpecDescription.trim());
      }
      // Add custom AI prompt for interface enhancement
      if (aiPrompt.trim()) {
        formData.append('ai_prompt', aiPrompt.trim());
      }
      
      // EPIC 20: Add AI processing toggle
      formData.append('skip_ai_processing', skipAIProcessing.toString());

      console.log('FormData prepared, sending request to /api/v1/interfaces/upload-excel');
      console.log('DEBUG: skipAIProcessing state:', skipAIProcessing);
      console.log('DEBUG: FormData skip_ai_processing:', formData.get('skip_ai_processing'));

      const response = await fetch('/api/v1/interfaces/upload-excel', {
        method: 'POST',
        body: formData
      });

      console.log('Upload response received:', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: `Upload failed: ${response.status} ${response.statusText}` };
        }
        
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      console.log('Validation data extracted:', {
        validation_results: result.validation_results,
        excel_analysis: result.excel_analysis,
        interfaces_count: result.interfaces_count,
        errors: result.errors
      });
      
      if (result.success && result.session_id) {
        setSessionId(result.session_id);
        // Ensure validation_results has the expected structure
        const validationData = result.validation_results || {};
        const excelAnalysis = result.excel_analysis || {};
        setValidation({
          valid: validationData.valid !== false,
          errors: validationData.errors || [],
          warnings: validationData.warnings || result.errors || [],
          interface_count: validationData.interfaces_parsed || result.interfaces_count || excelAnalysis.interface_count || 0,
          columns_found: excelAnalysis.columns_found || validationData.columns_found || [],
          parameter_columns_found: excelAnalysis.parameter_columns || validationData.parameter_columns || 0
        });
        
        setUploadProgress({ 
          stage: 'analysis', 
          progress: 10, 
          description: 'Analyzing Excel structure...' 
        });
        
        // Start polling for progress
        progressPollingRef.current = setInterval(() => {
          pollProgress(result.session_id);
        }, 1000);
        
        showNotification('Excel file uploaded successfully, processing...', 'info');
        
      } else if (result.ai_failure_reason) {
        // Handle AI failure responses
        setUploading(false);
        setUploadProgress(null);
        
        setAIFailureReason(result.ai_failure_reason);
        setAIFailureDetails(result.ai_failure_details || []);
        setScriptInterfaceCount(result.script_interfaces?.length || 0);
        setScriptInterfaces(result.script_interfaces || []);
        setShowAIFailureDialog(true);
        
      } else {
        throw new Error(result.errors?.join('; ') || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error details:', {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setUploading(false);
      setUploadProgress(null);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      showNotification(`Upload failed: ${errorMessage}`, 'error');
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (progressPollingRef.current) {
        clearInterval(progressPollingRef.current);
      }
    };
  }, []);

  // AI failure dialog handlers
  const handleCancelSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/v1/interfaces/handle-ai-failure/${sessionId}?decision=cancel_session_fix_ai`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowAIFailureDialog(false);
        // Reset all states
        setSelectedFile(null);
        setValidation(null);
        setAIFailureReason('');
        setAIFailureDetails([]);
        setScriptInterfaceCount(0);
        setScriptInterfaces([]);
        setSessionId(null);
        showNotification('Session cancelled. Please check AI service and try again.', 'info');
      } else {
        showNotification('Failed to cancel session', 'error');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      showNotification('Error cancelling session', 'error');
    }
  }, [sessionId, showNotification]);

  const handleProceedScriptOnly = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/v1/interfaces/handle-ai-failure/${sessionId}?decision=proceed_script_only`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowAIFailureDialog(false);
        showNotification(`Proceeding with ${result.interface_count} script-extracted interfaces`, 'info');
        onUploadSuccess({
          session_id: sessionId,
          interfaces_count: result.interface_count,
          source_type: 'excel_upload_script_only',
          ready_for_review: true,
          enhancement_applied: false,
          interfaces: result.interfaces
        });
      } else {
        showNotification('Failed to proceed with script-only extraction', 'error');
      }
    } catch (error) {
      console.error('Error proceeding with script-only:', error);
      showNotification('Error proceeding with script-only extraction', 'error');
    }
  }, [sessionId, onUploadSuccess, showNotification]);

  return (
    <>
      {/* AI Failure Dialog */}
      <AIFailureDialog
        isOpen={showAIFailureDialog}
        onClose={() => setShowAIFailureDialog(false)}
        failureReason={aiFailureReason}
        failureDetails={aiFailureDetails}
        onCancelSession={handleCancelSession}
        onProceedScriptOnly={handleProceedScriptOnly}
        scriptInterfaceCount={scriptInterfaceCount}
      />
      
      {/* Main Upload Dialog */}
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-600">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">
                Upload Excel Interface Specifications
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              disabled={uploading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-300 mt-2">
            Upload an Excel file containing interface specifications for AI-driven extraction
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Domain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Domain *
            </label>
            <div className="flex items-center gap-2 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-medium">
                {selectedDomainInfo?.name || 'Unknown Domain'}
              </span>
            </div>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excel File *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-400 bg-blue-900/20' 
                  : selectedFile 
                    ? 'border-green-400 bg-green-900/20' 
                    : 'border-gray-500 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={uploading}
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <FileCheck className="w-12 h-12 text-green-400 mx-auto" />
                  <p className="text-lg font-medium text-green-300">{selectedFile.name}</p>
                  <p className="text-sm text-green-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={handleFileInputClick}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    disabled={uploading}
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-300">
                      Drop your Excel file here
                    </p>
                    <p className="text-sm text-gray-400">
                      or{' '}
                      <button
                        onClick={handleFileInputClick}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                        disabled={uploading}
                      >
                        browse to upload
                      </button>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Supports .xlsx and .xls files up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interface Specification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interface Specification Name *
              </label>
              <input
                type="text"
                value={interfaceSpecName}
                onChange={(e) => setInterfaceSpecName(e.target.value)}
                placeholder="e.g., bluetooth_interfaces_v1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                disabled={uploading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Version
              </label>
              <input
                type="text"
                value={interfaceSpecVersion}
                onChange={(e) => setInterfaceSpecVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                disabled={uploading}
              />
            </div>
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-400"
              disabled={uploading}
            />
          </div>

          {/* EPIC 20: AI Processing Toggle */}
          <div className="border border-amber-500/30 bg-amber-900/10 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  id="skip-ai-processing"
                  checked={skipAIProcessing}
                  onChange={(e) => setSkipAIProcessing(e.target.checked)}
                  className="h-4 w-4 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-amber-500"
                  disabled={uploading}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="skip-ai-processing" className="flex items-center gap-2 font-medium text-amber-300 cursor-pointer">
                  <Zap className="w-4 h-4" />
                  Skip AI Enhancement (Direct Excel parsing only)
                </label>
                <p className="text-sm text-amber-200/80 mt-1">
                  {skipAIProcessing 
                    ? "⚡ Fast mode: Extract interfaces directly from Excel without AI enhancement"
                    : "🤖 AI mode: Enhance interfaces with AI processing for better quality"
                  }
                </p>
                {skipAIProcessing && (
                  <div className="mt-2 text-xs text-amber-300 bg-amber-900/20 rounded p-2">
                    <span className="font-medium">Note:</span> Direct parsing may result in basic interface specifications. 
                    AI enhancement improves descriptions, validates parameters, and adds technical accuracy.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Prompt Editor */}
          <div className={`border rounded-lg ${skipAIProcessing ? 'border-gray-500 opacity-50' : 'border-gray-600'}`}>
            <button
              onClick={() => !skipAIProcessing && setShowAIPromptEditor(!showAIPromptEditor)}
              className={`w-full p-4 rounded-lg flex items-center justify-between text-left transition-colors ${
                skipAIProcessing 
                  ? 'bg-gray-800 cursor-not-allowed' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              disabled={uploading || skipAIProcessing}
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className={`w-5 h-5 ${skipAIProcessing ? 'text-gray-500' : 'text-purple-400'}`} />
                <span className={`font-medium ${skipAIProcessing ? 'text-gray-500' : 'text-gray-300'}`}>
                  AI Enhancement Prompt
                </span>
                <span className={`text-xs ${skipAIProcessing ? 'text-gray-600' : 'text-gray-500'}`}>
                  {skipAIProcessing ? '(Disabled when AI is skipped)' : '(Click to customize)'}
                </span>
              </div>
              <span className="text-gray-400">
                {showAIPromptEditor ? '▼' : '▶'}
              </span>
            </button>
            
            {showAIPromptEditor && !skipAIProcessing && (
              <div className="p-4 border-t border-gray-600">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>🎯 Main AI Model:</span>
                    <code className="px-2 py-1 bg-gray-800 rounded text-yellow-400">codellama:34b</code>
                  </div>
                  <label className="block text-sm font-medium text-gray-300">
                    Custom AI Prompt for Interface Enhancement:
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAIPrompt(e.target.value)}
                    placeholder="Enter your custom AI prompt for interface enhancement..."
                    rows={8}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical placeholder-gray-400 font-mono text-sm"
                    disabled={uploading}
                  />
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>💡 Tip: The prompt will be used to enhance each interface specification during AI processing</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Results */}
          {validation && (
            <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-green-400" />
                Excel Validation Results
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Interfaces found:</span> {validation.interface_count || 0}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Columns found:</span> {validation.columns_found?.length || 0}
                </p>
                {validation.warnings && validation.warnings.length > 0 && (
                  <div className="text-sm text-amber-400">
                    <span className="font-medium">Warnings:</span>
                    <ul className="list-disc list-inside ml-2">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-3 mb-2">
                <BrainCircuit className={`w-5 h-5 text-blue-400 ${uploadProgress.stage === 'generation' ? 'animate-pulse' : ''}`} />
                <h4 className="font-medium text-blue-300">AI Processing Progress</h4>
                {uploadProgress.stage === 'generation' && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                    🧠 AI Enhancement Active
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-blue-300">
                  <span className="capitalize">{uploadProgress.stage} Stage</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-blue-900/30 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      uploadProgress.stage === 'generation' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse' 
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
                <p className="text-sm text-blue-400">{uploadProgress.description}</p>
                
                {/* AI Activity Indicator */}
                {uploadProgress.stage === 'generation' && (
                  <div className="mt-2 p-2 bg-purple-900/20 border border-purple-500/30 rounded">
                    <div className="flex items-center gap-2 text-purple-300 text-xs">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span>CodeLlama 34B is enhancing interface specifications...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !interfaceSpecName.trim() || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Upload & Process
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ExcelInterfaceUpload;