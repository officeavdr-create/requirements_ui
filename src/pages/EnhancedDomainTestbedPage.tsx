// EnhancedDomainTestbedPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity } from 'lucide-react'; // Add to existing imports

import {
  Upload,
  Play,
  Download,
  Trash2, Copy, Check,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText,
  Layers,
  BrainCircuit,
  ArrowRight,
  Settings2,
  Sparkles,
  Eye,
  Files,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTestbed } from '@/hooks/useTestbed';
import { ProcessingStatus } from '@/services/types';
import { MultiDomainSelector } from '@/components/MultiDomainSelector';
import { InterfaceSelectionPanel } from '@/components/InterfaceSelectionPanel';
import { FourTierSelectorControlled } from '@/components/FourTierSelectorControlled';
import { FourTierSelectorEnhanced } from '@/components/FourTierSelectorEnhanced';
import { testbedService, promptService } from '@/services';
import AIPromptModal from '@/components/AIPromptModal';
import type { PromptType } from '@/services/promptService';
import { Checkbox } from "@/components/ui/checkbox"; // REMOVE this line
// Nothing new needed — Alert, Badge, Button, AlertCircle are already imported ✅
// Enhanced components
import { EpicFileUploader, EpicFile, EpicUploadMode } from '@/components/EpicFileUploader';
import { EpicDomainSelector } from '@/components/EpicDomainSelector';

// Notification utilities
import { showNotificationWithSound, requestNotificationPermission, shouldRequestPermission } from '@/utils/notificationUtils';
import { EpicDomainSuggestion } from '@/services/testbedService';

interface EnhancedDomainTestbedPageProps {
  navigate?: (page: string) => void;
}
interface Epic {
  id: string;
  name: string;
  type: 'file' | 'worksheet';
  fileName?: string;
  content?: string;
}
type ValidationIssueReq = {
  id: string;
  title: string;
  epic?: string;
  sheet?: string;
};

type ValidationIssues = {
  valid?: boolean;
  review_required?: boolean;
  skipped?: boolean;
  message?: string;
  warning_message?: string;
  validation_reasons?: string[];
  warnings?: string[];

  mismatched_domains: string[];
  missing_domain_reqs: ValidationIssueReq[];

  mismatched_domains_by_sheet?: Record<string, string[]>;
  missing_domain_reqs_by_sheet?: Record<string, ValidationIssueReq[]>;

  sys2_component_domains?: string[];
  resolved_sys2_domains?: string[];
  selected_domain_names?: string[];

  mismatched_domain_count?: number;
  unresolved_components?: string[];
  unresolved_component_count?: number;
  missing_domain_count?: number;
  has_components_column?: boolean;
};


