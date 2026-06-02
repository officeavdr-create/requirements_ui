/**
 * Inline Interface Editor Component
 * Story 7C.4: Individual Interface Editing & Management
 */
import React, { useState, useEffect } from 'react';
import { 
  Edit, Save, X, Plus, Trash2, CheckCircle, AlertCircle, 
  Type, FileText, Hash, Info, Tag, RotateCcw
} from 'lucide-react';
import { InterfaceSpecification, InterfaceParameter, unifiedInterfaceService } from '@/services';

interface InlineInterfaceEditorProps {
  interface_: InterfaceSpecification;
  onSave: (updatedInterface: InterfaceSpecification) => void;
  onCancel: () => void;
  onDelete?: () => void;
  className?: string;
}

const InlineInterfaceEditor: React.FC<InlineInterfaceEditorProps> = ({
  interface_,
  onSave,
  onCancel,
  onDelete,
  className = ''
}) => {
  const [editedInterface, setEditedInterface] = useState<InterfaceSpecification>({ ...interface_ });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [newParameter, setNewParameter] = useState<Partial<InterfaceParameter>>({});
  const [showAddParameter, setShowAddParameter] = useState(false);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(editedInterface) !== JSON.stringify(interface_);
    setHasChanges(hasChanges);
  }, [editedInterface, interface_]);

  // Validation
  const validateInterface = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editedInterface.interface_name.trim()) {
      errors.interface_name = 'Interface name is required';
    }

    if (!editedInterface.interface_description.trim()) {
      errors.interface_description = 'Interface description is required';
    }

    // Validate parameters
    editedInterface.parameters?.forEach((param, index) => {
      if (!param.name.trim()) {
        errors[`param_${index}_name`] = 'Parameter name is required';
      }
      if (!param.type.trim()) {
        errors[`param_${index}_type`] = 'Parameter type is required';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle field updates
  const updateField = (field: keyof InterfaceSpecification, value: any) => {
    setEditedInterface(prev => ({ ...prev, [field]: value }));
  };

  // Handle parameter updates
  const updateParameter = (index: number, field: keyof InterfaceParameter, value: any) => {
    setEditedInterface(prev => ({
      ...prev,
      parameters: prev.parameters?.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  // Add new parameter
  const addParameter = () => {
    if (newParameter.name && newParameter.type) {
      const parameter: InterfaceParameter = {
        seq: (editedInterface.parameters?.length || 0) + 1,
        name: newParameter.name,
        type: newParameter.type,
        description: newParameter.description || '',
        required: newParameter.required || false,
        default_value: newParameter.default_value,
        constraints: newParameter.constraints
      };

      setEditedInterface(prev => ({
        ...prev,
        parameters: [...(prev.parameters || []), parameter]
      }));

      setNewParameter({});
      setShowAddParameter(false);
    }
  };

  // Remove parameter
  const removeParameter = (index: number) => {
    setEditedInterface(prev => ({
      ...prev,
      parameters: prev.parameters?.filter((_, i) => i !== index)
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!validateInterface()) {
      return;
    }

    setSaving(true);
    try {
      // Update interface via API if it has an ID
      if (editedInterface.interface_id) {
        await unifiedInterfaceService.updateInterface(
          editedInterface.interface_id,
          editedInterface
        );
      }

      onSave(editedInterface);
    } catch (error) {
      console.error('Failed to save interface:', error);
      setValidationErrors({ general: 'Failed to save interface. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Reset to original
  const handleReset = () => {
    setEditedInterface({ ...interface_ });
    setValidationErrors({});
  };

  return (
    <div className={`bg-gray-700 rounded-lg border-2 border-blue-500/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <Edit className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Edit Interface</h3>
          {hasChanges && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
              Modified
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              title="Reset Changes"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* General Errors */}
      {validationErrors.general && (
        <div className="p-4 bg-red-500/20 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400">{validationErrors.general}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Basic Information</span>
          </h4>

          {/* Interface Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Interface Name *
            </label>
            <input
              type="text"
              value={editedInterface.interface_name}
              onChange={(e) => updateField('interface_name', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                validationErrors.interface_name ? 'border-red-500' : 'border-gray-500'
              }`}
              placeholder="e.g., getBatteryLevel"
            />
            {validationErrors.interface_name && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.interface_name}</p>
            )}
          </div>

          {/* Interface Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={editedInterface.interface_description}
              onChange={(e) => updateField('interface_description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                validationErrors.interface_description ? 'border-red-500' : 'border-gray-500'
              }`}
              placeholder="Describe what this interface does..."
            />
            {validationErrors.interface_description && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.interface_description}</p>
            )}
          </div>

          {/* Return Type and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Return Type
              </label>
              <input
                type="text"
                value={editedInterface.return_type || ''}
                onChange={(e) => updateField('return_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., integer, string, void"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Return Description
              </label>
              <input
                type="text"
                value={editedInterface.return_description || ''}
                onChange={(e) => updateField('return_description', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the return value"
              />
            </div>
          </div>
        </div>

        {/* Parameters Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-white flex items-center space-x-2">
              <Tag className="w-4 h-4 text-green-400" />
              <span>Parameters ({editedInterface.parameters?.length || 0})</span>
            </h4>
            <button
              onClick={() => setShowAddParameter(!showAddParameter)}
              className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Parameter</span>
            </button>
          </div>

          {/* Add New Parameter */}
          {showAddParameter && (
            <div className="p-4 bg-gray-600/50 rounded-lg border border-gray-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Parameter name"
                  value={newParameter.name || ''}
                  onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Type"
                  value={newParameter.type || ''}
                  onChange={(e) => setNewParameter(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Default value"
                  value={newParameter.default_value || ''}
                  onChange={(e) => setNewParameter(prev => ({ ...prev, default_value: e.target.value }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={newParameter.required || false}
                      onChange={(e) => setNewParameter(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Required</span>
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <textarea
                  placeholder="Parameter description"
                  value={newParameter.description || ''}
                  onChange={(e) => setNewParameter(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addParameter}
                  disabled={!newParameter.name || !newParameter.type}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Add Parameter
                </button>
                <button
                  onClick={() => {
                    setShowAddParameter(false);
                    setNewParameter({});
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Parameters */}
          <div className="space-y-3">
            {editedInterface.parameters?.map((param, index) => (
              <div key={index} className="p-4 bg-gray-600/50 rounded-lg border border-gray-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => updateParameter(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-700 border rounded text-white focus:ring-2 focus:ring-blue-500 ${
                        validationErrors[`param_${index}_name`] ? 'border-red-500' : 'border-gray-500'
                      }`}
                    />
                    {validationErrors[`param_${index}_name`] && (
                      <p className="mt-1 text-xs text-red-400">{validationErrors[`param_${index}_name`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                    <input
                      type="text"
                      value={param.type}
                      onChange={(e) => updateParameter(index, 'type', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-700 border rounded text-white focus:ring-2 focus:ring-blue-500 ${
                        validationErrors[`param_${index}_type`] ? 'border-red-500' : 'border-gray-500'
                      }`}
                    />
                    {validationErrors[`param_${index}_type`] && (
                      <p className="mt-1 text-xs text-red-400">{validationErrors[`param_${index}_type`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Default</label>
                    <input
                      type="text"
                      value={param.default_value || ''}
                      onChange={(e) => updateParameter(index, 'default_value', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={param.required || false}
                        onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                        className="rounded"
                      />
                      <span>Required</span>
                    </label>
                    
                    <button
                      onClick={() => removeParameter(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                      title="Remove Parameter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={param.description}
                    onChange={(e) => updateParameter(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Additional Information</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interface Category
              </label>
              <input
                type="text"
                value={editedInterface.interface_category || ''}
                onChange={(e) => updateField('interface_category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., System, User, Network"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Reference
              </label>
              <input
                type="text"
                value={editedInterface.api_reference || ''}
                onChange={(e) => updateField('api_reference', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Link to API documentation"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Constraints & Notes
            </label>
            <textarea
              value={editedInterface.constraints_notes || ''}
              onChange={(e) => updateField('constraints_notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Any constraints, limitations, or special notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineInterfaceEditor;