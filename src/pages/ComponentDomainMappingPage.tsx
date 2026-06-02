import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Search, AlertCircle, CheckCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ComponentDomainMapping {
  id: string;
  component_name: string;
  domain_name: string;
}

interface DomainType {
  id: string;
  domain_type: string;
  description: string;
}

const PREDEFINED_COMPONENTS = [
  'SW_CDC_HMI_CONNECTIVITY',
  'SW_CDC_HMI_HOME',
  'SW_CDC_HMI_MEDIA',
  'SW_CDC_AUDIO_AUDIO',
  'SW_CDC_IVI_BT',
  'SW_CDC_RUI_CPSTACK',
  'SW_CDC_DEL_EU',
  'SW_CDC_HMI_VEHICLE',
  'SW_CDC_ALLGO_PM',
  'SW_DI_APP_METERS',
  'SW_CDC_RUI_MRM',
  'SW_CDC_HMI_COREUX',
  'SW_CDC_VHAL_DIAGNOSTICS',
  'SW_CDC_INTEGRATION_TEST',
  'SW_IVI_FV',
  'SW_DI_SW',
  'SW_CDC_AUDIO_TUNER',
  'SW_CDC_AOSP_FRAMEWORK',
  'Systems',
  'SW_CDC_IVI_FO',
  'SW_CDC_IVI_WIFI',
  'SW_DI_APP_DISPLAY',
  'SW_CDC_AOSP_NATIVE',
  'SW_CDC_INTEGRATION',
  'SW_CDC_RUI_DCM',
  'SW_CDC_RUI_AAPSTACK',
  'SW_CDC_DEL_NA',
  'SW_CDC_MEDIA_MEDIA',
  'SW_CDC_BSP_PLATFORM',
  'SW_CDC_BSP_SUBSYSTEM',
  'SW_DI_AUT_BSW',
  'SW_CDC_DEL_AP',
  'SW_DI_INF_CYBERSECURITY',
  'SW_CDC_APPSTORE',
  'SW_CDC_AUDIO_VR',
  'SW_CDC_IVI_ARCH',
  'SW_CDC_RUI_TEST',
  'SW_DI_HMI_DESIGNSTUDIO',
  'SW_DI_INF_SW_UPDATE',
  'CDC_IVI_FO',
  'SW_DI_ARCH',
  'SW_DI_INF_MW',
  'SW_DI_IT_INTEGRATION',
  'ME_Design',
  'HW',
  'HW_Arch',
  'HW_CE',
  'HW_ECAD',
  'HW_EDS',
  'HW_TP/TF'
];

const ComponentDomainMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<ComponentDomainMapping[]>([]);
  const [domainTypes, setDomainTypes] = useState<DomainType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [componentSearch, setComponentSearch] = useState('');
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [customComponent, setCustomComponent] = useState('');

  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    loadMappings();
    loadDomainTypes();
  }, []);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/component-domains');
      if (!response.ok) throw new Error('Failed to load mappings');
      const data = await response.json();
      setMappings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDomainTypes = async () => {
    try {
      const response = await fetch('/api/v1/component-domains/available-domains');
      if (!response.ok) throw new Error('Failed to load domain types');
      const data = await response.json();
      setDomainTypes(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredComponents = PREDEFINED_COMPONENTS.filter(comp =>
    comp.toLowerCase().includes(componentSearch.toLowerCase())
  );

  const handleCreateMapping = async () => {
    const componentName = customComponent.trim() || selectedComponent;
    
    if (!componentName || !selectedDomain) {
      setError('Please select both component and domain');
      return;
    }

    setConfirmMessage(
      `Are you sure you want to map component "${componentName}" to domain "${selectedDomain}"?`
    );
    setConfirmAction(() => async () => {
      try {
        const response = await fetch('/api/v1/component-domains', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            component_name: componentName,
            domain_name: selectedDomain
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to create mapping');
        }

        setSuccess('Mapping created successfully!');
        resetForm();
        await loadMappings();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message);
      }
    });
    setShowConfirm(true);
  };

  const handleDeleteMapping = async (id: string, componentName: string, domainName: string) => {
    setConfirmMessage(
      `Are you sure you want to delete the mapping "${componentName}" → "${domainName}"?`
    );
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`/api/v1/component-domains/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete mapping');

        setSuccess('Mapping deleted successfully!');
        await loadMappings();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message);
      }
    });
    setShowConfirm(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setSelectedComponent('');
    setSelectedDomain('');
    setCustomComponent('');
    setComponentSearch('');
    setShowComponentDropdown(false);
  };

  const executeConfirmAction = () => {
    confirmAction();
    setShowConfirm(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Component-Domain Mapping</h1>
          <p className="text-gray-400 mt-1">Map software components to domain types</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadMappings}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Mapping
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/20 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Success</AlertTitle>
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="bg-gray-800/70 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create New Mapping</CardTitle>
            <CardDescription className="text-gray-400">
              Map a component to a domain type from the registry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Component Selection */}
              <div className="space-y-2">
                <Label className="text-gray-300">Component Name</Label>
                <div className="relative">
                  <Input
                    placeholder="Search or enter component name..."
                    value={componentSearch || customComponent}
                    onChange={(e) => {
                      setComponentSearch(e.target.value);
                      setCustomComponent(e.target.value);
                      setShowComponentDropdown(true);
                    }}
                    onFocus={() => setShowComponentDropdown(true)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  
                  {/* Dropdown */}
                  {showComponentDropdown && filteredComponents.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                      {filteredComponents.map((comp) => (
                        <button
                          key={comp}
                          onClick={() => {
                            setSelectedComponent(comp);
                            setCustomComponent('');
                            setComponentSearch(comp);
                            setShowComponentDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-600 text-white text-sm"
                        >
                          {comp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {customComponent && !PREDEFINED_COMPONENTS.includes(customComponent) && (
                  <p className="text-xs text-yellow-400">
                    Custom component: Will be added to database
                  </p>
                )}
              </div>

              {/* Domain Selection */}
              <div className="space-y-2">
                <Label className="text-gray-300">Domain Type</Label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select domain type...</option>
                  {domainTypes.map((domain) => (
                    <option key={domain.id} value={domain.domain_type}>
                      {domain.domain_type} {domain.description && `- ${domain.description}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreateMapping}
                disabled={(!selectedComponent && !customComponent.trim()) || !selectedDomain}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Mapping
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mappings List */}
      <Card className="bg-gray-800/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Current Mappings</CardTitle>
          <CardDescription className="text-gray-400">
            {mappings.length} component-domain mapping{mappings.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
              <span className="ml-3 text-lg text-gray-300">Loading mappings...</span>
            </div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No mappings found. Create your first mapping to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <LinkIcon className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="font-medium text-white">{mapping.component_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400">→</span>
                        <Badge variant="outline" className="bg-cyan-900/20 text-cyan-300 border-cyan-500">
                          {mapping.domain_name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteMapping(mapping.id, mapping.component_name, mapping.domain_name)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-white">Confirm Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{confirmMessage}</p>
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setShowConfirm(false)}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeConfirmAction}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComponentDomainMappingPage;