const EnhancedDomainTestbedPage: React.FC = () => {
  const {
    session,
    isLoading,
    error,
    createSession,
    uploadSys2File,
    generateSwe1,
    checkStatus,
    downloadSwe1,
    deleteSession,
    handleDownload
  } = useTestbed();
// const [validationIssues, setValidationIssues] = useState<{
//   mismatched_domains: string[];
//   missing_domain_reqs: { id: string; title: string; epic?: string }[];
//   skipped?: boolean;
// } | null>(null);
const [validationIssues, setValidationIssues] = useState<ValidationIssues | null>(null);
const [autoSuggestedDomains, setAutoSuggestedDomains] =
  useState<Record<string, EpicDomainSuggestion>>({});
const [isAutoSuggesting, setIsAutoSuggesting] = useState(false);
const validationAcknowledgedRef = useRef(false);
  const [copied, setCopied] = useState(false);
  // Session setup
  const [sessionName, setSessionName] = useState('');
  const [currentStep, setCurrentStep] = useState<'setup' | 'upload' | 'configure' | 'generate'>('setup');

  // Enhanced Epic-wise upload
  const [useEpicMode, setUseEpicMode] = useState(true);
  const [epicUploadMode, setEpicUploadMode] = useState<EpicUploadMode>('multi-worksheets');
  const [includeComponentNames, setIncludeComponentNames] = useState(true)
  const [epicFiles, setEpicFiles] = useState<EpicFile[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [epicSelections, setEpicSelections] = useState<Record<string, {
    domainIds: string[];
    interfaceIds: string[];
  }>>({});
  // Legacy file upload states
  const sys2FileRef = useRef<HTMLInputElement>(null);
  const [sys2FileInfo, setSys2FileInfo] = useState<{ name: string; size: number } | null>(null);

  // Enhanced generation options
  const [useEnhancedGeneration, setUseEnhancedGeneration] = useState(true);
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [selectedInterfaceIds, setSelectedInterfaceIds] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<'excel' | 'markdown' | 'csv'>('excel');
  const [includeTraceability, setIncludeTraceability] = useState(true);
  const [maxContextChunks, setMaxContextChunks] = useState(10);

  // EPIC 20: Interface section filtering
  const [selectedInterfaceSection, setSelectedInterfaceSection] = useState<string>('all');
  const [availableInterfaceSections, setAvailableInterfaceSections] = useState<string[]>([]);

  // Legacy options
  const [regenerateEmbeddings, setRegenerateEmbeddings] = useState(true);

  // AI Prompt modal
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [currentPromptType, setCurrentPromptType] = useState<PromptType>('swe1_generation');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Four-tier selection state
  const [useFourTierSelection, setUseFourTierSelection] = useState(true);
  const [fourTierSelection, setFourTierSelection] = useState<{
    domainTypes: string[];
    domainInstances: string[];
    interfaceVersions: string[];
    interfaceSections: string[];
    interfaces: string[];
  }>({
    domainTypes: [],
    domainInstances: [],
    interfaceVersions: [],
    interfaceSections: [],
    interfaces: []
  });

  // Enhanced 5-Tier Selection Mode
  const [useEnhancedFourTier, setUseEnhancedFourTier] = useState(true);

  // Validation feedback
  const [configureWarnings, setConfigureWarnings] = useState<string[]>([]);
  const [configureErrors, setConfigureErrors] = useState<string[]>([]);

  // Component extraction state (for displaying components per sheet)
  const [extractedComponents, setExtractedComponents] = useState<Record<string, string[]>>({});
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [isExtractingComponents, setIsExtractingComponents] = useState(false);

  // Status polling

  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<ProcessingStatus | null>(null);


  // Derived sessionStorage key
  const sessionStorageKey = session.sessionId ? `testbed_state_${session.sessionId}` : '';
  // const mismatchedBySheet = validationIssues?.mismatched_domains_by_sheet ?? {};
// const missingBySheet = validationIssues?.missing_domain_reqs_by_sheet ?? {};

// const mismatchedEntries = Object.entries(mismatchedBySheet);
// const missingEntries = Object.entries(missingBySheet);
  // Poll status when processing
  useEffect(() => {
    if (
      session.sessionId &&
      session.status !== ProcessingStatus.PENDING &&
      session.status !== ProcessingStatus.COMPLETED &&
      session.status !== ProcessingStatus.FAILED
    ) {
      statusPollingRef.current = setInterval(() => {
        checkStatus();
      }, 2000);
      return () => {
        if (statusPollingRef.current) {
          clearInterval(statusPollingRef.current);
        }
      };
    }
  }, [session.sessionId, session.status, checkStatus]);

  // Request notification permission on mount
  useEffect(() => {
    if (shouldRequestPermission()) {
      requestNotificationPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Monitor status changes and show notification when generation completes
  useEffect(() => {
    const currentStatus = session.status;
    const previousStatus = previousStatusRef.current;

    // Check if status changed to COMPLETED from a non-COMPLETED state
    if (
      currentStatus === ProcessingStatus.COMPLETED &&
      previousStatus !== null &&
      previousStatus !== ProcessingStatus.COMPLETED
    ) {
      // Show notification with sound
      showNotificationWithSound(
        '🎉 SWE.1 Generation Complete!',
        'Your requirements have been generated and the zip file is ready for download.',
        {
          requireInteraction: false,
          tag: 'swe1-generation-complete'
        }
      );

      console.log('Generation completed - notification shown');
    }

    // Update previous status
    previousStatusRef.current = currentStatus;
  }, [session.status]);

  // Auto-save to sessionStorage
  useEffect(() => {
    if (!session.sessionId) return;
    const stateToSave = {
      sessionName,
      currentStep,
      useEpicMode,
      epicUploadMode,
      includeComponentNames,
      epics,
      epicSelections,
      sys2FileInfo,
      useEnhancedGeneration,
      selectedDomainIds,
      selectedInterfaceIds,
      outputFormat,
      includeTraceability,
      maxContextChunks,
      selectedInterfaceSection,
      availableInterfaceSections,
      useFourTierSelection,
      useEnhancedFourTier,
      fourTierSelection,
      regenerateEmbeddings
    };
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(stateToSave));
  }, [
    session.sessionId,
    sessionStorageKey,
    sessionName,
    currentStep,
    useEpicMode,
    includeComponentNames,
    epicUploadMode,
    epics,
    epicSelections,
    sys2FileInfo,
    useEnhancedGeneration,
    selectedDomainIds,
    selectedInterfaceIds,
    outputFormat,
    includeTraceability,
    maxContextChunks,
    selectedInterfaceSection,
    availableInterfaceSections,
    useFourTierSelection,
    useEnhancedFourTier,
    fourTierSelection,
    regenerateEmbeddings
  ]);

  // Restore from sessionStorage
  useEffect(() => {
    if (!session.sessionId) return;
    const saved = sessionStorage.getItem(sessionStorageKey);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.sessionName !== undefined) setSessionName(s.sessionName);
        if (s.useEpicMode !== undefined) setUseEpicMode(s.useEpicMode);
        if (s.epicUploadMode !== undefined) setEpicUploadMode(s.epicUploadMode);
        if (s.includeComponentNames !== undefined) setIncludeComponentNames(s.includeComponentNames);
        if (s.epics !== undefined) setEpics(s.epics);
        if (s.epicSelections !== undefined) setEpicSelections(s.epicSelections);
        if (s.sys2FileInfo !== undefined) setSys2FileInfo(s.sys2FileInfo);
        if (s.useEnhancedGeneration !== undefined) setUseEnhancedGeneration(s.useEnhancedGeneration);
        if (s.selectedDomainIds !== undefined) setSelectedDomainIds(s.selectedDomainIds);
        if (s.selectedInterfaceIds !== undefined) setSelectedInterfaceIds(s.selectedInterfaceIds);
        if (s.outputFormat !== undefined) setOutputFormat(s.outputFormat);
        if (s.includeTraceability !== undefined) setIncludeTraceability(s.includeTraceability);
        if (s.maxContextChunks !== undefined) setMaxContextChunks(s.maxContextChunks);
        if (s.selectedInterfaceSection !== undefined) setSelectedInterfaceSection(s.selectedInterfaceSection);
        if (s.availableInterfaceSections !== undefined) setAvailableInterfaceSections(s.availableInterfaceSections);
        if (s.useFourTierSelection !== undefined) setUseFourTierSelection(s.useFourTierSelection);
        if (s.useEnhancedFourTier !== undefined) setUseEnhancedFourTier(s.useEnhancedFourTier);
        if (s.fourTierSelection !== undefined) setFourTierSelection(s.fourTierSelection);
        if (s.regenerateEmbeddings !== undefined) setRegenerateEmbeddings(s.regenerateEmbeddings);
      } catch (e) {
        console.error('Failed to restore session state:', e);
      }
    }
  }, [session.sessionId, sessionStorageKey]);

  // Restore sys2 info if backend says it's uploaded but local UI lacks it
  useEffect(() => {
    if (session.sys2FileUploaded && !sys2FileInfo && !useEpicMode) {
      setSys2FileInfo({ name: 'Previously uploaded file', size: 0 });
    }
  }, [session.sessionId, session.sys2FileUploaded, sys2FileInfo, useEpicMode]);

  const navigateToStep = useCallback((step: 'setup' | 'upload' | 'configure' | 'generate') => {
    setCurrentStep(step);
  }, []);

  const handleCreateSession = async () => {
    try {
      await createSession(sessionName || undefined);
      navigateToStep('upload');
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  // Enhanced Epic File Processing
  const processEpicFiles = async (files: EpicFile[], mode: EpicUploadMode) => {
    const newEpics: Epic[] = [];

    if (mode === 'single') {
      if (files.length > 0) {
        const file = files[0];
        newEpics.push({
          id: `epic-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: 'file',
          fileName: file.name
        });
      }
    } else if (mode === 'multi-files') {
      files.forEach((file, index) => {
        newEpics.push({
          id: `epic-${Date.now()}-${index}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: 'file',
          fileName: file.name
        });
      });
    } else if (mode === 'multi-worksheets') {
      if (files.length > 0) {
        const file = files[0];
        // Placeholder sheet names until backend extraction returns real sheets
        const worksheetNames = ['Requirements_Epic1', 'Requirements_Epic2', 'Requirements_Epic3'];
        worksheetNames.forEach((worksheetName, index) => {
          newEpics.push({
            id: `epic-${Date.now()}-${index}`,
            name: worksheetName,
            type: 'worksheet',
            fileName: file.name
          });
        });
      }
    }

    setEpics(newEpics);

    // Initialize empty selections for each epic
    const initialSelections: Record<string, { domainIds: string[]; interfaceIds: string[] }> = {};
    newEpics.forEach(epic => {
      initialSelections[epic.id] = { domainIds: [], interfaceIds: [] };
    });
    setEpicSelections(initialSelections);
  };

  // const handleEpicFilesChange = async (files: EpicFile[], mode: EpicUploadMode) => {
  //   setEpicFiles(files);
  //   await processEpicFiles(files, mode);

  //   // Minimal upload to register SYS2 presence (legacy path)
  //   if (files.length > 0) {
  //     try {
  //       const mainFile = files[0];
  //       await uploadSys2File(mainFile.file);
  //     } catch (err) {
  //       console.error('Failed to upload epic files:', err);
  //     }
  //   }
  // };
  const handleEpicFilesChange = async (files: EpicFile[], mode: EpicUploadMode) => {
    setEpicFiles(files);

    if (files.length === 0) {
      setEpics([]);
      setEpicSelections({});
      return;
    }

    try {
      // Upload files to backend using proper epic endpoint
      const actualFiles = files.map(f => f.file);
      const response = await testbedService.uploadEpicSys2Files(
        session.sessionId,
        actualFiles,
        mode,
        includeComponentNames
      );

      console.log('Epic upload response:', response);

      // Fetch the actual epic information from backend
      const epicsFromBackend = await testbedService.getSessionEpics(session.sessionId);
      console.log('Epics from backend:', epicsFromBackend);

      if (epicsFromBackend && epicsFromBackend.length > 0) {
        setEpics(epicsFromBackend);

        // Initialize empty selections for each epic
        const initialSelections: Record<string, { domainIds: string[]; interfaceIds: string[] }> = {};
        epicsFromBackend.forEach(epic => {
          initialSelections[epic.id] = { domainIds: [], interfaceIds: [] };
        });
        setEpicSelections(initialSelections);
        await autoSuggestEpicDomains(epicsFromBackend);
      } else {
        // Fallback to client-side processing if backend didn't return epics
        await processEpicFiles(files, mode);
      }
    } catch (err) {
      console.error('Failed to upload epic files:', err);
      alert('Failed to upload epic files. Please try again.');
    }
  };

  const handleEpicUploadModeChange = (mode: EpicUploadMode) => {
    setEpicUploadMode(mode);
    setEpicFiles([]);
    setEpics([]);
    setEpicSelections({});
  };

  // Legacy file upload
  const handleSys2FileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supportedExtensions = ['.md', '.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!supportedExtensions.includes(fileExtension)) {
      alert('Please select a supported file format (.md, .xlsx, .xls, or .csv)');
      return;
    }

    try {
      setSys2FileInfo({ name: file.name, size: file.size });
      await uploadSys2File(file);
    } catch (err) {
      console.error('Failed to upload SYS2 file:', err);
    }
  };

  // // Domain and interface selection handlers
  // const handleDomainSelection = useCallback(async (domainIds: string[]) => {
  //   setSelectedDomainIds(domainIds);
  //   if (session.sessionId && domainIds.length > 0) {
  //     try {
  //       await testbedService.selectDomains(session.sessionId, domainIds);
  //     } catch (err) {
  //       console.error('Failed to save domain selection:', err);
  //     }
  //   }
  // }, [session.sessionId]);

  // const handleInterfaceSelection = useCallback(async (interfaceIds: string[]) => {
  //   setSelectedInterfaceIds(interfaceIds);
  //   if (session.sessionId && interfaceIds.length > 0) {
  //     try {
  //       await testbedService.selectInterfaces(session.sessionId, interfaceIds);
  //     } catch (err) {
  //       console.error('Failed to save interface selection:', err);
  //     }
  //   }
  // }, [session.sessionId]);

  // const handleEpicSelectionsChange = (selections: Record<string, { domainIds: string[]; interfaceIds: string[] }>) => {
  //   setEpicSelections(selections);
  // };

  // const handleDomainSelection = useCallback(async (domainIds: string[]) => {
  //   // Convert any UUID objects to strings
  //   const stringDomainIds = domainIds.map(id => typeof id === 'string' ? id : String(id));

  //   setSelectedDomainIds(stringDomainIds);
  //   if (session.sessionId && stringDomainIds.length > 0) {
  //     try {
  //       await testbedService.selectDomains(session.sessionId, stringDomainIds);
  //     } catch (err) {
  //       console.error('Failed to save domain selection:', err);
  //     }
  //   }
  // }, [session.sessionId]);

  // const handleInterfaceSelection = useCallback(async (interfaceIds: string[]) => {
  //   // Convert any UUID objects to strings
  //   const stringInterfaceIds = interfaceIds.map(id => typeof id === 'string' ? id : String(id));

  //   setSelectedInterfaceIds(stringInterfaceIds);
  //   if (session.sessionId && stringInterfaceIds.length > 0) {
  //     try {
  //       await testbedService.selectInterfaces(session.sessionId, stringInterfaceIds);
  //     } catch (err) {
  //       console.error('Failed to save interface selection:', err);
  //     }
  //   }
  // }, [session.sessionId]);
//   const autoSuggestEpicDomains = useCallback(async (epicList: Epic[]) => {
//   if (!session.sessionId || epicList.length === 0) return;
//   setIsAutoSuggesting(true);
//   try {
//     const suggestions = await testbedService.suggestEpicDomains(session.sessionId);
//     setAutoSuggestedDomains(suggestions);

//     // Pre-populate only epics that have no manual selection yet
//     setEpicSelections(prev => {
//       const next = { ...prev };
//       for (const epic of epicList) {
//         const sug = suggestions[epic.id];
//         if (sug && sug.suggested_domain_ids.length > 0) {
//           const alreadySelected = prev[epic.id]?.domainIds?.length ?? 0;
//           if (alreadySelected === 0) {
//             next[epic.id] = {
//               domainIds:    sug.suggested_domain_ids,
//               interfaceIds: prev[epic.id]?.interfaceIds ?? [],
//             };
//           }
//         }
//       }
//       return next;
//     });
//   } catch (err) {
//     console.warn('Auto domain suggestion failed (non-blocking):', err);
//   } finally {
//     setIsAutoSuggesting(false);
//   }
// }, [session.sessionId]);
const autoSuggestEpicDomains = useCallback(async (epicList: Epic[]) => {
  if (!session.sessionId || epicList.length === 0) return;
  setIsAutoSuggesting(true);
  try {
    const suggestions = await testbedService.suggestEpicDomains(session.sessionId);
    setAutoSuggestedDomains(suggestions);
    // ✅ Don't touch epicSelections here — EpicDomainSelector applies them internally
  } catch (err) {
    console.warn('Auto domain suggestion failed (non-blocking):', err);
  } finally {
    setIsAutoSuggesting(false);
  }
}, [session.sessionId]);
  
  // EnhancedDomainTestbedPage: de-duplicate and memoize handlers
  
  const handleDomainSelection = useCallback((domainIds: string[]) => {
    setSelectedDomainIds(prev => {
      const same = prev.length === domainIds.length && prev.every((x, i) => x === domainIds[i]);
      return same ? prev : domainIds;
    });
    if (session.sessionId && domainIds.length > 0) {
      testbedService.selectDomains(session.sessionId, domainIds).catch(console.error);
    }
  }, [session.sessionId]);

  const handleInterfaceSelection = useCallback((interfaceIds: string[]) => {
    setSelectedInterfaceIds(prev => {
      const same = prev.length === interfaceIds.length && prev.every((x, i) => x === interfaceIds[i]);
      return same ? prev : interfaceIds;
    });
    if (session.sessionId && interfaceIds.length > 0) {
      testbedService.selectInterfaces(session.sessionId, interfaceIds).catch(console.error);
    }
  }, [session.sessionId]);


  const handleEpicSelectionsChange = (selections: Record<string, { domainIds: string[]; interfaceIds: string[] }>) => {
    // Ensure all IDs are strings when updating epic selections
    const sanitizedSelections = Object.entries(selections).reduce((acc, [epicId, sel]) => {
      acc[epicId] = {
        domainIds: sel.domainIds.map(id => typeof id === 'string' ? id : String(id)),
        interfaceIds: sel.interfaceIds.map(id => typeof id === 'string' ? id : String(id))
      };
      return acc;
    }, {} as Record<string, { domainIds: string[]; interfaceIds: string[] }>);

    setEpicSelections(sanitizedSelections);
  };

  const handleShowPromptModal = () => {
    setCurrentPromptType('swe1_generation');
    setShowPromptModal(true);
  };

  const handlePromptSave = (prompt: string) => {
    setCustomPrompt(prompt);
    setShowPromptModal(false);
    handleGenerateSwe1();
  };
  
  // const mismatchedDomainsBySheet = React.useMemo(() => {
  //   if (!validationIssues) return {};

  //   if (
  //     validationIssues.mismatched_domains_by_sheet &&
  //     Object.keys(validationIssues.mismatched_domains_by_sheet).length > 0
  //   ) {
  //     return validationIssues.mismatched_domains_by_sheet;
  //   }

  //   // Fallback for older API response
  //   if ((validationIssues.mismatched_domains || []).length > 0) {
  //     return {
  //       Overall: validationIssues.mismatched_domains,
  //     };
  //   }

  //   return {};
  // }, [validationIssues]);
  
   const mismatchedDomainsBySheet = React.useMemo(() => {
    if (!validationIssues) return {};

    if (
      validationIssues.mismatched_domains_by_sheet &&
      Object.keys(validationIssues.mismatched_domains_by_sheet).length > 0
    ) {
      return validationIssues.mismatched_domains_by_sheet;
    }

    if ((validationIssues.mismatched_domains || []).length > 0) {
      return {
        Overall: validationIssues.mismatched_domains,
      };
    }

    return {};
  }, [validationIssues]);
  // const missingReqsBySheet = React.useMemo(() => {
  //   if (!validationIssues) return {};

  //   if (
  //     validationIssues.missing_domain_reqs_by_sheet &&
  //     Object.keys(validationIssues.missing_domain_reqs_by_sheet).length > 0
  //   ) {
  //     return validationIssues.missing_domain_reqs_by_sheet;
  //   }

  //   // Fallback for older API response
  //   if ((validationIssues.missing_domain_reqs || []).length > 0) {
  //     const grouped: Record<string, typeof validationIssues.missing_domain_reqs> = {};

  //     for (const req of validationIssues.missing_domain_reqs) {
  //       const key = req.sheet || req.epic || 'Overall';
  //       if (!grouped[key]) grouped[key] = [];
  //       grouped[key].push(req);
  //     }

  //     return grouped;
  //   }

  //   return {};
  // }, [validationIssues]);
  const missingReqsBySheet = React.useMemo(() => {
    if (!validationIssues) return {};

    if (
      validationIssues.missing_domain_reqs_by_sheet &&
      Object.keys(validationIssues.missing_domain_reqs_by_sheet).length > 0
    ) {
      return validationIssues.missing_domain_reqs_by_sheet;
    }

    if ((validationIssues.missing_domain_reqs || []).length > 0) {
      const grouped: Record<string, typeof validationIssues.missing_domain_reqs> = {};

      for (const req of validationIssues.missing_domain_reqs) {
        const key = req.sheet || req.epic || 'Overall';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(req);
      }

      return grouped;
    }

    return {};
  }, [validationIssues]);

  const totalMismatchedDomains = Object.values(mismatchedDomainsBySheet).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const totalMissingReqs = Object.values(missingReqsBySheet).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  // Validation guards reused for step navigation
  const canNavigateTo = (target: 'setup' | 'upload' | 'configure' | 'generate') => {
    switch (target) {
      case 'setup':
        return true;
      case 'upload':
        return !!session.sessionId;
      case 'configure':
        // Must have SYS2 uploaded
        if (!hasSys2Uploaded()) return false;
        return true;
      case 'generate':
        // Must satisfy generation preconditions
        if (!hasSys2Uploaded()) return false;
        if (useEpicMode) {
          return epics.length > 0 && epics.every(e => (epicSelections[e.id]?.domainIds?.length || 0) > 0);
        }
        if (useEnhancedGeneration) {
          return selectedDomainIds.length > 0;
        }
        return true; // legacy
      default:
        return false;
    }
  };

  // Attempt navigation with validation feedback
  const validateAndNavigateTo = (target: 'setup' | 'upload' | 'configure' | 'generate') => {
    // Always allow backward navigation
    const order = ['setup', 'upload', 'configure', 'generate'] as const;
    const currentIdx = order.indexOf(currentStep);
    const targetIdx = order.indexOf(target);
    if (targetIdx <= currentIdx) {
      setConfigureErrors([]);
      setConfigureWarnings([]);
      navigateToStep(target);
      return;
    }

    // Forward navigation: run the same validations used by buttons
    if (target === 'upload') {
      // Only requires session
      if (!session.sessionId) return;
      navigateToStep('upload');
      return;
    }

    if (target === 'configure') {
      if (!validateUploadStep()) return;
      setConfigureErrors([]);
      setConfigureWarnings([]);
      navigateToStep('configure');
      return;
    }

    if (target === 'generate') {
      // Prepare error/warning messages similar to Continue button
      const okConfigure = validateConfigureStep();
      if (!okConfigure) return;
      // Final generation pre-check
      if (!canGenerate()) {
        alert('Please ensure a SYS2 file is uploaded and mandatory domain selections are completed.');
        return;
      }
      navigateToStep('generate');
      return;
    }
  };

  const getPromptContextData = () => {
    if (useEpicMode) {
      const totalDomains = Object.values(epicSelections).reduce((acc, sel) => acc + sel.domainIds.length, 0);
      const totalInterfaces = Object.values(epicSelections).reduce((acc, sel) => acc + sel.interfaceIds.length, 0);
      return promptService.buildSwe1GenerationContext(
        { name: session.sessionName || 'Enhanced Multi-Epic Session' },
        [],
        `Epic-wise generation with ${epics.length} EPICs, ${totalDomains} total domain(s) and ${totalInterfaces} total interface(s)`
      );
    } else {
      const selectedDomains = selectedDomainIds.length;
      const selectedInterfaces = selectedInterfaceIds.length;
      return promptService.buildSwe1GenerationContext(
        { name: session.sessionName || 'Enhanced Multi-Domain Session' },
        [],
        useEnhancedGeneration ?
          `Enhanced generation with ${selectedDomains} domain(s) and ${selectedInterfaces} interface(s)` :
          'Legacy single-domain generation'
      );
    }
  };

  // Handle four-tier selection changes
  const handleFourTierSelectionChange = useCallback((selection: {
    domainTypes: string[];
    domainInstances: string[];
    interfaceVersions: string[];
    interfaceSections?: string[];
    interfaces: string[];
  }) => {
    const enhancedSelection = {
      ...selection,
      interfaceSections: selection.interfaceSections || []
    };
    setFourTierSelection(enhancedSelection);
    setSelectedDomainIds(selection.domainInstances);
    setSelectedInterfaceIds(selection.interfaces);
  }, []);

  // VALIDATION HELPERS

  const hasSys2Uploaded = () => {
    if (useEpicMode) return epics.length > 0;
    return !!sys2FileInfo;
  };

  const validateUploadStep = () => {
    if (!hasSys2Uploaded()) {
      alert('Please upload at least one SYS2 file (Markdown or Excel).');
      return false;
    }
    return true;
  };

  const validateConfigureStep = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (useEpicMode) {
      const missingDomainEpics = epics.filter(
        e => !(epicSelections[e.id]?.domainIds?.length > 0)
      );
      if (missingDomainEpics.length > 0) {
        errors.push(
          `Select at least one domain for: ${missingDomainEpics.map(e => e.name).join(', ')}`
        );
      }
      const missingInterfaces = epics.filter(
        e => !(epicSelections[e.id]?.interfaceIds?.length > 0)
      );
      if (missingInterfaces.length > 0) {
        warnings.push(
          `No interfaces selected for: ${missingInterfaces.map(e => e.name).join(', ')} (optional)`
        );
      }
    } else if (useEnhancedGeneration) {
      if (selectedDomainIds.length === 0) {
        errors.push('Select at least one domain before continuing.');
      }
      if (selectedInterfaceIds.length === 0) {
        warnings.push('No interfaces selected (optional).');
      }
    }

    setConfigureErrors(errors);
    setConfigureWarnings(warnings);
    return errors.length === 0;
  };

  const canGenerate = () => {
    if (!hasSys2Uploaded()) return false;
    if (useEpicMode) {
      return epics.length > 0 && epics.every(e => (epicSelections[e.id]?.domainIds?.length || 0) > 0);
    }
    if (useEnhancedGeneration) {
      return selectedDomainIds.length > 0;
    }
    return true;
  };

  // const handleGenerateSwe1 = async () => {
  //   try {
  //     // Block generation when mandatory items missing
  //     if (!canGenerate()) {
  //       alert('Please ensure a SYS2 file is uploaded and mandatory domain selections are completed.');
  //       return;
  //     }

  //     if (useEpicMode) {
  //       const allDomainIds = Array.from(new Set(
  //         Object.values(epicSelections).flatMap(sel => sel.domainIds)
  //       ));
  //       const allInterfaceIds = Array.from(new Set(
  //         Object.values(epicSelections).flatMap(sel => sel.interfaceIds)
  //       ));

  //       await testbedService.generateEnhancedSwe1(session.sessionId, {
  //         output_format: outputFormat,
  //         include_traceability: includeTraceability,
  //         max_context_chunks: maxContextChunks,
  //         custom_prompt: customPrompt || undefined,
  //         selected_interfaces: allInterfaceIds,
  //         selected_domains: allDomainIds
  //       });
  //       alert(`Epic-wise generation started for ${epics.length} EPICs! Check status for progress.`);
  //     } else if (useEnhancedGeneration && selectedDomainIds.length > 0) {
  //       await testbedService.generateEnhancedSwe1(session.sessionId, {
  //         output_format: outputFormat,
  //         include_traceability: includeTraceability,
  //         max_context_chunks: maxContextChunks,
  //         custom_prompt: customPrompt || undefined,
  //         selected_interfaces: selectedInterfaceIds,
  //         selected_domains: selectedDomainIds
  //       });
  //       alert('Enhanced generation started! Check status for progress.');
  //     } else {
  //       await generateSwe1(regenerateEmbeddings, outputFormat);
  //       alert('Legacy generation started! Check status for progress.');
  //     }

  //     setTimeout(() => {
  //       checkStatus();
  //     }, 1000);

  //     setCustomPrompt('');
  //   } catch (err: any) {
  //     console.error('Failed to generate SWE.1:', err);
  //     alert(`Generation failed: ${err?.message || 'Unknown error'}`);
  //   }
  // };

  //   const handleGenerateSwe1 = async () => {
  //   try {
  //     if (!canGenerate()) {
  //       alert('Please ensure a SYS2 file is uploaded and mandatory domain selections are completed.');
  //       return;
  //     }

  //     if (useEpicMode) {
  //       // NEW: Call epic-specific generation endpoint
  //       // Transform epicSelections into the format backend expects
  //       const epicSelectionsArray = Object.entries(epicSelections).map(([epicId, selection]) => ({
  //         epicId: epicId,
  //         domainIds: selection.domainIds || [],
  //         interfaceIds: selection.interfaceIds || []
  //       }));

  //       // Call the epic-specific endpoint
  //       const formData = new FormData();
  //       formData.append('epic_selections', JSON.stringify(epicSelectionsArray));
  //       formData.append('output_format', outputFormat);
  //       formData.append('include_traceability', includeTraceability.toString());
  //       formData.append('max_context_chunks', maxContextChunks.toString());
  //       if (customPrompt) {
  //         formData.append('custom_prompt', customPrompt);
  //       }

  //       const response = await fetch(`/api/testbed/${session.sessionId}/generate-epic-swe1`, {
  //         method: 'POST',
  //         body: formData
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.detail || 'Epic generation failed');
  //       }

  //       alert(`Epic-wise generation started for ${epics.length} EPICs! Check status for progress.`);

  //     } else if (useEnhancedGeneration && selectedDomainIds.length > 0) {
  //       // Existing enhanced generation
  //       await testbedService.generateEnhancedSwe1(session.sessionId, {
  //         output_format: outputFormat,
  //         include_traceability: includeTraceability,
  //         max_context_chunks: maxContextChunks,
  //         custom_prompt: customPrompt || undefined,
  //         selected_interfaces: selectedInterfaceIds,
  //         selected_domains: selectedDomainIds
  //       });
  //       alert('Enhanced generation started! Check status for progress.');
  //     } else {
  //       // Legacy generation
  //       await generateSwe1(regenerateEmbeddings, outputFormat);
  //       alert('Legacy generation started! Check status for progress.');
  //     }

  //     setTimeout(() => {
  //       checkStatus();
  //     }, 1000);

  //     setCustomPrompt('');
  //   } catch (err: any) {
  //     console.error('Failed to generate SWE.1:', err);
  //     alert(`Generation failed: ${err?.message || 'Unknown error'}`);
  //   }
  // };

  // const handleGenerateSwe1 = async () => {
  //   try {
  //     if (!canGenerate()) {
  //       alert('Please ensure a SYS2 file is uploaded and mandatory domain selections are completed.');
  //       return;
  //     }

  //     if (useEpicMode) {
  //       // Convert epicSelections to proper array format for backend
  //       const epicSelectionsArray = Object.entries(epicSelections).map(([epicId, selection]) => ({
  //         epicId: epicId,
  //         domainIds: selection.domainIds || [],
  //         interfaceIds: selection.interfaceIds || []
  //       }));

  //       console.log('Sending epic selections:', epicSelectionsArray);

  //       await testbedService.generateEnhancedSwe1(session.sessionId, ({
  //         output_format: outputFormat,
  //         include_traceability: includeTraceability,
  //         max_context_chunks: maxContextChunks,
  //         custom_prompt: customPrompt || undefined,
  //         epic_selections: epicSelectionsArray,
  //         include_component_names: includeComponentNames
  //       } as any));

  //       alert(`Epic-wise generation started for ${epics.length} EPICs! Check status for progress.`);
  //     } else if (useEnhancedGeneration && selectedDomainIds.length > 0) {
  //       await testbedService.generateEnhancedSwe1(session.sessionId, {
  //         output_format: outputFormat,
  //         include_traceability: includeTraceability,
  //         max_context_chunks: maxContextChunks,
  //         custom_prompt: customPrompt || undefined,
  //         selected_interfaces: selectedInterfaceIds,
  //         selected_domains: selectedDomainIds,
  //         include_component_names: includeComponentNames
  //       } as any);
  //       alert('Enhanced generation started! Check status for progress.');
  //     } else {
  //       await generateSwe1(regenerateEmbeddings, outputFormat);
  //       alert('Legacy generation started! Check status for progress.');
  //     }

  //     setTimeout(() => checkStatus(), 1000);
  //     setCustomPrompt('');
  //   } catch (err: any) {
  //     console.error('Failed to generate SWE.1:', err);
  //     alert(`Generation failed: ${err?.message || 'Unknown error'}`);
  //   }
  // };

//  const handleGenerateSwe1 = async () => {
//   try {
//     if (!canGenerate()) {
//       alert('Please ensure a SYS2 file is uploaded and mandatory domain selections are completed.');
//       return;
//     }

//     // ── Validation gate ────────────────────────────────────────────────
//     if (!validationAcknowledgedRef.current) {
//       try {
//         const domainIds = useEpicMode
//           ? Array.from(new Set(Object.values(epicSelections).flatMap(sel => sel.domainIds)))
//           : selectedDomainIds;

//         const result = await testbedService.validateSys2Domains(
//           session.sessionId,
//           domainIds,
//           includeComponentNames ?? true
//         );

//         if (
//           !result.skipped &&
//           (result.mismatched_domains.length > 0 || result.missing_domain_reqs.length > 0)
//         ) {
//           setValidationIssues(result);
//           return; // stop — panel takes over
//         }
//       } catch (_) {
//         // endpoint unavailable — don't block generation
//       }
//     }
//     validationAcknowledgedRef.current = false;
//     // ── end gate ──────────────────────────────────────────────────────

//     if (useEpicMode) {
//       const epicSelectionsArray = Object.entries(epicSelections).map(([epicId, selection]) => ({
//         epicId,
//         domainIds: selection.domainIds || [],
//         interfaceIds: selection.interfaceIds || []
//       }));

