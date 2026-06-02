/**
 * Enhanced Domain management service with dynamic domain type support
 */
import api from './api';

// Enhanced domain types
export interface Domain {
  id: string | null; // null for placeholder domains (empty domain types)
  name: string;
  description: string;
  configurations: string;
  special_input: string;
  domain_type: string;
  table_name?: string;
  embedding_exists: boolean;
  ollama_embedding_model: string | null;
  st_embedding_model: string | null;
  created_at: string | null; // null for placeholder domains
  updated_at: string | null; // null for placeholder domains
  supported_features?: string[];
}

export interface DomainType {
  domain_type: string;
  description: string;
  features: string[];
  metadata: Record<string, any>;
  created_programmatically: boolean;
}

export interface DomainTypeCreate {
  domain_type: string;
  description?: string;
  features?: string[];
  metadata?: Record<string, any>;
}

export interface DomainCreate {
  name: string;
  description?: string;
  configurations?: string;
  special_input?: string;
}

export interface DomainUpdate {
  name?: string;
  description?: string;
  configurations?: string;
  special_input?: string;
}

export interface EmbeddingGenerationRequest {
  embedding_type: 'ollama' | 'st';
  model_name?: string;
}

export interface DomainStats {
  total_domains: number;
  domains_with_embeddings: number;
  domain_types: string[];
  domains_by_type: Record<string, number>;
  domains: Array<{ 
    id: string; 
    name: string; 
    domain_type: string; 
    embedding_exists: boolean 
  }>;
}

class DomainService {
  // =====================================================
  // DOMAIN TYPE MANAGEMENT (NEW)
  // =====================================================

