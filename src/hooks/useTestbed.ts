// import { useState, useCallback } from 'react';
// import { testbedService } from '@/services/testbedService';
// import { ProcessingStatus } from '@/services/types';
// import type { 
//   SessionStatusResponse, 
//   FileUploadResponse 
// } from '@/services/types';

// export interface TestbedSession {
//   sessionId: string | null;
//   status: ProcessingStatus;
//   message: string;
//   progressPercentage?: number;
//   currentStep?: string;
//   errorDetails?: string;
//   domainFileUploaded: boolean;
//   sys2FileUploaded: boolean;
// }

// export function useTestbed() {
//   const [session, setSession] = useState<TestbedSession>({
//     sessionId: null,
//     status: ProcessingStatus.PENDING,
//     message: 'Ready to create session',
//     domainFileUploaded: false,
//     sys2FileUploaded: false,
//   });
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const createSession = useCallback(async (sessionName?: string) => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const response = await testbedService.createSession(sessionName);
//       setSession({
//         sessionId: response.session_id,
//         status: response.status,
//         message: response.message,
//         domainFileUploaded: false,
//         sys2FileUploaded: false,
//       });
//       return response;
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.detail || err.message || 'Failed to create session';
//       setError(errorMessage);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const uploadDomainFile = useCallback(async (file: File) => {
//     if (!session.sessionId) {
//       throw new Error('No active session');
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await testbedService.uploadDomainFile(session.sessionId, file);
//       setSession(prev => ({
//         ...prev,
//         domainFileUploaded: response.success,
//         message: response.message,
//       }));
//       return response;
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload domain file';
//       setError(errorMessage);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [session.sessionId]);
//   const uploadSys2File = useCallback(async (file: File) => {
//     if (!session.sessionId) {
//       throw new Error('No active session');
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await testbedService.uploadSys2File(session.sessionId, file);
//       setSession(prev => ({
//         ...prev,
//         sys2FileUploaded: response.success,
//         message: response.message,
//       }));
//       return response;
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload SYS2 file';
//       setError(errorMessage);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [session.sessionId]);

//   const generateSwe1 = useCallback(async (regenerateEmbeddings: boolean = true, outputFormat: string = 'markdown') => {
//     if (!session.sessionId) {
//       throw new Error('No active session');
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await testbedService.generateSwe1(session.sessionId, regenerateEmbeddings, outputFormat);
//       setSession(prev => ({
//         ...prev,
//         status: ProcessingStatus.PROCESSING_DOMAIN,
//         message: 'Generation started...',
//       }));
//       return response;
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.detail || err.message || 'Failed to start generation';
//       setError(errorMessage);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [session.sessionId]);

//   const checkStatus = useCallback(async () => {
//     if (!session.sessionId) {
//       return;
//     }

//     try {
//       const response = await testbedService.getSessionStatus(session.sessionId);
//       setSession(prev => ({
//         ...prev,
//         status: response.status,
//         message: response.message,
//         progressPercentage: response.progress_percentage,
//         currentStep: response.current_step,
//         errorDetails: response.error_details,
//       }));
//       return response;
//     } catch (err: any) {
//       console.error('Failed to check status:', err);
//       // Don't set error for status checks - they happen frequently
//     }
//   }, [session.sessionId]);
//   const downloadSwe1 = useCallback(async (outputFormat: string = 'markdown') => {
//     if (!session.sessionId) {
//       throw new Error('No active session');
//     }

//     try {
//       const blob = await testbedService.downloadSwe1(session.sessionId);
      
//       // Determine file extension based on format
//       let extension = '.md';
//       if (outputFormat === 'excel') extension = '.xlsx';
//       else if (outputFormat === 'csv') extension = '.csv';
      
//       // Create download link
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `swe1-output-${session.sessionId}${extension}`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
      
//       return true;
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.detail || err.message || 'Failed to download file';
//       setError(errorMessage);
//       throw err;
//     }
//   }, [session.sessionId]);

//   const deleteSession = useCallback(async () => {
//     if (!session.sessionId) {
//       return;
//     }

//     try {
//       await testbedService.deleteSession(session.sessionId);
//       setSession({
//         sessionId: null,
//         status: ProcessingStatus.PENDING,
//         message: 'Ready to create session',
//         domainFileUploaded: false,
//         sys2FileUploaded: false,
//       });
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete session';
//       setError(errorMessage);
//       throw err;
//     }
//   }, [session.sessionId]);

//   const clearError = useCallback(() => {
//     setError(null);
//   }, []);

//   return {
//     session,
//     isLoading,
//     error,
//     createSession,
//     uploadDomainFile,
//     uploadSys2File,
//     generateSwe1,
//     checkStatus,
//     downloadSwe1,
//     deleteSession,
//     clearError,
//   };
// }

import { useState, useCallback } from 'react';
import { testbedService, EpicUploadRequest, EpicSelection, EpicGenerationRequest } from '@/services/testbedService';
import { ProcessingStatus } from '@/services/types';

export interface TestbedSession {
  sessionId: string;
  sessionName?: string;
  status: ProcessingStatus;
  currentStep?: string;
  progressPercentage?: number;
  domainFileUploaded: boolean;
  sys2FileUploaded: boolean;
  epicMode: boolean;
  epicCount?: number;
  createdAt?: string;
  updatedAt?: string;
  errorDetails?: string;
}

export interface Epic {
  id: string;
  name: string;
  type: 'file' | 'worksheet';
  fileName?: string;
  worksheetName?: string;
}

export const useTestbed = () => {
  const [session, setSession] = useState<TestbedSession>({
    sessionId: '',
    status: ProcessingStatus.PENDING,
    domainFileUploaded: false,
    sys2FileUploaded: false,
    epicMode: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [epics, setEpics] = useState<Epic[]>([]);

  const createSession = useCallback(async (sessionName?: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await testbedService.createSession(sessionName);
      setSession({
        sessionId: response.session_id,
        sessionName: sessionName,
        status: response.status,
        domainFileUploaded: false,
        sys2FileUploaded: false,
        epicMode: false
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDomainFile = useCallback(async (file: File) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await testbedService.uploadDomainFile(session.sessionId, file);
      setSession(prev => ({
        ...prev,
        domainFileUploaded: true
      }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to upload domain file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session.sessionId]);

  const uploadSys2File = useCallback(async (file: File) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await testbedService.uploadSys2File(session.sessionId, file);
      setSession(prev => ({
        ...prev,
        sys2FileUploaded: true
      }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to upload SYS2 file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session.sessionId]);

  // NEW: Upload epic-wise SYS2 files
  const uploadEpicSys2Files = useCallback(async (request: EpicUploadRequest) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await testbedService.uploadEpicSys2Files(session.sessionId, request);
      
      // Fetch epic information after upload
      const epicInfo = await testbedService.getEpicInfo(session.sessionId);
      setEpics(epicInfo.epics);
      
      setSession(prev => ({
        ...prev,
        sys2FileUploaded: true,
        epicMode: true,
        epicCount: epicInfo.epics.length
      }));
      
      return response;
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to upload epic SYS2 files');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session.sessionId]);

  // NEW: Save epic selections
  const saveEpicSelections = useCallback(async (selections: EpicSelection[]) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    try {
      await testbedService.saveEpicSelections(session.sessionId, selections);
    } catch (err: any) {
      console.error('Failed to save epic selections:', err);
    }
  }, [session.sessionId]);

  // NEW: Get epic selections
  const getEpicSelections = useCallback(async (): Promise<EpicSelection[]> => {
    if (!session.sessionId) {
      return [];
    }
    
    try {
      const response = await testbedService.getEpicSelections(session.sessionId);
      return response.selections;
    } catch (err: any) {
      console.error('Failed to get epic selections:', err);
      return [];
    }
  }, [session.sessionId]);

  const generateSwe1 = useCallback(async (
    regenerateEmbeddings: boolean = true, 
    outputFormat: string = 'markdown',
    customPrompt?: string
  ) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await testbedService.generateSwe1(
        session.sessionId, 
        regenerateEmbeddings, 
        outputFormat,
        customPrompt
      );
      
      setSession(prev => ({
        ...prev,
        status: ProcessingStatus.PROCESSING_DOMAIN
      }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to start SWE.1 generation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session.sessionId]);

  // NEW: Generate epic-wise SWE.1
  const generateEpicSwe1 = useCallback(async (request: EpicGenerationRequest) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await testbedService.generateEpicSwe1(session.sessionId, request);
      
      setSession(prev => ({
        ...prev,
        status: ProcessingStatus.PROCESSING_SYS2
      }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to start epic SWE.1 generation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session.sessionId]);

  const generateEnhancedSwe1 = useCallback(async (options: {
    output_format: string;
    include_traceability: boolean;
    max_context_chunks: number;
    custom_prompt?: string;
    selected_interfaces?: string[];
    selected_domains?: string[];
    include_component_names: boolean;
  }) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await testbedService.generateEnhancedSwe1(session.sessionId, options);
      
      setSession(prev => ({
        ...prev,
        status: ProcessingStatus.PROCESSING_SYS2
      }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to start enhanced SWE.1 generation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session.sessionId]);

  const checkStatus = useCallback(async () => {
    if (!session.sessionId) return;
    
    try {
      const statusResponse = await testbedService.getSessionStatus(session.sessionId);
      setSession(prev => ({
        ...prev,
        status: statusResponse.status,
        currentStep: statusResponse.current_step || statusResponse.message,
        progressPercentage: statusResponse.progress_percentage,
        errorDetails: statusResponse.error_details
      }));
      
      setError('');
    } catch (err: any) {
      console.error('Failed to check status:', err);
    }
  }, [session.sessionId]);

  const downloadSwe1 = useCallback(async (outputFormat: string = 'markdown') => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    try {
      const blob = await testbedService.downloadSwe1(session.sessionId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swe1-requirements-${session.sessionId.slice(0, 8)}.${
        outputFormat === 'excel' ? 'xlsx' : 
        outputFormat === 'csv' ? 'csv' : 'md'
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to download file');
      throw err;
    }
  }, [session.sessionId]);
  // EnhancedDomainTestbedPage.tsx — button handler uses server filename/type
  const handleDownload = async () => {
    try {
      // const blob = await testbedService.downloadSwe1(session.sessionId);

      const { blob, fileName, contentType } = await testbedService.downloadSwe1(session.sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // trust server-provided name (ZIP when epic)
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Download failed. Please try again.');
    }
  };

  // NEW: Download epic-wise SWE.1
  const downloadEpicSwe1 = useCallback(async (epicId?: string) => {
    if (!session.sessionId) {
      throw new Error('No active session');
    }
    
    try {
      const blob = await testbedService.downloadEpicSwe1(session.sessionId, epicId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = epicId 
        ? `epic-swe1-${epicId}-${session.sessionId.slice(0, 8)}.xlsx`
        : `all-epics-swe1-${session.sessionId.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to download epic file');
      throw err;
    }
  }, [session.sessionId]);

  const deleteSession = useCallback(async () => {
    if (!session.sessionId) return;
    
    setIsLoading(true);
    
    try {
      await testbedService.deleteSession(session.sessionId);
      
      setSession({
        sessionId: '',
        status: ProcessingStatus.PENDING,
        domainFileUploaded: false,
        sys2FileUploaded: false,
        epicMode: false
      });
      setEpics([]);
      setError('');
    } catch (err: any) {
      console.error('Failed to delete session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session.sessionId]);

  return {
    session,
    epics,
    isLoading,
    error,
    createSession,
    uploadDomainFile,
    uploadSys2File,
    uploadEpicSys2Files,      // NEW
    saveEpicSelections,       // NEW
    getEpicSelections,        // NEW
    generateSwe1,
    generateEpicSwe1,         // NEW
    generateEnhancedSwe1,
    checkStatus,
    downloadSwe1,
    downloadEpicSwe1,         // NEW
    deleteSession,
    handleDownload
  };
};