/**
 * Enhanced Save Window for Interface Specifications
 * Story 7C.2: Enhanced Interface Save Window
 */
import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Loader2, Save, FileText, Clock, BrainCircuit } from 'lucide-react';
import { EnhancedInterfaceProcessingResponse } from '@/services';

interface SaveProgress {
  stage: 'validating' | 'saving' | 'embedding' | 'indexing' | 'completed';
  progress: number;
  message: string;
}

interface EnhancedSaveWindowProps {
  processedResult: EnhancedInterfaceProcessingResponse;
  onSave: () => Promise<any>;
  onCancel: () => void;
  className?: string;
}

const EnhancedSaveWindow: React.FC<EnhancedSaveWindowProps> = ({
  processedResult,
  onSave,
  onCancel,
  className = ''
}) => {
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<SaveProgress | null>(null);
  const [saveResult, setSaveResult] = useState<any>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);

    // Simulate save progress stages
    const stages: SaveProgress[] = [
      { stage: 'validating', progress: 20, message: 'Validating interface specifications...' },
      { stage: 'saving', progress: 50, message: 'Saving interfaces to database...' },
      { stage: 'embedding', progress: 75, message: 'Updating vector embeddings...' },
      { stage: 'indexing', progress: 90, message: 'Updating search indexes...' },
      { stage: 'completed', progress: 100, message: 'Save completed successfully!' }
    ];

    try {
      for (const stage of stages) {
        setSaveProgress(stage);
        
        // Realistic timing for different stages
        const delay = stage.stage === 'embedding' ? 2000 : 800;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (stage.stage === 'saving') {
          // Actual save call happens here
          const result = await onSave();
          setSaveResult(result);
        }
      }
    } catch (error) {
      setSaveProgress({
        stage: 'validating',
        progress: 0,
        message: `Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSaving(false);
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'validating':
        return <FileText className="w-4 h-4" />;
      case 'saving':
        return <Database className="w-4 h-4" />;
      case 'embedding':
        return <Clock className="w-4 h-4" />;
      case 'indexing':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Save className="w-4 h-4" />;
    }
  };

  const interfaceCount = processedResult.interfaces?.length || 0;
  const isCompleted = saveProgress?.stage === 'completed';

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-600 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Save Interface Specifications</h3>
        </div>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
          {interfaceCount} interfaces
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        
        {/* Save Summary */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Specification Name:</span>
              <div className="text-white font-semibold">{processedResult.interface_spec_name}</div>
            </div>
            <div>
              <span className="text-gray-400">Version:</span>
              <div className="text-white font-semibold">{processedResult.interface_spec_version}</div>
            </div>
            <div>
              <span className="text-gray-400">Interfaces Found:</span>
              <div className="text-white font-semibold">{interfaceCount}</div>
            </div>
            <div>
              <span className="text-gray-400">Processing Time:</span>
              <div className="text-white font-semibold">
                {new Date(processedResult.processing_timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Interface Preview with Enhancement Info */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Interface Preview</h4>
          
          {/* Enhancement Summary */}
          {processedResult.interfaces?.some(iface => iface.enhancement_applied) && (
            <div className="mb-3 p-2 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-300 text-xs">
                <BrainCircuit className="w-3 h-3" />
                <span>
                  AI Enhancements Applied: {processedResult.interfaces.filter(iface => iface.enhancement_applied).length} of {interfaceCount} interfaces enhanced
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {processedResult.interfaces?.slice(0, 5).map((interface_, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <span className="w-6 text-gray-400">#{index + 1}</span>
                <span className="text-white font-medium">{interface_.interface_name}</span>
                <span className="text-gray-400 text-xs">
                  {interface_.parameters?.length || 0} params
                </span>
                {interface_.enhancement_applied && (
                  <span className="text-green-400 text-xs px-1 py-0.5 bg-green-900/30 rounded">
                    Enhanced
                  </span>
                )}
                {interface_.enhancement_source && (
                  <span className="text-blue-400 text-xs" title={`Enhancement source: ${interface_.enhancement_source}`}>
                    ✨
                  </span>
                )}
              </div>
            ))}
            {interfaceCount > 5 && (
              <div className="text-gray-400 text-xs text-center pt-2">
                ... and {interfaceCount - 5} more interfaces
              </div>
            )}
          </div>
        </div>

        {/* Save Progress */}
        {saving && saveProgress && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {saving && !isCompleted ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  getStageIcon(saveProgress.stage)
                )}
                <span className="text-sm font-semibold text-white capitalize">
                  {saveProgress.stage}
                </span>
              </div>
              <span className="text-sm text-gray-300">{saveProgress.progress}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${saveProgress.progress}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-300">{saveProgress.message}</p>
          </div>
        )}

        {/* Save Result */}
        {saveResult && !saving && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              {saveResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-sm font-semibold ${
                saveResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {saveResult.success ? 'Save Completed' : 'Save Failed'}
              </span>
            </div>
            
            {saveResult.success && (
              <div className="text-sm text-gray-300">
                Successfully saved {saveResult.saved_count} interfaces with embeddings updated
              </div>
            )}
            
            {saveResult.errors && saveResult.errors.length > 0 && (
              <div className="text-sm text-red-400 mt-2">
                Errors: {saveResult.errors.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          {!isCompleted && !saving && (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !processedResult.success}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save to Database</span>
              </button>
            </>
          )}
          
          {isCompleted && (
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSaveWindow;