/**
 * Unified Interface Service
 * Combines standard and enhanced interface processing capabilities
 * with support for versioning, real-time progress tracking, and comprehensive error handling
 */
import axios from 'axios';
import api from './api';

const API_BASE_URL = '/api/v1'; // Always use relative URL to leverage Vite proxy

// Create axios instance with extended timeout for interface operations
const interfaceApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for interface save operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error interceptor for proper error handling
interfaceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('InterfaceApi Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase()
    });
    return Promise.reject(error);
  }
);

export interface InterfaceProcessingRequest {
  raw_interface: string;
  domain_id: string;
  processing_options?: Record<string, any>;
}

export interface VersionedInterfaceProcessingRequest {
  raw_interface: string;
  domain_id: string;
  interface_spec_name: string;
  interface_spec_version: string;
  interface_spec_description?: string;
  processing_options?: Record<string, any>;
}

export interface InterfaceSpecValidationRequest {
  domain_id: string;
  interface_spec_name: string;
  interface_spec_version: string;
}

export interface InterfaceProcessingResponse {
  success: boolean;
  session_id?: string;
  domain_name: string;
  processing_timestamp: string;
  status: string;
  stages_completed: string[];
  current_stage?: string;
  current_stage_description?: string;
  progress_percentage?: number;
  total_stages?: number;
  stage_progress?: Record<string, any>;
  interfaces?: InterfaceSpecification[];
  validation_results?: Record<string, any>;
  errors: string[];
  analysis_data?: Record<string, any>;
  extraction_data?: Record<string, any>;
  parameter_data?: Record<string, any>;
}

export interface EnhancedInterfaceProcessingResponse extends InterfaceProcessingResponse {
  interface_spec_name: string;
  interface_spec_version: string;
  interface_spec_description?: string;
  embedding_status?: string;
}

export interface InterfaceSpecification {
  interface_id?: string;
  interface_name: string;
  interface_version?: string;
  interface_description: string;
  detailed_description?: string;
  parameters?: InterfaceParameter[];
  return_type?: string;
  return_description?: string;
  notifications?: string;
  api_reference?: string;
  constraints_notes?: string;
  sub_feature_section?: string;
  interface_category?: string;
  domain_association: string;
  ai_confidence_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InterfaceParameter {
  seq: number;
  type: string;
  name: string;
  description: string;
  required?: boolean;
  default_value?: string;
  constraints?: string;
}

export interface InterfaceVersion {
  spec_name: string;
  spec_version: string;
  interface_count: number;
  latest_created?: string;
  max_confidence: number;
}

export interface EmbeddingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

// EPIC 21: Enhanced 4-Tier Testbed Interface Types
export interface InterfaceSection {
  sectionName: string;
  sectionDescription?: string;
  interfaceCount: number;
  availableVersions: string[];
  parentDomainInstances: {
    instanceId: string;
    instanceName: string;
    versionsWithThisSection: string[];
  }[];
}

export interface VersionDisplayGroup {
  domainInstanceId: string;
  domainInstanceName: string;
  domainType: string;
  availableVersions: {
    version: string;
    interfaceCount: number;
    sectionsAvailable: string[];
    lastUpdated?: string;
  }[];
  totalInterfaces: number;
  isExpanded: boolean;
}

export interface GroupedInterface extends InterfaceSpecification {
  sectionName: string;
  domainInstanceName: string;
  domainInstanceId: string;
  versionGroup: string;
  sectionDisplayOrder?: number;
}

class UnifiedInterfaceService {
  private readonly baseUrl = `${API_BASE_URL}/interfaces`;
  
  constructor() {
    // Service initialized
  }

  // Health Check
  async checkHealth(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Interface service health check failed:', error);
      throw error;
    }
  }

