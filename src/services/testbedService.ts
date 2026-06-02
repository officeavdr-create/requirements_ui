// import api from './api';
// import type {
//   DomainTestbedRequest,
//   DomainTestbedResponse,
//   FileUploadResponse,
//   SessionStatusResponse,
//   HealthResponse
// } from './types';

// class TestbedService {
//   // Create a new testbed session
//   async createSession(sessionName?: string): Promise<DomainTestbedResponse> {
//     const response = await api.post<DomainTestbedResponse>('/testbed/create-session', {
//       session_name: sessionName
//     });
//     return response.data;
//   }

//   // Upload domain scope file
//   async uploadDomainFile(sessionId: string, file: File): Promise<FileUploadResponse> {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await api.post<FileUploadResponse>(
//       `/testbed/${sessionId}/upload-domain`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );
//     return response.data;
//   }

//   // Upload SYS2 requirements file
//   async uploadSys2File(sessionId: string, file: File): Promise<FileUploadResponse> {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await api.post<FileUploadResponse>(
//       `/testbed/${sessionId}/upload-sys2`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );
//     return response.data;
//   }
//   // Generate SWE.1 requirements
//   async generateSwe1(sessionId: string, regenerateEmbeddings: boolean = true, outputFormat: string = 'markdown', customPrompt?: string): Promise<any> {
//     const formData = new FormData();
//     formData.append('regenerate_embeddings', regenerateEmbeddings.toString());
//     formData.append('output_format', outputFormat);

//     // Add custom prompt if provided
//     if (customPrompt) {
//       formData.append('custom_prompt', customPrompt);
//     }

//     const response = await api.post(
//       `/testbed/${sessionId}/generate-swe1`,
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );
//     return response.data;
//   }

//   // Get session status
//   async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
//     const response = await api.get<SessionStatusResponse>(`/testbed/${sessionId}/status`);
//     return response.data;
//   }

//   // Download generated SWE.1 file
//   async downloadSwe1(sessionId: string): Promise<Blob> {
//     const response = await api.get(`/testbed/${sessionId}/download`, {
//       responseType: 'blob',
//     });
//     return response.data;
//   }

//   // Delete session
//   async deleteSession(sessionId: string): Promise<any> {
//     const response = await api.delete(`/testbed/${sessionId}`);
//     return response.data;
//   }

//   // Health check
//   async checkHealth(): Promise<HealthResponse> {
//     const response = await api.get<HealthResponse>('/health');
//     return response.data;
//   }

//   // EPIC 8: Enhanced generation methods

//   // Select domains for multi-domain context
//   async selectDomains(sessionId: string, domainIds: string[]): Promise<any> {
//     // For now, just return success - selections are stored in frontend state
//     // Backend will need to be updated to support storing selections
//     return { success: true, message: "Domains selected", domain_ids: domainIds };
//   }

//   // Select interfaces for enhancement
//   async selectInterfaces(sessionId: string, interfaceIds: string[]): Promise<any> {
//     // For now, just return success - selections are stored in frontend state
//     // Backend will need to be updated to support storing selections
//     return { success: true, message: "Interfaces selected", interface_ids: interfaceIds };
//   }

//   // Generate enhanced SWE.1 with multi-domain context
//   async generateEnhancedSwe1(sessionId: string, options: {
//     output_format: string;
//     include_traceability: boolean;
//     max_context_chunks: number;
//     custom_prompt?: string;
//     selected_interfaces?: string[];
//     selected_domains?: string[];
//   }): Promise<any> {
//     console.log('generateEnhancedSwe1 called with:', { sessionId, options });

//     // Enhanced mode workaround: Upload a dummy domain file first if none exists
//     try {
//       // Check if domain file exists
//       const statusResponse = await api.get(`/testbed/${sessionId}/status`);
//       console.log('Session status:', statusResponse.data);

//       // If no domain file, upload a dummy one
//       if (!statusResponse.data.domain_file_path) {
//         console.log('No domain file found, uploading dummy domain file...');

//         // Create a dummy domain markdown file
//         const dummyDomainContent = `# Enhanced Multi-Domain Scope

// This is a placeholder domain file for Enhanced Generation mode.

// ## Selected Domains
// Enhanced generation will use the selected domains from the database instead of this file.

// ## Processing Mode
// - Mode: Enhanced Multi-Domain
// - Context: Selected domain scope documents from database
// - Interfaces: User-selected interface specifications
// `;

