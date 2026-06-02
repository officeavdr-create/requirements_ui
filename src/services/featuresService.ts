/**
 * Features management service for API operations
 */
import api from './api';

// Feature types
export interface Feature {
  id: string;
  feature_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  sys2_requirements_count: number;
}

export interface FeatureCreate {
  feature_name: string;
  description?: string;
}

export interface FeatureUpdate {
  feature_name?: string;
  description?: string;
}

// SYS2 Requirement types
export interface SYS2Requirement {
  id: string;
  sys2_jira_id: string;
  sys_id: string;
  requirement_text: string;
  requirement_type: 'Functional' | 'Non-Functional' | 'Constraint' | 'Information' | 'Heading';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Inactive' | 'Draft' | 'Approved';
  domains: string[];
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SYS2RequirementCreate {
  sys2_jira_id?: string;
  sys_id?: string;
  requirement_text: string;
  requirement_type?: 'Functional' | 'Non-Functional' | 'Constraint' | 'Information' | 'Heading';
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Active' | 'Inactive' | 'Draft' | 'Approved';
  domains?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SYS2RequirementUpdate {
  sys2_jira_id?: string;
  sys_id?: string;
  requirement_text?: string;
  requirement_type?: 'Functional' | 'Non-Functional' | 'Constraint' | 'Information' | 'Heading';
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Active' | 'Inactive' | 'Draft' | 'Approved';
  domains?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

class FeaturesService {
  /**
   * Get all features
   */
  async getAllFeatures(): Promise<Feature[]> {
    try {
      const response = await api.get<Feature[]>('/features');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch features:', error);
      throw error;
    }
  }

  /**
   * Get feature by ID
   */
  async getFeatureById(featureId: string): Promise<Feature> {
    try {
      const response = await api.get<Feature>(`/features/${featureId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch feature ${featureId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new feature
   */
  async createFeature(featureData: FeatureCreate): Promise<Feature> {
    try {
      const response = await api.post<Feature>('/features', featureData);
      return response.data;
    } catch (error) {
      console.error('Failed to create feature:', error);
      throw error;
    }
  }

  /**
   * Update an existing feature
   */
  async updateFeature(featureId: string, featureData: FeatureUpdate): Promise<Feature> {
    try {
      const response = await api.put<Feature>(`/features/${featureId}`, featureData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update feature ${featureId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a feature
   */
  async deleteFeature(featureId: string): Promise<void> {
    try {
      await api.delete(`/features/${featureId}`);
    } catch (error) {
      console.error(`Failed to delete feature ${featureId}:`, error);
      throw error;
    }
  }

  // SYS2 Requirements methods

  /**
   * Get all SYS2 requirements for a feature
   */
  async getSYS2Requirements(featureId: string): Promise<SYS2Requirement[]> {
    try {
      const response = await api.get<SYS2Requirement[]>(`/features/${featureId}/sys2`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch SYS2 requirements for feature ${featureId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new SYS2 requirement for a feature
   */
  async createSYS2Requirement(featureId: string, requirementData: SYS2RequirementCreate): Promise<SYS2Requirement> {
    try {
      const response = await api.post<SYS2Requirement>(`/features/${featureId}/sys2`, requirementData);
      return response.data;
    } catch (error) {
      console.error(`Failed to create SYS2 requirement for feature ${featureId}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing SYS2 requirement
   */
  async updateSYS2Requirement(
    featureId: string, 
    requirementId: string, 
    requirementData: SYS2RequirementUpdate
  ): Promise<SYS2Requirement> {
    try {
      const response = await api.put<SYS2Requirement>(
        `/features/${featureId}/sys2/${requirementId}`, 
        requirementData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update SYS2 requirement ${requirementId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a SYS2 requirement
   */
  async deleteSYS2Requirement(featureId: string, requirementId: string): Promise<void> {
    try {
      await api.delete(`/features/${featureId}/sys2/${requirementId}`);
    } catch (error) {
      console.error(`Failed to delete SYS2 requirement ${requirementId}:`, error);
      throw error;
    }
  }
}

export const featuresService = new FeaturesService();