//       console.log('Sending epic selections:', epicSelectionsArray);

//       await testbedService.generateEnhancedSwe1(session.sessionId, ({
//         output_format: outputFormat,
//         include_traceability: includeTraceability,
//         max_context_chunks: maxContextChunks,
//         custom_prompt: customPrompt || undefined,
//         epic_selections: epicSelectionsArray,
//         include_component_names: includeComponentNames
//       } as any));

//       alert(`Epic-wise generation started for ${epics.length} EPICs! Check status for progress.`);
//     } else if (useEnhancedGeneration && selectedDomainIds.length > 0) {
//       await testbedService.generateEnhancedSwe1(session.sessionId, {
//         output_format: outputFormat,
//         include_traceability: includeTraceability,
//         max_context_chunks: maxContextChunks,
//         custom_prompt: customPrompt || undefined,
//         selected_interfaces: selectedInterfaceIds,
//         selected_domains: selectedDomainIds,
//         include_component_names: includeComponentNames
//       } as any);
//       alert('Enhanced generation started! Check status for progress.');
//     } else {
//       await generateSwe1(regenerateEmbeddings, outputFormat);
//       alert('Legacy generation started! Check status for progress.');
//     }

//     setTimeout(() => checkStatus(), 1000);
//     setCustomPrompt('');
//   } catch (err: any) {
//     console.error('Failed to generate SWE.1:', err);
//     alert(`Generation failed: ${err?.message || 'Unknown error'}`);
//   }
// };
// const _doGenerate = async () => {
//   if (useEpicMode) {
//     const epicSelectionsArray = Object.entries(epicSelections).map(([epicId, selection]) => ({
//       epicId,
//       domainIds: selection.domainIds || [],
//       interfaceIds: selection.interfaceIds || [],
//     }));

