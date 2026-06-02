import React from 'react';
import { X, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface AIFailureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  failureReason: string;
  failureDetails?: Array<{
    interface: string;
    reason: string;
  }>;
  onCancelSession: () => void;
  onProceedScriptOnly: () => void;
  scriptInterfaceCount?: number;
}

export const AIFailureDialog: React.FC<AIFailureDialogProps> = ({
  isOpen,
  onClose,
  failureReason,
  failureDetails = [],
  onCancelSession,
  onProceedScriptOnly,
  scriptInterfaceCount = 0
}) => {
  if (!isOpen) return null;

  const getFailureMessage = () => {
    switch (failureReason) {
      case 'script_extraction_failed':
        return {
          title: 'Excel Extraction Failed',
          description: 'The Excel file format appears to be invalid or corrupted. Please check your Excel file format.',
          canProceed: false
        };
      case 'all_enhancements_failed':
        return {
          title: 'AI Enhancement Failed',
          description: 'AI semantic enhancement failed for all interfaces. You can proceed with script-only extraction or cancel to fix AI issues.',
          canProceed: true
        };
      default:
        return {
          title: 'AI Processing Error',
          description: 'An unexpected error occurred during AI processing.',
          canProceed: false
        };
    }
  };

  const { title, description, canProceed } = getFailureMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">{description}</p>

          {/* Failure Details */}
          {failureDetails.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-red-800 mb-2">Failure Details:</h3>
              <div className="space-y-2">
                {failureDetails.slice(0, 5).map((detail, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-red-700">{detail.interface}:</span>{' '}
                    <span className="text-red-600">{detail.reason}</span>
                  </div>
                ))}
                {failureDetails.length > 5 && (
                  <div className="text-sm text-red-600">
                    ... and {failureDetails.length - 5} more interfaces
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Script-only option info */}
          {canProceed && scriptInterfaceCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Fallback Option Available:</h3>
              <p className="text-sm text-blue-700">
                Script-based extraction successfully found <strong>{scriptInterfaceCount} interfaces</strong>.
                You can proceed with these interfaces without AI enhancements.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {canProceed ? (
            <>
              {/* Primary Options */}
              <div className="flex space-x-3">
                <button
                  onClick={onCancelSession}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cancel Session to Fix AI
                </button>
                
                <button
                  onClick={onProceedScriptOnly}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Proceed with Script-Only ({scriptInterfaceCount} interfaces)
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Why might AI enhancement fail?</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Ollama server is not running or unreachable</div>
                  <div>• CodeLlama model is not available or corrupted</div>
                  <div>• Network connectivity issues</div>
                  <div>• High server load causing timeouts</div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Close and Check Excel File
              </button>
              
              <div className="text-sm text-gray-600">
                <strong>Suggested fixes:</strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Verify Excel file is not corrupted</li>
                  <li>Check if file follows expected interface format</li>
                  <li>Try re-saving Excel file in .xlsx format</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFailureDialog;