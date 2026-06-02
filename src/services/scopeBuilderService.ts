/**
 * Scope Builder Service - Frontend API client for domain scope template building
 */
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/v1/scope-builder' 
  : 'http://localhost:8000/api/v1/scope-builder';

// Types
export interface ScopeProcessingRequest {
  raw_scope: string;
  domain_name: string;
  processing_options?: Record<string, any>;
}

export interface ScopeProcessingResponse {
  success: boolean;
  domain_name: string;
  processing_timestamp: string;
  status: string;
  stages_completed: string[];
  current_stage?: string;
  current_stage_description?: string;
  progress_percentage?: number;
  total_stages?: number;
  stage_progress?: Record<string, {
    status: string;
    description: string;
  }>;
  template_content?: string;
  validation_results?: any;
  errors: string[];
  analysis_data?: any;
  boundary_data?: any;
  mapped_content?: any;
}

export interface TemplateStructureResponse {
  template_sections: Record<string, any>;
  template_markdown: string;
}

export interface AvailableDomain {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export interface ScopeBuilderValidationResult {
  success: boolean;
  domain_name: string;
  validation_results: any;
  timestamp: string;
}

class ScopeBuilderService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 3000000, // 5 minutes for AI processing of large documents
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Request interceptor for logging
    this.apiClient.interceptors.request.use((config) => {
      console.log(`[ScopeBuilder] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[ScopeBuilder] API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Get template structure for UI reference
   */
  async getTemplateStructure(): Promise<TemplateStructureResponse> {
    try {
      const response = await this.apiClient.get<TemplateStructureResponse>('/template-structure');
      return response.data;
    } catch (error) {
      console.error('Failed to get template structure:', error);
      throw new Error('Failed to get template structure');
    }
  }

  /**
   * Get available domains for scope building
   */
  async getAvailableDomains(): Promise<AvailableDomain[]> {
    try {
      const response = await this.apiClient.get<{
        success: boolean;
        domains: AvailableDomain[];
        count: number;
      }>('/domains');
      
      if (!response.data.success) {
        throw new Error('Failed to fetch available domains');
      }
      
      return response.data.domains;
    } catch (error) {
      console.error('Failed to get available domains:', error);
      throw new Error('Failed to get available domains');
    }
  }

  /**
   * Start asynchronous processing and return session ID
   */
  async startAsyncProcessing(request: ScopeProcessingRequest): Promise<{
    success: boolean;
    session_id: string;
    message: string;
    poll_endpoint: string;
  }> {
    try {
      const response = await this.apiClient.post('/process-async', request);
      return response.data;
    } catch (error) {
      console.error('Failed to start async processing:', error);
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to start processing');
    }
  }

  /**
   * Get processing progress for a session
   */
  async getProcessingProgress(sessionId: string): Promise<ScopeProcessingResponse> {
    try {
      const response = await this.apiClient.get<ScopeProcessingResponse>(`/progress/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get processing progress:', error);
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to get progress');
    }
  }

  /**
   * Clean up a processing session
   */
  async cleanupSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.delete(`/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to cleanup session:', error);
      return { success: false, message: 'Failed to cleanup session' };
    }
  }

  /**
   * Process raw scope document into standardized template (synchronous)
   */
  async processScopeDocument(request: ScopeProcessingRequest): Promise<ScopeProcessingResponse> {
    try {
      const response = await this.apiClient.post<ScopeProcessingResponse>('/process', request);
      return response.data;
    } catch (error) {
      console.error('Failed to process scope document:', error);
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to process scope document');
    }
  }

  /**
   * Process scope document with real-time progress updates
   */
  async processScopeDocumentWithProgress(
    request: ScopeProcessingRequest,
    onProgress?: (progress: ScopeProcessingResponse) => void
  ): Promise<ScopeProcessingResponse> {
    try {
      // Start async processing
      const startResponse = await this.startAsyncProcessing(request);
      const sessionId = startResponse.session_id;

      // Poll for progress
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            const progress = await this.getProcessingProgress(sessionId);
            
            // Call progress callback if provided
            if (onProgress) {
              onProgress(progress);
            }

            // Check if processing is complete
            if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'error') {
              clearInterval(pollInterval);
              
              // Clean up session
              this.cleanupSession(sessionId);
              
              if (progress.status === 'completed') {
                resolve(progress);
              } else {
                reject(new Error(progress.errors.join(', ') || 'Processing failed'));
              }
            }
          } catch (error) {
            clearInterval(pollInterval);
            this.cleanupSession(sessionId);
            reject(error);
          }
        }, 1000); // Poll every second

        // Set timeout to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval);
          this.cleanupSession(sessionId);
          reject(new Error('Processing timeout'));
        }, 600000); // 10 minute timeout
      });
    } catch (error) {
      console.error('Failed to process with progress:', error);
      throw error;
    }
  }

  /**
   * Process uploaded scope document file
   */
  async processScopeFile(
    domainName: string, 
    file: File, 
    processingOptions?: Record<string, any>
  ): Promise<ScopeProcessingResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('domain_name', domainName);
      
      if (processingOptions) {
        formData.append('processing_options', JSON.stringify(processingOptions));
      }

      const response = await this.apiClient.post<ScopeProcessingResponse>(
        '/process-file', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to process scope file:', error);
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to process scope file');
    }
  }

  /**
   * Download processed scope template as markdown file
   */
  async downloadScopeTemplate(domainName: string, templateContent: string): Promise<void> {
    try {
      const response = await this.apiClient.get('/download/' + encodeURIComponent(domainName), {
        params: { template_content: templateContent },
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const safeDomainName = domainName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `scope_template_${safeDomainName}_${timestamp}.md`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download scope template:', error);
      throw new Error('Failed to download scope template');
    }
  }

  /**
   * Validate scope template content for completeness and quality
   */
  async validateTemplateContent(
    domainName: string, 
    templateContent: string
  ): Promise<ScopeBuilderValidationResult> {
    try {
      const response = await this.apiClient.post<ScopeBuilderValidationResult>(
        '/validate-template',
        null,
        {
          params: {
            domain_name: domainName,
            template_content: templateContent,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to validate template content:', error);
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to validate template content');
    }
  }

  /**
   * Helper method to check processing status
   */
  getProcessingStatusMessage(status: string): string {
    switch (status) {
      case 'processing':
        return 'Processing scope document...';
      case 'completed':
        return 'Scope processing completed successfully';
      case 'completed_with_warnings':
        return 'Scope processing completed with warnings';
      case 'failed':
        return 'Scope processing failed';
      case 'error':
        return 'An error occurred during processing';
      default:
        return 'Unknown processing status';
    }
  }

  /**
   * Helper method to get validation quality color
   */
  getValidationQualityColor(quality: string): string {
    switch (quality?.toLowerCase()) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'needs improvement':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }
}

// Create and export service instance
export const scopeBuilderService = new ScopeBuilderService();
export default scopeBuilderService;