//     await testbedService.generateEnhancedSwe1(session.sessionId, ({
//       output_format: outputFormat,
//       include_traceability: includeTraceability,
//       max_context_chunks: maxContextChunks,
//       custom_prompt: customPrompt || undefined,
//       epic_selections: epicSelectionsArray,
//       include_component_names: includeComponentNames
//     } as any));

//     alert(`Epic-wise generation started for ${epics.length} EPICs! Check status for progress.`);
//     } else if (useEnhancedGeneration && selectedDomainIds.length > 0) {
//       await testbedService.generateEnhancedSwe1(session.sessionId, {
//         output_format: outputFormat,
//         include_traceability: includeTraceability,
//         max_context_chunks: maxContextChunks,
//         custom_prompt: customPrompt || undefined,
//         selected_interfaces: selectedInterfaceIds,
//         selected_domains: selectedDomainIds,
//         include_component_names: includeComponentNames
//       } as any);
//       alert('Enhanced generation started! Check status for progress.');
//     } else {
//       await generateSwe1(regenerateEmbeddings, outputFormat);
//       alert('Legacy generation started! Check status for progress.');
//     }

//   setTimeout(() => checkStatus(), 1000);
//   setCustomPrompt('');
// };

// const handleGenerateSwe1 = async () => {
//   try {
//     if (!canGenerate()) {
//       alert('Please ensure a SYS2 file is uploaded and mandatory domain selections are completed.');
//       return;
//     }

//     if (!validationAcknowledgedRef.current) {
//       const domainIds = useEpicMode
//         ? Array.from(new Set(Object.values(epicSelections).flatMap(sel => sel.domainIds || [])))
//         : selectedDomainIds;

//       // const result = await testbedService.validateSys2Domains(
//       //   session.sessionId,
//       //   domainIds,
//       //   includeComponentNames ?? true
//       // );
//       const result = await testbedService.validateSys2Domains(
//           session.sessionId,
//           allSelectedDomainIds,
//           includeComponentNames,
//           epicSelectionsForValidation   // ← per-epic
//         );

//       // if (
//       //   !result.skipped &&
//       //   (
//       //     (result.mismatched_domains?.length ?? 0) > 0 ||
//       //     (result.missing_domain_reqs?.length ?? 0) > 0
//       //   )
//       // ) {
//       //   setValidationIssues({
//       //     mismatched_domains: result.mismatched_domains || [],
//       //     missing_domain_reqs: result.missing_domain_reqs || [],
//       //     skipped: result.skipped,
//       //   });
//       //   return;
//       // }
//     const hasMismatched =
//         Object.keys(result.mismatched_domains_by_sheet || {}).length > 0 ||
//         (result.mismatched_domains?.length ?? 0) > 0;

//       const hasMissing =
//         Object.keys(result.missing_domain_reqs_by_sheet || {}).length > 0 ||
//         (result.missing_domain_reqs?.length ?? 0) > 0;

//       if (!result.skipped && (hasMismatched || hasMissing)) {
//         setValidationIssues({
//           ...result,
//           mismatched_domains: result.mismatched_domains || [],
//           missing_domain_reqs: result.missing_domain_reqs || [],
//           mismatched_domains_by_sheet: result.mismatched_domains_by_sheet || {},
//           missing_domain_reqs_by_sheet: result.missing_domain_reqs_by_sheet || {},
//           skipped: result.skipped,
//         });
//         return;
//       }

//     }

