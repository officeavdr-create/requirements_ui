// // import React, { useState } from 'react';
// // import { ChevronDown, ChevronRight, Check, Search } from 'lucide-react';
// // import { Interface } from '../types/interface';

// // interface InterfaceSelectorProps {
// //   interfaces: Interface[];
// //   selectedInterfaces: Interface[];
// //   onInterfaceToggle: (interfaceName: Interface) => void;
// //   loading?: boolean;

// //   restrictSelectionTo?: Set<number>; 
// // }

// // const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({
// //   interfaces,
// //   selectedInterfaces,
// //   onInterfaceToggle,
// //   loading,
// //   restrictSelectionTo // newly added prop
// // }) => {
// //   const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
// //   const [searchTerm, setSearchTerm] = useState('');

// //   const isSelectionRestricted = restrictSelectionTo && restrictSelectionTo.size > 0;
// //   const isInterfaceSelectable = (interface_: Interface) =>
// //     !isSelectionRestricted || restrictSelectionTo!.has(interface_.id);

// //   const handleToggle = (interface_: Interface) => {
// //     if (isInterfaceSelectable(interface_)) {
// //       onInterfaceToggle(interface_);
// //     }
// //   };
// //   // Group interfaces by type
// //   const groupedInterfaces = interfaces.reduce((acc, interface_) => {
// //     const type = interface_.interface_type || 'Uncategorised';
// //     if (!acc[type]) acc[type] = [];
// //     acc[type].push(interface_);
// //     return acc;
// //   }, {} as Record<string, Interface[]>);

// //   // Filter interfaces based on search term
// //   const filteredGroupedInterfaces = Object.entries(groupedInterfaces).reduce((acc, [type, typeInterfaces]) => {
// //     if (searchTerm) {
// //       const filtered = typeInterfaces.filter(interface_ => 
// //         interface_.interface_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         interface_.interface_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         type.toLowerCase().includes(searchTerm.toLowerCase())
// //       );
// //       if (filtered.length > 0) {
// //         acc[type] = filtered;
// //       }
// //     } else {
// //       acc[type] = typeInterfaces;
// //     }
// //     return acc;
// //   }, {} as Record<string, Interface[]>);

// //   const toggleType = (type: string) => {
// //     const newExpanded = new Set(expandedTypes);
// //     if (newExpanded.has(type)) {
// //       newExpanded.delete(type);
// //     } else {
// //       newExpanded.add(type);
// //     }
// //     setExpandedTypes(newExpanded);
// //   };

// //   // const selectAllTypeInterfaces = (typeInterfaces: Interface[]) => {
// //   //   const allSelected = typeInterfaces.every(interface_ => 
// //   //     selectedInterfaces.some(selected => selected.id === interface_.id)
// //   //   );

// //   //   typeInterfaces.forEach(interface_ => {
// //   //     const isSelected = selectedInterfaces.some(selected => selected.id === interface_.id);
// //   //     if (allSelected && isSelected) {
// //   //       onInterfaceToggle(interface_); // Deselect
// //   //     } else if (!allSelected && !isSelected) {
// //   //       onInterfaceToggle(interface_); // Select
// //   //     }
// //   //   });
// //   // };
// //   const selectAllTypeInterfaces = (typeInterfaces: Interface[]) => {
// //     // Filter interfaces by selectable ones only
// //     const selectableInterfaces = typeInterfaces.filter(iface => isInterfaceSelectable(iface));

// //     const allSelected = selectableInterfaces.every(interface_ =>
// //       selectedInterfaces.some(selected => selected.id === interface_.id)
// //     );
// //       selectableInterfaces.forEach(interface_ => {
// //       const isSelected = selectedInterfaces.some(selected => selected.id === interface_.id);
// //       if (allSelected && isSelected) {
// //         onInterfaceToggle(interface_); // Deselect
// //       } else if (!allSelected && !isSelected) {
// //         onInterfaceToggle(interface_); // Select
// //       }
// //     });
// //   };


// //   const isInterfaceSelected = (interface_: Interface) => 
// //     selectedInterfaces.some(selected => selected.id === interface_.id);

// //   if (loading) {
// //     return (
// //       <div className="space-y-4">
// //         {[1, 2, 3].map(i => (
// //           <div key={i} className="animate-pulse">
// //             <div className="h-6 bg-gray-200 rounded mb-2"></div>
// //             <div className="ml-4 space-y-2">
// //               <div className="h-4 bg-gray-100 rounded w-3/4"></div>
// //               <div className="h-4 bg-gray-100 rounded w-1/2"></div>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     );
// //   }

