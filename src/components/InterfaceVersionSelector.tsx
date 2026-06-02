import React, { useState, useEffect } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';

interface InterfaceVersion {
  version: string;
  interface_count: number;
  last_updated?: string;
}

interface InterfaceVersionSelectorProps {
  sessionId: string;
  selectedDomainIds: string[];
  onVersionSelected: (domainId: string, version: string) => void;
  onProceed: () => void;
  onSelectInterfaces?: (domainId: string, domainName: string, version: string) => void;
}

export const InterfaceVersionSelector: React.FC<InterfaceVersionSelectorProps> = ({
  sessionId,
  selectedDomainIds,
  onVersionSelected,
  onProceed,
  onSelectInterfaces
}) => {
  const [domainVersions, setDomainVersions] = useState<Record<string, InterfaceVersion[]>>({});
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainNames, setDomainNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedDomainIds.length > 0) {
      fetchVersionsForDomains();
    }
  }, [selectedDomainIds]);

  const fetchVersionsForDomains = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const versionsData: Record<string, InterfaceVersion[]> = {};
      const names: Record<string, string> = {};
      
      // Fetch versions for each domain
      for (const domainId of selectedDomainIds) {
        try {
          // First get domain info
          const domainResponse = await axios.get(`/api/v1/domains/${domainId}`);
          names[domainId] = domainResponse.data.name || 'Unknown Domain';
          
          // Then get interface versions
          const response = await axios.get(`/api/v1/interfaces/versions/${domainId}`);
          versionsData[domainId] = response.data.versions || [];
        } catch (err) {
          console.error(`Failed to fetch versions for domain ${domainId}:`, err);
          versionsData[domainId] = [];
        }
      }
      
      setDomainVersions(versionsData);
      setDomainNames(names);
      
      // Auto-select the latest version for each domain
      const autoSelected: Record<string, string> = {};
      Object.entries(versionsData).forEach(([domainId, versions]) => {
        if (versions.length > 0) {
          autoSelected[domainId] = versions[0].version; // Assuming versions are sorted by date
        }
      });
      setSelectedVersions(autoSelected);
      
    } catch (err) {
      setError('Failed to load interface versions');
      console.error('Error fetching versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (domainId: string, version: string) => {
    setSelectedVersions(prev => ({
      ...prev,
      [domainId]: version
    }));
    onVersionSelected(domainId, version);
  };

  const canProceed = () => {
    return selectedDomainIds.every(domainId => selectedVersions[domainId]);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {selectedDomainIds.map(domainId => {
              const versions = domainVersions[domainId] || [];
              const domainName = domainNames[domainId] || 'Unknown Domain';
              const selectedVersion = selectedVersions[domainId];
              
              return (
                <Card key={domainId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-lg">{domainName}</CardTitle>
                      </div>
                      {versions.length === 0 && (
                        <Badge variant="outline" className="text-yellow-600">
                          No interfaces available
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {versions.length > 0 ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Select Interface Specification Version
                        </label>
                        <Select
                          value={selectedVersion}
                          onValueChange={(value) => handleVersionChange(domainId, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a version" />
                          </SelectTrigger>
                          <SelectContent>
                            {versions.map(version => (
                              <SelectItem key={version.version} value={version.version}>
                                <div className="flex items-center justify-between w-full">
                                  <span>Version {version.version}</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {version.interface_count} interfaces
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedVersion && onSelectInterfaces && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectInterfaces(domainId, domainName, selectedVersion)}
                            className="mt-2 w-full"
                          >
                            Select Interfaces for this Version
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No interface specifications found for this domain.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={onProceed}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Continue to Interface Selection
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};