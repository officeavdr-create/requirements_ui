/**
 * Enhancement Comparison Modal - Shows before/after AI enhancement comparison
 * Allows users to review, accept/reject, and edit AI enhancements
 */
import React, { useState } from 'react';
import { 
  X, Check, XIcon, Edit3, BrainCircuit, ArrowRight, 
  Eye, EyeOff, ChevronDown, ChevronUp, Save, Undo
} from 'lucide-react';

interface EnhancementChange {
  field: string;
  original: string;
  enhanced: string;
  accepted: boolean;
  manually_edited?: boolean;
}

interface InterfaceEnhancement {
  interface_id: string;
  interface_name: string;
  original_interface: any;
  enhanced_interface: any;
  enhancement_applied: boolean;
  enhancement_source: string;
  enhancement_changes: string[];
  ai_confidence_score: number;
  user_accepted: boolean;
  user_rejected: boolean;
  manual_edits: any;
}

interface EnhancementComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  interfaces: any[];
  onSaveEnhancements: (acceptedInterfaces: any[]) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const EnhancementComparisonModal: React.FC<EnhancementComparisonModalProps> = ({
  isOpen,
  onClose,
  interfaces,
  onSaveEnhancements,
  showNotification
}) => {
  const [selectedInterfaceIndex, setSelectedInterfaceIndex] = useState(0);
  const [enhancementDecisions, setEnhancementDecisions] = useState<Map<string, InterfaceEnhancement>>(new Map());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description', 'parameters', 'return']));
  const [editMode, setEditMode] = useState<Map<string, boolean>>(new Map());
  const [editedValues, setEditedValues] = useState<Map<string, any>>(new Map());

  if (!isOpen || !interfaces || interfaces.length === 0) return null;

  const currentInterface = interfaces[selectedInterfaceIndex];
  const hasOriginal = currentInterface?.original_interface;
  const hasEnhancements = currentInterface?.enhancement_applied;

  // Initialize enhancement decisions
  React.useEffect(() => {
    const decisions = new Map<string, InterfaceEnhancement>();
    interfaces.forEach((iface, index) => {
      decisions.set(iface.interface_name, {
        interface_id: iface.interface_id || `temp_${index}`,
        interface_name: iface.interface_name,
        original_interface: iface.original_interface || iface,
        enhanced_interface: iface,
        enhancement_applied: iface.enhancement_applied || false,
        enhancement_source: iface.enhancement_source || 'none',
        enhancement_changes: iface.enhancement_changes || [],
        ai_confidence_score: iface.ai_confidence_score || 0.7,
        user_accepted: false,
        user_rejected: false,
        manual_edits: {}
      });
    });
    setEnhancementDecisions(decisions);
  }, [interfaces]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const acceptEnhancement = (interfaceName: string) => {
    const decision = enhancementDecisions.get(interfaceName);
    if (decision) {
      decision.user_accepted = true;
      decision.user_rejected = false;
      setEnhancementDecisions(new Map(enhancementDecisions));
      showNotification(`Enhancement accepted for ${interfaceName}`, 'success');
    }
  };

  const rejectEnhancement = (interfaceName: string) => {
    const decision = enhancementDecisions.get(interfaceName);
    if (decision) {
      decision.user_accepted = false;
      decision.user_rejected = true;
      setEnhancementDecisions(new Map(enhancementDecisions));
      showNotification(`Enhancement rejected for ${interfaceName}`, 'info');
    }
  };

  const acceptAllEnhancements = () => {
    enhancementDecisions.forEach((decision) => {
      if (decision.enhancement_applied) {
        decision.user_accepted = true;
        decision.user_rejected = false;
      }
    });
    setEnhancementDecisions(new Map(enhancementDecisions));
    showNotification(`All enhancements accepted`, 'success');
  };

  const rejectAllEnhancements = () => {
    enhancementDecisions.forEach((decision) => {
      decision.user_accepted = false;
      decision.user_rejected = true;
    });
    setEnhancementDecisions(new Map(enhancementDecisions));
    showNotification(`All enhancements rejected`, 'info');
  };

  // Manual editing functions
  const enableEditMode = (interfaceName: string, field: string) => {
    const key = `${interfaceName}_${field}`;
    setEditMode(new Map(editMode.set(key, true)));
    
    // Initialize edit value with current enhanced value
    const decision = enhancementDecisions.get(interfaceName);
    if (decision) {
      const currentValue = getFieldValue(decision.enhanced_interface, field);
      setEditedValues(new Map(editedValues.set(key, currentValue)));
    }
  };

  const saveManualEdit = (interfaceName: string, field: string) => {
    const key = `${interfaceName}_${field}`;
    const editedValue = editedValues.get(key);
    
    if (editedValue !== undefined) {
      const decision = enhancementDecisions.get(interfaceName);
      if (decision) {
        // Update the enhanced interface with manual edit
        const updatedInterface = { ...decision.enhanced_interface };
        setFieldValue(updatedInterface, field, editedValue);
        
        // Mark as manually edited
        decision.enhanced_interface = updatedInterface;
        decision.manual_edits = { ...decision.manual_edits, [field]: editedValue };
        decision.user_accepted = true; // Auto-accept manual edits
        
        setEnhancementDecisions(new Map(enhancementDecisions));
        setEditMode(new Map(editMode.set(key, false)));
        showNotification(`Manual edit saved for ${field}`, 'success');
      }
    }
  };

  const cancelEdit = (interfaceName: string, field: string) => {
    const key = `${interfaceName}_${field}`;
    setEditMode(new Map(editMode.set(key, false)));
    editedValues.delete(key);
    setEditedValues(new Map(editedValues));
  };

  const updateEditedValue = (interfaceName: string, field: string, value: string) => {
    const key = `${interfaceName}_${field}`;
    setEditedValues(new Map(editedValues.set(key, value)));
  };

  // Helper functions for field access
  const getFieldValue = (obj: any, field: string): string => {
    switch (field) {
      case 'description':
        return obj?.interface_description || obj?.description || '';
      case 'return':
        return obj?.return_description || '';
      case 'parameters':
        return Array.isArray(obj?.parameters) ? JSON.stringify(obj.parameters, null, 2) : '';
      default:
        return obj?.[field] || '';
    }
  };

  const setFieldValue = (obj: any, field: string, value: string) => {
    switch (field) {
      case 'description':
        obj.interface_description = value;
        break;
      case 'return':
        obj.return_description = value;
        break;
      case 'parameters':
        try {
          obj.parameters = JSON.parse(value);
        } catch {
          // If JSON parsing fails, keep as string
          obj.parameters = value;
        }
        break;
      default:
        obj[field] = value;
        break;
    }
  };

  const handleSave = () => {
    const acceptedInterfaces = Array.from(enhancementDecisions.values())
      .filter(decision => decision.user_accepted)
      .map(decision => decision.enhanced_interface);
    
    const rejectedInterfaces = Array.from(enhancementDecisions.values())
      .filter(decision => decision.user_rejected)
      .map(decision => decision.original_interface);

    const finalInterfaces = [...acceptedInterfaces, ...rejectedInterfaces];
    
    showNotification(`Saving ${acceptedInterfaces.length} enhanced and ${rejectedInterfaces.length} original interfaces`, 'info');
    onSaveEnhancements(finalInterfaces);
  };

  const enhancedCount = Array.from(enhancementDecisions.values()).filter(d => d.user_accepted).length;
  const rejectedCount = Array.from(enhancementDecisions.values()).filter(d => d.user_rejected).length;
  const pendingCount = interfaces.length - enhancedCount - rejectedCount;

  const ComparisonSection = ({ title, original, enhanced, field }: {
    title: string;
    original: any;
    enhanced: any;
    field: string;
  }) => {
    const isExpanded = expandedSections.has(field);
    const hasChanges = JSON.stringify(original) !== JSON.stringify(enhanced);
    
    return (
      <div className="border border-gray-600 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(field)}
          className="w-full px-4 py-3 bg-gray-700 text-left flex items-center justify-between hover:bg-gray-600"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{title}</span>
            {hasChanges && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                Enhanced
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  Original (Excel)
                </h4>
                <div className="bg-gray-900 rounded p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
                  {typeof original === 'string' ? original : JSON.stringify(original, null, 2)}
                </div>
              </div>
              
              {/* Enhanced */}
              <div>
                <h4 className="text-sm font-medium text-green-300 mb-2 flex items-center gap-2">
                  <BrainCircuit className="w-3 h-3" />
                  AI Enhanced
                  <ArrowRight className="w-3 h-3" />
                  <button
                    onClick={() => enableEditMode(currentInterface.interface_name, field)}
                    className="ml-auto text-blue-400 hover:text-blue-300 p-1"
                    title="Edit manually"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </h4>
                
                {editMode.get(`${currentInterface.interface_name}_${field}`) ? (
                  /* Edit Mode */
                  <div className="space-y-2">
                    <textarea
                      value={editedValues.get(`${currentInterface.interface_name}_${field}`) || ''}
                      onChange={(e) => updateEditedValue(currentInterface.interface_name, field, e.target.value)}
                      className="w-full bg-gray-900 border border-blue-500/50 rounded p-3 text-sm text-blue-200 resize-none"
                      rows={field === 'parameters' ? 6 : 3}
                      placeholder={`Edit ${field}...`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveManualEdit(currentInterface.interface_name, field)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={() => cancelEdit(currentInterface.interface_name, field)}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 flex items-center gap-1"
                      >
                        <Undo className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="bg-green-900/20 border border-green-500/30 rounded p-3 text-sm text-green-200 max-h-32 overflow-y-auto">
                    {typeof enhanced === 'string' ? enhanced : JSON.stringify(enhanced, null, 2)}
                    {enhancementDecisions.get(currentInterface.interface_name)?.manual_edits?.[field] && (
                      <div className="mt-2 text-xs text-blue-300 flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        Manually edited
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {hasChanges && (
              <div className="mt-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded">
                <p className="text-xs text-blue-300">
                  <strong>Changes:</strong> AI improved the {field} with better semantic clarity and technical precision
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden border border-gray-600">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">AI Enhancement Review</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm">
                {interfaces.length} interfaces
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Decision Summary */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-300">Accepted: {enhancedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-300">Rejected: {rejectedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-300">Pending: {pendingCount}</span>
            </div>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Interface List */}
          <div className="w-1/3 border-r border-gray-600 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Interfaces</h3>
              <div className="space-y-2">
                {interfaces.map((iface, index) => {
                  const decision = enhancementDecisions.get(iface.interface_name);
                  const isSelected = index === selectedInterfaceIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedInterfaceIndex(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-blue-900/50 border-blue-500/50 text-blue-200'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{iface.interface_name}</span>
                        <div className="flex items-center gap-1">
                          {decision?.user_accepted && <Check className="w-3 h-3 text-green-400" />}
                          {decision?.user_rejected && <XIcon className="w-3 h-3 text-red-400" />}
                          {iface.enhancement_applied && <BrainCircuit className="w-3 h-3 text-purple-400" />}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Confidence: {Math.round((iface.ai_confidence_score || 0.7) * 100)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comparison View */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{currentInterface?.interface_name}</h3>
                <div className="flex items-center gap-2">
                  {hasEnhancements ? (
                    <>
                      <button
                        onClick={() => acceptEnhancement(currentInterface.interface_name)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => rejectEnhancement(currentInterface.interface_name)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <XIcon className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-gray-600 text-gray-300 rounded-lg text-sm">
                      No enhancements available
                    </span>
                  )}
                </div>
              </div>

              {hasOriginal && hasEnhancements ? (
                <div className="space-y-4">
                  <ComparisonSection
                    title="Interface Description"
                    original={currentInterface.original_interface?.interface_description || 'No description'}
                    enhanced={currentInterface.interface_description || 'No description'}
                    field="description"
                  />
                  
                  <ComparisonSection
                    title="Parameters"
                    original={currentInterface.original_interface?.parameters || []}
                    enhanced={currentInterface.parameters || []}
                    field="parameters"
                  />
                  
                  <ComparisonSection
                    title="Return Information"
                    original={{
                      type: currentInterface.original_interface?.return_type || 'void',
                      description: currentInterface.original_interface?.return_description || 'No description'
                    }}
                    enhanced={{
                      type: currentInterface.return_type || 'void',
                      description: currentInterface.return_description || 'No description'
                    }}
                    field="return"
                  />

                  {/* Enhancement Details */}
                  <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Enhancement Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Source:</span>
                        <span className="ml-2 text-purple-300">{currentInterface.enhancement_source}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Confidence:</span>
                        <span className="ml-2 text-purple-300">
                          {Math.round((currentInterface.ai_confidence_score || 0.7) * 100)}%
                        </span>
                      </div>
                      {currentInterface.enhancement_changes && (
                        <div>
                          <span className="text-gray-400">Changes:</span>
                          <div className="ml-2 mt-1 space-y-1">
                            {currentInterface.enhancement_changes.map((change: string, index: number) => (
                              <div key={index} className="text-xs text-purple-200 bg-purple-900/30 px-2 py-1 rounded">
                                {change}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No AI enhancements available for this interface</p>
                  <p className="text-sm mt-2">The interface will be saved with original Excel data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={acceptAllEnhancements}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Accept All
            </button>
            <button
              onClick={rejectAllEnhancements}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject All
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save Decisions ({enhancedCount + rejectedCount}/{interfaces.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancementComparisonModal;