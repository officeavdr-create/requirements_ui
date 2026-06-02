// import React, { useState, useEffect } from 'react';
// import { 
//   Code,
//   ChevronRight,
//   ChevronDown,
//   Check,
//   Circle,
//   Calendar,
//   Package,
//   Layers
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { unifiedInterfaceService } from '@/services';
// import { createVersionKey } from '@/utils/versionUtils';
// import type { VersionDisplayGroup } from '@/services/unifiedInterfaceService';

// interface InstanceGroupedVersionSelectorProps {
//   selectedDomainInstances: string[];
//   selectedVersions: string[];
//   onVersionSelectionChange: (versions: string[]) => void;
//   onVersionGroupsLoad?: (groups: VersionDisplayGroup[]) => void;
// }

// export const InstanceGroupedVersionSelector: React.FC<InstanceGroupedVersionSelectorProps> = ({
//   selectedDomainInstances,
//   selectedVersions,
//   onVersionSelectionChange,
//   onVersionGroupsLoad
// }) => {
//   const [versionGroups, setVersionGroups] = useState<VersionDisplayGroup[]>([]);
//   const [expandedInstances, setExpandedInstances] = useState<Set<string>>(new Set());
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [lastLoadParams, setLastLoadParams] = useState<string>('');
//   const [loadAttempts, setLoadAttempts] = useState(0);

//   // Load version groups when domain instances change (with duplicate prevention)
//   useEffect(() => {
//     if (selectedDomainInstances.length > 0) {
//       // Create a unique key for these parameters to prevent duplicate loads
//       const paramKey = JSON.stringify(selectedDomainInstances.sort());
      
//       if (paramKey !== lastLoadParams) {
//         setLastLoadParams(paramKey);
//         setLoadAttempts(0); // Reset attempts for new parameters
//         loadVersionGroups();
//       }
//     } else {
//       setVersionGroups([]);
//       setError(null);
//       setLastLoadParams('');
//       setLoadAttempts(0);
//     }
//   }, [selectedDomainInstances, lastLoadParams]);

//   // Auto-expand instances with selected versions
//   useEffect(() => {
//     if (selectedVersions.length > 0) {
//       const instancesToExpand = new Set<string>();
//       versionGroups.forEach(group => {
//         const hasSelectedVersion = group.availableVersions.some(v => 
//           selectedVersions.includes(`${group.domainInstanceId}:${v.version}`)
//         );
        
//         if (hasSelectedVersion) {
//           instancesToExpand.add(group.domainInstanceId);
//         }
//       });
      
//       setExpandedInstances(instancesToExpand);
//     }
//   }, [selectedVersions, versionGroups]);

//   const loadVersionGroups = async () => {
//     // Prevent too many retry attempts
//     if (loadAttempts >= 3) {
//       console.error('InstanceGroupedVersionSelector: Maximum retry attempts reached');
//       setError('Maximum retry attempts reached. Please refresh the page.');
//       return;
//     }
    
//     // Prevent concurrent loads
//     if (loading) {
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
//       setLoadAttempts(prev => prev + 1);
      
//       const groups = await unifiedInterfaceService.getVersionsByInstance(selectedDomainInstances);
      
//       setVersionGroups(groups || []);
      
//       // Notify parent component
//       if (onVersionGroupsLoad) {
//         onVersionGroupsLoad(groups || []);
//       }
      
//       // Reset load attempts on success
//       setLoadAttempts(0);
      
//     } catch (error) {
//       console.error('InstanceGroupedVersionSelector: Failed to load version groups:', error);
      
//       // Provide more specific error messages
//       let errorMessage = 'Network Error';
//       if (error.response) {
//         if (error.response.status === 404) {
//           errorMessage = 'Versions endpoint not found';
//         } else if (error.response.status >= 500) {
//           errorMessage = 'Server error occurred';
//         } else if (error.response.status === 400) {
//           errorMessage = 'Invalid request parameters';
//         } else {
//           errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
//         }
//       } else if (error.code === 'ECONNABORTED') {
//         errorMessage = 'Request timeout';
//       } else if (error.code === 'ERR_NETWORK') {
//         errorMessage = 'Network connection failed';
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       setError(`Failed to load versions: ${errorMessage}`);
      
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleInstanceExpansion = (instanceId: string) => {
//     const newExpanded = new Set(expandedInstances);
//     if (newExpanded.has(instanceId)) {
//       newExpanded.delete(instanceId);
//     } else {
//       newExpanded.add(instanceId);
//     }
    
//     setExpandedInstances(newExpanded);
//   };

//   const toggleVersion = (version: string, instanceId: string) => {
//     // Create a unique identifier for this version in this specific instance
//     const versionKey = createVersionKey(instanceId, version);
    
//     const newSelection = selectedVersions.includes(versionKey)
//       ? selectedVersions.filter(v => v !== versionKey)
//       : [...selectedVersions, versionKey];
    
//     onVersionSelectionChange(newSelection);
//   };

//   const selectAllVersionsInInstance = (group: VersionDisplayGroup) => {
//     // Create unique identifiers for all versions in this instance
//     const instanceVersionKeys = group.availableVersions.map(v => createVersionKey(group.domainInstanceId, v.version));
    
//     // Remove any existing selections for this instance, then add all versions for this instance
//     const otherVersions = selectedVersions.filter(v => 
//       !v.startsWith(`${group.domainInstanceId}:`)
//     );
    
//     const newSelection = [...otherVersions, ...instanceVersionKeys];
    
//     onVersionSelectionChange(newSelection);
//   };

//   const formatLastUpdated = (lastUpdated?: string) => {
//     if (!lastUpdated) return 'Unknown';
//     return new Date(lastUpdated).toLocaleDateString();
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Code className="h-5 w-5" />
//           3. Interface Versions
//           {selectedVersions.length > 0 && (
//             <Badge variant="secondary" className="bg-purple-100 text-purple-800">
//               {selectedVersions.length} selected
//             </Badge>
//           )}
//         </CardTitle>
//         <div className="text-sm text-gray-600">
//           Select interface versions grouped by domain instance
//         </div>
//       </CardHeader>
//       <CardContent>
//         {selectedDomainInstances.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             Select domain instances first
//           </div>
//         ) : error ? (
//           <div className="flex flex-col items-center justify-center py-8 space-y-3">
//             <div className="text-red-500 text-center">
//               <p className="font-medium">Error loading versions</p>
//               <p className="text-sm mt-1">{error}</p>
//             </div>
//             <Button 
//               onClick={() => {
//                 setError(null);
//                 setLastLoadParams(''); // Force reload
//                 setLoadAttempts(0);
//                 loadVersionGroups();
//               }}
//               size="sm"
//               disabled={loading || loadAttempts >= 3}
//             >
//               {loading ? 'Retrying...' : loadAttempts >= 3 ? 'Max Retries' : 'Retry'}
//             </Button>
//           </div>
//         ) : loading ? (
//           <div className="flex items-center justify-center py-8">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
//           </div>
//         ) : versionGroups.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <p>No versions found for selected instances</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {versionGroups.map(group => {
//               const isExpanded = expandedInstances.has(group.domainInstanceId);
//               const selectedVersionsInGroup = group.availableVersions.filter(v => 
//                 selectedVersions.includes(`${group.domainInstanceId}:${v.version}`)
//               ).length;
              
//               return (
//                 <div key={group.domainInstanceId} className="border rounded-lg">
//                   {/* Instance Header */}
//                   <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
//                     <button 
//                       onClick={() => toggleInstanceExpansion(group.domainInstanceId)}
//                       className="flex items-center gap-2 flex-1 text-left"
//                     >
//                       {isExpanded ? (
//                         <ChevronDown className="h-4 w-4 text-gray-500" />
//                       ) : (
//                         <ChevronRight className="h-4 w-4 text-gray-500" />
//                       )}
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium text-gray-900">{group.domainInstanceName}</span>
//                         <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                           {group.domainType}
//                         </Badge>
//                         {selectedVersionsInGroup > 0 && (
//                           <Badge className="bg-purple-500 text-white">
//                             {selectedVersionsInGroup} selected
//                           </Badge>
//                         )}
//                       </div>
//                     </button>
                    
//                     <div className="flex items-center gap-4 text-sm text-gray-600">
//                       <div className="flex items-center gap-1">
//                         <Package className="h-4 w-4" />
//                         {group.totalInterfaces} interfaces
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Code className="h-4 w-4" />
//                         {group.availableVersions.length} version{group.availableVersions.length !== 1 ? 's' : ''}
//                       </div>
//                       {group.availableVersions.length > 1 && (
//                         <Button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             selectAllVersionsInInstance(group);
//                           }}
//                           variant="outline"
//                           size="sm"
//                           className="ml-2"
//                         >
//                           Select All
//                         </Button>
//                       )}
//                     </div>
//                   </div>
                  
//                   {/* Version List */}
//                   {isExpanded && (
//                     <div className="border-t">
//                       <div className="p-3 space-y-2">
//                         {group.availableVersions.map(version => {
//                           const versionKey = `${group.domainInstanceId}:${version.version}`;
//                           const isSelected = selectedVersions.includes(versionKey);
                          
//                           return (
//                             <button
//                               key={version.version}
//                               onClick={() => toggleVersion(version.version, group.domainInstanceId)}
//                               className={cn(
//                                 "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
//                                 isSelected 
//                                   ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white border-purple-600 shadow-lg" 
//                                   : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
//                               )}
//                             >
//                               {isSelected ? (
//                                 <Check className="h-4 w-4 text-white" />
//                               ) : (
//                                 <Circle className="h-4 w-4 text-gray-500" />
//                               )}
                              
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <span className="font-medium text-sm">
//                                     {version.version === 'default' ? 'Default' : 
//                                      version.version.startsWith('v') ? version.version : `v${version.version}`}
//                                   </span>
//                                   <Badge 
//                                     className={cn(
//                                       "text-xs",
//                                       isSelected 
//                                         ? "bg-purple-200 text-purple-900 border-purple-400" 
//                                         : "bg-gray-200 text-gray-900 border-gray-400"
//                                     )}
//                                   >
//                                     {version.interfaceCount} interface{version.interfaceCount !== 1 ? 's' : ''}
//                                   </Badge>
//                                 </div>
                                
//                                 <div className="flex items-center gap-4 text-xs">
//                                   <div className="flex items-center gap-1">
//                                     <Layers className="h-3 w-3" />
//                                     <span>{version.sectionsAvailable.length} section{version.sectionsAvailable.length !== 1 ? 's' : ''}</span>
//                                   </div>
//                                   {version.lastUpdated && (
//                                     <div className="flex items-center gap-1">
//                                       <Calendar className="h-3 w-3" />
//                                       <span>Updated {formatLastUpdated(version.lastUpdated)}</span>
//                                     </div>
//                                   )}
//                                 </div>
                                
//                                 {version.sectionsAvailable.length > 0 && (
//                                   <div className="mt-2 flex flex-wrap gap-1">
//                                     {version.sectionsAvailable.slice(0, 3).map(section => (
//                                       <Badge 
//                                         key={section}
//                                         variant="outline" 
//                                         className={cn(
//                                           "text-xs",
//                                           isSelected ? "border-purple-300 text-purple-900 bg-purple-200" : "border-gray-300 text-gray-600"
//                                         )}
//                                       >
//                                         {section}
//                                       </Badge>
//                                     ))}
//                                     {version.sectionsAvailable.length > 3 && (
//                                       <Badge 
//                                         variant="outline" 
//                                         className={cn(
//                                           "text-xs",
//                                           isSelected ? "border-purple-300 text-purple-900 bg-purple-200" : "border-gray-300 text-gray-600"
//                                         )}
//                                       >
//                                         +{version.sectionsAvailable.length - 3} more
//                                       </Badge>
//                                     )}
//                                   </div>
//                                 )}
//                               </div>
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  Code,
  Check,
  Circle,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unifiedInterfaceService } from '@/services';
