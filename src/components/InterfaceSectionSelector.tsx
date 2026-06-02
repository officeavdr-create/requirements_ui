// import React, { useState, useEffect } from 'react';
// import { 
//   Layers,
//   Check,
//   Circle,
//   Filter,
//   RotateCcw
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { unifiedInterfaceService } from '@/services';
// import { parseInstanceVersionSelections, createParameterKey } from '@/utils/versionUtils';
// import type { InterfaceSection } from '@/services/unifiedInterfaceService';

// interface InterfaceSectionSelectorProps {
//   selectedDomainInstances: string[];
//   selectedVersions: string[];
//   selectedSections: string[];
//   onSectionSelectionChange: (sections: string[]) => void;
//   onSectionsLoad?: (sections: InterfaceSection[]) => void;
// }

// export const InterfaceSectionSelector: React.FC<InterfaceSectionSelectorProps> = ({
//   selectedDomainInstances,
//   selectedVersions,
//   selectedSections,
//   onSectionSelectionChange,
//   onSectionsLoad
// }) => {
//   const [availableSections, setAvailableSections] = useState<InterfaceSection[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [lastLoadParams, setLastLoadParams] = useState<string>('');
//   const [loadAttempts, setLoadAttempts] = useState(0);

//   // Load sections when dependencies change
//   useEffect(() => {
//     if (selectedDomainInstances.length > 0 && selectedVersions.length > 0) {
//       // Prevent duplicate loads
//       const paramKey = createParameterKey(selectedDomainInstances, selectedVersions);
      
//       if (paramKey !== lastLoadParams) {
//         setLastLoadParams(paramKey);
//         setLoadAttempts(0);
//         loadSections();
//       }
//     } else {
//       setAvailableSections([]);
//       setError(null);
//       setLastLoadParams('');
//       setLoadAttempts(0);
//     }
//   }, [selectedDomainInstances, selectedVersions]);

//   const loadSections = async () => {
//     // Prevent too many retry attempts
//     if (loadAttempts >= 3) {
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
      
//       // Parse instance-specific version selections
//       const { filteredDomainInstances, allSelectedVersions } = parseInstanceVersionSelections(selectedVersions);
      
//       if (filteredDomainInstances.length === 0 || allSelectedVersions.length === 0) {
//         setAvailableSections([]);
//         return;
//       }
      
//       const sections = await unifiedInterfaceService.getInterfaceSections(
//         filteredDomainInstances,
//         allSelectedVersions
//       );
      
//       setAvailableSections(sections || []);
      
//       if (onSectionsLoad) {
//         onSectionsLoad(sections || []);
//       }
      
//       // Reset load attempts on success
//       setLoadAttempts(0);
      
//     } catch (error) {
//       console.error('Failed to load interface sections:', error);
      
//       // Provide more specific error messages
//       let errorMessage = 'Network Error';
//       if (error.response) {
//         if (error.response.status === 404) {
//           errorMessage = 'Sections endpoint not found';
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
      
