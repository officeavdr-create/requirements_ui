import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Search, 
  Filter, 
  ChevronRight,
  ChevronDown,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { unifiedInterfaceService } from '@/services';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Interface {
  id: string;
  interface_name: string;
  interface_version?: string;
  description: string;
  interface_type: string;
  confidence_score: number;
  domain_id: string;
  domain_name?: string;
  parameters?: any;
  enhanced_by_ai?: boolean;
  sub_feature_section?: string;
}

interface InterfaceSelectionPanelProps {
  sessionId: string;
  selectedDomainIds: string[];
  onInterfacesSelected: (interfaceIds: string[]) => void;
  selectedInterfaceIds?: string[];
  maxSelection?: number;
  sectionFilter?: string; // EPIC 20: Section filtering
}

export const InterfaceSelectionPanel: React.FC<InterfaceSelectionPanelProps> = ({
  sessionId,
  selectedDomainIds,
  onInterfacesSelected,
  selectedInterfaceIds = [],
  maxSelection = 10,
  sectionFilter, // EPIC 20: Section filtering
}) => {
  const [interfaces, setInterfaces] = useState<Interface[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>(selectedInterfaceIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [domainVersionFilters, setDomainVersionFilters] = useState<Record<string, string>>({});
  const [availableVersions, setAvailableVersions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setError(null);
    if (selectedDomainIds.length > 0) {
      fetchInterfacesForDomains();
    } else {
      setInterfaces([]);
    }
  }, [selectedDomainIds]);

  useEffect(() => {
    setSelectedInterfaces(selectedInterfaceIds);
  }, [selectedInterfaceIds]);

  const fetchInterfacesForDomains = async () => {
    try {
      setLoading(true);
      const response = await unifiedInterfaceService.getInterfacesByDomains(selectedDomainIds);
      
      console.log('Interface API response:', response);
      
      // Handle the response structure from the API
      const allInterfaces: Interface[] = [];
      const domainsData = response.domains || {};
      
      Object.entries(domainsData).forEach(([domainId, domainData]: [string, any]) => {
        if (domainData.interfaces && Array.isArray(domainData.interfaces)) {
          domainData.interfaces.forEach((iface: any) => {
            allInterfaces.push({
              id: iface.interface_id || iface.id,
              interface_name: iface.interface_name,
              interface_version: iface.interface_version || iface.version,
              description: iface.interface_description || iface.description || '',
              interface_type: iface.interface_type || 'unknown',
              confidence_score: iface.confidence_score || 95,
              domain_id: domainId,
              domain_name: domainData.domain_name,
              parameters: iface.parameters,
              enhanced_by_ai: iface.enhanced_by_ai || false
            });
          });
        }
      });
      
      console.log('Parsed interfaces:', allInterfaces);
      
      // Extract available versions for each domain
      const domainVersions: Record<string, string[]> = {};
      const domainFilters: Record<string, string> = {};
      
      Object.entries(domainsData).forEach(([domainId, domainData]: [string, any]) => {
        if (domainData.interfaces && Array.isArray(domainData.interfaces)) {
          const versions = new Set<string>();
          domainData.interfaces.forEach((iface: any) => {
            const version = iface.interface_version || iface.version || 'default';
            versions.add(version);
          });
          domainVersions[domainId] = ['all', ...Array.from(versions).sort()];
          domainFilters[domainId] = 'all'; // Default to show all versions
        }
      });
      
      setAvailableVersions(domainVersions);
      setDomainVersionFilters(domainFilters);
      setInterfaces(allInterfaces);
      // Auto-expand all domains initially
      setExpandedDomains(new Set(selectedDomainIds));
    } catch (error) {
      console.error('Failed to fetch interfaces:', error);
      setError('Failed to load interfaces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterface = (interfaceId: string) => {
    let newSelection: string[];
    
    if (selectedInterfaces.includes(interfaceId)) {
      newSelection = selectedInterfaces.filter(id => id !== interfaceId);
    } else {
      if (selectedInterfaces.length >= maxSelection) {
        // Alert user about max selection
        return;
      }
      newSelection = [...selectedInterfaces, interfaceId];
    }
    
    setSelectedInterfaces(newSelection);
    onInterfacesSelected(newSelection);
  };

  const toggleDomainExpansion = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const toggleSectionExpansion = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const handleVersionFilterChange = (domainId: string, version: string) => {
    setDomainVersionFilters(prev => ({
      ...prev,
      [domainId]: version
    }));
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 95) return <Shield className="h-4 w-4 text-green-500" />;
    if (score >= 80) return <Activity className="h-4 w-4 text-blue-500" />;
    return <Zap className="h-4 w-4 text-amber-500" />;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    return 'text-amber-600 bg-amber-50';
  };

  // Filter interfaces by search query only
  const filteredInterfaces = interfaces
    .filter(iface => {
      const matchesSearch = 
        iface.interface_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        iface.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

  // Group interfaces by domain and section, applying version and section filters
  const interfacesByDomain = filteredInterfaces.reduce((acc, iface) => {
    // Apply version filter first
    const versionFilter = domainVersionFilters[iface.domain_id];
    if (versionFilter && versionFilter !== 'all') {
      const ifaceVersion = iface.interface_version || 'default';
      if (ifaceVersion !== versionFilter) {
        return acc; // Skip this interface
      }
    }
    
    // EPIC 20: Apply section filter
    const section = iface.sub_feature_section || 'General';
    if (sectionFilter && sectionFilter !== section) {
      return acc; // Skip this interface if it doesn't match the section filter
    }
    
    if (!acc[iface.domain_id]) {
      acc[iface.domain_id] = {
        domain_name: iface.domain_name || 'Unknown',
        sections: {}
      };
    }
    
    if (!acc[iface.domain_id].sections[section]) {
      acc[iface.domain_id].sections[section] = [];
    }
    
    acc[iface.domain_id].sections[section].push(iface);
    return acc;
  }, {} as Record<string, { domain_name: string; sections: Record<string, Interface[]> }>);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Interface Selection</h3>
            <p className="text-sm text-gray-600 mt-1">
              {sectionFilter 
                ? `EPIC 20: Filtered by "${sectionFilter}" section`
                : "Version-first workflow: Filter by version → Select by section → Choose interfaces"
              }
            </p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              {selectedInterfaces.length} selected
            </Badge>
            <div className="text-xs text-gray-500">
              {filteredInterfaces.length} total interfaces
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search interfaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Version and section filtering summary */}
          {(Object.entries(domainVersionFilters).some(([_, version]) => version !== 'all') || sectionFilter) && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs text-gray-600">Active filters:</span>
              {/* Version filters */}
              {Object.entries(domainVersionFilters)
                .filter(([_, version]) => version !== 'all')
                .map(([domainId, version]) => {
                  const domainName = interfacesByDomain[domainId]?.domain_name || domainId;
                  return (
                    <Badge 
                      key={domainId} 
                      variant="secondary" 
                      className="text-xs bg-blue-100 text-blue-700"
                    >
                      {domainName}: {version.startsWith('v') ? version : `v${version}`}
                    </Badge>
                  );
                })
              }
              {/* EPIC 20: Section filter */}
              {sectionFilter && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-amber-100 text-amber-700"
                >
                  📂 Section: {sectionFilter}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : Object.keys(interfacesByDomain).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedDomainIds.length === 0 
              ? "Select domains to view their interfaces"
              : "No interfaces found for selected domains"}
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {Object.entries(interfacesByDomain).map(([domainId, domainData]) => {
              const isExpanded = expandedDomains.has(domainId);
              // Count total interfaces in all sections
              const totalInterfaces = Object.values(domainData.sections).flat();
              const domainInterfaceCount = totalInterfaces.filter(i => 
                selectedInterfaces.includes(i.id)
              ).length;
              
              return (
                <div key={domainId} className="border rounded-lg">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => toggleDomainExpansion(domainId)}
                        className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{domainData.domain_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {totalInterfaces.length} interfaces
                        </Badge>
                        {domainInterfaceCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {domainInterfaceCount} selected
                          </Badge>
                        )}
                      </button>
                    </div>
                    
                    {/* Version Filter - Always visible for version-first workflow */}
                    {availableVersions[domainId] && availableVersions[domainId].length > 2 && (
                      <div className="mb-3">
                        <Label className="text-xs text-gray-600 mb-1 block">Filter by Version:</Label>
                        <Select
                          value={domainVersionFilters[domainId] || 'all'}
                          onValueChange={(value) => handleVersionFilterChange(domainId, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableVersions[domainId].map(version => (
                              <SelectItem key={version} value={version} className="text-xs">
                                {version === 'all' ? 'All Versions' : 
                                 version === 'default' ? 'Default' : 
                                 version.startsWith('v') ? version : `v${version}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t">
                      {/* Render sections */}
                      <div className="divide-y">
                        {Object.entries(domainData.sections).map(([sectionName, sectionInterfaces]) => {
                          const sectionKey = `${domainId}-${sectionName}`;
                          const isSectionExpanded = expandedSections.has(sectionKey);
                          const sectionSelectedCount = sectionInterfaces.filter(i => 
                            selectedInterfaces.includes(i.id)
                          ).length;
                          
                          return (
                            <div key={sectionKey}>
                              {/* Section Header */}
                              <button
                                onClick={() => toggleSectionExpansion(sectionKey)}
                                className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gray-50"
                              >
                                <div className="flex items-center gap-2">
                                  {isSectionExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                  <span className="font-medium text-sm">{sectionName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {sectionInterfaces.length} interface{sectionInterfaces.length !== 1 ? 's' : ''}
                                  </Badge>
                                  {sectionSelectedCount > 0 && (
                                    <Badge variant="default" className="text-xs">
                                      {sectionSelectedCount} selected
                                    </Badge>
                                  )}
                                  {/* Show active version filter if applied */}
                                  {domainVersionFilters[domainId] && domainVersionFilters[domainId] !== 'all' && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      {domainVersionFilters[domainId].startsWith('v') ? domainVersionFilters[domainId] : `v${domainVersionFilters[domainId]}`}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                              
                              {/* Section Interfaces */}
                              {isSectionExpanded && (
                                <div className="border-l-2 border-gray-200 ml-4">
                                  {sectionInterfaces
                                    .sort((a, b) => {
                                      // Sort by version first (newest first), then by name
                                      const versionA = a.interface_version || 'default';
                                      const versionB = b.interface_version || 'default';
                                      if (versionA !== versionB) {
                                        if (versionA === 'default') return 1;
                                        if (versionB === 'default') return -1;
                                        return versionB.localeCompare(versionA);
                                      }
                                      return a.interface_name.localeCompare(b.interface_name);
                                    })
                                    .map(iface => {
                            const isSelected = selectedInterfaces.includes(iface.id);
                            
                            return (
                          <div
                            key={iface.id}
                            className={cn(
                              "px-4 py-3 transition-all cursor-pointer border-2 relative",
                              isSelected 
                                ? "bg-red-50 border-red-500 hover:bg-red-100 hover:border-red-600" 
                                : "bg-white border-transparent hover:bg-yellow-50 hover:border-amber-400"
                            )}
                            onClick={() => toggleInterface(iface.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleInterface(iface.id)}
                                className="mt-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn(
                                    "font-medium transition-colors",
                                    isSelected 
                                      ? "text-red-800 font-semibold" 
                                      : "text-gray-900 hover:text-amber-700"
                                  )}>
                                    {iface.interface_name}
                                  </span>
                                  {iface.interface_version && (
                                    <Badge 
                                      variant={isSelected ? "destructive" : "default"} 
                                      className={cn(
                                        "text-xs font-medium",
                                        // Highlight if this version matches the filter
                                        domainVersionFilters[domainId] === iface.interface_version
                                          ? "ring-2 ring-blue-400 bg-blue-100 text-blue-800"
                                          : ""
                                      )}
                                    >
                                      {iface.interface_version.startsWith('v') ? iface.interface_version : `v${iface.interface_version}`}
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      isSelected ? "border-red-300 text-red-700" : "border-gray-300"
                                    )}
                                  >
                                    {iface.interface_type}
                                  </Badge>
                                  {iface.enhanced_by_ai && (
                                    <Badge 
                                      variant="secondary" 
                                      className={cn(
                                        "text-xs",
                                        isSelected ? "bg-red-100 text-red-700" : ""
                                      )}
                                    >
                                      AI Enhanced
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className={cn(
                                  "text-sm mb-2 line-clamp-1 transition-colors",
                                  isSelected ? "text-red-600" : "text-gray-600"
                                )}>
                                  {iface.description}
                                </p>
                                
                                <div className="flex items-center gap-2">
                                  {getConfidenceIcon(iface.confidence_score)}
                                  <span className={cn(
                                    "text-sm font-medium px-2 py-1 rounded-full",
                                    getConfidenceColor(iface.confidence_score)
                                  )}>
                                    {iface.confidence_score}% confidence
                                  </span>
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {selectedInterfaces.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedInterfaces.length} interface{selectedInterfaces.length !== 1 ? 's' : ''} selected
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedInterfaces([]);
                  onInterfacesSelected([]);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};