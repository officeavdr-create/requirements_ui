import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Database, 
  Code, 
  Settings,
  Check,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { domainService, unifiedInterfaceService } from '@/services';
import type { Domain } from '@/services';

interface DomainType {
  domain_type: string;
  count: number;
  domains: Domain[];
}

interface Interface {
  id: string;
  interface_name: string;
  interface_version?: string;
  description: string;
  interface_type: string;
  confidence_score: number;
  domain_id: string;
  sub_feature_section?: string;
}

export interface FourTierSelection {
  domainTypes: string[];
  domainInstances: string[];
  interfaceVersions: string[];
  interfaces: string[];
}

interface FourTierSelectorControlledProps {
  sessionId: string;
  value: FourTierSelection;
  onChange: (value: FourTierSelection) => void;
}

export const FourTierSelectorControlled: React.FC<FourTierSelectorControlledProps> = ({
  sessionId,
  value,
  onChange
}) => {
  // Data state (not selections)
  const [domainTypes, setDomainTypes] = useState<DomainType[]>([]);
  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [availableInterfaces, setAvailableInterfaces] = useState<Interface[]>([]);
  
  // UI state
  const [expandedDomainTypes, setExpandedDomainTypes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load domain types on mount
  useEffect(() => {
    loadDomainTypes();
  }, []);

  // Load domain instances when domain types change
  useEffect(() => {
    if (value.domainTypes.length > 0) {
      loadDomainInstances();
    } else {
      setAvailableDomains([]);
      // Clear downstream selections when domain types are cleared
      if (value.domainInstances.length > 0) {
        onChange({
          ...value,
          domainInstances: [],
          interfaceVersions: [],
          interfaces: []
        });
      }
    }
  }, [value.domainTypes]);

  // Load interface versions when domain instances change
  useEffect(() => {
    if (value.domainInstances.length > 0) {
      loadInterfaceVersions();
    } else {
      setAvailableVersions([]);
      // Clear downstream selections
      if (value.interfaceVersions.length > 0) {
        onChange({
          ...value,
          interfaceVersions: [],
          interfaces: []
        });
      }
    }
  }, [value.domainInstances]);

  // Load interfaces when versions change
  useEffect(() => {
    if (value.domainInstances.length > 0 && value.interfaceVersions.length > 0) {
      loadInterfaces();
    } else {
      setAvailableInterfaces([]);
      // Clear interface selection
      if (value.interfaces.length > 0) {
        onChange({
          ...value,
          interfaces: []
        });
      }
    }
  }, [value.domainInstances, value.interfaceVersions]);

  const loadDomainTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('FourTierSelectorControlled: Loading domain types...');
      
      const response = await domainService.getAllDomains(true);
      const domains = response.data || response;
      
      if (!domains || !Array.isArray(domains)) {
        throw new Error('Invalid domain data received');
      }
      
      // Group domains by type
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
      
      console.log('FourTierSelectorControlled: Loaded domain types:', types);
      setDomainTypes(types);
    } catch (error) {
      console.error('FourTierSelectorControlled: Failed to load domain types:', error);
      setError(`Failed to load domain types: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDomainInstances = () => {
    // Find all domains of selected types
    const instances = domainTypes
      .filter(dt => value.domainTypes.includes(dt.domain_type))
      .flatMap(dt => dt.domains);
    
    setAvailableDomains(instances);
  };

  const loadInterfaceVersions = async () => {
    try {
      const domainIds = value.domainInstances;
      const response = await unifiedInterfaceService.getInterfacesByDomains(domainIds);
      
      const versions = new Set<string>();
      const domainsData = response.domains || {};
      
      Object.values(domainsData).forEach((domainData: any) => {
        if (domainData.interfaces && Array.isArray(domainData.interfaces)) {
          domainData.interfaces.forEach((iface: any) => {
            const version = iface.interface_version || iface.version || 'default';
            versions.add(version);
          });
        }
      });
      
      setAvailableVersions(Array.from(versions).sort());
    } catch (error) {
      console.error('Failed to load interface versions:', error);
    }
  };

  const loadInterfaces = async () => {
    try {
      const domainIds = value.domainInstances;
      const response = await unifiedInterfaceService.getInterfacesByDomains(domainIds);
      
      const interfaces: Interface[] = [];
      const domainsData = response.domains || {};
      
      Object.entries(domainsData).forEach(([domainId, domainData]: [string, any]) => {
        if (domainData.interfaces && Array.isArray(domainData.interfaces)) {
          domainData.interfaces.forEach((iface: any) => {
            const version = iface.interface_version || iface.version || 'default';
            if (value.interfaceVersions.includes(version)) {
              const mappedInterface = {
                id: iface.interface_id || iface.id,
                interface_name: iface.interface_name,
                interface_version: version,
                description: iface.interface_description || iface.description || '',
                interface_type: iface.interface_type || iface.type || iface.interface_category || 'API',
                confidence_score: iface.confidence_score || iface.ai_confidence_score || 95,
                domain_id: domainId,
                sub_feature_section: iface.sub_feature_section || iface.section || iface.feature_section || iface.category
              };
              interfaces.push(mappedInterface);
            }
          });
        }
      });
      
      console.log('FourTierSelectorControlled: Loaded interfaces:', interfaces.length);
      setAvailableInterfaces(interfaces);
    } catch (error) {
      console.error('Failed to load interfaces:', error);
    }
  };

  // Selection handlers
  const toggleDomainType = (domainType: string) => {
    const newDomainTypes = value.domainTypes.includes(domainType)
      ? value.domainTypes.filter(t => t !== domainType)
      : [...value.domainTypes, domainType];
    
    onChange({
      ...value,
      domainTypes: newDomainTypes
    });
  };

  const toggleDomainInstance = (domainId: string) => {
    const newInstances = value.domainInstances.includes(domainId)
      ? value.domainInstances.filter(id => id !== domainId)
      : [...value.domainInstances, domainId];
    
    onChange({
      ...value,
      domainInstances: newInstances
    });
  };

  const toggleInterfaceVersion = (version: string) => {
    const newVersions = value.interfaceVersions.includes(version)
      ? value.interfaceVersions.filter(v => v !== version)
      : [...value.interfaceVersions, version];
    
    onChange({
      ...value,
      interfaceVersions: newVersions
    });
  };

  const toggleInterface = (interfaceId: string) => {
    const newInterfaces = value.interfaces.includes(interfaceId)
      ? value.interfaces.filter(id => id !== interfaceId)
      : [...value.interfaces, interfaceId];
    
    onChange({
      ...value,
      interfaces: newInterfaces
    });
  };

  const toggleDomainTypeExpansion = (domainType: string) => {
    const newExpanded = new Set(expandedDomainTypes);
    if (newExpanded.has(domainType)) {
      newExpanded.delete(domainType);
    } else {
      newExpanded.add(domainType);
    }
    setExpandedDomainTypes(newExpanded);
  };

  // Group interfaces by section
  const groupedInterfaces = useMemo(() => {
    return availableInterfaces.reduce((acc, iface) => {
      let section = iface.sub_feature_section || iface.interface_type || 'General Functions';
      
      // Clean up section names
      section = section && section.trim() !== '' ? section.trim() : 'General Functions';
      
      // Replace technical terms with user-friendly ones
      const sectionMappings: Record<string, string> = {
        'unknown': 'Unclassified Functions',
        'API': 'API Functions',
        'excel_extracted': 'Document Functions',
        'excel imported': 'Document Functions',
        'excel': 'Document Functions',
        'bluetooth': 'Bluetooth Functions',
        'audio': 'Audio Functions',
        'hmi': 'HMI Functions'
      };
      
      // Apply mappings
      const lowerSection = section.toLowerCase();
      for (const [key, value] of Object.entries(sectionMappings)) {
        if (lowerSection.includes(key)) {
          section = value;
          break;
        }
      }
      
      // Ensure proper formatting
      if (!section.includes(' ')) {
        section = section.charAt(0).toUpperCase() + section.slice(1) + ' Functions';
      }
      
      if (!acc[section]) acc[section] = [];
      acc[section].push(iface);
      return acc;
    }, {} as Record<string, Interface[]>);
  }, [availableInterfaces]);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            value.domainTypes.length > 0 
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
              : "text-gray-500"
          )}>
            <Layers className="h-4 w-4" />
            <span className="text-sm font-medium">
              1. Domain Types ({value.domainTypes.length})
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            value.domainInstances.length > 0 
              ? "bg-blue-100 text-blue-800 border border-blue-300" 
              : "text-gray-500"
          )}>
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">
              2. Domain Instances ({value.domainInstances.length})
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            value.interfaceVersions.length > 0 
              ? "bg-purple-100 text-purple-800 border border-purple-300" 
              : "text-gray-500"
          )}>
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">
              3. Interface Versions ({value.interfaceVersions.length})
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg",
            value.interfaces.length > 0 
              ? "bg-orange-100 text-orange-800 border border-orange-300" 
              : "text-gray-500"
          )}>
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">
              4. Interfaces ({value.interfaces.length})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 1: Domain Types */}
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
              <div className="space-y-2">
                {domainTypes.map(domainType => {
                  const isSelected = value.domainTypes.includes(domainType.domain_type);
                  const isExpanded = expandedDomainTypes.has(domainType.domain_type);
                  
                  return (
                    <div key={domainType.domain_type} className="border rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleDomainTypeExpansion(domainType.domain_type)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleDomainType(domainType.domain_type)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border w-full min-w-[200px]",
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

        {/* Tier 2: Domain Instances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              2. Domain Instances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {value.domainTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Select domain types first
              </div>
            ) : (
              <div className="space-y-2">
                {availableDomains.map(domain => {
                  const isSelected = value.domainInstances.includes(domain.id);
                  
                  return (
                    <button
                      key={domain.id}
                      onClick={() => toggleDomainInstance(domain.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
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
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{domain.name}</div>
                        <div className={cn(
                          "text-xs",
                          isSelected ? "text-blue-100" : "text-gray-600"
                        )}>{domain.domain_type}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier 3: Interface Versions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              3. Interface Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {value.domainInstances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Select domain instances first
              </div>
            ) : (
              <div className="space-y-2">
                {availableVersions.map(version => {
                  const isSelected = value.interfaceVersions.includes(version);
                  
                  return (
                    <button
                      key={version}
                      onClick={() => toggleInterfaceVersion(version)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                        isSelected 
                          ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white border-purple-600 shadow-lg" 
                          : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400"
                      )}
                    >
                      {isSelected ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="font-medium text-sm">
                        {version === 'default' ? 'Default' : 
                         version.startsWith('v') ? version : `v${version}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier 4: Interfaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              4. Interfaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            {value.interfaceVersions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Select interface versions first
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {availableInterfaces.length > 0 ? (
                  Object.entries(groupedInterfaces)
                    .sort(([a], [b]) => {
                      if (a === 'Uncategorized') return 1;
                      if (b === 'Uncategorized') return -1;
                      return a.localeCompare(b);
                    })
                    .map(([section, interfaces]) => (
                      <div key={section} className="space-y-2">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-400 rounded-lg text-sm font-semibold text-white shadow-md">
                          <span>{section}</span>
                          <span className="text-xs text-indigo-100 bg-indigo-400 px-2 py-0.5 rounded">
                            {interfaces.length}
                          </span>
                        </div>
                        
                        {/* Interfaces in this section */}
                        <div className="space-y-2 ml-4 border-l-2 border-indigo-200 pl-3">
                          {interfaces.map(iface => {
                            const isSelected = value.interfaces.includes(iface.id);
                            
                            return (
                              <button
                                key={iface.id}
                                onClick={() => toggleInterface(iface.id)}
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
                                  <div className="font-medium text-sm truncate">{iface.interface_name}</div>
                                  <div className={cn(
                                    "text-xs mt-1 line-clamp-2",
                                    isSelected ? "text-orange-100" : "text-gray-600"
                                  )}>{iface.description}</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={cn(
                                      "text-xs px-2 py-0.5 rounded border-2 font-medium",
                                      isSelected 
                                        ? "bg-orange-200 text-orange-900 border-orange-400" 
                                        : "bg-gray-100 text-gray-700 border-gray-300"
                                    )}>
                                      {iface.interface_type || 'Interface'}
                                    </span>
                                    {iface.interface_version && (
                                      <span className={cn(
                                        "text-xs px-2 py-0.5 rounded border-2 font-medium",
                                        isSelected 
                                          ? "bg-orange-200 text-orange-900 border-orange-400" 
                                          : "bg-gray-100 text-gray-700 border-gray-300"
                                      )}>
                                        {iface.interface_version}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No interfaces found for selected versions</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};