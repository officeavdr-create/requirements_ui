/**
 * Full-Screen Interface Management Modal
 * Story 7C.5: Full-Screen Interface Management Window
 */
import React, { useState, useEffect } from 'react';
import { 
  X, Maximize2, ChevronDown, ChevronRight, Edit, Eye, 
  FileText, Clock, Star, Filter, Search, Download,
  GitBranch, History, Plus, Settings, Database
} from 'lucide-react';
import { 
  InterfaceSpecification, 
  InterfaceVersion, 
  unifiedInterfaceService,
  Domain 
} from '@/services';
import InlineInterfaceEditor from './InlineInterfaceEditor';
import InterfaceDetailsModal from './InterfaceDetailsModal';

interface FullScreenInterfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: Domain;
  initialVersion?: InterfaceVersion;
  onSave?: (interfaces: InterfaceSpecification[]) => void;
}

interface VersionGroup {
  version: InterfaceVersion;
  interfaces: InterfaceSpecification[];
  expanded: boolean;
}

const FullScreenInterfaceModal: React.FC<FullScreenInterfaceModalProps> = ({
  isOpen,
  onClose,
  domain,
  initialVersion,
  onSave
}) => {
  const [versions, setVersions] = useState<InterfaceVersion[]>([]);
  const [versionGroups, setVersionGroups] = useState<VersionGroup[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<InterfaceVersion | null>(initialVersion || null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingInterface, setEditingInterface] = useState<InterfaceSpecification | null>(null);
  const [viewingInterface, setViewingInterface] = useState<InterfaceSpecification | null>(null);
  const [viewMode, setViewMode] = useState<'versions' | 'interfaces' | 'editor'>('versions');
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Load domain versions and interfaces
  useEffect(() => {
    if (isOpen) {
      loadDomainData();
    }
  }, [isOpen, domain.id]);

  const loadDomainData = async () => {
    setLoading(true);
    try {
      // Load all interfaces for the domain first
      const interfacesResult = await unifiedInterfaceService.getInterfacesByDomain(domain.id);
      
      // Create version groups from interfaces
      const interfacesByVersion = interfacesResult.interfaces.reduce((acc, iface) => {
        const version = iface.interface_version || 'v1.0';
        if (!acc[version]) {
          acc[version] = [];
        }
        acc[version].push(iface);
        return acc;
      }, {} as Record<string, InterfaceSpecification[]>);

      // Create version metadata
      const versionList: InterfaceVersion[] = Object.entries(interfacesByVersion).map(([version, interfaces]) => ({
        spec_name: `${domain.name} Interfaces`,
        spec_version: version,
        interface_count: interfaces.length,
        latest_created: interfaces.reduce((latest, iface) => {
          const ifaceDate = iface.created_at ? new Date(iface.created_at).getTime() : 0;
          const latestDate = latest ? new Date(latest).getTime() : 0;
          return ifaceDate > latestDate ? iface.created_at! : latest;
        }, null as string | null),
        max_confidence: Math.max(...interfaces.map(i => i.ai_confidence_score || 0))
      }));

      setVersions(versionList);

      // Create version groups
      const groups: VersionGroup[] = versionList.map(version => ({
        version,
        interfaces: interfacesByVersion[version.spec_version] || [],
        expanded: version === selectedVersion
      }));

      setVersionGroups(groups);

      // Auto-select first version if none selected
      if (!selectedVersion && versionList.length > 0) {
        setSelectedVersion(versionList[0]);
      }
    } catch (error) {
      console.error('Failed to load domain data:', error);
      // Create empty state with meaningful message
      setVersions([]);
      setVersionGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter interfaces based on search and confidence
  const getFilteredInterfaces = (interfaces: InterfaceSpecification[]) => {
    return interfaces.filter(iface => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          iface.interface_name.toLowerCase().includes(query) ||
          iface.interface_description.toLowerCase().includes(query) ||
          iface.return_type?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Confidence filter
      if (filterConfidence !== 'all') {
        const confidence = iface.ai_confidence_score || 0;
        switch (filterConfidence) {
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

      return true;
    });
  };

  // Handle version expansion
  const toggleVersionExpansion = (versionIndex: number) => {
    setVersionGroups(prev => prev.map((group, index) => 
      index === versionIndex ? { ...group, expanded: !group.expanded } : group
    ));
  };

  // Handle interface editing
  const handleEditInterface = (iface: InterfaceSpecification) => {
    setEditingInterface(iface);
    setViewMode('editor');
  };

  const handleSaveInterface = async (updatedInterface: InterfaceSpecification) => {
    try {
      // Update in the version groups
      setVersionGroups(prev => prev.map(group => ({
        ...group,
        interfaces: group.interfaces.map(iface =>
          iface.interface_id === updatedInterface.interface_id ? updatedInterface : iface
        )
      })));

      setEditingInterface(null);
      setViewMode('interfaces');
      
      if (onSave) {
        // Get all interfaces from current version
        const currentVersionGroup = versionGroups.find(g => g.version === selectedVersion);
        if (currentVersionGroup) {
          onSave(currentVersionGroup.interfaces);
        }
      }
    } catch (error) {
      console.error('Failed to save interface:', error);
    }
  };

  const handleDeleteInterface = async (iface: InterfaceSpecification) => {
    if (iface.interface_id && confirm('Are you sure you want to delete this interface?')) {
      try {
        await unifiedInterfaceService.deleteInterface(iface.interface_id);
        
        // Remove from version groups
        setVersionGroups(prev => prev.map(group => ({
          ...group,
          interfaces: group.interfaces.filter(i => i.interface_id !== iface.interface_id)
        })));
      } catch (error) {
        console.error('Failed to delete interface:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Maximize2 className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                Interface Management - {domain.name}
              </h2>
              <p className="text-gray-400 text-sm">
                Complete interface specification management for {domain.domain_type} domain
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Selector */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              {[
                { mode: 'versions' as const, label: 'Versions', icon: GitBranch },
                { mode: 'interfaces' as const, label: 'Interfaces', icon: Database },
                { mode: 'editor' as const, label: 'Editor', icon: Edit }
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  disabled={mode === 'editor' && !editingInterface}
                  className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
                    viewMode === mode 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar - Version Navigation */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Version History</h3>
              <p className="text-gray-400 text-sm">
                {versions.length} versions available
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {versions.map((version, index) => (
                    <button
                      key={`${version.spec_name}-${version.spec_version}`}
                      onClick={() => setSelectedVersion(version)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedVersion === version
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{version.spec_version}</span>
                        <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                          {version.interface_count} interfaces
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {version.spec_name}
                      </div>
                      {version.latest_created && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(version.latest_created).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            
            {viewMode === 'editor' && editingInterface ? (
              /* Interface Editor View */
              <div className="flex-1 p-6 overflow-y-auto">
                <InlineInterfaceEditor
                  interface_={editingInterface}
                  onSave={handleSaveInterface}
                  onCancel={() => {
                    setEditingInterface(null);
                    setViewMode('interfaces');
                  }}
                  onDelete={() => handleDeleteInterface(editingInterface)}
                  className="max-w-4xl mx-auto"
                />
              </div>
            ) : (
              /* Versions/Interfaces List View */
              <>
                {/* Filter Bar */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search interfaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Confidence Filter */}
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={filterConfidence}
                        onChange={(e) => setFilterConfidence(e.target.value as any)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Confidence</option>
                        <option value="high">High (80%+)</option>
                        <option value="medium">Medium (60-79%)</option>
                        <option value="low">Low (&lt;60%)</option>
                      </select>
                    </div>

                    {/* Export Button */}
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Interface List */}
                <div className="flex-1 overflow-y-auto p-6">
                  {selectedVersion ? (
                    <div className="max-w-4xl mx-auto space-y-4">
                      {versionGroups
                        .filter(group => group.version === selectedVersion)
                        .map((group, groupIndex) => {
                          const filteredInterfaces = getFilteredInterfaces(group.interfaces);
                          
                          return (
                            <div key={groupIndex} className="space-y-3">
                              {/* Version Header */}
                              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-600">
                                <div className="flex items-center space-x-3">
                                  <GitBranch className="w-5 h-5 text-blue-400" />
                                  <div>
                                    <h3 className="text-lg font-semibold text-white">
                                      {group.version.spec_name} - {group.version.spec_version}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                      {filteredInterfaces.length} interfaces
                                      {searchQuery || filterConfidence !== 'all' ? 
                                        ` (filtered from ${group.interfaces.length})` : ''
                                      }
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-400">
                                    Max Confidence: {Math.round(group.version.max_confidence * 100)}%
                                  </span>
                                  {group.version.latest_created && (
                                    <span className="text-sm text-gray-400">
                                      {new Date(group.version.latest_created).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Interfaces */}
                              {filteredInterfaces.map((iface, index) => (
                                <div
                                  key={iface.interface_id || index}
                                  className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-2">
                                        <h4 className="text-lg font-semibold text-white">
                                          {iface.interface_name}
                                        </h4>
                                        {iface.ai_confidence_score && iface.ai_confidence_score >= 0.9 && (
                                          <Star className="w-4 h-4 text-yellow-400" />
                                        )}
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                          {iface.interface_version}
                                        </span>
                                      </div>
                                      
                                      <p className="text-gray-300 mb-3">
                                        {iface.interface_description}
                                      </p>
                                      
                                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                                        <span>
                                          Confidence: <span className={`font-semibold ${
                                            iface.ai_confidence_score && iface.ai_confidence_score >= 0.8 ? 'text-green-400' :
                                            iface.ai_confidence_score && iface.ai_confidence_score >= 0.6 ? 'text-yellow-400' :
                                            'text-red-400'
                                          }`}>
                                            {iface.ai_confidence_score ? 
                                              `${Math.round(iface.ai_confidence_score * 100)}%` : 
                                              'N/A'
                                            }
                                          </span>
                                        </span>
                                        <span>{iface.parameters?.length || 0} parameters</span>
                                        {iface.return_type && <span>Returns: {iface.return_type}</span>}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                      <button
                                        onClick={() => setViewingInterface(iface)}
                                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                      >
                                        <Eye className="w-4 h-4" />
                                        <span>View</span>
                                      </button>
                                      <button
                                        onClick={() => handleEditInterface(iface)}
                                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                        <span>Edit</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {filteredInterfaces.length === 0 && (
                                <div className="text-center py-8">
                                  <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                  <p className="text-gray-400">
                                    {searchQuery || filterConfidence !== 'all' ? 
                                      'No interfaces match your filters' : 
                                      'No interfaces found in this version'
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <GitBranch className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Select a version to view interfaces</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interface Details Modal */}
      {viewingInterface && (
        <InterfaceDetailsModal
          isOpen={true}
          onClose={() => setViewingInterface(null)}
          interface_={viewingInterface}
          onEdit={() => {
            setViewingInterface(null);
            handleEditInterface(viewingInterface);
          }}
          onDelete={() => {
            setViewingInterface(null);
            handleDeleteInterface(viewingInterface);
          }}
        />
      )}
    </div>
  );
};

export default FullScreenInterfaceModal;