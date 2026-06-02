/**
 * Utility functions for version selection and parsing
 */

export interface InstanceVersionMapping {
  instanceId: string;
  versions: string[];
}

/**
 * Parse instance-specific version selections from "instanceId:version" format
 * @param selectedVersions Array of strings in "instanceId:version" format
 * @returns Object containing filtered domain instances and all selected versions
 */
// export function parseInstanceVersionSelections(selectedVersions: string[]): {
//   instanceVersionMap: Map<string, string[]>;
//   filteredDomainInstances: string[];
//   allSelectedVersions: string[];
// } {
//   const instanceVersionMap = new Map<string, string[]>();
  
//   selectedVersions.forEach(versionKey => {
//     if (versionKey.includes(':')) {
//       const [instanceId, version] = versionKey.split(':');
//       if (instanceId && version) {
//         if (!instanceVersionMap.has(instanceId)) {
//           instanceVersionMap.set(instanceId, []);
//         }
//         instanceVersionMap.get(instanceId)!.push(version);
//       }
//     }
//   });
  
//   const filteredDomainInstances = Array.from(instanceVersionMap.keys());
//   const allSelectedVersions = Array.from(new Set(Array.from(instanceVersionMap.values()).flat()));
  
//   return {
//     instanceVersionMap,
//     filteredDomainInstances,
//     allSelectedVersions
//   };
// }

/**
 * Create a version key for instance-specific selection
 * @param instanceId Domain instance ID
 * @param version Version string
 * @returns Formatted version key "instanceId:version"
 */
export function createVersionKey(instanceId: string, version: string): string {
  return `${instanceId}:${version}`;
}

/**
 * Check if version key is in valid format
 * @param versionKey Version key to validate
 * @returns True if valid "instanceId:version" format
 */
export function isValidVersionKey(versionKey: string): boolean {
  if (typeof versionKey !== 'string') return false;
  if (!versionKey.includes(':')) return false;
  
  const parts = versionKey.split(':');
  return parts.length === 2 && parts[0] && parts[1];
}

/**
 * Parse a single version key
 * @param versionKey Version key in "instanceId:version" format
 * @returns Object with instanceId and version, or null if invalid
 */
export function parseVersionKey(versionKey: string): { instanceId: string; version: string } | null {
  if (!isValidVersionKey(versionKey)) return null;
  
  const [instanceId, version] = versionKey.split(':');
  return { instanceId, version };
}

/**
 * Create parameter key for caching API calls
 * @param instances Array of domain instance IDs
 * @param versions Array of version strings
 * @returns JSON string for parameter comparison
 */
// export function createParameterKey(instances: string[], versions: string[]): string {
//   return JSON.stringify({
//     instances: instances.sort(),
//     versions: versions.sort()
//   });
// }

// Enhanced version utilities for better data handling and state management

export interface VersionSelection {
  domainInstanceId: string;
  version: string;
}

/**
 * Parse instance-version selections to avoid data mixing between domains
 * This prevents the data aggregation issue mentioned in the requirements
 */
export function parseInstanceVersionSelections(selectedVersions: string[]): {
  filteredDomainInstances: string[];
  allSelectedVersions: string[];
  versionsByDomain: Map<string, string[]>;
} {
  const versionsByDomain = new Map<string, string[]>();
  const filteredDomainInstances: string[] = [];
  const allSelectedVersions: string[] = [];
  
  selectedVersions.forEach(versionSelection => {
    // Parse the version selection format: "domainInstanceId::version"
    const parts = versionSelection.split('::');
    if (parts.length === 2) {
      const [domainInstanceId, version] = parts;
      
      if (!filteredDomainInstances.includes(domainInstanceId)) {
        filteredDomainInstances.push(domainInstanceId);
      }
      
      if (!allSelectedVersions.includes(version)) {
        allSelectedVersions.push(version);
      }
      
      if (!versionsByDomain.has(domainInstanceId)) {
        versionsByDomain.set(domainInstanceId, []);
      }
      
      const domainVersions = versionsByDomain.get(domainInstanceId) || [];
      if (!domainVersions.includes(version)) {
        domainVersions.push(version);
        versionsByDomain.set(domainInstanceId, domainVersions);
      }
    }
  });
  
  return {
    filteredDomainInstances,
    allSelectedVersions,
    versionsByDomain
  };
}

/**
 * Create a unique parameter key to prevent duplicate API calls
 * This helps with memory management and prevents flickering
 */
export function createParameterKey(
  domainInstances: string[],
  versions: string[],
  sections?: string[]
): string {
  const sortedInstances = [...domainInstances].sort();
  const sortedVersions = [...versions].sort();
  const sortedSections = sections ? [...sections].sort() : [];
  
  return `${sortedInstances.join(',')}_${sortedVersions.join(',')}_${sortedSections.join(',')}`;
}

/**
 * Debounce function to prevent excessive API calls and improve performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create version selection string in the proper format
 */
export function createVersionSelection(domainInstanceId: string, version: string): string {
  return `${domainInstanceId}::${version}`;
}

/**
 * Group interfaces by section while maintaining domain separation
 */
export function groupInterfacesBySection(interfaces: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();
  
  interfaces.forEach(iface => {
    const section = iface.sectionName || iface.sub_feature_section || 'General Functions';
    
    if (!grouped.has(section)) {
      grouped.set(section, []);
    }
    
    grouped.get(section)!.push(iface);
  });
  
  return grouped;
}

/**
 * Safe array state updater to prevent memory leaks
 */
export function safeUpdateArray<T>(
  currentArray: T[],
  item: T,
  isSelected: boolean,
  keyExtractor?: (item: T) => string | number
): T[] {
  const key = keyExtractor ? keyExtractor(item) : item;
  const currentIndex = keyExtractor 
    ? currentArray.findIndex(existingItem => keyExtractor(existingItem) === key)
    : currentArray.indexOf(item);
  
  if (isSelected && currentIndex === -1) {
    // Add item if not present and should be selected
    return [...currentArray, item];
  } else if (!isSelected && currentIndex !== -1) {
    // Remove item if present and should not be selected
    return currentArray.filter((_, index) => index !== currentIndex);
  }
  
  // Return current array if no change needed
  return currentArray;
}

/**
 * Validate and sanitize selections to prevent invalid states
 */
export function validateSelections(selections: {
  domainTypes: string[];
  domainInstances: string[];
  interfaceVersions: string[];
  interfaceSections: string[];
  interfaces: string[];
}) {
  return {
    domainTypes: selections.domainTypes.filter(Boolean),
    domainInstances: selections.domainInstances.filter(Boolean),
    interfaceVersions: selections.interfaceVersions.filter(Boolean),
    interfaceSections: selections.interfaceSections.filter(Boolean),
    interfaces: selections.interfaces.filter(Boolean)
  };
}

/**
 * Check if two selection objects are equal (for optimization)
 */
export function areSelectionsEqual(
  selectionA: Record<string, any>,
  selectionB: Record<string, any>
): boolean {
  const keysA = Object.keys(selectionA).sort();
  const keysB = Object.keys(selectionB).sort();
  
  if (keysA.length !== keysB.length) return false;
  if (keysA.some((key, index) => key !== keysB[index])) return false;
  
  return keysA.every(key => {
    const valueA = selectionA[key];
    const valueB = selectionB[key];
    
    if (Array.isArray(valueA) && Array.isArray(valueB)) {
      return valueA.length === valueB.length && 
             valueA.every((item, index) => item === valueB[index]);
    }
    
    return valueA === valueB;
  });
}