//     validationAcknowledgedRef.current = false;
//     await _doGenerate();
//   } catch (err: any) {
//     console.error('Failed to generate SWE.1:', err);
//     alert(`Generation failed: ${err?.message || 'Unknown error'}`);
//   }
// };
  const _doGenerate = async () => {
    if (useEpicMode) {
      const epicSelectionsArray = Object.entries(epicSelections).map(([epicId, selection]) => ({
        epicId,
        domainIds: selection.domainIds || [],
        interfaceIds: selection.interfaceIds || [],
      }));

      await testbedService.generateEnhancedSwe1(session.sessionId, {
        output_format: outputFormat,
        include_traceability: includeTraceability,
        max_context_chunks: maxContextChunks,
        custom_prompt: customPrompt || undefined,
        epic_selections: epicSelectionsArray,
        include_component_names: includeComponentNames,
      } as any);

      alert(`Epic-wise generation started for ${epics.length} EPICs! Check status for progress.`);
    } else if (useEnhancedGeneration && selectedDomainIds.length > 0) {
      await testbedService.generateEnhancedSwe1(session.sessionId, {
        output_format: outputFormat,
        include_traceability: includeTraceability,
        max_context_chunks: maxContextChunks,
        custom_prompt: customPrompt || undefined,
        selected_interfaces: selectedInterfaceIds,
        selected_domains: selectedDomainIds,
        include_component_names: includeComponentNames,
      } as any);
      alert('Enhanced generation started! Check status for progress.');
    } else {
      await generateSwe1(regenerateEmbeddings, outputFormat);
      alert('Legacy generation started! Check status for progress.');
    }

    setTimeout(() => checkStatus(), 1000);
    setCustomPrompt('');
  };

  const handleGenerateSwe1 = async () => {
    try {
      if (!canGenerate()) {
        alert('Please ensure a SYS2 file is uploaded and mandatory domain selections are completed.');
        return;
      }

      if (!validationAcknowledgedRef.current) {
        // ── Build per-epic selections for the new per-epic validation ──────
        const epicSelectionsForValidation = useEpicMode
          ? Object.entries(epicSelections).map(([epicId, sel]) => ({
              epicId,
              domainIds: sel.domainIds || [],
            }))
          : [];

        // Union of all selected domain IDs (used by legacy mode + display)
        const allSelectedDomainIds = useEpicMode
          ? Array.from(
              new Set(Object.values(epicSelections).flatMap(sel => sel.domainIds || []))
            )
          : selectedDomainIds;

        const result = await testbedService.validateSys2Domains(
          session.sessionId,
          allSelectedDomainIds,
          includeComponentNames ?? true,
          epicSelectionsForValidation.length > 0 ? epicSelectionsForValidation : undefined,
        );

        const hasMismatched =
          Object.values(result.mismatched_domains_by_sheet || {}).some(
            (sheet) => Array.isArray(sheet) && sheet.length > 0
          ) || (result.mismatched_domains?.length ?? 0) > 0;

        const hasMissing =
          Object.values(result.missing_domain_reqs_by_sheet || {}).some(
            (sheet) => Array.isArray(sheet) && sheet.length > 0
          ) || (result.missing_domain_reqs?.length ?? 0) > 0;

        if (!result.skipped && (hasMismatched || hasMissing)) {
          setValidationIssues({
            ...result,
            mismatched_domains: result.mismatched_domains || [],
            missing_domain_reqs: result.missing_domain_reqs || [],
            mismatched_domains_by_sheet: result.mismatched_domains_by_sheet || {},
            missing_domain_reqs_by_sheet: result.missing_domain_reqs_by_sheet || {},
            skipped: result.skipped,
          });
          return;
        }
      }

      validationAcknowledgedRef.current = false;
      await _doGenerate();
    } catch (err: any) {
      console.error('Failed to generate SWE.1:', err);
      alert(`Generation failed: ${err?.message || 'Unknown error'}`);
    }
  };
  const getStatusIcon = () => {
    switch (session.status) {
      case ProcessingStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ProcessingStatus.FAILED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case ProcessingStatus.PENDING:
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const isStepComplete = (step: string) => {
    switch (step) {
      case 'setup':
        return !!session.sessionId;
      case 'upload':
        return hasSys2Uploaded();
      case 'configure': {
        if (useEpicMode) {
          return epics.length > 0 && epics.every(e => (epicSelections[e.id]?.domainIds?.length || 0) > 0);
        }
        if (useEnhancedGeneration) {
          return selectedDomainIds.length > 0;
        }
        return true;
      }
      case 'generate':
        return session.status === ProcessingStatus.COMPLETED;
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-[95vw] mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-300">Enhanced SWE.1 Generator</h1>
          <p className="text-gray-500 mt-1">Multi-domain & Epic-wise requirements generation with hybrid RAG</p>
        </div>
        {session.sessionId && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              Session: {session.sessionId.slice(0, 500)}
            </Badge>
            {/* Access navigate from window object */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const navigate = (window as any).appNavigate;
                if (navigate) {
                  navigate('status-tracker');
                }
              }}
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-900/20"
              title="Track session status"
            >
              <Activity className="h-4 w-4 mr-2" />
              Track Status
            </Button>


            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  const sessionId = session.sessionId || '';

                  // Try modern Clipboard API first
                  if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(sessionId);
                    console.log('Copied using Clipboard API');
                  } else {
                    // Fallback for older browsers or non-HTTPS
                    const textArea = document.createElement('textarea');
                    textArea.value = sessionId;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    try {
                      document.execCommand('copy');
                      console.log('Copied using execCommand fallback');
                    } catch (err) {
                      console.error('Fallback copy failed:', err);
                    }

                    document.body.removeChild(textArea);
                  }

                  // Show visual feedback
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                  console.error('Failed to copy:', err);
                }
              }}
              title={copied ? "Copied!" : "Copy session ID"}
              className={copied ? "text-green-500" : ""}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (session.sessionId) {
                  const key = `testbed_state_${session.sessionId}`;
                  sessionStorage.removeItem(key);
                }
                deleteSession();
              }}
              title="Delete session"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}



      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
      {/* <div className="flex items-center justify-between mb-8">
        {['setup', 'upload', 'configure', 'generate'].map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${currentStep === step ? 'bg-primary text-white' : 
                  isStepComplete(step) ? 'bg-green-500 text-white' : 
                  'bg-gray-200 text-gray-600'}
              `}>
                {isStepComplete(step) ? '✓' : index + 1}
              </div>
              <span className={`ml-2 font-medium capitalize ${
                currentStep === step ? 'text-primary' : 'text-gray-600'
              }`}>
                {step}
              </span>
            </div>
            {index < 3 && (
              <ArrowRight className="h-5 w-5 text-gray-400 mx-4 flex-shrink-0" />
            )}
          </div>
        ))}
      </div> */}
      {/* Progress Steps: now functional navigation */}
      <div className="flex items-center justify-between mb-8">
        {(['setup', 'upload', 'configure', 'generate'] as const).map((step, index) => {
          const active = currentStep === step;
          const complete = isStepComplete(step);
          const allowed = canNavigateTo(step);
          const title =
            step === 'setup' ? 'Create or view session' :
              step === 'upload' ? 'Upload SYS2' :
                step === 'configure' ? 'Select domains/interfaces' :
                  'Generate & download';

          return (
            <div key={step} className="flex items-center flex-1">
              <button
                type="button"
                title={title}
                aria-label={title}
                onClick={() => validateAndNavigateTo(step)}
                disabled={!allowed && index > (['setup', 'upload', 'configure', 'generate'] as const).indexOf(currentStep)}
                className={[
                  "flex items-center group",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-full"
                ].join(' ')}
                style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
              >
                <div
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                    active ? "bg-primary text-white" :
                      complete ? "bg-green-500 text-white" :
                        (allowed ? "bg-gray-200 text-gray-800 group-hover:bg-gray-300" : "bg-gray-100 text-gray-400")
                  ].join(' ')}
                  aria-current={active ? "step" : undefined}
                >
                  {complete ? '✓' : index + 1}
                </div>
                <span
                  className={[
                    "ml-2 font-medium capitalize transition-colors",
                    active ? "text-primary" :
                      complete ? "text-green-700" :
                        (allowed ? "text-gray-700" : "text-gray-400")
                  ].join(' ')}
                >
                  {step}
                </span>
              </button>

              {index < 3 && (
                <div
                  className={[
                    "mx-4 h-[2px] flex-1",
                    // Progress line color reflects past/future
                    (['setup', 'upload', 'configure', 'generate'] as const).indexOf(step) <
                      (['setup', 'upload', 'configure', 'generate'] as const).indexOf(currentStep)
                      ? "bg-green-400"
                      : "bg-gray-200"
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Session Setup */}
      {currentStep === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create Session</CardTitle>
            <CardDescription>
              Start by creating a new processing session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session-name">Session Name (Optional)</Label>
              <Input
                id="session-name"
                placeholder="e.g., Automotive Requirements v2.0"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="mt-1"
              />
            </div>



            <Button
              onClick={handleCreateSession}
              disabled={isLoading}
              className="w-full"
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: File Upload */}
      {currentStep === 'upload' && session.sessionId && (
        <div className="space-y-6">
          {useEpicMode ? (
            <>
              <EpicFileUploader
                onFilesChange={handleEpicFilesChange}
                uploadMode={epicUploadMode}
                onModeChange={handleEpicUploadModeChange}
                maxFiles={10}
              />

              <div className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                  <Switch
                    id="include-component-names"
                    checked={includeComponentNames}
                    onCheckedChange={setIncludeComponentNames}
                    className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-gray-600 border-0 [&>span]:bg-white [&>span]:shadow-sm"
                  />
                  <Label htmlFor="include-component-names" className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium text-gray-100">Include Component Names</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      When enabled, component names from worksheets will be included in the generated requirements
                    </p>
                  </Label>
                </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Upload SYS2 Requirements</CardTitle>
                <CardDescription>
                  Upload your SYS2 requirements file in any supported format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={sys2FileRef}
                    type="file"
                    accept=".md,.xlsx,.xls,.csv"
                    onChange={handleSys2FileUpload}
                    className="hidden"
                  />

                  {sys2FileInfo ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="font-medium">{sys2FileInfo.name}</p>
                      <p className="text-sm text-gray-500">
                        {(sys2FileInfo.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sys2FileRef.current?.click()}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drop your SYS2 file here or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Supports .md, .xlsx, .xls, and .csv files
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => sys2FileRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select File
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigateToStep('setup')}
            >
              Back to Setup
            </Button>

            <Button
              onClick={async () => {
                if (!validateUploadStep()) return;
                const nextStep = useEnhancedGeneration || useEpicMode ? 'configure' : 'generate';

                // Extract components if using Epic mode with multi-worksheets Excel
                if (useEpicMode && epicUploadMode === 'multi-worksheets' && session.sessionId) {
                  setIsExtractingComponents(true);
                  try {
                    const result = await testbedService.extractComponents(session.sessionId);
                    if (result.success && result.sheets) {
                      setExtractedComponents(result.sheets);
                      const sheetNames = Object.keys(result.sheets);
                      if (sheetNames.length > 0) {
                        setSelectedSheet(sheetNames[0]);
                      }
                      console.log('Extracted components:', result);
                    }
                  } catch (err) {
                    console.error('Failed to extract components:', err);
                    // Continue even if extraction fails - it's not critical
                  } finally {
                    setIsExtractingComponents(false);
                  }
                }

                navigateToStep(nextStep);
              }}
              disabled={isExtractingComponents || isLoading}
            >
              {isExtractingComponents ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Components...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

          </div>
        </div>
      )}

      {/* Step 3: Configure Domains & Interfaces */}
      {currentStep === 'configure' && (useEnhancedGeneration || useEpicMode) && (
        <div className="space-y-6">
          {(configureErrors.length > 0 || configureWarnings.length > 0) && (
            <div className="space-y-2">
              {configureErrors.map((msg, i) => (
                <Alert key={`err-${i}`} variant="destructive">
                  <AlertTitle>Action required</AlertTitle>
                  <AlertDescription>{msg}</AlertDescription>
                </Alert>
              ))}
              {configureWarnings.map((msg, i) => (
                <Alert key={`warn-${i}`} className="border-yellow-300 bg-yellow-50 text-yellow-900">
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>{msg}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {useEpicMode ? (
            <>
              <EpicDomainSelector
                epics={epics}
                sessionId={session.sessionId}
                onSelectionsChange={handleEpicSelectionsChange}
                initialSelections={epicSelections}
                // NEW: enable Four-Tier/5-Tier in Epic mode
                enableFourTier={true}
                enableEnhancedFiveTier={true}
                // NEW: Pass extracted components for display in each epic tab
                extractedComponents={extractedComponents}
                autoSuggestedDomains={autoSuggestedDomains}
              />
              {/* NEW: Navigation for Epic mode */}

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => navigateToStep('upload')}>
                  Back to Upload
                </Button>
                <Button
                  onClick={() => {
                    if (!validateConfigureStep()) return;
                    navigateToStep('generate');
                  }}
                  disabled={isLoading}
                >
                  Continue to Generation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Card>

              <CardHeader>
                <CardTitle>Step 3: Configure Multi-Domain Context</CardTitle>
                <CardDescription>
                  Select domains and interfaces to enhance your SWE.1 generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {useFourTierSelection ? (
                  <div>
                    <div className="mb-4 space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>{useEnhancedFourTier ? '5-Tier Enhanced Selection Mode' : '4-Tier Selection Mode'}:</strong> {useEnhancedFourTier ? ' Domain Type → Domain Instance → Interface Version → Interface Section → Interface' : ' Domain Type → Domain Instance → Interface Version → Interface'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <Switch
                          id="enhanced-four-tier"
                          checked={useEnhancedFourTier}
                          onCheckedChange={setUseEnhancedFourTier}
                          className="border-2 border-gray-400 data-[state=checked]:border-purple-500"
                        />
                        <Label htmlFor="enhanced-four-tier" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900">Enhanced 5-Tier Selection with Interface Section Filtering</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Adds interface section/group filtering for better interface discovery and organization
                          </p>
                        </Label>
                      </div>
                    </div>

                    {useEnhancedFourTier ? (
                      <FourTierSelectorEnhanced
                        sessionId={session.sessionId}
                        initialSelection={fourTierSelection}
                        onSelectionChanged={handleFourTierSelectionChange}
                      />
                    ) : (
                      <FourTierSelectorControlled
                        sessionId={session.sessionId}
                        value={fourTierSelection}
                        onChange={handleFourTierSelectionChange}
                      />
                    )}
                  </div>
                ) : (
                  <Tabs defaultValue="domains" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="domains">
                        <Layers className="mr-2 h-4 w-4" />
                        Domains
                      </TabsTrigger>
                      <TabsTrigger value="interfaces">
                        <Settings2 className="mr-2 h-4 w-4" />
                        Interfaces
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="domains" className="mt-4">
                      <MultiDomainSelector
                        sessionId={session.sessionId}
                        onDomainsSelected={handleDomainSelection}
                        selectedDomainIds={selectedDomainIds}
                        maxSelection={10}
                      />
                    </TabsContent>

                    <TabsContent value="interfaces" className="mt-4">
                      {selectedDomainIds.length > 0 ? (
                        <InterfaceSelectionPanel
                          sessionId={session.sessionId}
                          selectedDomainIds={selectedDomainIds}
                          onInterfacesSelected={handleInterfaceSelection}
                          selectedInterfaceIds={selectedInterfaceIds}
                          maxSelection={10}
                          sectionFilter={selectedInterfaceSection !== 'all' ? selectedInterfaceSection : undefined}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Please select at least one domain first
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => navigateToStep('upload')}
                  >
                    Back to Upload
                  </Button>

                  <Button
                    onClick={() => {
                      if (!validateConfigureStep()) return;
                      navigateToStep('generate');
                    }}
                    disabled={isLoading}
                  >
                    Continue to Generation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 4: Generate */}
      {currentStep === 'generate' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Generate SWE.1 Requirements</CardTitle>
            <CardDescription>
              Configure output options and start generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {useEpicMode && epics.length > 0 && (
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
                  <h4 className="font-medium text-gray-100 text-sm">Epic-wise Generation Summary</h4>
                  <span className="ml-auto text-xs text-gray-400">{epics.length} EPIC{epics.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-gray-700">
                  {Object.entries(epicSelections).map(([epicId, selection]) => {
                    const epic = epics.find(e => e.id === epicId);
                    if (!epic) return null;
                    const domainCount = selection.domainIds.length;
                    const ifaceCount = selection.interfaceIds.length;
                    const isReady = domainCount > 0;
                    return (
                      <div key={epicId} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isReady ? 'bg-cyan-400' : 'bg-gray-500'}`} />
                          <span className="text-sm text-gray-200 truncate">{epic.name}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          <span className={`text-xs font-medium ${domainCount > 0 ? 'text-cyan-400' : 'text-gray-500'}`}>
                            {domainCount} domain{domainCount !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-500">
                            {ifaceCount} interface{ifaceCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-1 border-t border-gray-700 flex gap-4 text-xs text-gray-400">
                  <span>{Object.values(epicSelections).reduce((a, s) => a + s.domainIds.length, 0)} total domains</span>
                  <span>{Object.values(epicSelections).reduce((a, s) => a + s.interfaceIds.length, 0)} total interfaces</span>
                </div>
              </div>
            )}
            {useEpicMode && (
              <div className="mb-4">
                {isAutoSuggesting ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-800 border border-blue-600 rounded-lg text-sm text-blue-300">
                    <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                    <span>Auto-selecting domains from SYS2 component values…</span>
                  </div>
                ) : Object.keys(autoSuggestedDomains).length > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-gray-800 border border-green-600 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>
                        Domains auto-selected from SYS2 component list.{' '}
                        <span className="font-medium">Review and adjust below.</span>
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-green-500 text-green-300 hover:bg-gray-700"
                      onClick={() => autoSuggestEpicDomains(epics)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Re-run
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            {useEnhancedGeneration && !useEpicMode && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-blue-900">Enhanced Generation Summary</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• {selectedDomainIds.length} domain(s) selected for context</p>
                  <p>• {selectedInterfaceIds.length} interface(s) selected for enhancement</p>
                  <p>• Using hybrid RAG (BM25 + Dense embeddings)</p>
                </div>
              </div>
            )}



            {session.sessionId && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="font-medium">
                      {session.status === ProcessingStatus.COMPLETED ? 'Generation Complete' :
                        session.status === ProcessingStatus.FAILED ? 'Generation Failed' :
                          session.status === ProcessingStatus.PROCESSING_DOMAIN ? 'Processing Domain...' :
                            session.status === ProcessingStatus.PROCESSING_SYS2 ? 'Processing SYS2...' :
                              session.status === ProcessingStatus.UPLOADING ? 'Uploading...' :
                                session.status ? `Status: ${session.status}` :
                                  'Ready to Generate'}
                    </span>
                  </div>
                  {session.progressPercentage !== undefined && (
                    <span className="text-sm text-gray-500">
                      {session.progressPercentage}%
                    </span>
                  )}
                </div>

                {session.currentStep && (
                  <p className="text-sm text-gray-600">{session.currentStep}</p>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      checkStatus();
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Check Status
                  </Button>
                  <span className="text-xs text-gray-500 flex items-center">
                    Current: {session.status || 'PENDING'}
                  </span>
                </div>

                {session.progressPercentage !== undefined && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${session.progressPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* <div className="flex gap-2">
              {session.status === ProcessingStatus.COMPLETED ? (
                <>
                  <Button
                    // onClick={() => downloadSwe1(outputFormat)}
                    onClick={handleDownload}
                    className="flex-1"
                    variant="default"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {useEpicMode
                      ? `Download ZIP (${epics.length} Epic Excel Files)`
                      : `Download SWE.1 Requirements (.${outputFormat === 'excel' ? 'xlsx' : outputFormat})`}
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    New Session
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const prevStep = (useEnhancedGeneration || useEpicMode) ? 'configure' : 'upload';
                      navigateToStep(prevStep);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShowPromptModal}
                    disabled={isLoading}
                    title="View and customize AI prompt"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    AI Prompt
                  </Button>
                  <Button
                    onClick={handleGenerateSwe1}
                    disabled={isLoading || !canGenerate() ||
                      (session.status !== ProcessingStatus.PENDING &&
                        session.status !== ProcessingStatus.FAILED &&
                        session.status !== ProcessingStatus.COMPLETED)}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {useEpicMode ? 'Start Epic-wise Generation' :
                          useEnhancedGeneration ? 'Start Enhanced Generation' : 'Start Generation'}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div> */}
{validationIssues ? (
<div className="border border-gray-700 rounded-lg p-4 bg-gray-800 space-y-4">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
      <span className="font-semibold text-amber-300">Review Required Before Generating</span>
    </div>

    {totalMismatchedDomains > 0 && (
      <Alert className="border-amber-500 bg-gray-700">
        <AlertCircle className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-amber-300">
          {totalMismatchedDomains} domain(s) in SYS2 not found in your selection
        </AlertTitle>
        <AlertDescription className="text-amber-200 space-y-3">
          <p className="text-sm">
            These mapped domains appear in the SYS2 file but were not selected on the domain configuration step.
            Requirements referencing them will be generated without domain-specific context.
          </p>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {Object.entries(mismatchedDomainsBySheet).map(([sheet, domains]) => (
              <div key={sheet} className="rounded-md border border-amber-600 bg-gray-700 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-amber-300">
                    Sheet: {sheet}
                  </div>
                  <Badge variant="outline" className="border-amber-400 text-amber-300">
                    {domains.length} missing
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  {domains.map((d) => (
                    <Badge
                      key={`${sheet}-${d}`}
                      variant="outline"
                      className="border-amber-400 text-amber-300 bg-gray-600"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    )}

    {totalMissingReqs > 0 && (
      <Alert variant="destructive" className="bg-gray-700 border-red-500">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {totalMissingReqs} SYS2 requirement(s) have no component domain
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-sm">
            These requirements have an empty "Component Domain" field and will be generated without domain context.
          </p>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {Object.entries(missingReqsBySheet).map(([sheet, reqs]) => (
              <div key={sheet} className="rounded-md border border-red-600 bg-gray-700 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-red-300">
                    Sheet: {sheet}
                  </div>
                  <Badge variant="outline" className="border-red-400 text-red-300 bg-gray-600">
                    {reqs.length} requirement{reqs.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto rounded bg-gray-800 p-2">
                  {reqs.slice(0, 100).map((req) => (
                    <div
                      key={`${sheet}-${req.id}`}
                      className="flex gap-2 text-xs"
                    >
                      <span className="font-mono text-red-300 shrink-0">{req.id}</span>
                      <span className="text-red-200 break-words">
                        {req.title}
                      </span>
                    </div>
                  ))}

                  {reqs.length > 100 && (
                    <p className="text-xs text-gray-400 italic">
                      … and {reqs.length - 100} more in this sheet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    )}

    <div className="flex gap-2 pt-1">
      <Button
        variant="outline"
        onClick={() => {
          setValidationIssues(null);
          const prevStep = (useEnhancedGeneration || useEpicMode) ? 'configure' : 'upload';
          navigateToStep(prevStep as any);
        }}
      >
        Back to Configure
      </Button>

      <Button
        className="flex-1"
        onClick={() => {
          validationAcknowledgedRef.current = true;
          setValidationIssues(null);
          handleGenerateSwe1();
        }}
      >
        <Play className="mr-2 h-4 w-4" />
        Continue Anyway
      </Button>
    </div>
  </div>
) : (
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={() => {
        const prevStep = (useEnhancedGeneration || useEpicMode) ? 'configure' : 'upload';
        navigateToStep(prevStep as any);
      }}
    >
      Back
    </Button>

    <Button
      variant="outline"
      onClick={handleShowPromptModal}
      disabled={isLoading}
      title="View and customize AI prompt"
    >
      <Eye className="h-4 w-4 mr-2" />
      AI Prompt
    </Button>

    <Button
      onClick={handleGenerateSwe1}
      disabled={
        isLoading ||
        (
          session.status !== ProcessingStatus.PENDING &&
          session.status !== ProcessingStatus.FAILED &&
          session.status !== ProcessingStatus.COMPLETED
        )
      }
      className="flex-1"
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          {useEpicMode
            ? 'Start Epic-wise Generation'
            : useEnhancedGeneration
              ? 'Start Enhanced Generation'
              : 'Start Generation'}
        </>
      )}
    </Button>
  </div>
)}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">About Enhanced Generation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Epic-wise Features:</strong> Upload multiple files or Excel worksheets
            with per-EPIC domain & interface selection for organized requirements generation.
          </p>
          <p>
            <strong>EPIC 8 Features:</strong> Multi-domain context assembly, interface-driven
            requirements enhancement, and hybrid RAG architecture for superior results.
          </p>
          <p>
            <strong>Hybrid RAG:</strong> Combines BM25 sparse retrieval with dense embeddings
            (α=0.4, β=0.6) for optimal context matching.
          </p>
          <p>
            <strong>Output Formats:</strong> Professional Excel workbooks with traceability
            matrix, CSV for data analysis, or Markdown for documentation.
          </p>
        </CardContent>
      </Card>

      {showPromptModal && (
        <AIPromptModal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          promptType={currentPromptType}
          originalPrompt={customPrompt || 'Generate comprehensive SWE.1 requirements from the provided SYS2 requirements using enhanced multi-domain context and interface specifications.'}
          contextData={getPromptContextData()}
          onExecute={async (editedPrompt: string) => {
            setCustomPrompt(editedPrompt);
            setShowPromptModal(false);
            await handleGenerateSwe1();
          }}
          title={useEpicMode ? "Epic-wise SWE.1 Generation Prompt" : "SWE.1 Generation Prompt"}
        />
      )}
    </div>
  );
};

export default EnhancedDomainTestbedPage;