//       setError(`Failed to load sections: ${errorMessage}`);
      
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSection = (sectionName: string) => {
//     const newSelection = selectedSections.includes(sectionName)
//       ? selectedSections.filter(s => s !== sectionName)
//       : [...selectedSections, sectionName];
    
//     onSectionSelectionChange(newSelection);
//   };

//   const selectAllSections = () => {
//     const allSectionNames = availableSections.map(s => s.sectionName);
//     onSectionSelectionChange(allSectionNames);
//   };

//   const clearSelection = () => {
//     onSectionSelectionChange([]);
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Layers className="h-5 w-5" />
//           4. Interface Sections (Filter)
//           {selectedSections.length > 0 ? (
//             <Badge variant="secondary" className="bg-green-100 text-green-800">
//               {selectedSections.length} selected
//             </Badge>
//           ) : (
//             <Badge variant="secondary" className="bg-gray-100 text-gray-700">
//               All sections
//             </Badge>
//           )}
//         </CardTitle>
//         <div className="text-sm text-gray-600">
//           Select which interface sections to include in step 5. Leave empty to show all interfaces.
//         </div>
//       </CardHeader>
//       <CardContent>
//         {selectedDomainInstances.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             Select domain instances first
//           </div>
//         ) : selectedVersions.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             Select interface versions first
//           </div>
//         ) : error ? (
//           <div className="flex flex-col items-center justify-center py-8 space-y-3">
//             <div className="text-red-500 text-center">
//               <p className="font-medium">Error loading sections</p>
//               <p className="text-sm mt-1">{error}</p>
//             </div>
//             <Button 
//               onClick={() => {
//                 setError(null);
//                 setLastLoadParams(''); // Force reload
//                 setLoadAttempts(0);
//                 loadSections();
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
//         ) : availableSections.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <p>No sections found for selected versions</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {/* Section Filter Controls */}
//             <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//               <div className="flex items-center gap-2 flex-1">
//                 <Filter className="h-4 w-4 text-blue-600" />
//                 <span className="text-sm font-medium text-blue-800">Interface Section Filter:</span>
                
//                 {selectedSections.length === 0 ? (
//                   <span className="text-sm text-blue-700">Showing all sections</span>
//                 ) : (
//                   <span className="text-sm text-blue-700">
//                     {selectedSections.length} of {availableSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected
//                   </span>
//                 )}
//               </div>
              
//               <div className="flex items-center gap-2">
//                 {availableSections.length > 1 && (
//                   <Button
//                     onClick={selectAllSections}
//                     variant="outline"
//                     size="sm"
//                     className="flex items-center gap-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
//                   >
//                     <Check className="h-3 w-3" />
//                     Select All
//                   </Button>
//                 )}
                
//                 {selectedSections.length > 0 && (
//                   <Button
//                     onClick={clearSelection}
//                     variant="outline"
//                     size="sm"
//                     className="flex items-center gap-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
//                   >
//                     <RotateCcw className="h-3 w-3" />
//                     Clear Filter
//                   </Button>
//                 )}
                
//                 <div className="text-xs text-blue-600">
//                   {availableSections.length} available
//                 </div>
//               </div>
//             </div>

//             {/* Active Filter Display */}
//             {selectedSections.length > 0 && (
//               <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <div className="text-sm text-green-800">
//                   <strong>🔍 Active Filter:</strong> Only showing interfaces from: <span className="font-medium">{selectedSections.join(', ')}</span>
//                 </div>
//                 <div className="text-xs text-green-700 mt-1">
//                   Step 5 will only display interfaces from the selected sections above.
//                 </div>
//               </div>
//             )}

//             {/* Section List */}
//             <div className="space-y-2">
//               {availableSections.map(section => {
//                 const isSelected = selectedSections.includes(section.sectionName);
                
//                 return (
//                   <div key={section.sectionName} className="border rounded-lg">
//                     <div className="flex items-center justify-between p-3">
//                       <div className="flex items-center gap-2 flex-1">
//                         <button
//                           onClick={() => toggleSection(section.sectionName)}
//                           className={cn(
//                             "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border flex-1 text-left",
//                             isSelected 
//                               ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg" 
//                               : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
//                           )}
//                         >
//                           {isSelected ? (
//                             <Check className="h-4 w-4 text-white" />
//                           ) : (
//                             <Circle className="h-4 w-4 text-gray-500" />
//                           )}
                          
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <div className={cn("font-medium text-sm", isSelected ? "text-white" : "text-gray-900")}>{section.sectionName}</div>
//                               {section.parentDomainInstances.length > 0 && (
//                                 <div className={cn("text-xs opacity-75", isSelected ? "text-white" : "text-gray-600")}>
//                                   ({section.parentDomainInstances.map(instance => instance.instanceName).join(', ')})
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-4 mt-1">
//                               <Badge 
//                                 variant="outline"
//                                 className={cn(
//                                   "text-xs",
//                                   isSelected 
//                                     ? "bg-blue-200 text-blue-900 border-blue-400" 
//                                     : "bg-gray-200 text-gray-900 border-gray-400"
//                                 )}
//                               >
//                                 {section.interfaceCount} interface{section.interfaceCount !== 1 ? 's' : ''}
//                               </Badge>
//                               <Badge 
//                                 variant="outline"
//                                 className={cn(
//                                   "text-xs",
//                                   isSelected 
//                                     ? "bg-blue-200 text-blue-900 border-blue-400" 
//                                     : "bg-gray-200 text-gray-900 border-gray-400"
//                                 )}
//                               >
//                                 {section.availableVersions.length} version{section.availableVersions.length !== 1 ? 's' : ''}
//                               </Badge>
//                             </div>
//                           </div>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layers,
  Check,
  Circle,
  Filter,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unifiedInterfaceService } from '@/services';
import { parseInstanceVersionSelections, createParameterKey } from '@/utils/versionUtils';
import type { InterfaceSection } from '@/services/unifiedInterfaceService';

interface InterfaceSectionSelectorProps {
  selectedDomainInstances: string[];
  selectedVersions: string[];
  selectedSections: string[];
  onSectionSelectionChange: (sections: string[]) => void;
  onSectionsLoad?: (sections: InterfaceSection[]) => void;
}

