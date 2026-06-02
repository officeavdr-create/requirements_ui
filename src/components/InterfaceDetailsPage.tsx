import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface InterfaceDetail {
  interface_id: string;
  interface_name: string;
  interface_description: string;
  parameters?: Array<{
    name: string;
    type: string;
    description: string;
    required?: boolean;
  }>;
  return_type?: string;
  return_description?: string;
}

interface InterfaceDetailsPageProps {
  domainId: string;
  domainName: string;
  version: string;
  onBack: () => void;
  onInterfacesSelected: (interfaceIds: string[]) => void;
  preSelectedIds?: string[];
}

export const InterfaceDetailsPage: React.FC<InterfaceDetailsPageProps> = ({
  domainId,
  domainName,
  version,
  onBack,
  onInterfacesSelected,
  preSelectedIds = []
}) => {
  const [interfaces, setInterfaces] = useState<InterfaceDetail[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preSelectedIds));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterfaces();
  }, [domainId, version]);

  const fetchInterfaces = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/v1/interfaces/by-version/${domainId}/${version}`);
      setInterfaces(response.data.interfaces || []);
    } catch (err) {
      setError('Failed to load interfaces');
      console.error('Error fetching interfaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInterface = (interfaceId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(interfaceId)) {
      newSelection.delete(interfaceId);
    } else {
      newSelection.add(interfaceId);
    }
    setSelectedIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === interfaces.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(interfaces.map(i => i.interface_id)));
    }
  };

  const handleConfirmSelection = () => {
    onInterfacesSelected(Array.from(selectedIds));
    onBack();
  };

  const formatParameters = (params?: any[]) => {
    if (!params || params.length === 0) return 'None';
    
    return params.map(p => (
      <span key={p.name} className="inline-flex items-center gap-1">
        <span className="font-mono text-sm">{p.name}</span>
        <span className="text-gray-500">:</span>
        <span className="text-blue-600">{p.type}</span>
        {p.required && <span className="text-red-500">*</span>}
      </span>
    )).reduce((prev, curr, idx) => (
      <>{prev}{idx > 0 && ', '}{curr}</>
    ), <></>);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold">{domainName} Interfaces</h2>
            <p className="text-sm text-gray-500">Version {version}</p>
          </div>
        </div>
        
        {interfaces.length > 0 && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {selectedIds.size} of {interfaces.length} selected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedIds.size === interfaces.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : interfaces.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No interfaces found for this version.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {interfaces.map(iface => (
              <Card 
                key={iface.interface_id}
                className={`cursor-pointer transition-all ${
                  selectedIds.has(iface.interface_id) 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                    : 'hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleToggleInterface(iface.interface_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.has(iface.interface_id)}
                      onCheckedChange={() => handleToggleInterface(iface.interface_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{iface.interface_name}</h3>
                        {iface.return_type && (
                          <Badge variant="outline" className="text-xs">
                            Returns: {iface.return_type}
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm line-clamp-1 ${
                        selectedIds.has(iface.interface_id) ? 'text-gray-100' : 'text-gray-600'
                      }`}>
                        {iface.interface_description?.substring(0, 100)}
                        {iface.interface_description && iface.interface_description.length > 100 ? '...' : ''}
                      </p>
                      
                      {iface.parameters && iface.parameters.length > 0 && (
                        <div className={`text-sm ${
                          selectedIds.has(iface.interface_id) ? 'text-gray-200' : ''
                        }`}>
                          <span className={
                            selectedIds.has(iface.interface_id) ? 'text-gray-300' : 'text-gray-500'
                          }>Parameters: </span>
                          {formatParameters(iface.parameters)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Selection ({selectedIds.size})
            </Button>
          </div>
        </>
      )}
    </div>
  );
};