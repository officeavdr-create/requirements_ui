import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Filter,
  Settings,
  Check,
  Circle,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unifiedInterfaceService } from '@/services';
import type { InterfaceSection, GroupedInterface } from '@/services/unifiedInterfaceService';

interface DomainInterfacesSelectorProps {
  selectedDomainInstances: string[];
  selectedVersions: string[];
  selectedSections: string[];
  onSectionSelectionChange: (sections: string[]) => void;
  onInterfaceSelectionChange: (interfaces: string[]) => void;
  selectedInterfaces: string[];
}

interface SectionGroup {
  sectionName: string;
  domainVersionGroups: {
    [domainVersion: string]: GroupedInterface[];
  };
  totalInterfaces: number;
}

export const DomainInterfacesSelector: React.FC<DomainInterfacesSelectorProps> = ({
  selectedDomainInstances,
  selectedVersions,
  selectedSections,
  onSectionSelectionChange,
  onInterfaceSelectionChange,
  selectedInterfaces
}) => {
  const [availableSections, setAvailableSections] = useState<InterfaceSection[]>([]);
  const [availableInterfaces, setAvailableInterfaces] = useState<GroupedInterface[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingInterfaces, setLoadingInterfaces] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // OPTIMIZED: Debounced loading to prevent excessive API calls
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load sections when domain instances and versions change
  useEffect(() => {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }

    if (selectedDomainInstances.length > 0 && selectedVersions.length > 0) {
      const timeout = setTimeout(() => {
        loadInterfaceSections();
      }, 300);
      setLoadTimeout(timeout);
    } else {
      setAvailableSections([]);
      setAvailableInterfaces([]);
      onSectionSelectionChange([]);
      onInterfaceSelectionChange([]);
    }

    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [selectedDomainInstances, selectedVersions]);

  // Load interfaces when sections change
  useEffect(() => {
    if (selectedDomainInstances.length > 0 && selectedVersions.length > 0) {
      loadInterfaces();
    } else {
      setAvailableInterfaces([]);
      onInterfaceSelectionChange([]);
    }
  }, [selectedDomainInstances, selectedVersions, selectedSections]);

  const loadInterfaceSections = async () => {
    if (loadingSections) return;
    
    try {
      setLoadingSections(true);
      setError(null);
      
      // Parse version selections to get proper domain instances and versions
      const parsedVersions = selectedVersions.map(v => {
        const parts = v.split('::');
        return {
          domainInstance: parts[0],
          version: parts[1] || 'default'
        };
      });
      
      const domainInstances = [...new Set(parsedVersions.map(pv => pv.domainInstance))];
      const versions = [...new Set(parsedVersions.map(pv => pv.version))];
      
      const sections = await unifiedInterfaceService.getInterfaceSections(
        domainInstances,
        versions
      );
      
      setAvailableSections(sections || []);
      
    } catch (error: any) {
      console.error('Failed to load interface sections:', error);
      setError(`Failed to load sections: ${error.message || 'Unknown error'}`);
      setAvailableSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const loadInterfaces = async () => {
    if (loadingInterfaces) return;
    
    try {
      setLoadingInterfaces(true);
      
      // Parse version selections
      const parsedVersions = selectedVersions.map(v => {
        const parts = v.split('::');
        return {
          domainInstance: parts[0],
          version: parts[1] || 'default'
        };
      });
      
      const domainInstances = [...new Set(parsedVersions.map(pv => pv.domainInstance))];
      const versions = [...new Set(parsedVersions.map(pv => pv.version))];
      
      const interfaces = await unifiedInterfaceService.getFilteredInterfaces(
        domainInstances,
        versions,
        selectedSections
      );
      
      setAvailableInterfaces(interfaces || []);
      
    } catch (error: any) {
      console.error('Failed to load interfaces:', error);
      setAvailableInterfaces([]);
    } finally {
      setLoadingInterfaces(false);
    }
  };

  const toggleSectionSelection = useCallback((sectionName: string) => {
    const newSections = selectedSections.includes(sectionName)
      ? selectedSections.filter(s => s !== sectionName)
      : [...selectedSections, sectionName];
    
    onSectionSelectionChange(newSections);
  }, [selectedSections, onSectionSelectionChange]);

  const toggleInterfaceSelection = useCallback((interfaceId: string) => {
    const newInterfaces = selectedInterfaces.includes(interfaceId)
      ? selectedInterfaces.filter(id => id !== interfaceId)
      : [...selectedInterfaces, interfaceId];
    
    onInterfaceSelectionChange(newInterfaces);
  }, [selectedInterfaces, onInterfaceSelectionChange]);

  const toggleSectionExpansion = useCallback((sectionName: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionName)) {
        newExpanded.delete(sectionName);
      } else {
        newExpanded.add(sectionName);
      }
      return newExpanded;
    });
  }, []);

  const selectAllInSection = useCallback((sectionName: string) => {
    const sectionInterfaces = availableInterfaces
      .filter(iface => iface.sectionName === sectionName)
      .map(iface => iface.id);
    
    const otherInterfaces = selectedInterfaces.filter(id => {
      const iface = availableInterfaces.find(i => i.id === id);
      return iface?.sectionName !== sectionName;
    });
    
    onInterfaceSelectionChange([...otherInterfaces, ...sectionInterfaces]);
  }, [availableInterfaces, selectedInterfaces, onInterfaceSelectionChange]);

  // OPTIMIZED: Memoized section grouping to maintain domain/version separation
  const sectionGroups = useMemo((): SectionGroup[] => {
    if (availableInterfaces.length === 0) return [];

    const grouped = availableInterfaces.reduce((acc, iface) => {
      const section = iface.sectionName || 'General Functions';
      
      if (!acc[section]) {
        acc[section] = {
          sectionName: section,
          domainVersionGroups: {},
          totalInterfaces: 0
        };
      }
      
      // Group by domain and version to maintain separation
      const domainVersion = `${iface.domainInstanceName}_${iface.interface_version || 'default'}`;
      
      if (!acc[section].domainVersionGroups[domainVersion]) {
        acc[section].domainVersionGroups[domainVersion] = [];
      }
      
      acc[section].domainVersionGroups[domainVersion].push(iface);
      acc[section].totalInterfaces++;
      
      return acc;
    }, {} as Record<string, SectionGroup>);

    // Filter by selected sections if any are selected
    const sectionsToShow = selectedSections.length > 0 
      ? selectedSections.filter(section => grouped[section])
      : Object.keys(grouped);

    return sectionsToShow
      .map(sectionName => grouped[sectionName])
      .sort((a, b) => {
        // Sort sections: put 'General Functions' last
        if (a.sectionName === 'General Functions') return 1;
        if (b.sectionName === 'General Functions') return -1;
        return a.sectionName.localeCompare(b.sectionName);
      });
  }, [availableInterfaces, selectedSections]);

  if (selectedDomainInstances.length === 0 || selectedVersions.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Interface Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              4. Interface Sections (Filter)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Select domain instances and interface versions first
            </div>
          </CardContent>
        </Card>

        {/* Interfaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              5. Interfaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Select domain instances and interface versions first
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Interface Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            4. Interface Sections (Filter)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="text-red-500 text-center">
                <p className="font-medium">Error loading sections</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={loadInterfaceSections}
                className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : loadingSections ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading sections...</span>
            </div>
          ) : availableSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sections found for current selection
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableSections.map(section => {
                const isSelected = selectedSections.includes(section.name);
                
                return (
                  <button
                    key={section.name}
                    onClick={() => toggleSectionSelection(section.name)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                      isSelected 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-black border-indigo-600 shadow-lg" 
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
                        {section.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={cn(
                            "text-xs",
                            isSelected 
                              ? "bg-indigo-200 text-indigo-900" 
                              : "bg-gray-200 text-gray-700"
                          )}
                        >
                          {section.interfaceCount} interfaces
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interfaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            5. Interfaces
            {selectedSections.length > 0 && (
              <Badge variant="secondary">
                Filtered by {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''}
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
          {loadingInterfaces ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading interfaces...</span>
            </div>
          ) : sectionGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No interfaces found for current selection</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sectionGroups.map(sectionGroup => (
                <div key={sectionGroup.sectionName} className="space-y-2">
                  {/* Section Header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSectionExpansion(sectionGroup.sectionName)}
                        className="text-black hover:text-indigo-200 transition-colors"
                      >
                        {expandedSections.has(sectionGroup.sectionName) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <span className="text-black font-semibold text-sm">{sectionGroup.sectionName}</span>
                      <Badge className="bg-indigo-400 text-black text-xs">
                        {sectionGroup.totalInterfaces} interfaces
                      </Badge>
                    </div>
                    <button 
                      onClick={() => selectAllInSection(sectionGroup.sectionName)}
                      className="text-indigo-100 hover:text-black text-xs px-2 py-1 rounded hover:bg-indigo-400 transition-colors"
                    >
                      Select All
                    </button>
                  </div>
                  
                  {/* Domain/Version Groups - FIXED: Proper separation maintained */}
                  {expandedSections.has(sectionGroup.sectionName) && (
                    <div className="space-y-2 ml-4 border-l-2 border-indigo-200 pl-3">
                      {Object.entries(sectionGroup.domainVersionGroups).map(([domainVersion, interfaces]) => {
                        const [domainName, version] = domainVersion.split('_');
                        
                        return (
                          <div key={domainVersion} className="space-y-1">
                            {/* Domain/Version Subheader */}
                            <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {domainName}
                                </Badge>
                                {version !== 'default' && (
                                  <Badge variant="outline" className="text-xs">
                                    v{version}
                                  </Badge>
                                )}
                                <span className="text-gray-600">
                                  {interfaces.length} interface{interfaces.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            
                            {/* Interfaces in this domain/version */}
                            <div className="space-y-1 ml-2">
                              {interfaces.slice(0, 3).map(iface => { // Show only first 3 to save space
                                const isSelected = selectedInterfaces.includes(iface.id);
                                
                                return (
                                  <button
                                    key={iface.id}
                                    onClick={() => toggleInterfaceSelection(iface.id)}
                                    className={cn(
                                      "w-full flex items-center gap-2 p-2 rounded border transition-colors text-left",
                                      isSelected 
                                        ? "bg-orange-100 text-orange-900 border-orange-300" 
                                        : "bg-white border-gray-200 hover:bg-gray-50"
                                    )}
                                  >
                                    {isSelected ? (
                                      <Check className="h-3 w-3 text-orange-600" />
                                    ) : (
                                      <Circle className="h-3 w-3 text-gray-400" />
                                    )}
                                    <span className="text-xs font-medium truncate">
                                      {iface.interface_name}
                                    </span>
                                  </button>
                                );
                              })}
                              {interfaces.length > 3 && (
                                <div className="text-xs text-gray-500 ml-5">
                                  ...and {interfaces.length - 3} more interfaces
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};