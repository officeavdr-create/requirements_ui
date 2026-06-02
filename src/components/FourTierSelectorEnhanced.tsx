// import React, { useState, useEffect } from 'react';
// import { 
//   ChevronRight, 
//   ChevronDown, 
//   Layers, 
//   Database, 
//   Code, 
//   Settings,
//   Check,
//   Circle,
//   Filter,
//   Package
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { domainService, unifiedInterfaceService } from '@/services';
// import { parseInstanceVersionSelections, createParameterKey } from '@/utils/versionUtils';
// import { InterfaceSectionSelector } from '@/components/InterfaceSectionSelector';
// import { InstanceGroupedVersionSelector } from '@/components/InstanceGroupedVersionSelector';
// import type { Domain } from '@/services';
// import type { InterfaceSection, VersionDisplayGroup, GroupedInterface } from '@/services/unifiedInterfaceService';

// interface DomainType {
//   domain_type: string;
//   count: number;
//   domains: Domain[];
// }

// interface FourTierSelectorEnhancedProps {
//   sessionId: string;
//   onSelectionChanged: (selection: {
//     domainTypes: string[];
//     domainInstances: string[];
//     interfaceVersions: string[];
//     interfaceSections: string[];  // NEW: Section filtering
//     interfaces: string[];
//   }) => void;
//   // Optional props to restore previous selections
//   initialSelection?: {
//     domainTypes: string[];
//     domainInstances: string[];
//     interfaceVersions: string[];
//     interfaceSections: string[];  // NEW: Section filtering
//     interfaces: string[];
//   };
// }

// export const FourTierSelectorEnhanced: React.FC<FourTierSelectorEnhancedProps> = ({
//   sessionId,
//   onSelectionChanged,
//   initialSelection
// }) => {
//   // Tier 1: Domain Types
//   const [domainTypes, setDomainTypes] = useState<DomainType[]>([]);
//   const [selectedDomainTypes, setSelectedDomainTypes] = useState<string[]>([]);
//   const [expandedDomainTypes, setExpandedDomainTypes] = useState<Set<string>>(new Set());
  
//   // Tier 2: Domain Instances
//   const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
//   const [selectedDomainInstances, setSelectedDomainInstances] = useState<string[]>([]);
  
//   // Tier 3: Interface Versions (now grouped by instance)
//   const [selectedInterfaceVersions, setSelectedInterfaceVersions] = useState<string[]>([]);
  
//   // Tier 4: Interface Sections (NEW)
//   const [selectedInterfaceSections, setSelectedInterfaceSections] = useState<string[]>([]);
  
//   // Tier 5: Interfaces (enhanced with section filtering)
//   const [availableInterfaces, setAvailableInterfaces] = useState<GroupedInterface[]>([]);
//   const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>([]);
  
//   const [loading, setLoading] = useState(false);
//   const [loadingInterfaces, setLoadingInterfaces] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [lastInterfaceLoadParams, setLastInterfaceLoadParams] = useState<string>('');
//   const [interfaceLoadAttempts, setInterfaceLoadAttempts] = useState(0);

//   // Load domain types on mount
//   useEffect(() => {
//     loadDomainTypes();
//   }, []);

//   // Restore initial selections when provided
//   useEffect(() => {
//     if (initialSelection) {
//       setSelectedDomainTypes(initialSelection.domainTypes || []);
//       setSelectedDomainInstances(initialSelection.domainInstances || []);
//       setSelectedInterfaceVersions(initialSelection.interfaceVersions || []);
//       setSelectedInterfaceSections(initialSelection.interfaceSections || []);
//       setSelectedInterfaces(initialSelection.interfaces || []);
//     }
//   }, [initialSelection]);

//   // Load domain instances when domain types are selected
//   useEffect(() => {
//     if (selectedDomainTypes.length > 0) {
//       loadDomainInstances();
//     } else {
//       setAvailableDomains([]);
//       setSelectedDomainInstances([]);
//     }
//   }, [selectedDomainTypes]);

//   // Load interfaces when all selections are made (with duplicate prevention)
//   useEffect(() => {
//     if (selectedDomainInstances.length > 0 && selectedInterfaceVersions.length > 0) {
//       // Create a unique key for these parameters to prevent duplicate loads
//       const paramKey = createParameterKey(
//         [...selectedDomainInstances, ...selectedInterfaceVersions], 
//         selectedInterfaceSections
//       );
      
//       if (paramKey !== lastInterfaceLoadParams) {
//         setLastInterfaceLoadParams(paramKey);
//         setInterfaceLoadAttempts(0); // Reset attempts for new parameters
//         loadInterfaces();
//       }
//     } else {
//       setAvailableInterfaces([]);
//       setSelectedInterfaces([]);
//       setLastInterfaceLoadParams('');
//       setInterfaceLoadAttempts(0);
//     }
//   }, [selectedDomainInstances, selectedInterfaceVersions, selectedInterfaceSections]);

//   // Notify parent of selection changes
//   useEffect(() => {
//     const selection = {
//       domainTypes: selectedDomainTypes,
//       domainInstances: selectedDomainInstances,
//       interfaceVersions: selectedInterfaceVersions,
//       interfaceSections: selectedInterfaceSections,
//       interfaces: selectedInterfaces
//     };
    
//     onSelectionChanged(selection);
//   }, [selectedDomainTypes, selectedDomainInstances, selectedInterfaceVersions, selectedInterfaceSections, selectedInterfaces, onSelectionChanged]);

//   const loadDomainTypes = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await domainService.getAllDomains(true);
//       const domains = response.data || response;
      