import { createParameterKey, createVersionSelection } from '@/components/versionUtils';
import type { VersionDisplayGroup } from '@/services/unifiedInterfaceService';

interface InstanceGroupedVersionSelectorProps {
  selectedDomainInstances: string[];
  selectedVersions: string[];
  onVersionSelectionChange: (versions: string[]) => void;
}

export const InstanceGroupedVersionSelector: React.FC<InstanceGroupedVersionSelectorProps> = ({
  selectedDomainInstances,
  selectedVersions,
  onVersionSelectionChange
}) => {
  const [versionGroups, setVersionGroups] = useState<VersionDisplayGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadParams, setLastLoadParams] = useState<string>('');
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Load version groups when domain instances change
  useEffect(() => {
    if (selectedDomainInstances.length > 0) {
      const paramKey = createParameterKey(selectedDomainInstances, []);
      
      if (paramKey !== lastLoadParams) {
        setLastLoadParams(paramKey);
        setLoadAttempts(0);
        loadVersionGroups();
      }
    } else {
      // Clear state when no domain instances selected
      setVersionGroups([]);
      setError(null);
      setLastLoadParams('');
      setLoadAttempts(0);
    }
  }, [selectedDomainInstances, lastLoadParams]);

  const loadVersionGroups = async () => {
    if (loadAttempts >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }
    
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      setLoadAttempts(prev => prev + 1);
      
      const groups = await unifiedInterfaceService.getVersionsByInstance(selectedDomainInstances);
      
      setVersionGroups(groups || []);
      setLoadAttempts(0);
      
    } catch (error) {
      console.error('Failed to load version groups:', error);
      
      let errorMessage = 'Network Error';
      if (error.response?.status === 404) {
        errorMessage = 'Versions endpoint not found';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error occurred';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request parameters';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(`Failed to load versions: ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return newExpanded;
    });
  }, []);

  const toggleVersionSelection = useCallback((domainInstanceId: string, version: string) => {
    const versionSelection = createVersionSelection(domainInstanceId, version);
    
    onVersionSelectionChange(
      selectedVersions.includes(versionSelection)
        ? selectedVersions.filter(v => v !== versionSelection)
        : [...selectedVersions, versionSelection]
    );
  }, [selectedVersions, onVersionSelectionChange]);

  const selectAllVersionsInGroup = useCallback((group: VersionDisplayGroup) => {
    const groupSelections = group.availableVersions.map(version => 
      createVersionSelection(group.domainInstanceId, version.version)
    );
    
    const otherSelections = selectedVersions.filter(selection => {
      const [domainId] = selection.split('::');
      return domainId !== group.domainInstanceId;
    });
    
    onVersionSelectionChange([...otherSelections, ...groupSelections]);
  }, [selectedVersions, onVersionSelectionChange]);

  const clearSelection = useCallback(() => {
    onVersionSelectionChange([]);
  }, [onVersionSelectionChange]);

  const retryLoad = useCallback(() => {
    setError(null);
    setLastLoadParams('');
    setLoadAttempts(0);
    loadVersionGroups();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          3. Interface Versions
          {selectedVersions.length > 0 && (
            <Badge className="bg-purple-100 text-purple-800">
              {selectedVersions.length} selected
            </Badge>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Select interface versions grouped by domain instance. Multiple selections across domains are maintained separately.
        </div>
      </CardHeader>
      <CardContent>
        {selectedDomainInstances.length === 0 ? (
          <div className="text-center py-8 text-black-500">
            Select domain instances first
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="text-red-500 text-center">
              <p className="font-medium">Error loading versions</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <Button 
              onClick={retryLoad} 
              size="sm"
              disabled={loading || loadAttempts >= 3}
            >
              {loading ? 'Retrying...' : loadAttempts >= 3 ? 'Max Retries' : 'Retry'}
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : versionGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No versions found for selected domains</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Control Panel */}
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <Code className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Version Selection:</span>
                <span className="text-sm text-purple-700">
                  {selectedVersions.length} version{selectedVersions.length !== 1 ? 's' : ''} across {versionGroups.length} domain{versionGroups.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {selectedVersions.length > 0 && (
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Version Groups - WITH SCROLL */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {versionGroups.map(group => {
                const isExpanded = expandedGroups.has(group.domainInstanceId);
                const groupSelections = selectedVersions.filter(selection => {
                  const [domainId] = selection.split('::');
                  return domainId === group.domainInstanceId;
                });
                
                return (
                  <div key={group.domainInstanceId} className="border rounded-lg">
                    {/* Group Header */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => toggleGroupExpansion(group.domainInstanceId)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {group.domainInstanceName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {group.domainType} • {group.availableVersions.length} versions • {group.totalInterfaces} interfaces
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-black-900">
                          <Badge variant="outline" className="text-xs">
                            {groupSelections.length}/{group.availableVersions.length} selected
                          </Badge>
                          
                          <button
                            onClick={() => selectAllVersionsInGroup(group)}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Select All
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Versions List */}
                    {isExpanded && (
                      <div className="p-3 space-y-2">
                        {group.availableVersions.map(version => {
                          const versionSelection = createVersionSelection(group.domainInstanceId, version.version);
                          const isSelected = selectedVersions.includes(versionSelection);
                          
                          return (
                            <button
                              key={version.version}
                              onClick={() => toggleVersionSelection(group.domainInstanceId, version.version)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                                isSelected 
                                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-black border-purple-600 shadow-lg" 
                                  : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
                              )}
                            >
                              {isSelected ? (
                                <Check className="h-4 w-4 text-black" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-500" />
                              )}
                              
                              <div className="flex-1">
                                <div className={cn("font-medium text-sm", isSelected ? "text-black" : "text-gray-900")}>
                                  Version {version.version}
                                </div>
                                <div className={cn("text-xs mt-1", isSelected ? "text-purple-100" : "text-gray-600")}>
                                  {version.interfaceCount} interfaces
                                  {version.sectionsAvailable.length > 0 && (
                                    <span> • {version.sectionsAvailable.length} sections</span>
                                  )}
                                  {version.lastUpdated && (
                                    <span> • Updated {new Date(version.lastUpdated).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};