// // //   return (
// // //     <div className="space-y-4">
// // //       {/* Search */}
// // //       <div className="relative">
// // //         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
// // //         <input
// // //           type="text"
// // //           placeholder="Search interfaces..."
// // //           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
// // //           value={searchTerm}
// // //           onChange={(e) => setSearchTerm(e.target.value)}
// // //         />
// // //       </div>

// // //       {/* Interface Groups */}
// // //       <div className="space-y-2 max-h-96 overflow-y-auto">
// // //         {Object.entries(filteredGroupedInterfaces).map(([type, typeInterfaces]) => {
// // //           const isExpanded = expandedTypes.has(type);
// // //           const allSelected = typeInterfaces.every(interface_ => isInterfaceSelected(interface_));
// // //           const someSelected = typeInterfaces.some(interface_ => isInterfaceSelected(interface_));

// // //           return (
// // //             <div key={type} className="border border-gray-200 rounded-lg">
// // //               {/* Type Header */}
// // //               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
// // //                 <button
// // //                   onClick={() => toggleType(type)}
// // //                   className="flex items-center space-x-2 flex-1 text-left hover:text-primary-600"
// // //                 >
// // //                   {isExpanded ? (
// // //                     <ChevronDown className="h-4 w-4" />
// // //                   ) : (
// // //                     <ChevronRight className="h-4 w-4" />
// // //                   )}
// // //                   <span className="font-medium text-gray-900">{type}</span>
// // //                   <span className="text-sm text-gray-500">({typeInterfaces.length})</span>
// // //                 </button>

// // //                 <button
// // //                   onClick={() => selectAllTypeInterfaces(typeInterfaces)}
// // //                   className={`
// // //                     px-3 py-1 text-sm rounded border transition-colors
// // //                     ${allSelected 
// // //                       ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
// // //                       : someSelected
// // //                       ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
// // //                       : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
// // //                     }
// // //                   `}
// // //                 >
// // //                   {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
// // //                 </button>
// // //               </div>

// // //               {/* Interface List */}
// // //               {isExpanded && (
// // //                 <div className="p-3 space-y-2">
// // //                   {typeInterfaces.map(interface_ => {
// // //                     const selected = isInterfaceSelected(interface_);

// // //                     return (
// // //                       <div
// // //                         key={interface_.id}
// // //                         className={`
// // //                           p-3 border rounded cursor-pointer transition-all hover:shadow-sm
// // //                           ${selected 
// // //                             ? 'border-primary-200 bg-primary-50' 
// // //                             : 'border-gray-200 hover:border-gray-300'
// // //                           }
// // //                         `}
// // //                         onClick={() => onInterfaceToggle(interface_)}
// // //                       >
// // //                         <div className="flex items-start justify-between">
// // //                           <div className="flex-1">
// // //                             <div className="flex items-center space-x-2">
// // //                               <h4 className="font-medium text-gray-900">
// // //                                 {interface_.interface_name}
// // //                               </h4>
// // //                               {selected && (
// // //                                 <Check className="h-4 w-4 text-primary-600" />
// // //                               )}
// // //                               {interface_.similarity_score && (
// // //                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
// // //                                   {(interface_.similarity_score * 100).toFixed(1)}% match
// // //                                 </span>
// // //                               )}
// // //                             </div>

// // //                             {interface_.interface_description && (
// // //                               <p className="text-sm text-gray-600 mt-1">
// // //                                 {interface_.interface_description}
// // //                               </p>
// // //                             )}

// // //                             <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
// // //                               {interface_.parameter_name && (
// // //                                 <div>
// // //                                   <span className="font-medium">Param:</span> {interface_.parameter_name} ({interface_.parameter_type})
// // //                                 </div>
// // //                               )}
// // //                               {interface_.return_type && (
// // //                                 <div>
// // //                                   <span className="font-medium">Returns:</span> {interface_.return_type}
// // //                                 </div>
// // //                               )}
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                       </div>
// // //                     );
// // //                   })}
// // //                 </div>
// // //               )}
// // //             </div>
// // //           );
// // //         })}
// // //       </div>

// // //       {Object.keys(filteredGroupedInterfaces).length === 0 && (
// // //         <div className="text-center py-8 text-gray-500">
// // //           <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
// // //           <p>No interfaces found matching your search.</p>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };
// // return (
// //     <div className="space-y-4">
// //       {/* ... search input and other code ... */}
// //       <div className="space-y-2 max-h-96 overflow-y-auto">
// //         {Object.entries(filteredGroupedInterfaces).map(([type, typeInterfaces]) => {
// //           const isExpanded = expandedTypes.has(type);
// //           // Only count selectable interfaces for allSelected check
// //           const selectableInterfacesInType = typeInterfaces.filter(iface => isInterfaceSelectable(iface));
// //           const allSelected = selectableInterfacesInType.length > 0 && selectableInterfacesInType.every(isInterfaceSelected);
// //           const someSelected = selectableInterfacesInType.some(isInterfaceSelected);

