/**
 * Interface Details Modal
 * Comprehensive view of interface specifications with all technical details
 */
import React, { useState } from 'react';
import { 
  X, Code, FileText, Settings, AlertCircle, CheckCircle, 
  Copy, ExternalLink, Tag, Clock, Database, Zap,
  ChevronDown, ChevronRight, Eye, Star
} from 'lucide-react';
import { InterfaceSpecification } from '@/services';

interface InterfaceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interface_: InterfaceSpecification;
  onEdit?: () => void;
  onDelete?: () => void;
}

const InterfaceDetailsModal: React.FC<InterfaceDetailsModalProps> = ({
  isOpen,
  onClose,
  interface_,
  onEdit,
  onDelete
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'parameters', 'details'])
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBadge = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  const SectionHeader = ({ 
    section, 
    title, 
    icon: Icon, 
    badge 
  }: { 
    section: string; 
    title: string; 
    icon: React.ComponentType<any>; 
    badge?: string 
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-white">{title}</span>
        {badge && (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
            {badge}
          </span>
        )}
      </div>
      {expandedSections.has(section) ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  const CopyableField = ({ 
    label, 
    value, 
    fieldKey 
  }: { 
    label: string; 
    value: string; 
    fieldKey: string 
  }) => (
    <div className="flex items-start justify-between space-x-2">
      <div className="flex-1">
        <dt className="text-sm font-medium text-gray-400 mb-1">{label}</dt>
        <dd className="text-sm text-white break-words">{value}</dd>
      </div>
      <button
        onClick={() => copyToClipboard(value, fieldKey)}
        className="p-1 text-gray-400 hover:text-white transition-colors"
        title="Copy to clipboard"
      >
        {copiedField === fieldKey ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Eye className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>{interface_.interface_name}</span>
                {interface_.ai_confidence_score && interface_.ai_confidence_score >= 0.9 && (
                  <Star className="w-5 h-5 text-yellow-400" />
                )}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span>Version: {interface_.interface_version || '1.0'}</span>
                <span className={`font-semibold ${getConfidenceColor(interface_.ai_confidence_score)}`}>
                  {getConfidenceBadge(interface_.ai_confidence_score)}
                </span>
                <span>{interface_.interface_category || 'Interface'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this interface?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Basic Information */}
          <div className="space-y-3">
            <SectionHeader
              section="basic"
              title="Basic Information"
              icon={FileText}
            />
            
            {expandedSections.has('basic') && (
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CopyableField
                    label="Interface Name"
                    value={interface_.interface_name}
                    fieldKey="name"
                  />
                  <CopyableField
                    label="Version"
                    value={interface_.interface_version || '1.0'}
                    fieldKey="version"
                  />
                  <CopyableField
                    label="Category"
                    value={interface_.interface_category || 'Interface'}
                    fieldKey="category"
                  />
                  <div>
                    <dt className="text-sm font-medium text-gray-400 mb-1">AI Confidence</dt>
                    <dd className={`text-sm font-semibold ${getConfidenceColor(interface_.ai_confidence_score)}`}>
                      {interface_.ai_confidence_score ? 
                        `${Math.round(interface_.ai_confidence_score * 100)}% (${getConfidenceBadge(interface_.ai_confidence_score)})` : 
                        'N/A'
                      }
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-400 mb-1">Description</dt>
                    <dd className="text-sm text-white">{interface_.interface_description}</dd>
                  </div>
                  {interface_.detailed_description && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-400 mb-1">Detailed Description</dt>
                      <dd className="text-sm text-white whitespace-pre-wrap">{interface_.detailed_description}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Parameters */}
          <div className="space-y-3">
            <SectionHeader
              section="parameters"
              title="Parameters"
              icon={Code}
              badge={`${interface_.parameters?.length || 0} parameters`}
            />
            
            {expandedSections.has('parameters') && (
              <div className="bg-gray-800 rounded-lg p-4">
                {interface_.parameters && interface_.parameters.length > 0 ? (
                  <div className="space-y-3">
                    {interface_.parameters.map((param, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                              #{param.seq || index + 1}
                            </span>
                            <span className="font-mono text-white font-semibold">
                              {param.name}
                            </span>
                            <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              {param.type}
                            </span>
                            {param.required && (
                              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(
                              `${param.name}: ${param.type} - ${param.description}`,
                              `param-${index}`
                            )}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedField === `param-${index}` ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{param.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {param.default_value && (
                            <div>
                              <span className="text-gray-400">Default:</span>
                              <span className="ml-1 font-mono text-yellow-300">{param.default_value}</span>
                            </div>
                          )}
                          {param.constraints && (
                            <div>
                              <span className="text-gray-400">Constraints:</span>
                              <span className="ml-1 text-gray-200">{param.constraints}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No parameters defined for this interface</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Return Information */}
          {(interface_.return_type || interface_.return_description) && (
            <div className="space-y-3">
              <SectionHeader
                section="return"
                title="Return Information"
                icon={Zap}
              />
              
              {expandedSections.has('return') && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <dl className="space-y-3">
                    {interface_.return_type && (
                      <CopyableField
                        label="Return Type"
                        value={interface_.return_type}
                        fieldKey="return-type"
                      />
                    )}
                    {interface_.return_description && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400 mb-1">Return Description</dt>
                        <dd className="text-sm text-white">{interface_.return_description}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}

          {/* Technical Details */}
          <div className="space-y-3">
            <SectionHeader
              section="technical"
              title="Technical Details"
              icon={Database}
            />
            
            {expandedSections.has('technical') && (
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <dl className="space-y-3">
                  {interface_.notifications && (
                    <div>
                      <dt className="text-sm font-medium text-gray-400 mb-1">Notifications</dt>
                      <dd className="text-sm text-white">{interface_.notifications}</dd>
                    </div>
                  )}
                  {interface_.api_reference && (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-400 mb-1">API Reference</dt>
                        <dd className="text-sm text-blue-300 hover:text-blue-200 cursor-pointer">
                          <a
                            href={interface_.api_reference}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1"
                          >
                            <span>{interface_.api_reference}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                  {interface_.constraints_notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-400 mb-1">Constraints & Notes</dt>
                      <dd className="text-sm text-white whitespace-pre-wrap">{interface_.constraints_notes}</dd>
                    </div>
                  )}
                  {interface_.sub_feature_section && (
                    <CopyableField
                      label="Source Section"
                      value={interface_.sub_feature_section}
                      fieldKey="source-section"
                    />
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <SectionHeader
              section="metadata"
              title="Metadata"
              icon={Tag}
            />
            
            {expandedSections.has('metadata') && (
              <div className="bg-gray-800 rounded-lg p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-400 mb-1">Interface ID</dt>
                    <dd className="text-sm font-mono text-gray-300">{interface_.interface_id || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400 mb-1">Domain Association</dt>
                    <dd className="text-sm text-white">{interface_.domain_association}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400 mb-1">Created At</dt>
                    <dd className="text-sm text-gray-300">{formatDate(interface_.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-400 mb-1">Updated At</dt>
                    <dd className="text-sm text-gray-300">{formatDate(interface_.updated_at)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterfaceDetailsModal;