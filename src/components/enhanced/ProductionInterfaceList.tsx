/**
 * Production-Scale Interface Listing System
 * Story 7C.3: Production-Scale Interface Listing System
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { 
  Search, Filter, SortAsc, SortDesc, Edit, Trash2, 
  Eye, Star, Clock, Database, CheckSquare, Square,
  MoreVertical, FileText, Settings, Copy, Download, ExternalLink, Share
} from 'lucide-react';
import { InterfaceSpecification } from '@/services';
import InterfaceDetailsModal from './InterfaceDetailsModal';

interface FilterOptions {
  confidence: 'all' | 'high' | 'medium' | 'low';
  hasParameters: 'all' | 'yes' | 'no';
  dateRange: 'all' | 'today' | 'week' | 'month';
  version: string; // 'all' or specific version
}

interface SortOptions {
  field: 'name' | 'confidence' | 'created' | 'parameters' | 'complexity' | 'category' | 'version';
  direction: 'asc' | 'desc';
}

interface ProductionInterfaceListProps {
  interfaces: InterfaceSpecification[];
  onEdit?: (interface_: InterfaceSpecification) => void;
  onDelete?: (interface_: InterfaceSpecification) => void;
  onView?: (interface_: InterfaceSpecification) => void;
  onBulkAction?: (action: string, interfaces: InterfaceSpecification[]) => void;
  className?: string;
}

const ProductionInterfaceList: React.FC<ProductionInterfaceListProps> = ({
  interfaces,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    confidence: 'all',
    hasParameters: 'all',
    dateRange: 'all',
    version: 'all'
  });
  const [sort, setSort] = useState<SortOptions>({
    field: 'name',
    direction: 'asc'
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewingInterface, setViewingInterface] = useState<InterfaceSpecification | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract available versions for filtering
  const availableVersions = useMemo(() => {
    const versions = new Set<string>();
    interfaces.forEach(iface => {
      const version = iface.interface_version || 'default';
      versions.add(version);
    });
    return ['all', ...Array.from(versions).sort()];
  }, [interfaces]);

  // Filter and sort interfaces
  const filteredAndSortedInterfaces = useMemo(() => {
    let filtered = interfaces.filter(interface_ => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        interface_.interface_name.toLowerCase().includes(searchLower) ||
        interface_.interface_description.toLowerCase().includes(searchLower) ||
        interface_.return_type?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Confidence filter
      if (filters.confidence !== 'all') {
        const confidence = interface_.ai_confidence_score || 0;
        switch (filters.confidence) {
          case 'high':
            if (confidence < 0.8) return false;
            break;
          case 'medium':
            if (confidence < 0.6 || confidence >= 0.8) return false;
            break;
          case 'low':
            if (confidence >= 0.6) return false;
            break;
        }
      }

      // Parameters filter
      if (filters.hasParameters !== 'all') {
        const hasParams = (interface_.parameters?.length || 0) > 0;
        if (filters.hasParameters === 'yes' && !hasParams) return false;
        if (filters.hasParameters === 'no' && hasParams) return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all' && interface_.created_at) {
        const createdDate = new Date(interface_.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }

      // Version filter
      if (filters.version !== 'all') {
        const interfaceVersion = interface_.interface_version || 'default';
        if (interfaceVersion !== filters.version) return false;
      }

      return true;
    });

    // Sort interfaces
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sort.field) {
        case 'name':
          aVal = a.interface_name.toLowerCase();
          bVal = b.interface_name.toLowerCase();
          break;
        case 'confidence':
          aVal = a.ai_confidence_score || 0;
          bVal = b.ai_confidence_score || 0;
          break;
        case 'created':
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
        case 'parameters':
          aVal = a.parameters?.length || 0;
          bVal = b.parameters?.length || 0;
          break;
        case 'complexity':
          // Calculate complexity based on parameters, return type, notifications, constraints
          aVal = (a.parameters?.length || 0) + 
                 (a.return_type ? 1 : 0) + 
                 (a.notifications ? 1 : 0) + 
                 (a.constraints_notes ? 1 : 0) +
                 (a.detailed_description?.length || 0) / 100;
          bVal = (b.parameters?.length || 0) + 
                 (b.return_type ? 1 : 0) + 
                 (b.notifications ? 1 : 0) + 
                 (b.constraints_notes ? 1 : 0) +
                 (b.detailed_description?.length || 0) / 100;
          break;
        case 'category':
          aVal = a.interface_category?.toLowerCase() || 'zzz';
          bVal = b.interface_category?.toLowerCase() || 'zzz';
          break;
        case 'version':
          // Sort by version number (handle semantic versioning)
          const parseVersion = (version?: string) => {
            if (!version) return [0, 0, 0];
            const parts = version.replace('v', '').split('.').map(n => parseInt(n) || 0);
            return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
          };
          const aVersion = parseVersion(a.interface_version);
          const bVersion = parseVersion(b.interface_version);
          
          for (let i = 0; i < 3; i++) {
            if (aVersion[i] !== bVersion[i]) {
              aVal = aVersion[i];
              bVal = bVersion[i];
              break;
            }
          }
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [interfaces, searchQuery, filters, sort]);

  // Handle sort change
  const handleSort = (field: SortOptions['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectItem = (interfaceId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interfaceId)) {
        newSet.delete(interfaceId);
      } else {
        newSet.add(interfaceId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedInterfaces.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedInterfaces.map(i => i.interface_id!)));
    }
  };

  // Get confidence color
  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Handle three-dot menu actions
  const handleCopyInterface = async (interface_: InterfaceSpecification) => {
    try {
      const interfaceText = `Interface: ${interface_.interface_name}\nDescription: ${interface_.interface_description}\nParameters: ${interface_.parameters?.length || 0}`;
      await navigator.clipboard.writeText(interfaceText);
      // Show success notification
    } catch (error) {
      console.error('Failed to copy interface:', error);
    }
  };

  const handleExportInterface = (interface_: InterfaceSpecification) => {
    const interfaceData = {
      name: interface_.interface_name,
      version: interface_.interface_version,
      description: interface_.interface_description,
      detailed_description: interface_.detailed_description,
      parameters: interface_.parameters,
      return_type: interface_.return_type,
      return_description: interface_.return_description,
      notifications: interface_.notifications,
      api_reference: interface_.api_reference,
      constraints_notes: interface_.constraints_notes,
      interface_category: interface_.interface_category,
      ai_confidence_score: interface_.ai_confidence_score
    };

    const dataStr = JSON.stringify(interfaceData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${interface_.interface_name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareInterface = async (interface_: InterfaceSpecification) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: interface_.interface_name,
          text: interface_.interface_description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  // List item renderer for virtual scrolling
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const interface_ = filteredAndSortedInterfaces[index];
    const isSelected = selectedItems.has(interface_.interface_id!);

    return (
      <div style={style} className="px-4">
        <div className={`bg-gray-700 rounded-lg p-4 border transition-all duration-200 ${
          isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
        }`}>
          <div className="flex items-start space-x-4">
            {/* Selection Checkbox */}
            <button
              onClick={() => handleSelectItem(interface_.interface_id!)}
              className="mt-1 text-gray-400 hover:text-white transition-colors"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Interface Name and Version */}
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white truncate">
                      {interface_.interface_name}
                    </h4>
                    {interface_.interface_version && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {interface_.interface_version}
                      </span>
                    )}
                    {interface_.ai_confidence_score && interface_.ai_confidence_score >= 0.9 && (
                      <Star className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {interface_.interface_description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className={`font-semibold ${getConfidenceColor(interface_.ai_confidence_score)}`}>
                      {interface_.ai_confidence_score ? 
                        `${Math.round(interface_.ai_confidence_score * 100)}%` : 
                        'N/A'
                      }
                    </span>
                    <span>{interface_.parameters?.length || 0} params</span>
                    {interface_.return_type && (
                      <span>→ {interface_.return_type}</span>
                    )}
                    {interface_.created_at && (
                      <span>{new Date(interface_.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => setViewingInterface(interface_)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(interface_)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                      title="Edit Interface"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(interface_)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition-colors"
                      title="Delete Interface"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === interface_.interface_id ? null : interface_.interface_id!)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeDropdown === interface_.interface_id && (
                      <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setViewingInterface(interface_);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          {onEdit && (
                            <button
                              onClick={() => {
                                onEdit(interface_);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit Interface</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleCopyInterface(interface_);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy Summary</span>
                          </button>
                          <button
                            onClick={() => {
                              handleExportInterface(interface_);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <Download className="w-4 h-4" />
                            <span>Export JSON</span>
                          </button>
                          <button
                            onClick={() => {
                              handleShareInterface(interface_);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <Share className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          {interface_.api_reference && (
                            <button
                              onClick={() => {
                                window.open(interface_.api_reference, '_blank');
                                setActiveDropdown(null);
                              }}
                              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open Reference</span>
                            </button>
                          )}
                          {onDelete && (
                            <>
                              <div className="border-t border-gray-600 my-1"></div>
                              <button
                                onClick={() => {
                                  onDelete(interface_);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Interface</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [filteredAndSortedInterfaces, selectedItems, onView, onEdit, onDelete]);

  return (
    <div className={`bg-gray-800 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Interface Specifications</h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
              {filteredAndSortedInterfaces.length} / {interfaces.length}
            </span>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && onBulkAction && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">
                {selectedItems.size} selected
              </span>
              <button
                onClick={() => onBulkAction('delete', 
                  filteredAndSortedInterfaces.filter(i => selectedItems.has(i.interface_id!))
                )}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search interfaces by name, description, or return type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
          >
            {selectedItems.size === filteredAndSortedInterfaces.length && filteredAndSortedInterfaces.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>All</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-700/50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Confidence Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confidence Level
                </label>
                <select
                  value={filters.confidence}
                  onChange={(e) => setFilters(prev => ({ ...prev, confidence: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="high">High (80%+)</option>
                  <option value="medium">Medium (60-79%)</option>
                  <option value="low">Low (&lt;60%)</option>
                </select>
              </div>

              {/* Parameters Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Has Parameters
                </label>
                <select
                  value={filters.hasParameters}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasParameters: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Interfaces</option>
                  <option value="yes">With Parameters</option>
                  <option value="no">No Parameters</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Created
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>

              {/* Version Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Interface Version
                </label>
                <select
                  value={filters.version}
                  onChange={(e) => setFilters(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  {availableVersions.map(version => (
                    <option key={version} value={version}>
                      {version === 'all' ? 'All Versions' : 
                       version === 'default' ? 'Default' : 
                       version.startsWith('v') ? version : `v${version}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="mt-4 space-y-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { field: 'name' as const, label: 'Name', description: 'Alphabetical by interface name' },
              { field: 'confidence' as const, label: 'Confidence', description: 'AI confidence score' },
              { field: 'created' as const, label: 'Created', description: 'Creation timestamp' },
              { field: 'parameters' as const, label: 'Parameters', description: 'Number of parameters' },
              { field: 'complexity' as const, label: 'Complexity', description: 'Interface complexity score' },
              { field: 'category' as const, label: 'Category', description: 'Interface type/category' },
              { field: 'version' as const, label: 'Version', description: 'Interface version number' }
            ].map(({ field, label, description }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                title={description}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                  sort.field === field ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{label}</span>
                {sort.field === field && (
                  sort.direction === 'asc' ? 
                    <SortAsc className="w-3 h-3" /> : 
                    <SortDesc className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {sort.field === 'complexity' && 'Complexity = Parameters + Return Type + Notifications + Constraints + Description Length'}
            {sort.field === 'version' && 'Supports semantic versioning (v1.0.0, v2.1.3, etc.)'}
            {sort.field === 'parameters' && 'Sorts by total number of parameters in interface'}
            {sort.field === 'confidence' && 'AI confidence score from interface extraction process'}
          </div>
        </div>
      </div>

      {/* Interface List with Virtual Scrolling */}
      <div className="h-96">
        {filteredAndSortedInterfaces.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                {searchQuery || Object.values(filters).some(f => f !== 'all') ? 
                  'No interfaces match your filters' : 
                  'No interfaces found'
                }
              </p>
              {(searchQuery || Object.values(filters).some(f => f !== 'all')) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      confidence: 'all',
                      hasParameters: 'all',
                      dateRange: 'all'
                    });
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <List
            height={384}
            itemCount={filteredAndSortedInterfaces.length}
            itemSize={120}
            itemData={filteredAndSortedInterfaces}
          >
            {ItemRenderer}
          </List>
        )}
      </div>

      {/* Interface Details Modal */}
      {viewingInterface && (
        <InterfaceDetailsModal
          isOpen={true}
          onClose={() => setViewingInterface(null)}
          interface_={viewingInterface}
          onEdit={() => {
            setViewingInterface(null);
            if (onEdit) onEdit(viewingInterface);
          }}
          onDelete={() => {
            setViewingInterface(null);
            if (onDelete) onDelete(viewingInterface);
          }}
        />
      )}
    </div>
  );
};

export default ProductionInterfaceList;