// //           return (
// //             <div key={type} className="border border-gray-200 rounded-lg">
// //               {/* Type Header */}
// //               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
// //                 <button
// //                   onClick={() => toggleType(type)}
// //                   className="flex items-center space-x-2 flex-1 text-left hover:text-primary-600"
// //                 >
// //                   {isExpanded ? (
// //                     <ChevronDown className="h-4 w-4" />
// //                   ) : (
// //                     <ChevronRight className="h-4 w-4" />
// //                   )}
// //                   <span className="font-medium text-gray-900">{type}</span>
// //                   <span className="text-sm text-gray-500">({typeInterfaces.length})</span>
// //                 </button>

// //                 {/* Disable select all button if none selectable */}
// //                 <button
// //                   onClick={() => selectAllTypeInterfaces(typeInterfaces)}
// //                   disabled={selectableInterfacesInType.length === 0}
// //                   className={`
// //                     px-3 py-1 text-sm rounded border transition-colors
// //                     ${allSelected 
// //                       ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
// //                       : someSelected
// //                       ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
// //                       : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
// //                     }
// //                     ${selectableInterfacesInType.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
// //                   `}
// //                 >
// //                   {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
// //                 </button>
// //               </div>

// //               {/* Interface List */}
// //               {isExpanded && (
// //                 <div className="p-3 space-y-2">
// //                   {typeInterfaces.map(interface_ => {
// //                     const selected = isInterfaceSelected(interface_);
// //                     const selectable = isInterfaceSelectable(interface_);

// //                     return (
// //                       <div
// //                         key={interface_.id}
// //                         className={`
// //                           p-3 border rounded cursor-pointer transition-all hover:shadow-sm
// //                           ${selected 
// //                             ? 'border-primary-200 bg-primary-50' 
// //                             : 'border-gray-200 hover:border-gray-300'
// //                           }
// //                           ${!selectable ? 'opacity-50 cursor-not-allowed' : ''}
// //                         `}
// //                         onClick={() => handleToggle(interface_)}
// //                         title={!selectable ? 'Selection restricted: not allowed' : undefined}
// //                       >
// //                         <div className="flex items-start justify-between">
// //                           <div className="flex-1">
// //                             <div className="flex items-center space-x-2">
// //                               <h4 className="font-medium text-gray-900">
// //                                 {interface_.interface_name}
// //                               </h4>
// //                               {selected && (
// //                                 <Check className="h-4 w-4 text-primary-600" />
// //                               )}
// //                               {interface_.similarity_score && (
// //                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
// //                                   {(interface_.similarity_score * 100).toFixed(1)}% match
// //                                 </span>
// //                               )}
// //                             </div>

// //                             {interface_.interface_description && (
// //                               <p className="text-sm text-gray-600 mt-1">
// //                                 {interface_.interface_description}
// //                               </p>
// //                             )}

// //                             <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
// //                               {interface_.parameter_name && (
// //                                 <div>
// //                                   <span className="font-medium">Param:</span> {interface_.parameter_name} ({interface_.parameter_type})
// //                                 </div>
// //                               )}
// //                               {interface_.return_type && (
// //                                 <div>
// //                                   <span className="font-medium">Returns:</span> {interface_.return_type}
// //                                 </div>
// //                               )}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>

// //       {/* No interfaces found message */}
// //       {Object.keys(filteredGroupedInterfaces).length === 0 && (
// //         <div className="text-center py-8 text-gray-500">
// //           <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
// //           <p>No interfaces found matching your search.</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };


// // export default InterfaceSelector;

// import React, { useState } from 'react';
// import { ChevronDown, ChevronRight, Check, Search } from 'lucide-react';
// import { Domain, Interface } from '../types/interface';

// interface InterfaceSelectorProps {
//   interfaces: Interface[];
//   selectedInterfaces: Interface[];
//   onInterfaceToggle: (interfaceName: Interface) => void;
//   loading?: boolean;

//   restrictSelectionTo?: Set<number>; 
//   domains?: Domain[]; // Add domains prop
// }

// const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({
//   interfaces,
//   selectedInterfaces,
//   onInterfaceToggle,
//   loading,
//   restrictSelectionTo, // newly added prop
//   domains = [] // Add domains prop
// }) => {
//   const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
//   const [searchTerm, setSearchTerm] = useState('');

//   const isSelectionRestricted = restrictSelectionTo && restrictSelectionTo.size > 0;
//   const isInterfaceSelectable = (interface_: Interface) =>
//     !isSelectionRestricted || restrictSelectionTo!.has(interface_.id);