//       if (!domains || !Array.isArray(domains)) {
//         throw new Error('Invalid domain data received');
//       }
      
//       // Group domains by type
//       const typeGroups = domains.reduce((acc: Record<string, Domain[]>, domain: Domain) => {
//         const type = domain.domain_type || 'Unknown';
//         if (!acc[type]) acc[type] = [];
//         acc[type].push(domain);
//         return acc;
//       }, {});
      
//       const types: DomainType[] = Object.entries(typeGroups).map(([type, domainList]) => ({
//         domain_type: type,
//         count: domainList.length,
//         domains: domainList
//       }));
      
//       setDomainTypes(types);
//     } catch (error) {
//       console.error('FourTierSelectorEnhanced: Failed to load domain types:', error);
//       setError(`Failed to load domain types: ${error.message || 'Unknown error'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadDomainInstances = () => {
//     // Find all domains of selected types
//     const instances = domainTypes
//       .filter(dt => selectedDomainTypes.includes(dt.domain_type))
//       .flatMap(dt => dt.domains);
    
//     setAvailableDomains(instances);
//   };

//   const loadInterfaces = async () => {
//     // Prevent too many retry attempts
//     if (interfaceLoadAttempts >= 3) {
//       console.error('FourTierSelectorEnhanced: Maximum interface load retry attempts reached');
//       return;
//     }
    
//     // Prevent concurrent loads
//     if (loadingInterfaces) {
//       return;
//     }
    
//     try {
//       setLoadingInterfaces(true);
//       setInterfaceLoadAttempts(prev => prev + 1);
      
//       // Parse instance-specific version selections to get the domain instances and versions
//       const { filteredDomainInstances, allSelectedVersions } = parseInstanceVersionSelections(selectedInterfaceVersions);
      
//       if (filteredDomainInstances.length === 0 || allSelectedVersions.length === 0) {
//         setAvailableInterfaces([]);
//         return;
//       }
      
//       const interfaces = await unifiedInterfaceService.getFilteredInterfaces(
//         filteredDomainInstances,
//         allSelectedVersions,
//         selectedInterfaceSections
//       );
      
//       setAvailableInterfaces(interfaces || []);
      
//       // Reset load attempts on success
//       setInterfaceLoadAttempts(0);
      
//     } catch (error) {
//       console.error('FourTierSelectorEnhanced: Failed to load interfaces:', error);
      
//       // Don't reset lastInterfaceLoadParams on error to prevent immediate retry
      
//     } finally {
//       setLoadingInterfaces(false);
//     }
//   };

//   const toggleDomainType = (domainType: string) => {
//     const newSelection = selectedDomainTypes.includes(domainType)
//       ? selectedDomainTypes.filter(t => t !== domainType)
//       : [...selectedDomainTypes, domainType];
    
//     setSelectedDomainTypes(newSelection);
//   };

//   const toggleDomainInstance = (domainId: string) => {
//     const newSelection = selectedDomainInstances.includes(domainId)
//       ? selectedDomainInstances.filter(id => id !== domainId)
//       : [...selectedDomainInstances, domainId];
    
//     setSelectedDomainInstances(newSelection);
//   };

//   const toggleInterface = (interfaceId: string) => {
//     const newSelection = selectedInterfaces.includes(interfaceId)
//       ? selectedInterfaces.filter(id => id !== interfaceId)
//       : [...selectedInterfaces, interfaceId];
    
//     setSelectedInterfaces(newSelection);
//   };

//   const toggleDomainTypeExpansion = (domainType: string) => {
//     const newExpanded = new Set(expandedDomainTypes);
//     if (newExpanded.has(domainType)) {
//       newExpanded.delete(domainType);
//     } else {
//       newExpanded.add(domainType);
//     }
//     setExpandedDomainTypes(newExpanded);
//   };

//   const selectAllInterfacesInSection = (sectionName: string) => {
//     const sectionInterfaces = availableInterfaces
//       .filter(iface => iface.sectionName === sectionName)
//       .map(iface => iface.id);
    
//     const otherInterfaces = selectedInterfaces.filter(id => {
//       const iface = availableInterfaces.find(i => i.id === id);
//       return iface?.sectionName !== sectionName;
//     });
    
//     setSelectedInterfaces([...otherInterfaces, ...sectionInterfaces]);
//   };

//   const renderFilteredInterfaces = () => {
//     if (availableInterfaces.length === 0) {
//       return (
//         <div className="text-center py-8 text-gray-500">
//           <p>No interfaces found for current selection</p>
//         </div>
//       );
//     }

//     // Group interfaces by section
//     const groupedInterfaces = availableInterfaces.reduce((acc, iface) => {
//       const section = iface.sectionName || 'General Functions';
//       if (!acc[section]) acc[section] = [];
//       acc[section].push(iface);
//       return acc;
//     }, {} as Record<string, GroupedInterface[]>);

//     // If sections are filtered, only show selected sections
//     const sectionsToShow = selectedInterfaceSections.length > 0 
//       ? selectedInterfaceSections.filter(section => groupedInterfaces[section])
//       : Object.keys(groupedInterfaces);

//     return sectionsToShow
//       .sort((a, b) => {
//         // Sort sections: put 'General Functions' last
//         if (a === 'General Functions') return 1;
//         if (b === 'General Functions') return -1;
//         return a.localeCompare(b);
//       })
//       .map(sectionName => (
//         <div key={sectionName} className="space-y-2">
//           {/* Section Header */}
//           <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
//             <div className="flex items-center gap-2">
//               <span className="text-white font-semibold">{sectionName}</span>
//               <Badge className="bg-indigo-400 text-white">
//                 {groupedInterfaces[sectionName]?.length || 0} interfaces
//               </Badge>
//             </div>
//             <button 
//               onClick={() => selectAllInterfacesInSection(sectionName)}
//               className="text-indigo-100 hover:text-white text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-indigo-400 transition-colors"
//             >
//               Select All
//             </button>
//           </div>
          