  // Standard Processing Mode
  async startAsyncProcessing(request: InterfaceProcessingRequest): Promise<{ session_id: string; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/process-async`, request);
      return response.data;
    } catch (error) {
      console.error('Failed to start async processing:', error);
      throw error;
    }
  }

  // Enhanced Processing Mode (Versioned)
  async startVersionedAsyncProcessing(request: VersionedInterfaceProcessingRequest): Promise<{ session_id: string; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/process-versioned-async`, request);
      return response.data;
    } catch (error) {
      console.error('Failed to start versioned async processing:', error);
      throw error;
    }
  }

  // Progress Tracking
  async getProcessingProgress(sessionId: string): Promise<InterfaceProcessingResponse | EnhancedInterfaceProcessingResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/progress/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get processing progress:', error);
      throw error;
    }
  }

  // Real-time Processing with Progress Callback
  async processScopeDocumentWithProgress(
    request: InterfaceProcessingRequest,
    onProgress?: (progress: InterfaceProcessingResponse) => void
  ): Promise<InterfaceProcessingResponse> {
    const startResponse = await this.startAsyncProcessing(request);
    const sessionId = startResponse.session_id;

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const progress = await this.getProcessingProgress(sessionId);
          
          if (onProgress) {
            onProgress(progress);
          }

          if (progress.status === 'completed' || progress.status === 'completed_with_warnings') {
            clearInterval(pollInterval);
            resolve(progress);
          } else if (progress.status === 'failed' || progress.status === 'error') {
            clearInterval(pollInterval);
            reject(new Error(`Processing failed: ${progress.errors.join(', ')}`));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 1000); // Poll every second for real-time updates

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Processing timeout'));
      }, 600000);
    });
  }

  // Versioned Processing with Progress Callback
  async processVersionedScopeDocumentWithProgress(
    request: VersionedInterfaceProcessingRequest,
    onProgress?: (progress: EnhancedInterfaceProcessingResponse) => void
  ): Promise<EnhancedInterfaceProcessingResponse> {
    const startResponse = await this.startVersionedAsyncProcessing(request);
    const sessionId = startResponse.session_id;

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const progress = await this.getProcessingProgress(sessionId) as EnhancedInterfaceProcessingResponse;
          
          if (onProgress) {
            onProgress(progress);
          }

          if (progress.status === 'completed' || progress.status === 'completed_with_warnings') {
            clearInterval(pollInterval);
            resolve(progress);
          } else if (progress.status === 'failed' || progress.status === 'error') {
            clearInterval(pollInterval);
            reject(new Error(`Processing failed: ${progress.errors.join(', ')}`));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 1000); // Poll every second for real-time updates

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Processing timeout'));
      }, 600000);
    });
  }

  // Session Management
  async cleanupSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${this.baseUrl}/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to cleanup session:', error);
      throw error;
    }
  }

  async saveInterfacesFromSession(sessionId: string, domainId: string): Promise<any> {
    try {
      const response = await interfaceApi.post(`/interfaces/save/${sessionId}?domain_id=${domainId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to save interfaces:', error);
      throw error;
    }
  }

  // Validation
  async validateInterfaceSpecName(request: InterfaceSpecValidationRequest): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/validate-spec-name`, request);
      return response.data;
    } catch (error) {
      console.error('Failed to validate interface spec name:', error);
      throw error;
    }
  }

  // Domain Management
  async getInterfacesByDomain(domainId: string): Promise<{ interfaces: InterfaceSpecification[]; count: number }> {
    try {
      const response = await interfaceApi.get(`/interfaces/domain/${domainId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get interfaces by domain:', error);
      throw error;
    }
  }

  // EPIC 8: Multi-Domain Interface Management
  async getInterfacesByDomains(domainIds: string[]): Promise<{ domains: Record<string, any>; total_interfaces: number }> {
    try {
      const response = await interfaceApi.post(`/interfaces/by-domains`, {
        domain_ids: domainIds,
        include_metadata: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get interfaces by domains:', error);
      throw error;
    }
  }

  async getDomainInterfaceVersions(domainId: string): Promise<{ versions: InterfaceVersion[]; total_versions: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/domain/${domainId}/versions`);
      return response.data;
    } catch (error) {
      console.error('Failed to get domain interface versions:', error);
      throw error;
    }
  }

  // Search
  async searchInterfaces(query: string, domainId?: string): Promise<{ results: InterfaceSpecification[]; count: number }> {
    try {
      const params = new URLSearchParams({ q: query });
      if (domainId) {
        params.append('domain_id', domainId);
      }
      
      const response = await axios.get(`${this.baseUrl}/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search interfaces:', error);
      throw error;
    }
  }

  // CRUD Operations
  async getInterfaceById(interfaceId: string): Promise<InterfaceSpecification> {
    try {
      const response = await axios.get(`${this.baseUrl}/${interfaceId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get interface by ID:', error);
      throw error;
    }
  }

  async updateInterface(interfaceId: string, interfaceSpec: InterfaceSpecification): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.put(`${this.baseUrl}/${interfaceId}`, interfaceSpec);
      return response.data;
    } catch (error) {
      console.error('Failed to update interface:', error);
      throw error;
    }
  }

  async deleteInterface(interfaceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${interfaceId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete interface:', error);
      throw error;
    }
  }

  // Utility Methods
  getEmbeddingStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  }

  getEmbeddingStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'processing': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  formatConfidenceScore(score?: number): string {
    if (!score) return 'N/A';
    return `${Math.round(score * 100)}%`;
  }

  getConfidenceColor(score?: number): string {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  }

  // EPIC 21: Enhanced 4-Tier Testbed API Methods

  /**
   * Get available interface sections for filtering
   */
  async getInterfaceSections(domainInstances: string[], versions: string[]): Promise<InterfaceSection[]> {
    try {
      const params = new URLSearchParams();
      domainInstances.forEach(instance => {
        params.append('domain_instances', instance);
      });
      versions.forEach(version => {
        params.append('versions', version);
      });

      const url = `/interfaces/sections?${params.toString()}`;
      const response = await interfaceApi.get(url);
      
      return response.data.sections || [];
    } catch (error) {
      console.error('Failed to get interface sections:', error);
      throw error;
    }
  }

  /**
   * Get interface versions grouped by domain instance
   */
  async getVersionsByInstance(domainInstances: string[]): Promise<VersionDisplayGroup[]> {
    try {
      const params = new URLSearchParams();
      domainInstances.forEach(instance => {
        params.append('domain_instances', instance);
      });

      const url = `/interfaces/versions-by-instance?${params.toString()}`;
      const response = await interfaceApi.get(url);
      
      return response.data.version_groups || [];
    } catch (error) {
      console.error('Failed to get versions by instance:', error);
      throw error;
    }
  }

  /**
   * Get interfaces filtered by sections with enhanced metadata
   */
  async getFilteredInterfaces(
    domainInstances: string[], 
    versions: string[], 
    sections: string[] = []
  ): Promise<GroupedInterface[]> {
    try {
      const params = new URLSearchParams();
      domainInstances.forEach(instance => {
        params.append('domain_instances', instance);
      });
      versions.forEach(version => {
        params.append('versions', version);
      });
      sections.forEach(section => {
        params.append('sections', section);
      });

      const url = `/interfaces/filtered?${params.toString()}`;
      const response = await interfaceApi.get(url);
      
      return response.data.interfaces || [];
    } catch (error) {
      console.error('Failed to get filtered interfaces:', error);
      throw error;
    }
  }

  /**
   * Enhanced getInterfacesByDomains method with section support
   */
  async getInterfacesByDomainsEnhanced(domainIds: string[]): Promise<{
    success: boolean;
    domains: Record<string, {
      domain_id: string;
      domain_name: string;
      domain_type: string;
      interfaces: InterfaceSpecification[];
    }>;
    total_interfaces: number;
  }> {
    try {
      const response = await interfaceApi.post('/by-domains', {
        domain_ids: domainIds
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get interfaces by domains (enhanced):', error);
      throw error;
    }
  }
}

// Export singleton instance
export const unifiedInterfaceService = new UnifiedInterfaceService();
export default unifiedInterfaceService;