  /**
   * Get all registered domain types
   */
  async getDomainTypes(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/domain-types');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch domain types:', error);
      throw error;
    }
  }

  /**
   * Get metadata for all domain types
   */
  async getDomainTypesMetadata(): Promise<Record<string, DomainType>> {
    try {
      const response = await api.get<Record<string, DomainType>>('/domain-types/metadata');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch domain types metadata:', error);
      throw error;
    }
  }

  /**
   * Get metadata for specific domain type
   */
  async getDomainTypeMetadata(domainType: string): Promise<DomainType> {
    try {
      const response = await api.get<DomainType>(`/domain-types/${domainType}/metadata`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch metadata for domain type ${domainType}:`, error);
      throw error;
    }
  }

  /**
   * Register a new domain type
   */
  async registerDomainType(domainTypeData: DomainTypeCreate): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/domain-types', domainTypeData);
      return response.data;
    } catch (error) {
      console.error('Failed to register domain type:', error);
      throw error;
    }
  }

  /**
   * Create a new domain type (alias for registerDomainType)
   */
  async createDomainType(domainTypeData: DomainTypeCreate): Promise<{ message: string }> {
    return this.registerDomainType(domainTypeData);
  }

  /**
   * Delete a domain type (alias for unregisterDomainType)
   */
  async deleteDomainType(domainType: string): Promise<void> {
    return this.unregisterDomainType(domainType);
  }

  /**
   * Unregister a domain type
   */
  async unregisterDomainType(domainType: string): Promise<void> {
    try {
      await api.delete(`/domain-types/${domainType}`);
    } catch (error) {
      console.error(`Failed to unregister domain type ${domainType}:`, error);
      throw error;
    }
  }

  // =====================================================
  // DOMAIN INSTANCE MANAGEMENT (ENHANCED)
  // =====================================================

  /**
   * Get all domain instances from all domain tables
   */
  async getAllDomains(includeMetadata: boolean = false): Promise<Domain[]> {
    try {
      const params = includeMetadata ? { include_metadata: true } : {};
      const response = await api.get<Domain[]>('/domains', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      throw error;
    }
  }

  /**
   * Get supported domain types (legacy compatibility)
   */
  async getSupportedDomainTypes(): Promise<string[]> {
    return this.getDomainTypes();
  }

  /**
   * Get domain instance by type
   */
  async getDomainByType(domainType: string): Promise<Domain> {
    try {
      const response = await api.get<Domain>(`/domains/type/${domainType}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${domainType} domain:`, error);
      throw error;
    }
  }

  /**
   * Get domain instance by ID
   */
  async getDomainById(domainId: string): Promise<Domain> {
    try {
      const response = await api.get<Domain>(`/domains/${domainId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch domain ${domainId}:`, error);
      throw error;
    }
  }

  /**
   * Create domain instance of specific type
   */
  async createDomainInstance(domainType: string, domainData: DomainCreate): Promise<Domain> {
    try {
      const response = await api.post<Domain>(`/domains/${domainType}`, domainData);
      return response.data;
    } catch (error) {
      console.error(`Failed to create ${domainType} domain instance:`, error);
      throw error;
    }
  }

  /**
   * Update an existing domain instance
   */
  async updateDomain(domainId: string, domainData: DomainUpdate): Promise<Domain> {
    try {
      const response = await api.put<Domain>(`/domains/${domainId}`, domainData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update domain ${domainId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a domain instance
   */
  async deleteDomain(domainId: string): Promise<void> {
    try {
      await api.delete(`/domains/${domainId}`);
    } catch (error) {
      console.error(`Failed to delete domain ${domainId}:`, error);
      throw error;
    }
  }

  /**
   * Generate embeddings for a domain instance
   */
  async generateEmbedding(
    domainId: string, 
    embeddingType: 'ollama' | 'st', 
    modelName?: string,
    forceRegenerate: boolean = false
  ): Promise<{ message: string }> {
    try {
      const requestData: EmbeddingGenerationRequest & { force_regenerate?: boolean } = {
        embedding_type: embeddingType,
        model_name: modelName,
        force_regenerate: forceRegenerate
      };
      
      const response = await api.post<{ message: string }>(
        `/domains/${domainId}/generate-embedding`, 
        requestData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to generate ${embeddingType} embedding for domain ${domainId}:`, error);
      throw error;
    }
  }

  /**
   * Get domain statistics
   */
  async getDomainStats(): Promise<DomainStats> {
    try {
      const response = await api.get<DomainStats>('/domains/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch domain stats:', error);
      throw error;
    }
  }

  // =====================================================
  // LEGACY COMPATIBILITY
  // =====================================================

  /**
   * Create a new domain (legacy endpoint for compatibility)
   */
  async createDomain(domainData: DomainCreate): Promise<Domain> {
    try {
      const response = await api.post<Domain>('/domains', domainData);
      return response.data;
    } catch (error) {
      console.error('Failed to create domain:', error);
      throw error;
    }
  }

  /**
   * Create or update domain for specific type (legacy)
   */
  async createOrUpdateDomain(domainType: string, domainData: DomainCreate): Promise<Domain> {
    return this.createDomainInstance(domainType, domainData);
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if domain type exists
   */
  async domainTypeExists(domainType: string): Promise<boolean> {
    try {
      const domainTypes = await this.getDomainTypes();
      return domainTypes.includes(domainType);
    } catch (error) {
      console.error('Failed to check domain type existence:', error);
      return false;
    }
  }

  /**
   * Validate domain type name
   */
  validateDomainTypeName(domainType: string): { valid: boolean; error?: string } {
    // Must be alphanumeric and underscores only, start with letter, 2-50 chars
    const pattern = /^[a-z][a-z0-9_]*$/;
    
    if (!domainType) {
      return { valid: false, error: 'Domain type name is required' };
    }
    
    if (domainType.length < 2 || domainType.length > 50) {
      return { valid: false, error: 'Domain type name must be 2-50 characters long' };
    }
    
    if (!pattern.test(domainType.toLowerCase())) {
      return { 
        valid: false, 
        error: 'Domain type name must start with a letter and contain only lowercase letters, numbers, and underscores' 
      };
    }
    
    return { valid: true };
  }

  /**
   * Get domain instances count by type
   */
  async getDomainInstancesByType(): Promise<Record<string, number>> {
    try {
      const stats = await this.getDomainStats();
      return stats.domains_by_type;
    } catch (error) {
      console.error('Failed to get domain instances by type:', error);
      return {};
    }
  }

  /**
   * Check if domain type can be safely deleted
   */
  async canDeleteDomainType(domainType: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const metadata = await this.getDomainTypeMetadata(domainType);
      
      // Check if it's a legacy domain
      if (!metadata.created_programmatically) {
        return { 
          canDelete: false, 
          reason: 'Cannot delete legacy domain types (bluetooth, audio, hmi)' 
        };
      }
      
      // Check if there are instances
      const instanceCounts = await this.getDomainInstancesByType();
      const instanceCount = instanceCounts[domainType] || 0;
      
      if (instanceCount > 0) {
        return { 
          canDelete: false, 
          reason: `Cannot delete domain type with ${instanceCount} existing instances` 
        };
      }
      
      return { canDelete: true };
      
    } catch (error) {
      console.error('Failed to check if domain type can be deleted:', error);
      return { canDelete: false, reason: 'Failed to check deletion eligibility' };
    }
  }
}

export const domainService = new DomainService();
