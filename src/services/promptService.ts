import api from './api';

export type PromptType = 'domain_scope' | 'interface_enhancement' | 'swe1_generation';

export interface PromptPreviewRequest {
  prompt_type: PromptType;
  context_data: Record<string, any>;
  custom_prompt?: string;
}

export interface PromptPreviewResponse {
  prompt_type: string;
  original_prompt: string;
  context_data: Record<string, any>;
  preview_prompt: string;
}

export interface PromptTemplate {
  name: string;
  description: string;
  variables: string[];
}

class PromptService {
  /**
   * Preview an AI prompt with context data
   */
  async previewPrompt(request: PromptPreviewRequest): Promise<PromptPreviewResponse> {
    try {
      const response = await api.post<PromptPreviewResponse>('/prompts/preview', request);
      return response.data;
    } catch (error) {
      console.error('Failed to preview prompt:', error);
      throw error;
    }
  }

  /**
   * Get all available prompt templates
   */
  async getPromptTemplates(): Promise<Record<string, PromptTemplate>> {
    try {
      const response = await api.get<{ templates: Record<string, PromptTemplate> }>('/prompts/templates');
      return response.data.templates;
    } catch (error) {
      console.error('Failed to get prompt templates:', error);
      throw error;
    }
  }

  /**
   * Build context data for domain scope prompts
   */
  buildDomainScopeContext(domain: any): Record<string, any> {
    return {
      domain_type: domain.domain_type || 'unknown',
      domain_name: domain.name || 'Unknown Domain',
      content: domain.description || ''
    };
  }

  /**
   * Build context data for interface enhancement prompts
   */
  buildInterfaceEnhancementContext(iface: any, domain: any): Record<string, any> {
    return {
      interface_name: iface.interface_name || 'Unknown Interface',
      interface_type: iface.interface_type || 'unknown',
      domain_name: domain?.name || 'Unknown Domain',
      description: iface.interface_description || ''
    };
  }

  /**
   * Build context data for SWE.1 generation prompts
   */
  buildSwe1GenerationContext(
    domain: any, 
    requirements: any[], 
    domainScope?: string
  ): Record<string, any> {
    return {
      domain_name: domain?.name || 'Unknown Domain',
      requirement_count: requirements?.length || 0,
      has_domain_scope: !!domainScope,
      requirements: requirements?.map(r => `- ${r.id}: ${r.description}`).join('\n') || '',
      domain_context: domainScope || 'No domain scope available'
    };
  }
}

export const promptService = new PromptService();