//   const handleToggle = (interface_: Interface) => {
//     if (isInterfaceSelectable(interface_)) {
//       onInterfaceToggle(interface_);
//     }
//   };
//   // Group interfaces by type
//   const groupedInterfaces = interfaces.reduce((acc, interface_) => {
//     const type = interface_.interface_type || 'Uncategorised';
//     if (!acc[type]) acc[type] = [];
//     acc[type].push(interface_);
//     return acc;
//   }, {} as Record<string, Interface[]>);
//   const getDomainName = (domainId: string | undefined): string => {
//     if (!domainId) return 'Unknown Domain';
//     const domain = domains.find(d => d.id === domainId);
//     return domain?.name || 'Unknown Domain';
//   };
//   // Filter interfaces based on search term
//   const filteredGroupedInterfaces = Object.entries(groupedInterfaces).reduce((acc, [type, typeInterfaces]) => {
//     if (searchTerm) {
//       const filtered = typeInterfaces.filter(interface_ => 
//         interface_.interface_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         interface_.interface_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         type.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       if (filtered.length > 0) {
//         acc[type] = filtered;
//       }
//     } else {
//       acc[type] = typeInterfaces;
//     }
//     return acc;
//   }, {} as Record<string, Interface[]>);

//   const toggleType = (type: string) => {
//     const newExpanded = new Set(expandedTypes);
//     if (newExpanded.has(type)) {
//       newExpanded.delete(type);
//     } else {
//       newExpanded.add(type);
//     }
//     setExpandedTypes(newExpanded);
//   };

//   const selectAllTypeInterfaces = (typeInterfaces: Interface[]) => {
//     // Filter interfaces by selectable ones only
//     const selectableInterfaces = typeInterfaces.filter(iface => isInterfaceSelectable(iface));

//     const allSelected = selectableInterfaces.every(interface_ =>
//       selectedInterfaces.some(selected => selected.id === interface_.id)
//     );
//       selectableInterfaces.forEach(interface_ => {
//       const isSelected = selectedInterfaces.some(selected => selected.id === interface_.id);
//       if (allSelected && isSelected) {
//         onInterfaceToggle(interface_); // Deselect
//       } else if (!allSelected && !isSelected) {
//         onInterfaceToggle(interface_); // Select
//       }
//     });
//   };