//           {/* Interfaces in this section */}
//           <div className="space-y-2 ml-4 border-l-2 border-indigo-200 pl-3">
//             {groupedInterfaces[sectionName]?.map(iface => {
//               const isSelected = selectedInterfaces.includes(iface.id);
              
//               return (
//                 <button
//                   key={iface.id}
//                   onClick={() => toggleInterface(iface.id)}
//                   className={cn(
//                     "w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
//                     isSelected 
//                       ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500 shadow-lg" 
//                       : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
//                   )}
//                 >
//                   {isSelected ? (
//                     <Check className="h-4 w-4 mt-1 flex-shrink-0 text-white" />
//                   ) : (
//                     <Circle className="h-4 w-4 mt-1 flex-shrink-0 text-gray-500" />
//                   )}
//                   <div className="flex-1 min-w-0">
//                     <div className={cn("font-medium text-sm truncate", isSelected ? "text-white" : "text-gray-900")}>{iface.interface_name}</div>
//                     <div className={cn(
//                       "text-xs mt-1 line-clamp-2",
//                       isSelected ? "text-white" : "text-gray-600"
//                     )}>{iface.description}</div>
//                     <div className="flex items-center gap-2 mt-2">
//                       <Badge 
//                         className={cn(
//                           "text-xs px-2 py-0.5 border-2",
//                           isSelected 
//                             ? "bg-orange-200 text-orange-900 border-orange-400" 
//                             : "bg-gray-200 text-gray-900 border-gray-400"
//                         )}
//                       >
//                         {iface.interface_type === 'unknown' ? 'Unclassified' :
//                          iface.interface_type === 'API' ? 'API Interface' :
//                          iface.interface_type || 'Interface'}
//                       </Badge>
//                       {iface.interface_version && (
//                         <Badge 
//                           className={cn(
//                             "text-xs px-2 py-0.5 border-2",
//                             isSelected 
//                               ? "bg-orange-200 text-orange-900 border-orange-400" 
//                               : "bg-gray-200 text-gray-900 border-gray-400"
//                           )}
//                         >
//                           {iface.interface_version}
//                         </Badge>
//                       )}
//                       <Badge 
//                         className={cn(
//                           "text-xs px-2 py-0.5 border-2",
//                           isSelected 
//                             ? "bg-orange-200 text-orange-900 border-orange-400" 
//                             : "bg-gray-200 text-gray-900 border-gray-400"
//                         )}
//                       >
//                         {iface.domainInstanceName}
//                       </Badge>
//                     </div>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       ));
//   };