export const InterfaceSectionSelector: React.FC<InterfaceSectionSelectorProps> = ({
  selectedDomainInstances,
  selectedVersions,
  selectedSections,
  onSectionSelectionChange,
  onSectionsLoad
}) => {
  const [availableSections, setAvailableSections] = useState<InterfaceSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadParams, setLastLoadParams] = useState<string>('');
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Load sections when dependencies change - Optimized
  useEffect(() => {
    if (selectedDomainInstances.length > 0 && selectedVersions.length > 0) {
      // Prevent duplicate loads
      const paramKey = createParameterKey(selectedDomainInstances, selectedVersions);
      
      if (paramKey !== lastLoadParams) {
        setLastLoadParams(paramKey);
        setLoadAttempts(0);
        loadSections();
      }
    } else {
      // Clear state when prerequisites are not met
      setAvailableSections([]);
      setError(null);
      setLastLoadParams('');
      setLoadAttempts(0);
    }
  }, [selectedDomainInstances, selectedVersions, lastLoadParams]);

  const loadSections = async () => {
    // Prevent too many retry attempts
    if (loadAttempts >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }
    
    // Prevent concurrent loads
    if (loading) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setLoadAttempts(prev => prev + 1);
      
      // Parse instance-specific version selections to avoid data mixing
      const { filteredDomainInstances, allSelectedVersions } = parseInstanceVersionSelections(selectedVersions);
      
      if (filteredDomainInstances.length === 0 || allSelectedVersions.length === 0) {
        setAvailableSections([]);
        return;
      }
      
      const sections = await unifiedInterfaceService.getInterfaceSections(
        filteredDomainInstances,
        allSelectedVersions
      );
      
      setAvailableSections(sections || []);
      
      if (onSectionsLoad) {
        onSectionsLoad(sections || []);
      }
      
      // Reset load attempts on success
      setLoadAttempts(0);
      
    } catch (error) {
      console.error('Failed to load interface sections:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Network Error';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Sections endpoint not found';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error occurred';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid request parameters';
        } else {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network connection failed';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(`Failed to load sections: ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  // Optimized toggle functions
  const toggleSection = useCallback((sectionName: string) => {
    onSectionSelectionChange(
      selectedSections.includes(sectionName)
        ? selectedSections.filter(s => s !== sectionName)
        : [...selectedSections, sectionName]
    );
  }, [selectedSections, onSectionSelectionChange]);

  const selectAllSections = useCallback(() => {
    const allSectionNames = availableSections.map(s => s.sectionName);
    onSectionSelectionChange(allSectionNames);
  }, [availableSections, onSectionSelectionChange]);

  const clearSelection = useCallback(() => {
    onSectionSelectionChange([]);
  }, [onSectionSelectionChange]);

  const retryLoad = useCallback(() => {
    setError(null);
    setLastLoadParams(''); // Force reload
    setLoadAttempts(0);
    loadSections();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          4. Interface Sections (Filter)
          {selectedSections.length > 0 ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {selectedSections.length} selected
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              All sections
            </Badge>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Select which interface sections to include in step 5. Leave empty to show all interfaces.
        </div>
      </CardHeader>
      <CardContent>
        {selectedDomainInstances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Select domain instances first
          </div>
        ) : selectedVersions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Select interface versions first
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="text-red-500 text-center">
              <p className="font-medium">Error loading sections</p>
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
        ) : availableSections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No sections found for selected versions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Section Filter Controls */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Interface Section Filter:</span>
                
                {selectedSections.length === 0 ? (
                  <span className="text-sm text-blue-700">Showing all sections</span>
                ) : (
                  <span className="text-sm text-blue-700">
                    {selectedSections.length} of {availableSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {availableSections.length > 1 && (
                  <Button
                    onClick={selectAllSections}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                  >
                    <Check className="h-3 w-3" />
                    Select All
                  </Button>
                )}
                
                {selectedSections.length > 0 && (
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear Filter
                  </Button>
                )}
                
                <div className="text-xs text-blue-600">
                  {availableSections.length} available
                </div>
              </div>
            </div>

            {/* Active Filter Display */}
            {selectedSections.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  <strong>🔍 Active Filter:</strong> Only showing interfaces from: <span className="font-medium">{selectedSections.join(', ')}</span>
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Step 5 will only display interfaces from the selected sections above.
                </div>
              </div>
            )}

            {/* Section List - WITH SCROLL */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {availableSections.map(section => {
                const isSelected = selectedSections.includes(section.sectionName);
                
                return (
                  <div key={section.sectionName} className="border rounded-lg">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => toggleSection(section.sectionName)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border flex-1 text-left",
                            isSelected 
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg" 
                              : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
                          )}
                        >
                          {isSelected ? (
                            <Check className="h-4 w-4 text-white" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-500" />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={cn("font-medium text-sm", isSelected ? "text-white" : "text-gray-900")}>
                                {section.sectionName}
                              </div>
                              {section.parentDomainInstances.length > 0 && (
                                <div className={cn("text-xs opacity-75", isSelected ? "text-white" : "text-gray-600")}>
                                  ({section.parentDomainInstances.map(instance => instance.instanceName).join(', ')})
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  isSelected 
                                    ? "bg-blue-200 text-blue-900 border-blue-400" 
                                    : "bg-gray-200 text-gray-900 border-gray-400"
                                )}
                              >
                                {section.interfaceCount} interface{section.interfaceCount !== 1 ? 's' : ''}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  isSelected 
                                    ? "bg-blue-200 text-blue-900 border-blue-400" 
                                    : "bg-gray-200 text-gray-900 border-gray-400"
                                )}
                              >
                                {section.availableVersions.length} version{section.availableVersions.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
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