//   const isInterfaceSelected = (interface_: Interface) => 
//     selectedInterfaces.some(selected => selected.id === interface_.id);

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3].map(i => (
//           <div key={i} className="animate-pulse">
//             <div className="h-6 bg-gray-200 rounded mb-2"></div>
//             <div className="ml-4 space-y-2">
//               <div className="h-4 bg-gray-100 rounded w-3/4"></div>
//               <div className="h-4 bg-gray-100 rounded w-1/2"></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//  return (
//     <div className="space-y-4">
//       {/* Search */}
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
//         <input
//           type="text"
//           placeholder="Search interfaces..."
//           className="w-full pl-10 text-black pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* Interface Groups */}
//       <div className="space-y-2 max-h-96 overflow-y-auto">
//         {Object.entries(filteredGroupedInterfaces).map(([type, typeInterfaces]) => {
//           const isExpanded = expandedTypes.has(type);
//           const selectableInterfacesInType = typeInterfaces.filter(iface => isInterfaceSelectable(iface));
//           const allSelected = selectableInterfacesInType.length > 0 && selectableInterfacesInType.every(isInterfaceSelected);
//           const someSelected = selectableInterfacesInType.some(isInterfaceSelected);

//           return (
//             <div key={type} className="border border-gray-200 rounded-lg">
//               {/* Type Header */}
//               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
//                 <button
//                   onClick={() => toggleType(type)}
//                   className="flex items-center space-x-2 flex-1 text-left hover:text-primary-600"
//                 >
//                   {isExpanded ? (
//                     <ChevronDown className="h-4 w-4" />
//                   ) : (
//                     <ChevronRight className="h-4 w-4" />
//                   )}
//                   <span className="font-medium text-gray-900">{type}</span>
//                   <span className="text-sm text-white-500">({typeInterfaces.length})</span>
//                 </button>

//                 <button
//                   onClick={() => selectAllTypeInterfaces(typeInterfaces)}
//                   disabled={selectableInterfacesInType.length === 0}
//                   className={`
//                     px-3 py-1 text-sm rounded border transition-colors
//                     ${allSelected 
//                       ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
//                       : someSelected
//                       ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
//                       : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
//                     }
//                     ${selectableInterfacesInType.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
//                   `}
//                 >
//                   {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
//                 </button>
//               </div>

//               {/* Interface List */}
//               {isExpanded && (
//                 <div className="p-3 space-y-2">
//                   {typeInterfaces.map(interface_ => {
//                     const selected = isInterfaceSelected(interface_);
//                     const selectable = isInterfaceSelectable(interface_);

//                     return (
//                       <div
//                         key={interface_.id}
//                         className={`
//                           p-3 border rounded cursor-pointer transition-all hover:shadow-sm
//                           ${selected 
//                             ? 'border-primary-200 bg-primary-50 bg-blue-500 text-white-900' 
//                             : 'border-gray-200 hover:border-gray-300 '
//                           }
//                           ${!selectable ? 'opacity-50 cursor-not-allowed' : ''}
//                         `}
//                         onClick={() => handleToggle(interface_)}
//                         title={!selectable ? 'Selection restricted: not allowed' : undefined}
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center space-x-2">
//                               <h4 className="font-medium text-gray-900">
//                                 {interface_.interface_name}
//                               </h4>
//                               {selected && (
//                                 <Check className="h-4 w-4 text-white-600" />
//                               )}
//                               {interface_.similarity_score && (
//                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
//                                   {(interface_.similarity_score * 100).toFixed(1)}% match
//                                 </span>
//                               )}
//                             </div>

//                             {/* Add domain name display */}
//                             <div className="flex items-center space-x-2 mt-1">
//                               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                                 {getDomainName(interface_.domain_id)}
//                               </span>
//                               <span className="text-xs text-gray-500">
//                                 v{interface_.version}
//                               </span>
//                             </div>

//                             {interface_.interface_description && (
//                               <p className="text-sm text-gray-600 mt-1">
//                                 {interface_.interface_description}
//                               </p>
//                             )}

//                             <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                               {interface_.parameter_name && (
//                                 <div>
//                                   <span className="font-medium">Param:</span> {interface_.parameter_name} ({interface_.parameter_type})
//                                 </div>
//                               )}
//                               {interface_.return_type && (
//                                 <div>
//                                   <span className="font-medium">Returns:</span> {interface_.return_type}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {Object.keys(filteredGroupedInterfaces).length === 0 && (
//         <div className="text-center py-8 text-black">
//           <Search className="h-8 w-8 mx-auto mb-2 opacity-50 text-black" />
//           <p>No interfaces found matching your search.</p>
//         </div>
//       )}
//     </div>
//   );
// };
// // return (
// //     <div className="space-y-4">
// //       {/* ... search input and other code ... */}
// //       <div className="space-y-2 max-h-96 overflow-y-auto">
// //         {Object.entries(filteredGroupedInterfaces).map(([type, typeInterfaces]) => {
// //           const isExpanded = expandedTypes.has(type);
// //           // Only count selectable interfaces for allSelected check
// //           const selectableInterfacesInType = typeInterfaces.filter(iface => isInterfaceSelectable(iface));
// //           const allSelected = selectableInterfacesInType.length > 0 && selectableInterfacesInType.every(isInterfaceSelected);
// //           const someSelected = selectableInterfacesInType.some(isInterfaceSelected);

// //           return (
// //             <div key={type} className="border border-gray-200 rounded-lg">
// //               {/* Type Header */}
// //               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
// //                 <button
// //                   onClick={() => toggleType(type)}
// //                   className="flex items-center space-x-2 flex-1 text-left hover:text-primary-600"
// //                 >
// //                   {isExpanded ? (
// //                     <ChevronDown className="h-4 w-4" />
// //                   ) : (
// //                     <ChevronRight className="h-4 w-4" />
// //                   )}
// //                   <span className="font-medium text-gray-900">{type}</span>
// //                   <span className="text-sm text-gray-500">({typeInterfaces.length})</span>
// //                 </button>

// //                 {/* Disable select all button if none selectable */}
// //                 <button
// //                   onClick={() => selectAllTypeInterfaces(typeInterfaces)}
// //                   disabled={selectableInterfacesInType.length === 0}
// //                   className={`
// //                     px-3 py-1 text-sm rounded border transition-colors
// //                     ${allSelected 
// //                       ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
// //                       : someSelected
// //                       ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
// //                       : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
// //                     }
// //                     ${selectableInterfacesInType.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
// //                   `}
// //                 >
// //                   {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
// //                 </button>
// //               </div>

// //               {/* Interface List */}
// //               {isExpanded && (
// //                 <div className="p-3 space-y-2">
// //                   {typeInterfaces.map(interface_ => {
// //                     const selected = isInterfaceSelected(interface_);
// //                     const selectable = isInterfaceSelectable(interface_);

// //                     return (
// //                       <div
// //                         key={interface_.id}
// //                         className={`
// //                           p-3 border rounded cursor-pointer transition-all hover:shadow-sm
// //                           ${selected 
// //                             ? 'border-primary-200 bg-primary-50' 
// //                             : 'border-gray-200 hover:border-gray-300'
// //                           }
// //                           ${!selectable ? 'opacity-50 cursor-not-allowed' : ''}
// //                         `}
// //                         onClick={() => handleToggle(interface_)}
// //                         title={!selectable ? 'Selection restricted: not allowed' : undefined}
// //                       >
// //                         <div className="flex items-start justify-between">
// //                           <div className="flex-1">
// //                             <div className="flex items-center space-x-2">
// //                               <h4 className="font-medium text-gray-900">
// //                                 {interface_.interface_name}
// //                               </h4>
// //                               {selected && (
// //                                 <Check className="h-4 w-4 text-primary-600" />
// //                               )}
// //                               {interface_.similarity_score && (
// //                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
// //                                   {(interface_.similarity_score * 100).toFixed(1)}% match
// //                                 </span>
// //                               )}
// //                             </div>

// //                             {interface_.interface_description && (
// //                               <p className="text-sm text-gray-600 mt-1">
// //                                 {interface_.interface_description}
// //                               </p>
// //                             )}

// //                             <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
// //                               {interface_.parameter_name && (
// //                                 <div>
// //                                   <span className="font-medium">Param:</span> {interface_.parameter_name} ({interface_.parameter_type})
// //                                 </div>
// //                               )}
// //                               {interface_.return_type && (
// //                                 <div>
// //                                   <span className="font-medium">Returns:</span> {interface_.return_type}
// //                                 </div>
// //                               )}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>

// //       {/* No interfaces found message */}
// //       {Object.keys(filteredGroupedInterfaces).length === 0 && (
// //         <div className="text-center py-8 text-gray-500">
// //           <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
// //           <p>No interfaces found matching your search.</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };


// export default InterfaceSelector;




import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Search } from 'lucide-react';
import { Domain, Interface } from '../types/interface';

interface InterfaceSelectorProps {
  interfaces: Interface[];
  selectedInterfaces: Interface[];
  onInterfaceToggle: (interfaceName: Interface) => void;
  loading?: boolean;
  restrictSelectionTo?: Set<number>; 
  domains?: Domain[];
}

const InterfaceSelector: React.FC<InterfaceSelectorProps> = ({
  interfaces,
  selectedInterfaces,
  onInterfaceToggle,
  loading,
  restrictSelectionTo,
  domains = []
}) => {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const isSelectionRestricted = restrictSelectionTo && restrictSelectionTo.size > 0;
  const isInterfaceSelectable = (interface_: Interface) =>
    !isSelectionRestricted || restrictSelectionTo!.has(interface_.id);

  const handleToggle = (interface_: Interface) => {
    if (isInterfaceSelectable(interface_)) {
      onInterfaceToggle(interface_);
    }
  };

  // Group interfaces by type
  const groupedInterfaces = interfaces.reduce((acc, interface_) => {
    const type = interface_.interface_type || 'Uncategorised';
    if (!acc[type]) acc[type] = [];
    acc[type].push(interface_);
    return acc;
  }, {} as Record<string, Interface[]>);

  const getDomainName = (domainId: string | undefined): string => {
    if (!domainId) return 'Unknown Domain';
    const domain = domains.find(d => d.id === domainId);
    return domain?.name || 'Unknown Domain';
  };

  // Filter interfaces based on search term
  const filteredGroupedInterfaces = Object.entries(groupedInterfaces).reduce((acc, [type, typeInterfaces]) => {
    if (searchTerm) {
      const filtered = typeInterfaces.filter(interface_ => 
        interface_.interface_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interface_.interface_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[type] = filtered;
      }
    } else {
      acc[type] = typeInterfaces;
    }
    return acc;
  }, {} as Record<string, Interface[]>);

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const selectAllTypeInterfaces = (typeInterfaces: Interface[]) => {
    const selectableInterfaces = typeInterfaces.filter(iface => isInterfaceSelectable(iface));

    const allSelected = selectableInterfaces.every(interface_ =>
      selectedInterfaces.some(selected => selected.id === interface_.id)
    );
    
    selectableInterfaces.forEach(interface_ => {
      const isSelected = selectedInterfaces.some(selected => selected.id === interface_.id);
      if (allSelected && isSelected) {
        onInterfaceToggle(interface_); // Deselect
      } else if (!allSelected && !isSelected) {
        onInterfaceToggle(interface_); // Select
      }
    });
  };

  const isInterfaceSelected = (interface_: Interface) => 
    selectedInterfaces.some(selected => selected.id === interface_.id);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-2"></div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

//   return (
//     <div className="space-y-4">
//       {/* Search */}
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search interfaces..."
//           className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* Interface Groups */}
//       <div className="space-y-3 max-h-96 overflow-y-auto">
//         {Object.entries(filteredGroupedInterfaces).map(([type, typeInterfaces]) => {
//           const isExpanded = expandedTypes.has(type);
//           const selectableInterfacesInType = typeInterfaces.filter(iface => isInterfaceSelectable(iface));
//           const allSelected = selectableInterfacesInType.length > 0 && selectableInterfacesInType.every(isInterfaceSelected);
//           const someSelected = selectableInterfacesInType.some(isInterfaceSelected);

//           return (
//             <div key={type} className="border border-gray-600 rounded-lg bg-gray-800 overflow-hidden">
//               {/* Type Header */}
//               <div className="flex items-center justify-between p-4 bg-gray-700 border-b border-gray-600">
//                 <button
//                   onClick={() => toggleType(type)}
//                   className="flex items-center space-x-3 flex-1 text-left hover:text-blue-400 transition-colors duration-200"
//                 >
//                   {isExpanded ? (
//                     <ChevronDown className="h-5 w-5 text-gray-300" />
//                   ) : (
//                     <ChevronRight className="h-5 w-5 text-gray-300" />
//                   )}
//                   <span className="font-semibold text-white text-lg">{type}</span>
//                   <span className="text-sm text-gray-400 bg-gray-600 px-2 py-1 rounded-full">
//                     {typeInterfaces.length}
//                   </span>
//                 </button>

//                 <button
//                   onClick={() => selectAllTypeInterfaces(typeInterfaces)}
//                   disabled={selectableInterfacesInType.length === 0}
//                   className={`
//                     px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200
//                     ${allSelected 
//                       ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
//                       : someSelected
//                       ? 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
//                       : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
//                     }
//                     ${selectableInterfacesInType.length === 0 ? 'opacity-50 cursor-not-allowed' : 'shadow-md hover:shadow-lg'}
//                   `}
//                 >
//                   {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
//                 </button>
//               </div>

//               {/* Interface List */}
//               {isExpanded && (
//                 <div className="p-4 space-y-3">
//                   {typeInterfaces.map(interface_ => {
//                     const selected = isInterfaceSelected(interface_);
//                     const selectable = isInterfaceSelectable(interface_);

//                     return (
//                       <div
//                         key={interface_.id}
//                         className={`
//                           p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
//                           ${selected 
//                             ? 'border-blue-500 bg-blue-900/30 shadow-md ring-1 ring-blue-500/20' 
//                             : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
//                           }
//                           ${!selectable ? 'opacity-50 cursor-not-allowed' : ''}
//                         `}
//                         onClick={() => handleToggle(interface_)}
//                         title={!selectable ? 'Selection restricted: not allowed' : undefined}
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center space-x-3 mb-2">
//                               <h4 className="font-semibold text-white text-lg">
//                                 {interface_.interface_name}
//                               </h4>
//                               {selected && (
//                                 <div className="p-1 bg-blue-600 rounded-full">
//                                   <Check className="h-3 w-3 text-white" />
//                                 </div>
//                               )}
//                               {interface_.similarity_score && (
//                                 <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium">
//                                   {(interface_.similarity_score * 100).toFixed(1)}% match
//                                 </span>
//                               )}
//                             </div>

//                             {/* Domain and version info */}
//                             <div className="flex items-center space-x-2 mb-3">
//                               <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
//                                 {getDomainName(interface_.domain_id)}
//                               </span>
//                               <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
//                                 v{interface_.version}
//                               </span>
//                             </div>

//                             {interface_.interface_description && (
//                               <p className="text-sm text-gray-300 mb-3 leading-relaxed">
//                                 {interface_.interface_description}
//                               </p>
//                             )}

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
//                               {interface_.parameter_name && (
//                                 <div className="bg-gray-600 px-3 py-2 rounded">
//                                   <span className="font-medium text-gray-200">Param:</span>
//                                   <span className="text-white ml-1">
//                                     {interface_.parameter_name} ({interface_.parameter_type})
//                                   </span>
//                                 </div>
//                               )}
//                               {interface_.return_type && (
//                                 <div className="bg-gray-600 px-3 py-2 rounded">
//                                   <span className="font-medium text-gray-200">Returns:</span>
//                                   <span className="text-white ml-1">{interface_.return_type}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* No results state */}
//       {Object.keys(filteredGroupedInterfaces).length === 0 && (
//         <div className="text-center py-12 text-gray-400">
//           <div className="p-4 bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//             <Search className="h-8 w-8 opacity-50" />
//           </div>
//           <p className="text-lg font-medium text-gray-300 mb-2">No interfaces found</p>
//           <p className="text-sm">Try adjusting your search terms or browse all available interfaces.</p>
//         </div>
//       )}
//     </div>
//   );
// };
return (
  <div className="space-y-3">
    {/* Compact Search */}
    <div className="relative">
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search interfaces..."
        className="w-full pl-7 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Compact Interface Groups */}
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {Object.entries(filteredGroupedInterfaces).map(([type, typeInterfaces]) => {
        const isExpanded = expandedTypes.has(type);
        const selectableInterfacesInType = typeInterfaces.filter(iface => isInterfaceSelectable(iface));
        const allSelected = selectableInterfacesInType.length > 0 && selectableInterfacesInType.every(isInterfaceSelected);
        const someSelected = selectableInterfacesInType.some(isInterfaceSelected);

        return (
          <div key={type} className="border border-gray-600 rounded-md bg-gray-700/50 overflow-hidden">
            {/* Compact Type Header */}
            <div className="flex items-center justify-between p-2 bg-gray-700 border-b border-gray-600">
              <button
                onClick={() => toggleType(type)}
                className="flex items-center space-x-2 flex-1 text-left hover:text-blue-400 transition-colors duration-200"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-gray-300" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-300" />
                )}
                <span className="font-medium text-white text-xs">{type}</span>
                <span className="text-xs text-gray-400 bg-gray-600 px-1.5 py-0.5 rounded-full">
                  {typeInterfaces.length}
                </span>
              </button>

              <button
                onClick={() => selectAllTypeInterfaces(typeInterfaces)}
                disabled={selectableInterfacesInType.length === 0}
                className={`
                  px-2 py-1 text-xs font-medium rounded border transition-all duration-200
                  ${allSelected 
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                    : someSelected
                    ? 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  }
                  ${selectableInterfacesInType.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {allSelected ? 'Clear' : someSelected ? 'All' : 'All'}
              </button>
            </div>

            {/* Compact Interface List */}
            {isExpanded && (
              <div className="p-2 space-y-1">
                {typeInterfaces.map(interface_ => {
                  const selected = isInterfaceSelected(interface_);
                  const selectable = isInterfaceSelectable(interface_);

                  return (
                    <div
                      key={interface_.id}
                      className={`
                        p-2 border rounded cursor-pointer transition-all duration-200
                        ${selected 
                          ? 'border-blue-500 bg-blue-900/20 ring-1 ring-blue-500/20' 
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-600/50'
                        }
                        ${!selectable ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => handleToggle(interface_)}
                      title={!selectable ? 'Selection restricted' : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-white text-xs truncate">
                              {interface_.interface_name}
                            </h4>
                            {selected && (
                              <div className="p-0.5 bg-blue-600 rounded-full">
                                <Check className="h-2 w-2 text-white" />
                              </div>
                            )}
                            {interface_.similarity_score && (
                              <span className="text-xs bg-green-600 text-white px-1 py-0.5 rounded text-[10px] font-medium">
                                {(interface_.similarity_score * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-1">
                            <span className="text-xs bg-blue-600/80 text-blue-100 px-1.5 py-0.5 rounded font-medium">
                              {getDomainName(interface_.domain_id)}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-600 px-1.5 py-0.5 rounded">
                              v{interface_.version}
                            </span>
                          </div>

                          {interface_.interface_description && (
                            <p className="text-xs text-gray-300 leading-tight line-clamp-1 mb-1">
                              {interface_.interface_description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 gap-1 text-[10px]">
                            {interface_.parameter_name && (
                              <div className="bg-gray-600/50 px-1.5 py-0.5 rounded">
                                <span className="font-medium text-gray-300">Param:</span>
                                <span className="text-white ml-1">
                                  {interface_.parameter_name} ({interface_.parameter_type})
                                </span>
                              </div>
                            )}
                            {interface_.return_type && (
                              <div className="bg-gray-600/50 px-1.5 py-0.5 rounded">
                                <span className="font-medium text-gray-300">Returns:</span>
                                <span className="text-white ml-1">{interface_.return_type}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Compact No Results */}
    {Object.keys(filteredGroupedInterfaces).length === 0 && (
      <div className="text-center py-6 text-gray-400">
        <div className="p-2 bg-gray-700 rounded-full w-8 h-8 mx-auto mb-2 flex items-center justify-center">
          <Search className="h-4 w-4 opacity-50" />
        </div>
        <p className="text-xs font-medium text-gray-300 mb-1">No interfaces found</p>
        <p className="text-xs">Try different search terms</p>
      </div>
    )}
  </div>
);
};
export default InterfaceSelector;
