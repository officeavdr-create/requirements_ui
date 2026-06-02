import React, { useState, useEffect } from 'react';
import { Edit, X, Save, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainDescriptionDisplayProps {
  description: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (newDescription: string) => void;
  onCancel: () => void;
}

export const DomainDescriptionDisplay: React.FC<DomainDescriptionDisplayProps> = ({
  description,
  isEditing,
  onEdit,
  onSave,
  onCancel
}) => {
  const [editedDescription, setEditedDescription] = useState(description);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setEditedDescription(description);
  }, [description]);

  // Generate summary (first 2-3 lines)
  const generateSummary = (text: string): string => {
    const lines = text.split('\n').filter(line => line.trim());
    const maxChars = 200; // Approximately 2-3 lines
    
    if (text.length <= maxChars) {
      return text;
    }
    
    // Try to cut at sentence boundary
    let summary = text.substring(0, maxChars);
    const lastPeriod = summary.lastIndexOf('.');
    const lastNewline = summary.lastIndexOf('\n');
    
    const cutPoint = Math.max(lastPeriod, lastNewline);
    if (cutPoint > maxChars * 0.5) {
      summary = summary.substring(0, cutPoint + 1);
    }
    
    return summary.trim() + '...';
  };

  const handleSave = () => {
    onSave(editedDescription);
    setIsFullscreen(false);
  };

  const handleCancel = () => {
    setEditedDescription(description);
    setIsFullscreen(false);
    onCancel();
  };

  // Full screen edit modal
  if (isEditing && isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Edit Domain Description</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFullscreen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Exit fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full h-full bg-gray-900 text-gray-100 p-4 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none resize-none font-mono"
              placeholder="Enter domain description..."
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline edit mode
  if (isEditing && !isFullscreen) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Editing Description</span>
          <button
            onClick={() => setIsFullscreen(true)}
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Maximize2 className="h-3 w-3" />
            Full Screen
          </button>
        </div>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full bg-gray-900 text-gray-100 p-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none resize-none"
          rows={5}
          placeholder="Enter domain description..."
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // View mode - show summary
  return (
    <div className="relative group">
      <p className="text-gray-300 mb-2">
        {generateSummary(description)}
      </p>
      {description.length > 200 && (
        <button
          onClick={onEdit}
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1"
        >
          <Edit className="h-3 w-3" />
          View/Edit Full Description
        </button>
      )}
    </div>
  );
};

export default DomainDescriptionDisplay;