//   return (
//     <div className="space-y-6">
//       {/* Enhanced Progress indicator with 5 tiers */}
//       <div className="bg-gray-50 p-4 rounded-lg">
//         <div className="flex items-center flex-wrap gap-2 lg:gap-4">
//           <div className={cn(
//             "flex items-center gap-2 px-3 py-1 rounded-lg",
//             selectedDomainTypes.length > 0 
//               ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
//               : "text-gray-500"
//           )}>
//             <Layers className="h-4 w-4" />
//             <span className="text-sm font-medium">
//               1. Domain Types ({selectedDomainTypes.length})
//             </span>
//           </div>
//           <ChevronRight className="h-4 w-4 text-gray-400" />
//           <div className={cn(
//             "flex items-center gap-2 px-3 py-1 rounded-lg",
//             selectedDomainInstances.length > 0 
//               ? "bg-blue-100 text-blue-800 border border-blue-300" 
//               : "text-gray-500"
//           )}>
//             <Database className="h-4 w-4" />
//             <span className="text-sm font-medium">
//               2. Domain Instances ({selectedDomainInstances.length})
//             </span>
//           </div>
//           <ChevronRight className="h-4 w-4 text-gray-400" />
//           <div className={cn(
//             "flex items-center gap-2 px-3 py-1 rounded-lg",
//             selectedInterfaceVersions.length > 0 
//               ? "bg-purple-100 text-purple-800 border border-purple-300" 
//               : "text-gray-500"
//           )}>
//             <Code className="h-4 w-4" />
//             <span className="text-sm font-medium">
//               3. Interface Versions ({selectedInterfaceVersions.length})
//             </span>
//           </div>
//           <ChevronRight className="h-4 w-4 text-gray-400" />
//           <div className={cn(
//             "flex items-center gap-2 px-3 py-1 rounded-lg",
//             selectedInterfaceSections.length > 0 
//               ? "bg-indigo-100 text-indigo-800 border border-indigo-300" 
//               : selectedInterfaceSections.length === 0 && selectedInterfaceVersions.length > 0
//               ? "bg-green-100 text-green-800 border border-green-300"  // All sections = green
//               : "text-gray-500"
//           )}>
//             <Filter className="h-4 w-4" />
//             <span className="text-sm font-medium">
//               4. Interface Sections ({selectedInterfaceSections.length === 0 ? 'All' : selectedInterfaceSections.length})
//             </span>
//           </div>
//           <ChevronRight className="h-4 w-4 text-gray-400" />
//           <div className={cn(
//             "flex items-center gap-2 px-3 py-1 rounded-lg",
//             selectedInterfaces.length > 0 
//               ? "bg-orange-100 text-orange-800 border border-orange-300" 
//               : "text-gray-500"
//           )}>
//             <Settings className="h-4 w-4" />
//             <span className="text-sm font-medium">
//               5. Interfaces ({selectedInterfaces.length})
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Row 1: Domain Types and Domain Instances */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
//         {/* Tier 1: Domain Types */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Layers className="h-5 w-5" />
//               1. Domain Types
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {error ? (
//               <div className="flex flex-col items-center justify-center py-8 space-y-3">
//                 <div className="text-red-500 text-center">
//                   <p className="font-medium">Error loading domain types</p>
//                   <p className="text-sm mt-1">{error}</p>
//                 </div>
//                 <button
//                   onClick={loadDomainTypes}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                 >
//                   Retry
//                 </button>
//               </div>
//             ) : loading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
//               </div>
//             ) : domainTypes.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-8 space-y-3">
//                 <p className="text-gray-500 text-center">No domain types found</p>
//                 <button
//                   onClick={loadDomainTypes}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                 >
//                   Reload
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {domainTypes.map(domainType => {
//                   const isSelected = selectedDomainTypes.includes(domainType.domain_type);
//                   const isExpanded = expandedDomainTypes.has(domainType.domain_type);
                  
//                   return (
//                     <div key={domainType.domain_type} className="border rounded-lg">
//                       <div className="flex items-center justify-between p-3">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => toggleDomainTypeExpansion(domainType.domain_type)}
//                             className="p-1 hover:bg-gray-100 rounded"
//                           >
//                             {isExpanded ? (
//                               <ChevronDown className="h-4 w-4" />
//                             ) : (
//                               <ChevronRight className="h-4 w-4" />
//                             )}
//                           </button>
//                           <button
//                             onClick={() => toggleDomainType(domainType.domain_type)}
//                             className={cn(
//                               "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border w-full min-w-[200px]",
//                               isSelected 
//                                 ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-600 shadow-lg" 
//                                 : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
//                             )}
//                           >
//                             {isSelected ? (
//                               <Check className="h-4 w-4 text-white" />
//                             ) : (
//                               <Circle className="h-4 w-4 text-gray-500" />
//                             )}
//                             <span className="font-medium text-sm">{domainType.domain_type}</span>
//                           </button>
//                         </div>
//                       </div>
                      
//                       {isExpanded && (
//                         <div className="border-t px-6 py-2">
//                           {domainType.domains.map(domain => (
//                             <div key={domain.id} className="text-sm text-gray-600 py-1">
//                               • {domain.name}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Tier 2: Domain Instances */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Database className="h-5 w-5" />
//               2. Domain Instances
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {selectedDomainTypes.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 Select domain types first
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {availableDomains.map(domain => {
//                   const isSelected = selectedDomainInstances.includes(domain.id);
                  
//                   return (
//                     <button
//                       key={domain.id}
//                       onClick={() => toggleDomainInstance(domain.id)}
//                       className={cn(
//                         "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
//                         isSelected 
//                           ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg" 
//                           : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
//                       )}
//                     >
//                       {isSelected ? (
//                         <Check className="h-4 w-4 text-white" />
//                       ) : (
//                         <Circle className="h-4 w-4 text-gray-500" />
//                       )}
//                       <div className="text-left flex-1">
//                         <div className="font-medium text-sm">{domain.name}</div>
//                         <div className={cn(
//                           "text-xs",
//                           isSelected ? "text-blue-100" : "text-gray-600"
//                         )}>{domain.domain_type}</div>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Row 2: Interface Versions and Interface Sections */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
//         {/* Tier 3: Interface Versions (Enhanced with Instance Grouping) */}
//         <InstanceGroupedVersionSelector
//           selectedDomainInstances={selectedDomainInstances}
//           selectedVersions={selectedInterfaceVersions}
//           onVersionSelectionChange={setSelectedInterfaceVersions}
//         />

//         {/* Tier 4: Interface Sections (NEW) */}
//         <InterfaceSectionSelector
//           selectedDomainInstances={selectedDomainInstances}
//           selectedVersions={selectedInterfaceVersions}
//           selectedSections={selectedInterfaceSections}
//           onSectionSelectionChange={setSelectedInterfaceSections}
//         />
//       </div>

//       {/* Row 3: Interfaces (Enhanced with Section Filtering) - Full width */}
//       <div className="w-full">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Settings className="h-5 w-5" />
//                 5. Interfaces
//                 {selectedInterfaceSections.length > 0 && (
//                   <Badge variant="secondary">
//                     Filtered by {selectedInterfaceSections.length} section{selectedInterfaceSections.length !== 1 ? 's' : ''}
//                   </Badge>
//                 )}
//                 {availableInterfaces.length > 0 && (
//                   <Badge className="bg-gray-100 text-gray-700">
//                     {availableInterfaces.length} available
//                   </Badge>
//                 )}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {selectedInterfaceVersions.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   Select interface versions first
//                 </div>
//               ) : loadingInterfaces ? (
//                 <div className="flex items-center justify-center py-8">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
//                   <span className="ml-2 text-gray-600">Loading interfaces...</span>
//                 </div>
//               ) : (
//                 <div className="space-y-3 max-h-[600px] overflow-y-auto">
//                   {renderFilteredInterfaces()}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Database, 
  Code, 
  Settings,
  Check,
  Circle,
  Filter,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { domainService, unifiedInterfaceService } from '@/services';
import { parseInstanceVersionSelections, createParameterKey } from '@/components/versionUtils';
import { InterfaceSectionSelector } from '@/components/InterfaceSectionSelector';
import { InstanceGroupedVersionSelector } from '@/components/InstanceGroupedVersionSelector';
import type { Domain } from '@/services';
import type { InterfaceSection, VersionDisplayGroup, GroupedInterface } from '@/services/unifiedInterfaceService';

interface DomainType {
  domain_type: string;
  count: number;
  domains: Domain[];
}

interface FourTierSelectorEnhancedProps {
  sessionId: string;
  onSelectionChanged: (selection: {
    domainTypes: string[];
    domainInstances: string[];
    interfaceVersions: string[];
    interfaceSections: string[];
    interfaces: string[];
  }) => void;
  initialSelection?: {
    domainTypes: string[];
    domainInstances: string[];
    interfaceVersions: string[];
    interfaceSections: string[];
    interfaces: string[];
  };
}

export const FourTierSelectorEnhanced: React.FC<FourTierSelectorEnhancedProps> = ({
  sessionId,
  onSelectionChanged,
  initialSelection
}) => {
  // Tier 1: Domain Types
  const [domainTypes, setDomainTypes] = useState<DomainType[]>([]);
  const [selectedDomainTypes, setSelectedDomainTypes] = useState<string[]>([]);
  const [expandedDomainTypes, setExpandedDomainTypes] = useState<Set<string>>(new Set());
  
  // Tier 2: Domain Instances
  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
  const [selectedDomainInstances, setSelectedDomainInstances] = useState<string[]>([]);
  
  // Tier 3: Interface Versions (grouped by instance)
  const [selectedInterfaceVersions, setSelectedInterfaceVersions] = useState<string[]>([]);
  
  // Tier 4: Interface Sections (NEW)
  const [selectedInterfaceSections, setSelectedInterfaceSections] = useState<string[]>([]);
  
  // Tier 5: Interfaces (enhanced with section filtering)
  const [availableInterfaces, setAvailableInterfaces] = useState<GroupedInterface[]>([]);
  const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>([]);
  
  // State management optimizations
  const [loading, setLoading] = useState(false);
  const [loadingInterfaces, setLoadingInterfaces] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memory optimization: Prevent unnecessary re-renders and API calls
  const [lastInterfaceLoadParams, setLastInterfaceLoadParams] = useState<string>('');
  const [interfaceLoadAttempts, setInterfaceLoadAttempts] = useState(0);
  const [expandedInstanceDomainTypes, setExpandedInstanceDomainTypes] = useState<Set<string>>(new Set());
  // Memoized derived states to prevent flickering
  const filteredInterfacesForDisplay = useMemo(() => {
    if (availableInterfaces.length === 0) return [];

    // Group interfaces by section
    const groupedInterfaces = availableInterfaces.reduce((acc, iface) => {
      const section = iface.sectionName || 'General Functions';
      if (!acc[section]) acc[section] = [];
      acc[section].push(iface);
      return acc;
    }, {} as Record<string, GroupedInterface[]>);

    // If sections are filtered, only show selected sections
    const sectionsToShow = selectedInterfaceSections.length > 0 
      ? selectedInterfaceSections.filter(section => groupedInterfaces[section])
      : Object.keys(groupedInterfaces);

    return sectionsToShow
      .sort((a, b) => {
        // Sort sections: put 'General Functions' last
        if (a === 'General Functions') return 1;
        if (b === 'General Functions') return -1;
        return a.localeCompare(b);
      })
      .map(sectionName => ({
        sectionName,
        interfaces: groupedInterfaces[sectionName] || []
      }));
  }, [availableInterfaces, selectedInterfaceSections]);

  // Load domain types on mount
  useEffect(() => {
    loadDomainTypes();
  }, []);

  // Restore initial selections when provided - only once
  // useEffect(() => {
  //   if (initialSelection && selectedDomainTypes.length === 0 && selectedDomainInstances.length === 0) {
  //     setSelectedDomainTypes(initialSelection.domainTypes || []);
  //     setSelectedDomainInstances(initialSelection.domainInstances || []);
  //     setSelectedInterfaceVersions(initialSelection.interfaceVersions || []);
  //     setSelectedInterfaceSections(initialSelection.interfaceSections || []);
  //     setSelectedInterfaces(initialSelection.interfaces || []);
  //   }
  // }, [initialSelection, selectedDomainTypes.length, selectedDomainInstances.length]);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current && initialSelection) {
      setSelectedDomainTypes(initialSelection.domainTypes || []);
      setSelectedDomainInstances(initialSelection.domainInstances || []);
      setSelectedInterfaceVersions(initialSelection.interfaceVersions || []);
      setSelectedInterfaceSections(initialSelection.interfaceSections || []);
      setSelectedInterfaces(initialSelection.interfaces || []);
      didInitRef.current = true;
    }
  }, [initialSelection]);

  // Load domain instances when domain types are selected
  // useEffect(() => {
  //   if (selectedDomainTypes.length > 0) {
  //     loadDomainInstances();
  //   } else {
  //     setAvailableDomains([]);
  //     setSelectedDomainInstances([]);
  //   }
  // }, [selectedDomainTypes]);

  // Load interfaces when all selections are made (with duplicate prevention)
  useEffect(() => {
    if (selectedDomainInstances.length > 0 && selectedInterfaceVersions.length > 0) {
      // Create a unique key for these parameters to prevent duplicate loads
      const paramKey = createParameterKey(
        [...selectedDomainInstances, ...selectedInterfaceVersions], 
        selectedInterfaceSections
      );
      
      if (paramKey !== lastInterfaceLoadParams && interfaceLoadAttempts < 3) {
        setLastInterfaceLoadParams(paramKey);
        setInterfaceLoadAttempts(0);
        loadInterfaces();
      }
    } else {
      // Clear interfaces when prerequisites are not met
      setAvailableInterfaces([]);
      setSelectedInterfaces([]);
      setLastInterfaceLoadParams('');
      setInterfaceLoadAttempts(0);
    }
  }, [selectedDomainInstances, selectedInterfaceVersions, selectedInterfaceSections, lastInterfaceLoadParams, interfaceLoadAttempts]);
  const lastNotifiedRef = useRef<string>("");
useEffect(() => {
  const t = setTimeout(() => {
    const payload = {
      domainTypes: selectedDomainTypes,
      domainInstances: selectedDomainInstances,
      interfaceVersions: selectedInterfaceVersions,
      interfaceSections: selectedInterfaceSections,
      interfaces: selectedInterfaces,
    };
    const serialized = JSON.stringify(payload);
    if (serialized !== lastNotifiedRef.current) {
      onSelectionChanged?.(payload);
      lastNotifiedRef.current = serialized;
    }
  }, 120);
  return () => clearTimeout(t);
}, [
  selectedDomainTypes,
  selectedDomainInstances,
  selectedInterfaceVersions,
  selectedInterfaceSections,
  selectedInterfaces,
  onSelectionChanged,
]);
  // // Optimized selection change notification with debouncing
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     const selection = {
  //       domainTypes: selectedDomainTypes,
  //       domainInstances: selectedDomainInstances,
  //       interfaceVersions: selectedInterfaceVersions,
  //       interfaceSections: selectedInterfaceSections,
  //       interfaces: selectedInterfaces
  //     };
      
  //     onSelectionChanged(selection);
  //   }, 100); // Small debounce to prevent excessive calls

  //   return () => clearTimeout(timeoutId);
  // }, [selectedDomainTypes, selectedDomainInstances, selectedInterfaceVersions, selectedInterfaceSections, selectedInterfaces, onSelectionChanged]);

  // const loadDomainTypes = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
      
  //     const response = await domainService.getAllDomains(true);
  //     const domains = response.data || response;
      
  //     if (!domains || !Array.isArray(domains)) {
  //       throw new Error('Invalid domain data received');
  //     }
      
  //     // Group domains by type
  //     const typeGroups = domains.reduce((acc: Record<string, Domain[]>, domain: Domain) => {
  //       const type = domain.domain_type || 'Unknown';
  //       if (!acc[type]) acc[type] = [];
  //       acc[type].push(domain);
  //       return acc;
  //     }, {});
      
  //     const types: DomainType[] = Object.entries(typeGroups).map(([type, domainList]) => ({
  //       domain_type: type,
  //       count: domainList.length,
  //       domains: domainList
  //     }));
      
  //     setDomainTypes(types);
  //   } catch (error) {
  //     console.error('FourTierSelectorEnhanced: Failed to load domain types:', error);
  //     setError(`Failed to load domain types: ${error.message || 'Unknown error'}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const loadDomainTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await domainService.getAllDomains(true);
      const domains = response.data || response;
      if (!domains || !Array.isArray(domains)) {
        throw new Error('Invalid domain data received');
      }
      const typeGroups = domains.reduce((acc: Record<string, Domain[]>, domain: Domain) => {
        const type = domain.domain_type || 'Unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(domain);
        return acc;
      }, {});
      const types: DomainType[] = Object.entries(typeGroups).map(([type, domainList]) => ({
        domain_type: type,
        count: domainList.length,
        domains: domainList
      }));
      setDomainTypes(types);
    } catch (error) {
      console.error('FourTierSelectorEnhanced: Failed to load domain types:', error);
      setError(`Failed to load domain types: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  // const loadDomainInstances = useCallback(() => {
  //   // Find all domains of selected types
  //   const instances = domainTypes
  //     .filter(dt => selectedDomainTypes.includes(dt.domain_type))
  //     .flatMap(dt => dt.domains);
    
  //   setAvailableDomains(instances);
  // }, [domainTypes, selectedDomainTypes]);
  const toggleInstanceDomainTypeExpansion = useCallback((domainType: string) => {
    setExpandedInstanceDomainTypes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(domainType)) {
        newExpanded.delete(domainType);
      } else {
        newExpanded.add(domainType);
      }
      return newExpanded;
    });
  }, []);
  const loadInterfaces = async () => {
    // Prevent too many retry attempts
    if (interfaceLoadAttempts >= 3) {
      console.error('FourTierSelectorEnhanced: Maximum interface load retry attempts reached');
      return;
    }
    
    // Prevent concurrent loads
    if (loadingInterfaces) {
      return;
    }
    
    try {
      setLoadingInterfaces(true);
      setInterfaceLoadAttempts(prev => prev + 1);
      
      // Parse instance-specific version selections to get the domain instances and versions
      const { filteredDomainInstances, allSelectedVersions } = parseInstanceVersionSelections(selectedInterfaceVersions);
      
      if (filteredDomainInstances.length === 0 || allSelectedVersions.length === 0) {
        setAvailableInterfaces([]);
        return;
      }
      
      const interfaces = await unifiedInterfaceService.getFilteredInterfaces(
        filteredDomainInstances,
        allSelectedVersions,
        selectedInterfaceSections
      );
      
      setAvailableInterfaces(interfaces || []);
      
      // Reset load attempts on success
      setInterfaceLoadAttempts(0);
      
    } catch (error) {
      console.error('FourTierSelectorEnhanced: Failed to load interfaces:', error);
      // Don't reset lastInterfaceLoadParams on error to prevent immediate retry
    } finally {
      setLoadingInterfaces(false);
    }
  };

  // Optimized toggle functions with state batching
  const toggleDomainType = useCallback((domainType: string) => {
    setSelectedDomainTypes(prev => 
      prev.includes(domainType)
        ? prev.filter(t => t !== domainType)
        : [...prev, domainType]
    );
  }, []);

  const toggleDomainInstance = useCallback((domainId: string) => {
    setSelectedDomainInstances(prev => 
      prev.includes(domainId)
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  }, []);

  const toggleInterface = useCallback((interfaceId: string) => {
    setSelectedInterfaces(prev => 
      prev.includes(interfaceId)
        ? prev.filter(id => id !== interfaceId)
        : [...prev, interfaceId]
    );
  }, []);

  const toggleDomainTypeExpansion = useCallback((domainType: string) => {
    setExpandedDomainTypes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(domainType)) {
        newExpanded.delete(domainType);
      } else {
        newExpanded.add(domainType);
      }
      return newExpanded;
    });
  }, []);

  const selectAllInterfacesInSection = useCallback((sectionName: string) => {
    const sectionInterfaces = availableInterfaces
      .filter(iface => iface.sectionName === sectionName)
      .map(iface => iface.interface_id || iface.id);
    
    setSelectedInterfaces(prev => {
      const otherInterfaces = prev.filter(id => {
        const iface = availableInterfaces.find(i => (i.interface_id || i.id) === id);
        return iface?.sectionName !== sectionName;
      });
      return [...otherInterfaces, ...sectionInterfaces];
    });
  }, [availableInterfaces]);

  const renderFilteredInterfaces = () => {
    if (filteredInterfacesForDisplay.length === 0 && availableInterfaces.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No interfaces found for current selection</p>
        </div>
      );
    }

    return filteredInterfacesForDisplay.map(({ sectionName, interfaces }) => (
      <div key={sectionName} className="space-y-2">
        {/* Section Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{sectionName}</span>
            <Badge className="bg-indigo-400 text-white">
              {interfaces.length} interfaces
            </Badge>
          </div>
          <button 
            onClick={() => selectAllInterfacesInSection(sectionName)}
            className="text-indigo-100 hover:text-white text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-indigo-400 transition-colors"
          >
            Select All
          </button>
        </div>
        
        {/* Interfaces in this section */}
        <div className="space-y-2 ml-4 border-l-2 border-indigo-200 pl-3">
          {interfaces.map(iface => {
            const interfaceId = iface.interface_id || iface.id;
            const isSelected = selectedInterfaces.includes(interfaceId);
            
            return (
              <button
                key={interfaceId}
                onClick={() => toggleInterface(interfaceId)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                  isSelected 
                    ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500 shadow-lg" 
                    : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
                )}
              >
                {isSelected ? (
                  <Check className="h-4 w-4 mt-1 flex-shrink-0 text-white" />
                ) : (
                  <Circle className="h-4 w-4 mt-1 flex-shrink-0 text-gray-500" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={cn("font-medium text-sm truncate", isSelected ? "text-white" : "text-gray-900")}>
                    {iface.interface_name}
                  </div>
                  <div className={cn(
                    "text-xs mt-1 line-clamp-2",
                    isSelected ? "text-white" : "text-gray-600"
                  )}>
                    {iface.interface_description || iface.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      className={cn(
                        "text-xs px-2 py-0.5 border-2",
                        isSelected 
                          ? "bg-orange-200 text-orange-900 border-orange-400" 
                          : "bg-gray-200 text-gray-900 border-gray-400"
                      )}
                    >
                      {iface.interface_category || iface.interface_type || 'Interface'}
                    </Badge>
                    {iface.interface_version && (
                      <Badge 
                        className={cn(
                          "text-xs px-2 py-0.5 border-2",
                          isSelected 
                            ? "bg-orange-200 text-orange-900 border-orange-400" 
                            : "bg-gray-200 text-gray-900 border-gray-400"
                        )}
                      >
                        {iface.interface_version}
                      </Badge>
                    )}
                    <Badge 
                      className={cn(
                        "text-xs px-2 py-0.5 border-2",
                        isSelected 
                          ? "bg-orange-200 text-orange-900 border-orange-400" 
                          : "bg-gray-200 text-gray-900 border-gray-400"
                      )}
                    >
                      {iface.domainInstanceName}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Progress indicator with 5 tiers */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center flex-wrap gap-2 lg:gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            selectedDomainTypes.length > 0 
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
              : "text-gray-500"
          )}>
            <Layers className="h-4 w-4" />
            <span className="text-sm font-medium">
              1. Domain Types ({selectedDomainTypes.length})
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            selectedDomainInstances.length > 0 
              ? "bg-blue-100 text-blue-800 border border-blue-300" 
              : "text-gray-500"
          )}>
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">
              2. Domain Instances ({selectedDomainInstances.length})
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            selectedInterfaceVersions.length > 0 
              ? "bg-purple-100 text-purple-800 border border-purple-300" 
              : "text-gray-500"
          )}>
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">
              3. Interface Versions ({selectedInterfaceVersions.length})
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            selectedInterfaceSections.length > 0 
              ? "bg-indigo-100 text-indigo-800 border border-indigo-300" 
              : selectedInterfaceSections.length === 0 && selectedInterfaceVersions.length > 0
              ? "bg-green-100 text-green-800 border border-green-300"
              : "text-gray-500"
          )}>
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">
              4. Interface Sections ({selectedInterfaceSections.length === 0 ? 'All' : selectedInterfaceSections.length})
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            selectedInterfaces.length > 0 
              ? "bg-orange-100 text-orange-800 border border-orange-300" 
              : "text-gray-500"
          )}>
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">
              5. Interfaces ({selectedInterfaces.length})
            </span>
          </div>
        </div>
      </div>

    

<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Tier 1: Domain Types (Modified for scrolling) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              1. Domain Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="text-red-500 text-center">
                  <p className="font-medium">Error loading domain types</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={loadDomainTypes}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : domainTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <p className="text-gray-500 text-center">No domain types found</p>
                <button
                  onClick={loadDomainTypes}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Reload
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {domainTypes.map(domainType => {
                  const isSelected = selectedDomainTypes.includes(domainType.domain_type);
                  const isExpanded = expandedDomainTypes.has(domainType.domain_type);
                  return (
                    <div key={domainType.domain_type} className="border rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            onClick={() => toggleDomainTypeExpansion(domainType.domain_type)}
                            className={cn(
                              "p-1 rounded",
                              isSelected ? "hover:bg-emerald-600" : "hover:bg-gray-100"
                            )}
                          >
                            {isExpanded ? (
                              <ChevronDown className={cn("h-4 w-4", isSelected ? "text-white" : "text-gray-500")} />
                            ) : (
                              <ChevronRight className={cn("h-4 w-4", isSelected ? "text-white" : "text-gray-500")} />
                            )}
                          </button>
                          <button
                            onClick={() => toggleDomainType(domainType.domain_type)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border flex-1 text-left",
                              isSelected 
                                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-600 shadow-lg" 
                                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                            )}
                          >
                            {isSelected ? (
                              <Check className="h-4 w-4 text-white" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="font-medium text-sm">{domainType.domain_type}</span>
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t px-6 py-2">
                          {domainType.domains.map(domain => (
                            <div key={domain.id} className="text-sm text-gray-600 py-1">
                              • {domain.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Tier 2: Domain Instances (Unchanged from previous styling fix) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              2. Domain Instances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDomainTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Select domain types first
              </div>
            ) : (
              <div className="space-y-2">
                {domainTypes
                  .filter(dt => selectedDomainTypes.includes(dt.domain_type))
                  .map(domainType => {
                    const isExpanded = expandedInstanceDomainTypes.has(domainType.domain_type);
                    const isSelected = selectedDomainTypes.includes(domainType.domain_type);
                    return (
                      <div key={domainType.domain_type} className="border rounded-lg">
                        <div
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg transition-all duration-200 border",
                            isSelected
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-600 shadow-lg"
                              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => toggleInstanceDomainTypeExpansion(domainType.domain_type)}
                              className={cn(
                                "p-1 rounded",
                                isSelected ? "hover:bg-emerald-600" : "hover:bg-gray-100"
                              )}
                            >
                              {isExpanded ? (
                                <ChevronDown className={cn("h-4 w-4", isSelected ? "text-white" : "text-gray-500")} />
                              ) : (
                                <ChevronRight className={cn("h-4 w-4", isSelected ? "text-white" : "text-gray-500")} />
                              )}
                            </button>
                            <div className="flex items-center gap-2">
                              <span className={cn("font-medium text-sm", isSelected ? "text-white" : "text-gray-800")}>
                                {domainType.domain_type}
                              </span>
                              <Badge
                                className={cn(
                                  isSelected
                                    ? "bg-emerald-300 text-emerald-900 border-emerald-400"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                )}
                              >
                                {domainType.count} instance{domainType.count !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t px-6 py-2 space-y-2">
                            {domainType.domains.map(domain => {
                              const isSelectedInstance = selectedDomainInstances.includes(domain.id);
                              return (
                                <button
                                  key={domain.id}
                                  onClick={() => toggleDomainInstance(domain.id)}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                                    isSelectedInstance
                                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg"
                                      : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
                                  )}
                                >
                                  {isSelectedInstance ? (
                                    <Check className="h-4 w-4 text-white" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-500" />
                                  )}
                                  <div className="text-left flex-1">
                                    <div className="font-medium text-sm">{domain.name}</div>
                                    <div className={cn(
                                      "text-xs",
                                      isSelectedInstance ? "text-blue-100" : "text-gray-600"
                                    )}>
                                      ID: {domain.id}
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
            )}
          </CardContent>
        </Card>
      </div>


      {/* Row 2: Interface Versions and Interface Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Tier 3: Interface Versions (Enhanced with Instance Grouping) */}
        <InstanceGroupedVersionSelector
          selectedDomainInstances={selectedDomainInstances}
          selectedVersions={selectedInterfaceVersions}
          onVersionSelectionChange={setSelectedInterfaceVersions}
        />

        {/* Tier 4: Interface Sections (NEW) - Now with Scroll */}
        <InterfaceSectionSelector
          selectedDomainInstances={selectedDomainInstances}
          selectedVersions={selectedInterfaceVersions}
          selectedSections={selectedInterfaceSections}
          onSectionSelectionChange={setSelectedInterfaceSections}
        />
      </div>

      {/* Row 3: Interfaces (Enhanced with Section Filtering) - Full width with SCROLL */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              5. Interfaces
              {selectedInterfaceSections.length > 0 && (
                <Badge variant="secondary">
                  Filtered by {selectedInterfaceSections.length} section{selectedInterfaceSections.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {availableInterfaces.length > 0 && (
                <Badge className="bg-gray-100 text-gray-700">
                  {availableInterfaces.length} available
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInterfaceVersions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Select interface versions first
              </div>
            ) : loadingInterfaces ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading interfaces...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {renderFilteredInterfaces()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};