//         const dummyFile = new Blob([dummyDomainContent], { type: 'text/markdown' });
//         const formData = new FormData();
//         formData.append('file', dummyFile, 'enhanced-domain-scope.md');

//         const uploadResponse = await api.post(
//           `/testbed/${sessionId}/upload-domain`,
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           }
//         );
//         console.log('Dummy domain file uploaded:', uploadResponse.data);
//       }
//     } catch (uploadError) {
//       console.error('Failed to upload dummy domain file:', uploadError);
//       // Continue anyway, might work without it
//     }

//     // Now proceed with SWE.1 generation
//     const formData = new FormData();
//     formData.append('regenerate_embeddings', 'false');  // Don't regenerate since we're using selected domains
//     formData.append('output_format', options.output_format);

//     // Add custom prompt if provided
//     if (options.custom_prompt) {
//       formData.append('custom_prompt', options.custom_prompt);
//     }

//     // Add selected interfaces if provided
//     if (options.selected_interfaces && options.selected_interfaces.length > 0) {
//       formData.append('selected_interfaces', JSON.stringify(options.selected_interfaces));
//     }

//     // Add selected domains if provided
//     if (options.selected_domains && options.selected_domains.length > 0) {
//       formData.append('selected_domains', JSON.stringify(options.selected_domains));
//     }

//     console.log('FormData contents:');
//     for (let [key, value] of formData.entries()) {
//       console.log(key, value);
//     }

//     console.log('Making API call to:', `/testbed/${sessionId}/generate-swe1`);

//     try {
//       const response = await api.post(
//         `/testbed/${sessionId}/generate-swe1`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );
//       console.log('API response:', response);
//       return response.data;
//     } catch (error) {
//       console.error('API call failed:', error);
//       console.error('Error details:', error.response?.data);
//       console.error('Error status:', error.response?.status);
//       console.error('Error headers:', error.response?.headers);
//       throw error;
//     }
//   }
// }

// export const testbedService = new TestbedService();
// export default testbedService;


import api from './api';
import type {
  DomainTestbedRequest,
  DomainTestbedResponse,
  FileUploadResponse,
  SessionStatusResponse,
  HealthResponse
} from './types';

export interface EpicUploadRequest {
  files: File[];
  uploadMode: 'single' | 'multi-files' | 'multi-worksheets';
  includeComponentNames?: boolean;
  epicMetadata?: Array<{
    name: string;
    type: 'file' | 'worksheet';
    fileName?: string;
    worksheetName?: string;
  }>;

}

export interface EpicSelection {
  epicId: string;
  domainIds: string[];
  interfaceIds: string[];
}
// export interface Sys2DomainValidationResult {
//   valid: boolean;
//   skipped?: boolean;
//   reason?: string;
//   message?: string;
//   sys2_component_domains: string[];
//   selected_domain_names: string[];
//   mismatched_domains: string[];
//   missing_domain_reqs: Array<{ id: string; title: string; epic?: string }>;
//   missing_domain_count: number;
//   has_components_column: boolean;
// }
export interface Sys2DomainValidationResult {
  valid?: boolean;
  skipped?: boolean;
  review_required?: boolean;
  reason?: string;
  message?: string;
  warning_message?: string;
  validation_reasons?: string[];
  warnings?: string[];

  sys2_component_domains?: string[];
  resolved_sys2_domains?: string[];
  selected_domain_names?: string[];

  mismatched_domains: string[];
  missing_domain_reqs: Array<{
    id: string;
    title: string;
    epic?: string;
    sheet?: string;
  }>;

  mismatched_domains_by_sheet?: Record<string, string[]>;
  missing_domain_reqs_by_sheet?: Record<
    string,
    Array<{
      id: string;
      title: string;
      epic?: string;
      sheet?: string;
    }>
  >;

  mismatched_domain_count?: number;
  unresolved_components?: string[];
  unresolved_component_count?: number;
  missing_domain_count?: number;
  has_components_column?: boolean;
}
export interface EpicGenerationRequest {
  sessionId: string;
  epicSelections: EpicSelection[];
  outputFormat: string;
  includeTraceability: boolean;
  maxContextChunks: number;
  customPrompt?: string;
  include_component_names?: boolean;
}
export interface EpicDomainSuggestion {
  suggested_domain_ids:   string[];
  matched_domain_names:   string[];
  unmatched_domain_names: string[];
  reason?: string;
}

