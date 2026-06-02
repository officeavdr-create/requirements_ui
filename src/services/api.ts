// import axios from 'axios';
import axios, { AxiosResponse } from 'axios';
// import {
//   Interface,
//   InterfaceSearchRequest,
//   InterfaceSearchResponse,
//   VersionResponse,
//   GenerateDiagramRequest,
//   GenerateDiagramResponse,
//   UploadResponse,
// } from '@/types/interface';

import { DomainResponse, Interface, InterfaceSearchRequest, InterfaceSearchResponse, VersionResponse, GenerateDiagramRequest, GenerateDiagramResponse, UploadResponse } from '../types/interface';

// VITE_API_URL is injected at build time via the Dockerfile --build-arg VITE_API_URL.
// In Docker (no proxy): set to http://<host-ip>:8000/api/v1
// In local dev (Vite proxy active): leave unset → falls back to relative '/api/v1'
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers or common config here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// export const interfaceAPI = {
//   // Upload Excel file
//   uploadFile: async (file: File): Promise<UploadResponse> => {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response: AxiosResponse<UploadResponse> = await api.post('/interfaces/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Get all versions
//   getVersions: async (): Promise<string[]> => {
//     const response: AxiosResponse<VersionResponse> = await api.get('/interfaces/versions');
//     return response.data.versions;
//   },

//   // Get all interfaces
//   getInterfaces: async (version?: string, interface_type?: string): Promise<Interface[]> => {
//     const params = new URLSearchParams();
//     if (version) params.append('version', version);
//     if (interface_type) params.append('interface_type', interface_type);

//     const response: AxiosResponse<Interface[]> = await api.get(`/interfaces/?${params.toString()}`);
//     return response.data;
//   },

//   // Search interfaces
//   searchInterfaces: async (searchRequest: InterfaceSearchRequest): Promise<InterfaceSearchResponse> => {
//     const response: AxiosResponse<InterfaceSearchResponse> = await api.post('/interfaces/search', searchRequest);
//     return response.data;
//   },

//   // Get interface types
//   getInterfaceTypes: async (version?: string): Promise<string[]> => {
//     const params = new URLSearchParams();
//     if (version) params.append('version', version);

//     const response: AxiosResponse<string[]> = await api.get(`/interfaces/types?${params.toString()}`);
//     return response.data;
//   },

//   // Generate diagram
//   generateDiagram: async (request: GenerateDiagramRequest): Promise<GenerateDiagramResponse> => {
//     const response: AxiosResponse<GenerateDiagramResponse> = await api.post('/diagrams/generate', request);
//     return response.data;
//   },

//   // Download diagram
//   downloadDiagram: async (request: GenerateDiagramRequest): Promise<{ filename: string; content: string }> => {
//     const response: AxiosResponse<{ filename: string; content: string; content_type: string }> = 
//       await api.post('/diagrams/download', request);
//     return response.data;
//   },
// };


export const interfaceAPI = {
  getDomains: async (): Promise<DomainResponse> => {
    try {
      const response: AxiosResponse<DomainResponse> = await api.get('/sequence-interfaces/domains'); // Match backend endpoint
      console.log('Raw domains data from API:', response.data); // Debug log
      return response.data ?? [];
    } catch (error) {
      console.error('Error in getDomains:', error);
      throw error; // Let the caller handle the error
    }
  },

  getVersions: async (domain_id?: string): Promise<VersionResponse> => {
    try {
      const url = domain_id ? `/sequence-interfaces/versions?domain_id=${encodeURIComponent(domain_id)}` : '/sequence-interfaces/versions';
      const response = await api.get<VersionResponse>(url);
      return { versions: Array.isArray(response.data.versions) ? response.data.versions : [] };
    } catch (error) {
      console.error('Error in getVersions:', error);
      throw error;
    }
  },

  getInterfaces: async (version?: string, domain_id?: string): Promise<Interface[]> => {
    try {
      let url = '/sequence-interfaces/';
      const params = new URLSearchParams();
      if (version) params.append('version', version);
      if (domain_id) params.append('domain_id', domain_id);
      if (params.toString()) url += `?${params.toString()}`;
      const response = await api.get<Interface[]>(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error in getInterfaces:', error);
      throw error;
    }
  },

  searchInterfaces: async (request: InterfaceSearchRequest): Promise<InterfaceSearchResponse> => {
    try {
      const response = await api.post<InterfaceSearchResponse>('/sequence-interfaces/similarity-search', {
        ...request,
        query: request.requirements || request.query, // Fallback to query if requirements not provided
      });
      return {
        interfaces: Array.isArray(response.data.interfaces) ? response.data.interfaces : [],
        total_count: response.data.total_count ?? 0,
        query: request.requirements || request.query,
      };
    } catch (error) {
      console.error('Error in searchInterfaces:', error);
      throw error;
    }
  },

  uploadFile: async (file: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<UploadResponse>('/sequence-interfaces/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  },

  generateDiagram: async (request: GenerateDiagramRequest): Promise<GenerateDiagramResponse> => {
    try {
      const response = await api.post<GenerateDiagramResponse>('/diagrams/generate', request);
      return response.data;
    } catch (error) {
      console.error('Error in generateDiagram:', error);
      throw error;
    }
  },
  enhanceRequirements: async (data: GenerateDiagramRequest): Promise<GenerateDiagramResponse> => {
    try {
      const response = await api.post<GenerateDiagramResponse>('/diagrams/enhance-requirements', data);
      return response.data;
    } catch (error) {
      console.error('Error in enhanceRequirements:', error);
      throw error;
    }
  },
  getModels: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/diagrams/models');
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
      
    }
  },
  getEnhancePrompt: async (): Promise<string> => {
    try {
      const response = await api.get<{ prompt: string }>('/diagrams/enhance-prompt');
      console.log('Enhance prompt response:', response.data);

      return response.data; 
    } catch (error) {
      console.error('Error fetching enhance prompt:', error);
      throw error;
    }
  },

  getDiagramPrompt: async (): Promise<string> => {
    try {
      const response = await api.get<{ prompt: string }>('/diagrams/diagram-prompt');
      return response.data|| ''; // Extract the prompt string or return empty string
    } catch (error) {
      console.error('Error fetching diagram prompt:', error);
      throw error;
    }
  },

extractRequirementsFromExcel: async (file: File): Promise<{ requirements: string[] }> => {
try {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ requirements: string[] }>(
    '/sequence-interfaces/extract-requirements',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return { requirements: Array.isArray(response.data?.requirements) ? response.data.requirements : [] };
} catch (error) {
  console.error('Error in extractRequirementsFromExcel:', error);
  throw error;
}
},
};


export default api;
