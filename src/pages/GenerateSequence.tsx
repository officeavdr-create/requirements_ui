import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Zap, Settings, ChevronDown, ChevronRight, Download, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

import { interfaceAPI } from '../services/api';
import { Interface, InterfaceSearchRequest, GenerateDiagramRequest, Domain } from '../types/interface';
import FileUpload from '../components/FileUpload';
import InterfaceSelector from '../components/InterfaceSelector';
import MermaidViewer from '../components/MermaidViewer';

const HomePage: React.FC = () => {
  const queryClient = useQueryClient();

  // State
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [requirements, setRequirements] = useState('');
  const [selectedInterfaces, setSelectedInterfaces] = useState<Interface[]>([]);
  const [useRequirementsForSearch, setUseRequirementsForSearch] = useState(false);
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set(['interfaces']));
  const [generatedDiagram, setGeneratedDiagram] = useState<string>('');
  const [includeDomainKnowledge, setIncludeDomainKnowledge] = useState(false);
  const [enhanceRequirements, setEnhanceRequirements] = useState(false);
  const [enhancedRequirementsText, setEnhancedRequirementsText] = useState<string | undefined>(undefined);
  const [isEnhancingForGeneration, setIsEnhancingForGeneration] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'enhance' | 'diagram'>('enhance');
  const [editedEnhancePrompt, setEditedEnhancePrompt] = useState('');
  const [editedDiagramPrompt, setEditedDiagramPrompt] = useState('');
  const [excelRequirements, setExcelRequirements] = useState<string[]>([]);
  const [selectedExcelIndices, setSelectedExcelIndices] = useState<number[]>([]);
  const [selectedKnowledgeDomains, setSelectedKnowledgeDomains] = useState<string[]>([]);

  // Queries
  const { data: domains = [], isLoading: domainsLoading, error: domainsError } = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      try {
        const response = await interfaceAPI.getDomains();
        console.log('Domains fetched in useQuery:', response);
        return response ?? [];
      } catch (error) {
        console.error('Error fetching domains in useQuery:', error);
        toast.error('Failed to load domains. Please try again.');
        return [];
      }
    },
  });

  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: ['versions', selectedDomain],
    queryFn: async () => {
      try {
        const response = await interfaceAPI.getVersions(selectedDomain || undefined);
        console.log('Versions fetched for domain', selectedDomain, ':', response.versions);
        return response.versions ?? [];
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast.error('Failed to load versions. Please try again.');
        return [];
      }
    },
    enabled: !!selectedDomain,
  });

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      try {
        const response = await interfaceAPI.getModels();
        return response ?? [];
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Failed to load models. Please try again.');
        return [];
      }
    },
  });

  const { data: baseEnhancePrompt = '', isLoading: enhancePromptLoading } = useQuery({
    queryKey: ['baseEnhancePrompt'],
    queryFn: async () => {
      try {
        const response = await interfaceAPI.getEnhancePrompt();
        console.log('baseEnhancePrompt fetched:', response);
        return response;
      } catch (error) {
        console.error('Error in useQuery for enhance prompt:', error);
        toast.error('Failed to load enhance prompt. Using default.');
        return '';
      }
    },
  });

  const { data: baseDiagramPrompt = '', isLoading: diagramPromptLoading } = useQuery({
    queryKey: ['baseDiagramPrompt'],
    queryFn: async () => {
      try {
        const response = await interfaceAPI.getDiagramPrompt();
        console.log('baseDiagramPrompt fetched:', response);
        return response;
      } catch (error) {
        console.error('Error in useQuery for diagram prompt:', error);
        toast.error('Failed to load diagram prompt. Using default.');
        return '';
      }
    },
  });

  const getDomainName = (domainId: string | undefined): string => {
    if (!domainId) return 'Unknown Domain';
    const domain = domains.find(d => d.id === domainId);
    return domain?.name || 'Unknown Domain';
  };

  const { data: allInterfaces = [], isLoading: interfacesLoading, refetch: refetchInterfaces } = useQuery({
    queryKey: ['interfaces', selectedDomain, selectedVersion],
    queryFn: async () => {
      try {
        const interfaces = await interfaceAPI.getInterfaces(selectedVersion || undefined, selectedDomain || undefined);
        console.log('All interfaces fetched:', interfaces);
        return interfaces ?? [];
      } catch (error) {
        console.error('Error fetching interfaces:', error);
        toast.error('Failed to load interfaces. Please try again.');
        return [];
      }
    },
    enabled: !!selectedDomain && !!selectedVersion,
  });

  const { data: similarInterfaces = { interfaces: [], total_count: 0 }, isLoading: searchLoading } = useQuery({
    queryKey: ['similarInterfaces', selectedDomain, selectedVersion, requirements, useRequirementsForSearch],
    queryFn: async () => {
      if (!useRequirementsForSearch || !requirements.trim() || !selectedDomain || !selectedVersion) {
        return { interfaces: [], total_count: 0 };
      }
      try {
        const result = await interfaceAPI.searchInterfaces({
          requirements: requirements.trim(),
          version: selectedVersion,
          domain_id: selectedDomain,
          top_k: 10,
          similarity_threshold: 0.3,
        } as InterfaceSearchRequest);
        console.log('Similar interfaces fetched:', result);
        return result ?? { interfaces: [], total_count: 0 };
      } catch (error) {
        console.error('Error fetching similar interfaces:', error);
        toast.error('Failed to load similar interfaces. Please try again.');
        return { interfaces: [], total_count: 0 };
      }
    },
    enabled: useRequirementsForSearch && !!requirements.trim() && !!selectedDomain && !!selectedVersion,
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: interfaceAPI.uploadFile,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['versions'] });
      queryClient.invalidateQueries({ queryKey: ['interfaces'] });
      setOpenSteps(prev => new Set(prev).add('interfaces'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Upload failed');
    },
  });

  const extractExcelMutation = useMutation({
    mutationFn: interfaceAPI.extractRequirementsFromExcel,
    onSuccess: (data) => {
      setExcelRequirements(data.requirements);
      const allIndices = data.requirements.map((_: any, i: number) => i);
      setSelectedExcelIndices(allIndices);
      setRequirements(data.requirements.join('\n\n'));
      toast.success('Excel requirements extracted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Excel extraction failed');
    },
  });

  const enhanceRequirementsMutation = useMutation({
    mutationFn: async () => {
      console.log('Using editedEnhancePrompt in enhanceRequirements:', editedEnhancePrompt); // Log prompt used
      const response = await interfaceAPI.enhanceRequirements({
        requirements: requirements.trim(),
        selected_interfaces: selectedInterfaces,
        include_domain_knowledge: includeDomainKnowledge,
        // selected_knowledge_domains: selectedKnowledgeDomains,
        model_name: selectedModel || undefined,
        custom_prompt: editedEnhancePrompt || undefined,
      });
      return response;
    },
    onSuccess: (data) => {
      setEnhancedRequirementsText(data.enhanced_requirements);
      setIsEnhancingForGeneration(false);
      toast.success('Requirements enhanced successfully!');
    },
    onError: (error: any) => {
      setIsEnhancingForGeneration(false);
      toast.error(error.response?.data?.detail || 'Enhancement failed');
      setEnhancedRequirementsText(undefined);
    },
  });

  const generateMutation = useMutation({
    mutationFn: (request: GenerateDiagramRequest) => {
      console.log('Using editedDiagramPrompt in generateDiagram:', editedDiagramPrompt); // Log prompt used
      return interfaceAPI.generateDiagram({
        ...request,
        include_domain_knowledge: includeDomainKnowledge,
        // selected_knowledge_domains: selectedKnowledgeDomains,
        model_name: selectedModel || undefined,
        custom_prompt: editedDiagramPrompt || undefined,
        diagram_prompt: editedDiagramPrompt || undefined,
      });
    },
    onSuccess: (data) => {
      setGeneratedDiagram(data.mermaid_code);
      toast.success('Diagram generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Generation failed');
    },
  });

  // Handlers
  const handleFileUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      extractExcelMutation.mutate(file);
    }
  };

  const handleInterfaceToggle = (interface_: Interface) => {
    setSelectedInterfaces(prev => {
      const exists = prev.find(item => item.id === interface_.id);
      if (exists) {
        return prev.filter(item => item.id !== interface_.id);
      } else {
        return [...prev, interface_];
      }
    });
  };

  const handleGenerateDiagram = () => {
    if (!requirements.trim()) {
      toast.error('Please enter requirements');
      return;
    }

    const needsEnhancement = enhanceRequirements && !enhancedRequirementsText;

    if (needsEnhancement) {
      setIsEnhancingForGeneration(true);
      enhanceRequirementsMutation.mutate(undefined, {
        onSuccess: (enhancementData) => {
          const request: GenerateDiagramRequest = {
            requirements: requirements.trim(),
            selected_interfaces: selectedInterfaces,
            enhance_requirements: true,
            include_domain_knowledge: includeDomainKnowledge,
            enhanced_requirements: enhancementData.enhanced_requirements,
            model_name: selectedModel || undefined,
          };
          generateMutation.mutate(request);
        },
        onError: () => {
          const request: GenerateDiagramRequest = {
            requirements: requirements.trim(),
            selected_interfaces: selectedInterfaces,
            enhance_requirements: false,
            include_domain_knowledge: includeDomainKnowledge,
            model_name: selectedModel || undefined,
          };
          generateMutation.mutate(request);
        },
      });
    } else {
      const request: GenerateDiagramRequest = {
        requirements: requirements.trim(),
        selected_interfaces: selectedInterfaces,
        enhance_requirements: enhanceRequirements,
        include_domain_knowledge: includeDomainKnowledge,
        enhanced_requirements: enhanceRequirements ? enhancedRequirementsText : undefined,
        model_name: selectedModel || undefined,
      };
      generateMutation.mutate(request);
    }
  };

  const handleDownloadEnhancedSWE = () => {
    if (!enhancedRequirementsText) return;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `enhanced_requirements_${timestamp}.md`;
    const blob = new Blob([enhancedRequirementsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Enhanced requirements downloaded successfully!');
  };

  const handleReEnhance = () => {
    setEnhancedRequirementsText(undefined);
    enhanceRequirementsMutation.mutate();
  };

  const handleRegenerateDiagram = () => {
    setGeneratedDiagram('');
    handleGenerateDiagram();
  };

  const handleOpenPromptModal = () => {
    console.log('Opening prompt modal with:', { baseEnhancePrompt, baseDiagramPrompt }); // Log current prompts
    queryClient.invalidateQueries({ queryKey: ['baseEnhancePrompt'] });
    queryClient.invalidateQueries({ queryKey: ['baseDiagramPrompt'] });
    setEditedEnhancePrompt(baseEnhancePrompt);
    setEditedDiagramPrompt(baseDiagramPrompt);
    setCurrentTab('enhance');
    setIsPromptModalOpen(true);
  };

  const handlePromptDone = () => {
    console.log('Prompt modal closed with:', { editedEnhancePrompt, editedDiagramPrompt }); // Log final prompts
    setIsPromptModalOpen(false);
  };

  const handleKnowledgeDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedKnowledgeDomains(selectedOptions);
  };

  const toggleExcelSelection = (index: number) => {
    setSelectedExcelIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSelectAllExcel = () => {
    if (selectedExcelIndices.length === excelRequirements.length) {
      setSelectedExcelIndices([]);
    } else {
      setSelectedExcelIndices(excelRequirements.map((_, i) => i));
    }
  };

  // Auto-select first domain id when available
  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].id);
    }
  }, [domains]);

  // Auto-select first version when available
  useEffect(() => {
    if (versions.length > 0 && !selectedVersion) {
      setSelectedVersion(versions[0]);
    }
  }, [versions]);

  // Auto-select similar interfaces when fetched
  useEffect(() => {
    if (useRequirementsForSearch && similarInterfaces?.interfaces) {
      const newInterfaces = similarInterfaces.interfaces.filter(
        searchInterface => !selectedInterfaces.some(selected => selected.id === searchInterface.id)
      );
      if (newInterfaces.length > 0) {
        setSelectedInterfaces(prev => [...prev, ...newInterfaces]);
      }
    }
  }, [similarInterfaces, useRequirementsForSearch]);

  // Clear enhanced requirements when dependencies change
  useEffect(() => {
    setEnhancedRequirementsText(undefined);
  }, [requirements, selectedInterfaces, includeDomainKnowledge]);

  // Clear enhanced requirements when checkbox is unchecked
  useEffect(() => {
    if (!enhanceRequirements) {
      setEnhancedRequirementsText(undefined);
    }
  }, [enhanceRequirements]);

  // Update requirements when selected excel changes
  useEffect(() => {
    if (excelRequirements.length > 0) {
      const selectedReqs = selectedExcelIndices.map(i => excelRequirements[i]).join('\n\n');
      setRequirements(selectedReqs);
    }
  }, [selectedExcelIndices, excelRequirements]);

  // Sync edited prompts with base prompts
  useEffect(() => {
    console.log('Syncing baseEnhancePrompt:', baseEnhancePrompt);
    if (baseEnhancePrompt) {
      setEditedEnhancePrompt(baseEnhancePrompt);
    }
  }, [baseEnhancePrompt]);

  useEffect(() => {
    console.log('Syncing baseDiagramPrompt:', baseDiagramPrompt);
    if (baseDiagramPrompt) {
      setEditedDiagramPrompt(baseDiagramPrompt);
    }
  }, [baseDiagramPrompt]);

  const displayInterfaces = allInterfaces;

  // Toggle accordion step
  const toggleStep = (step: string) => {
    setOpenSteps(prev => {
      const newSteps = new Set(prev);
      if (newSteps.has(step)) {
        newSteps.delete(step);
      } else {
        newSteps.add(step);
      }
      return newSteps;
    });
  };

  const isGenerating = generateMutation.isPending || isEnhancingForGeneration;

  return (
    <div className="min-h-screen bg-gray-900 p-3 md:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl border border-gray-600 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generate Sequence Diagram</h2>
              <p className="text-gray-300 text-xs">
                Create enhanced Mermaid sequence diagrams from requirements
              </p>
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Column - Interface Selection & Domain Knowledge */}
          <div className="lg:col-span-1 space-y-4">
            {/* Interface Selection */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
              <button
                onClick={() => toggleStep('interfaces')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/50 transition-all duration-200 rounded-t-xl"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-600 rounded-md">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">Interface Selection</span>
                    <p className="text-gray-400 text-xs">Browse and select interfaces</p>
                  </div>
                </div>
                {openSteps.has('interfaces') ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {openSteps.has('interfaces') && (
                <div className="p-3 border-t border-gray-700 space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-300 mb-1 block">Domain</label>
                      <select
                        value={selectedDomain || ''}
                        onChange={e => setSelectedDomain(e.target.value || null)}
                        className="w-full border border-gray-600 rounded-md px-2 py-1.5 text-xs bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={domainsLoading}
                      >
                        <option value="">Select domain...</option>
                        {domains.map(domain => (
                          <option key={domain.id} value={domain.id}>
                            {domain.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDomain && (
                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1 block">Version</label>
                        <select
                          value={selectedVersion}
                          onChange={e => setSelectedVersion(e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-2 py-1.5 text-xs bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={versionsLoading}
                        >
                          <option value="">Select version...</option>
                          {versionsLoading ? (
                            <option value="">Loading...</option>
                          ) : versions.length > 0 ? (
                            versions.map(version => (
                              <option key={version} value={version}>
                                {version}
                              </option>
                            ))
                          ) : (
                            <option value="">No versions</option>
                          )}
                        </select>
                      </div>
                    )}
                  </div>

                  {domainsError && (
                    <div className="text-red-400 text-xs bg-red-900/20 border border-red-800 rounded-md p-2">
                      Domain loading error
                    </div>
                  )}

                  {useRequirementsForSearch && similarInterfaces.total_count > 0 && (
                    <div className="text-xs text-blue-400 bg-blue-900/20 border border-blue-800 rounded-md p-2">
                      Found {similarInterfaces.total_count} similar interfaces
                    </div>
                  )}

                  {selectedDomain && selectedVersion && (
                    <InterfaceSelector
                      interfaces={displayInterfaces}
                      selectedInterfaces={selectedInterfaces}
                      onInterfaceToggle={handleInterfaceToggle}
                      loading={interfacesLoading}
                      domains={domains}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Domain Knowledge Selection */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
              <div className="p-3 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-600 rounded-md">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">Domain Knowledge</span>
                    <p className="text-gray-400 text-xs">Select knowledge domains</p>
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeDomainKnowledge"
                    checked={includeDomainKnowledge}
                    onChange={e => setIncludeDomainKnowledge(e.target.checked)}
                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="includeDomainKnowledge" className="ml-2 text-xs text-gray-300">
                    Include domain-specific knowledge from selected domains
                  </label>
                </div>

                {includeDomainKnowledge && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-300">
                      Select Knowledge Domains (Ctrl/Cmd for multiple)
                    </label>
                    <select
                      multiple
                      value={selectedKnowledgeDomains}
                      onChange={handleKnowledgeDomainChange}
                      className="w-full border border-gray-600 rounded-md px-2 py-1.5 text-xs bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={domainsLoading}
                      size={Math.min(domains.length, 5)}
                    >
                      {domains.map(domain => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                    {selectedKnowledgeDomains.length > 0 && (
                      <div className="text-xs text-green-400">
                        {selectedKnowledgeDomains.length} domain(s) selected for knowledge integration
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Requirements & Generated Diagram */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <label className="block text-xs font-semibold text-white uppercase tracking-wide">
                      Software Requirements
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-medium text-gray-300">Model</label>
                    <select
                      value={selectedModel}
                      onChange={e => setSelectedModel(e.target.value)}
                      className="border border-gray-600 rounded-md px-2 py-1.5 text-xs bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={modelsLoading}
                    >
                      <option value="">Select model...</option>
                      {models.map(model_name => (
                        <option key={model_name} value={model_name}>
                          {model_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  rows={5}
                  className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Domain A sends a request to Domain B via Interface X.
Domain B processes the request using validation service.
Domain B responds to Domain A via Interface Y with results."
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                />

                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3">
                    <label
                      htmlFor="excel-upload"
                      className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Excel</span>
                    </label>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                      disabled={extractExcelMutation.isPending}
                    />
                    {extractExcelMutation.isPending && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                    )}
                  </div>

                  <button
                    onClick={handleOpenPromptModal}
                    disabled={enhancePromptLoading || diagramPromptLoading}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="h-4 w-4" />
                    <span>Edit Prompts</span>
                  </button>
                </div>

                {excelRequirements.length > 0 && (
                  <div className="bg-gray-700/70 border border-gray-600 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">
                        Extracted Requirements ({excelRequirements.length})
                      </span>
                      <button
                        onClick={handleSelectAllExcel}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {selectedExcelIndices.length === excelRequirements.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {excelRequirements.map((req, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedExcelIndices.includes(index)}
                            onChange={() => toggleExcelSelection(index)}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700 mt-1"
                          />
                          <p className="text-xs text-gray-300 leading-tight">{req}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg p-2">
                    <input
                      type="checkbox"
                      id="useRequirementsForSearch"
                      checked={useRequirementsForSearch}
                      onChange={e => setUseRequirementsForSearch(e.target.checked)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="useRequirementsForSearch" className="text-xs text-gray-300">
                      Find similar interfaces
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg p-2">
                    <input
                      type="checkbox"
                      id="enhanceRequirements"
                      checked={enhanceRequirements}
                      onChange={e => setEnhanceRequirements(e.target.checked)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="enhanceRequirements" className="text-xs text-gray-300">
                      AI enhancement
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg p-2">
                    <input
                      type="checkbox"
                      id="includeDomainKnowledgeCenter"
                      checked={includeDomainKnowledge}
                      onChange={e => setIncludeDomainKnowledge(e.target.checked)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="includeDomainKnowledgeCenter" className="text-xs text-gray-300">
                      Domain knowledge
                    </label>
                  </div>
                </div>

                {enhanceRequirements && (
                  <div className="bg-gray-700/70 border border-gray-600 rounded-lg p-3">
                    {isEnhancingForGeneration ? (
                      <div className="flex items-center space-x-2 text-blue-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        <span className="text-xs font-medium">Enhancing with AI...</span>
                      </div>
                    ) : enhancedRequirementsText ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-green-400">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs font-semibold">Enhanced successfully!</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleDownloadEnhancedSWE}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition-all duration-200"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={handleReEnhance}
                            disabled={enhanceRequirementsMutation.isPending}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                          >
                            <Zap className="h-3 w-3" />
                            <span>Re-enhance</span>
                          </button>
                        </div>
                      </div>
                    ) : enhanceRequirementsMutation.isError ? (
                      <div className="flex items-center space-x-2 text-red-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs">Enhancement failed</span>
                      </div>
                    ) : null}
                  </div>
                )}

                <button
                  onClick={handleGenerateDiagram}
                  disabled={!requirements.trim() || isGenerating}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isEnhancingForGeneration ? 'Enhancing...' : 'Generating...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Generate Diagram</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {generatedDiagram && (
              <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-4">
                <MermaidViewer code={generatedDiagram} onRegenerate={handleRegenerateDiagram} />
              </div>
            )}
          </div>

          {/* Right Column - Selected Interfaces */}
          <div className="lg:col-span-1 space-y-4">
            {selectedInterfaces.length > 0 && (
              <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
                <div className="p-3 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Selected ({selectedInterfaces.length})
                    </h3>
                    <button
                      onClick={() => setSelectedInterfaces([])}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="p-3 max-h-80 overflow-y-auto space-y-2">
                  {selectedInterfaces.map(interface_ => (
                    <div
                      key={interface_.id}
                      className="group bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-800/50 rounded-lg p-2 hover:from-green-800/30 hover:to-green-700/30 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-green-100 text-xs truncate">
                              {interface_.interface_name}
                            </h4>
                            {interface_.similarity_score && (
                              <span className="text-xs bg-green-600 text-white px-1 py-0.5 rounded text-[10px] font-medium">
                                {(interface_.similarity_score * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-1">
                            <span className="text-xs bg-blue-600/80 text-blue-100 px-2 py-0.5 rounded-full font-medium">
                              {getDomainName(interface_.domain_id)}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">
                              v{interface_.version}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">
                              {interface_.interface_type}
                            </span>
                          </div>

                          {interface_.interface_description && (
                            <p className="text-xs text-gray-300 leading-tight line-clamp-2 mb-1">
                              {interface_.interface_description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 gap-1 text-[10px]">
                            {interface_.parameter_name && (
                              <div className="bg-gray-700/50 px-2 py-1 rounded">
                                <span className="font-medium text-gray-300">Param:</span>
                                <span className="text-white ml-1">
                                  {interface_.parameter_name} ({interface_.parameter_type})
                                </span>
                              </div>
                            )}
                            {interface_.return_type && (
                              <div className="bg-gray-700/50 px-2 py-1 rounded">
                                <span className="font-medium text-gray-300">Returns:</span>
                                <span className="text-white ml-1">{interface_.return_type}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleInterfaceToggle(interface_)}
                          className="ml-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prompt Edit Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Edit Prompts</h3>

            <div className="flex border-b border-gray-600 mb-4">
              <button
                onClick={() => setCurrentTab('enhance')}
                className={`px-4 py-2 text-sm font-medium ${
                  currentTab === 'enhance'
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-gray-300 hover:text-white'
                } transition-colors`}
              >
                Enhance Requirements Prompt
              </button>
              <button
                onClick={() => setCurrentTab('diagram')}
                className={`px-4 py-2 text-sm font-medium ml-8 ${
                  currentTab === 'diagram'
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-gray-300 hover:text-white'
                } transition-colors`}
              >
                Diagram Generation Prompt
              </button>
            </div>

            <div className="mb-4">
              {(enhancePromptLoading || diagramPromptLoading) ? (
                <div className="text-center text-gray-400">
                  Loading {currentTab === 'enhance' ? 'enhance' : 'diagram'} prompt...
                </div>
              ) : (
                <>
                  <textarea
                    rows={10}
                    className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={currentTab === 'enhance' ? editedEnhancePrompt : editedDiagramPrompt}
                    onChange={e => {
                      console.log(`Updating ${currentTab} prompt:`, e.target.value); // Log changes
                      if (currentTab === 'enhance') {
                        setEditedEnhancePrompt(e.target.value);
                      } else {
                        setEditedDiagramPrompt(e.target.value);
                      }
                    }}
                    placeholder={`Enter ${currentTab === 'enhance' ? 'enhance' : 'diagram'} prompt...`}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Current prompt length: {(currentTab === 'enhance' ? editedEnhancePrompt : editedDiagramPrompt).length} characters
                  </p>
                </>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Changes will be used in the sequence generation/enhancement.
              </p>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePromptDone}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;