class TestbedService {
  // Create a new testbed session
  async createSession(sessionName?: string): Promise<DomainTestbedResponse> {
    const response = await api.post<DomainTestbedResponse>('/testbed/create-session', {
      session_name: sessionName
    });
    return response.data;
  }
  async suggestEpicDomains(
    sessionId: string
  ): Promise<Record<string, EpicDomainSuggestion>> {
    const response = await api.get(`/testbed/${sessionId}/suggest-epic-domains`);
    return response.data.suggestions ?? {};
  }
  // Upload domain scope file
  // async uploadDomainFile(sessionId: string, file: File): Promise<FileUploadResponse> {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   const response = await api.post<FileUploadResponse>(
  //     `/testbed/${sessionId}/upload-domain`,
  //     formData,
  //     {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     }
  //   );
  //   return response.data;
  // }
  async uploadDomainFile(sessionId: string, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<FileUploadResponse>(
      `/testbed/${sessionId}/upload-domain`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  // Upload SYS2 requirements file (legacy single file)
  // async uploadSys2File(sessionId: string, file: File): Promise<FileUploadResponse> {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   const response = await api.post<FileUploadResponse>(
  //     `/testbed/${sessionId}/upload-sys2`,
  //     formData,
  //     {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     }
  //   );
  //   return response.data;
  // }

  // // NEW: Upload multiple SYS2 files for epic-wise processing
  // async uploadEpicSys2Files(sessionId: string, request: EpicUploadRequest): Promise<FileUploadResponse> {
  //   const formData = new FormData();

  //   // Add files
  //   request.files.forEach((file, index) => {
  //     formData.append(`files`, file);
  //   });

  //   // Add upload mode
  //   formData.append('upload_mode', request.uploadMode);

  //   // Add epic metadata if provided
  //   if (request.epicMetadata) {
  //     formData.append('epic_metadata', JSON.stringify(request.epicMetadata));
  //   }

  //   const response = await api.post<FileUploadResponse>(
  //     `/testbed/${sessionId}/upload-epic-sys2`,
  //     formData,
  //     {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     }
  //   );
  //   return response.data;
  // }
  async uploadSys2File(sessionId: string, file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<FileUploadResponse>(
      `/testbed/${sessionId}/upload-sys2`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  // NEW: Epic upload
  // async uploadEpicSys2Files(
  //   sessionId: string,
  //   files: File[],
  //   uploadMode: 'single' | 'multi-files' | 'multi-worksheets'
  // ): Promise<FileUploadResponse> {
  //   const formData = new FormData();

  //   files.forEach((file) => {
  //     formData.append('files', file);
  //   });

  //   formData.append('upload_mode', uploadMode);

  //   const response = await api.post<FileUploadResponse>(
  //     `/testbed/${sessionId}/upload-epic-sys2`,
  //     formData,
  //     { headers: { 'Content-Type': 'multipart/form-data' } }
  //   );
  //   return response.data;
  // }
  async uploadEpicSys2Files(
    sessionId: string,
    files: File[],
    uploadMode: 'single' | 'multi-files' | 'multi-worksheets',
    includeComponentNames: boolean = false
  ): Promise<FileUploadResponse> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('upload_mode', uploadMode);
    formData.append('include_component_names', includeComponentNames.toString());


    const response = await api.post<FileUploadResponse>(
      `/testbed/${sessionId}/upload-epic-sys2`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  // NEW: Get epics stored in backend
  async getSessionEpics(sessionId: string): Promise<Array<{
    id: string;
    name: string;
    type: 'file' | 'worksheet';
    fileName?: string;
    worksheetName?: string;
    filePath?: string;
  }>> {
    try {
      const response = await api.get(`/testbed/${sessionId}/epics`);
      return response.data.epics || [];
    } catch (error) {
      console.error('Failed to get session epics:', error);
      return [];
    }
  }

  // NEW: Get epic information after upload
  async getEpicInfo(sessionId: string): Promise<{
    epics: Array<{
      id: string;
      name: string;
      type: 'file' | 'worksheet';
      fileName?: string;
      worksheetName?: string;
      includeComponentNames?: boolean;
    }>;
  }> {
    const response = await api.get(`/testbed/${sessionId}/epics`);
    return response.data;
  }

  // NEW: Save epic-wise domain and interface selections
  async saveEpicSelections(sessionId: string, selections: EpicSelection[]): Promise<any> {
    const response = await api.post(
      `/testbed/${sessionId}/epic-selections`,
      { selections }
    );
    return response.data;
  }

  // NEW: Get saved epic selections
  async getEpicSelections(sessionId: string): Promise<{ selections: EpicSelection[] }> {
    const response = await api.get(`/testbed/${sessionId}/epic-selections`);
    return response.data;
  }

  // Generate SWE.1 requirements (legacy)
  async generateSwe1(sessionId: string, regenerateEmbeddings: boolean = true, outputFormat: string = 'markdown', customPrompt?: string): Promise<any> {
    const formData = new FormData();
    formData.append('regenerate_embeddings', regenerateEmbeddings.toString());
    formData.append('output_format', outputFormat);

    if (customPrompt) {
      formData.append('custom_prompt', customPrompt);
    }

    const response = await api.post(
      `/testbed/${sessionId}/generate-swe1`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // NEW: Generate epic-wise SWE.1 requirements
  async generateEpicSwe1(sessionId: string, request: EpicGenerationRequest): Promise<any> {
    const formData = new FormData();
    formData.append('epic_selections', JSON.stringify(request.epicSelections));
    formData.append('output_format', request.outputFormat);
    formData.append('include_traceability', request.includeTraceability.toString());
    formData.append('max_context_chunks', request.maxContextChunks.toString());
    formData.append('include_component_names', (request.include_component_names ? 'true' : 'false'));
    if (request.customPrompt) {
      formData.append('custom_prompt', request.customPrompt);
    }

    const response = await api.post(
      `/testbed/${sessionId}/generate-epic-swe1`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Generate enhanced SWE.1 with multi-domain context (existing enhanced)
  //   async generateEnhancedSwe1(sessionId: string, options: {
  //     output_format: string;
  //     include_traceability: boolean;
  //     max_context_chunks: number;
  //     custom_prompt?: string;
  //     selected_interfaces?: string[];
  //     selected_domains?: string[];
  //   }): Promise<any> {
  //     console.log('generateEnhancedSwe1 called with:', { sessionId, options });

  //     try {
  //       const statusResponse = await api.get(`/testbed/${sessionId}/status`);
  //       console.log('Session status:', statusResponse.data);

  //       if (!statusResponse.data.domain_file_path) {
  //         console.log('No domain file found, uploading dummy domain file...');

  //         const dummyDomainContent = `# Enhanced Multi-Domain Scope

  // This is a placeholder domain file for Enhanced Generation mode.

  // ## Selected Domains
  // Enhanced generation will use the selected domains from the database instead of this file.

  // ## Processing Mode
  // - Mode: Enhanced Multi-Domain
  // - Context: Selected domain scope documents from database
  // - Interfaces: User-selected interface specifications
  // `;

  //         const dummyFile = new Blob([dummyDomainContent], { type: 'text/markdown' });
  //         const formData = new FormData();
  //         formData.append('file', dummyFile, 'enhanced-domain-scope.md');

  //         const uploadResponse = await api.post(
  //           `/testbed/${sessionId}/upload-domain`,
  //           formData,
  //           {
  //             headers: {
  //               'Content-Type': 'multipart/form-data',
  //             },
  //           }
  //         );
  //         console.log('Dummy domain file uploaded:', uploadResponse.data);
  //       }
  //     } catch (uploadError) {
  //       console.error('Failed to upload dummy domain file:', uploadError);
  //     }

  //   const formData = new FormData();
  //   formData.append('regenerate_embeddings', 'false');
  //   formData.append('output_format', options.output_format);

  //   if (options.custom_prompt) {
  //     formData.append('custom_prompt', options.custom_prompt);
  //   }

  //   if (options.selected_interfaces && options.selected_interfaces.length > 0) {
  //     formData.append('selected_interfaces', JSON.stringify(options.selected_interfaces));
  //   }

  //   if (options.selected_domains && options.selected_domains.length > 0) {
  //     formData.append('selected_domains', JSON.stringify(options.selected_domains));
  //   }

  //   console.log('Making API call to:', `/testbed/${sessionId}/generate-swe1`);

  //   try {
  //     const response = await api.post(
  //       `/testbed/${sessionId}/generate-swe1`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     );
  //     console.log('API response:', response);
  //     return response.data;
  //   } catch (error) {
  //     console.error('API call failed:', error);
  //     throw error;
  //   }
  // }
  async generateEnhancedSwe1(sessionId: string, options: {
    output_format: string;
    include_traceability: boolean;
    max_context_chunks: number;
    custom_prompt?: string;
    selected_interfaces?: string[];
    selected_domains?: string[];
    include_component_names?: boolean;
    epic_selections?: Array<{
      epicId: string;
      domainIds: string[];
      interfaceIds: string[];
      include_component_names?: boolean;
    }>;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('regenerate_embeddings', 'false');
    formData.append('output_format', options.output_format);
    formData.append('include_component_names', (options.include_component_names ? 'true' : 'false'));

    if (options.custom_prompt) {
      formData.append('custom_prompt', options.custom_prompt);
    }

    if (options.selected_interfaces && options.selected_interfaces.length > 0) {
      formData.append('selected_interfaces', JSON.stringify(options.selected_interfaces));
    }

    if (options.selected_domains && options.selected_domains.length > 0) {
      formData.append('selected_domains', JSON.stringify(options.selected_domains));
    }

    // NEW: Epic selections
    if (options.epic_selections && options.epic_selections.length > 0) {
      formData.append('epic_selections', JSON.stringify(options.epic_selections));
      const response = await api.post(
        `/testbed/${sessionId}/generate-epic-swe1`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    }

    // Regular enhanced generation
    const response = await api.post(
      `/testbed/${sessionId}/generate-swe1`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }
  // Get session status
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    const response = await api.get<SessionStatusResponse>(`/testbed/${sessionId}/status`);
    return response.data;
  }

  // Download generated SWE.1 file
  // async downloadSwe1(sessionId: string): Promise<Blob> {
  //   const response = await api.get(`/testbed/${sessionId}/download`, {
  //     responseType: 'blob',
  //   });
  //   return response.data;
  // }
  // services/testbedService.ts
  async downloadSwe1(sessionId: string): Promise<{ blob: Blob; fileName: string; contentType: string }> {
    const response = await api.get(`/testbed/${sessionId}/download`, { responseType: 'blob' });
    // Parse Content-Disposition to extract filename
    const cd = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    let fileName = `swe1-output-${sessionId.slice(0, 8)}`;
    const m = cd ? /filename="?([^"]+)"?/i.exec(cd) : null;
    if (m && m[1]) fileName = m[1];
    // Get content type
    const contentType = response.headers['content-type'] || response.headers['Content-Type'] || 'application/octet-stream';
    // Return structured payload
    return { blob: response.data, fileName, contentType };
  }


  // NEW: Download epic-wise generated SWE.1 files
  async downloadEpicSwe1(sessionId: string, epicId?: string): Promise<Blob> {
    const url = epicId
      ? `/testbed/${sessionId}/download-epic/${epicId}`
      : `/testbed/${sessionId}/download-all-epics`;

    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<any> {
    const response = await api.delete(`/testbed/${sessionId}`);
    return response.data;
  }

  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  }

  // Select domains for multi-domain context
  async selectDomains(sessionId: string, domainIds: string[]): Promise<any> {
    return { success: true, message: "Domains selected", domain_ids: domainIds };
  }

  // Select interfaces for enhancement
  async selectInterfaces(sessionId: string, interfaceIds: string[]): Promise<any> {
    return { success: true, message: "Interfaces selected", interface_ids: interfaceIds };
  }

  // Extract components from uploaded Excel file
  async extractComponents(sessionId: string): Promise<{
    success: boolean;
    session_id: string;
    sheets: Record<string, string[]>;
    total_sheets: number;
    total_components: number;
  }> {
    const response = await api.post(`/testbed/${sessionId}/extract-components`);
    return response.data;
  }
// Add to the existing testbedService object
// async validateSys2Domains(
//   sessionId: string,
//   selectedDomainIds: string[],
//   includeComponentNames = true
// ): Promise<Sys2DomainValidationResult> {
//   const fd = new FormData();
//   fd.append('selected_domain_ids', JSON.stringify(selectedDomainIds));
//   fd.append('include_component_names', String(includeComponentNames));

//   const response = await api.post(
//     `/testbed/${sessionId}/validate-sys2-domains`,
//     fd,
//     {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     }
//   );

//   return response.data;
// }
async validateSys2Domains(
  sessionId: string,
  selectedDomainIds: string[],
  includeComponentNames = true,
  epicSelections?: Array<{ epicId: string; domainIds: string[] }>
): Promise<any> {
  const fd = new FormData();
  fd.append('selected_domain_ids', JSON.stringify(selectedDomainIds));
  fd.append('include_component_names', String(includeComponentNames));

  if (epicSelections && epicSelections.length > 0) {
    fd.append('epic_selections', JSON.stringify(epicSelections));
  }

  const response = await api.post(
    `/testbed/${sessionId}/validate-sys2-domains`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}
}


export const testbedService = new TestbedService();
export default testbedService;