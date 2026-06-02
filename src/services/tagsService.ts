/**
 * Tags management service for API operations
 */
import api from './api';

// Tag types
export interface Tag {
  id: string;
  tag: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TagCreate {
  tag: string;
  description?: string;
}

export interface TagUpdate {
  tag?: string;
  description?: string;
}

export interface TagStats {
  total_tags: number;
  recent_tags: number;
  most_recent: {
    tag: string;
    created_at: string;
  } | null;
}

class TagsService {
  /**
   * Get all tags
   */
  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await api.get<Tag[]>('/tags');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      throw error;
    }
  }

  /**
   * Get tag by ID
   */
  async getTagById(tagId: string): Promise<Tag> {
    try {
      const response = await api.get<Tag>(`/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch tag ${tagId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new tag
   */
  async createTag(tagData: TagCreate): Promise<Tag> {
    try {
      const response = await api.post<Tag>('/tags', tagData);
      return response.data;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  }

  /**
   * Update an existing tag
   */
  async updateTag(tagId: string, tagData: TagUpdate): Promise<Tag> {
    try {
      const response = await api.put<Tag>(`/tags/${tagId}`, tagData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update tag ${tagId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<void> {
    try {
      await api.delete(`/tags/${tagId}`);
    } catch (error) {
      console.error(`Failed to delete tag ${tagId}:`, error);
      throw error;
    }
  }

  /**
   * Search tags by name or description
   */
  async searchTags(searchTerm: string): Promise<Tag[]> {
    try {
      const response = await api.get<Tag[]>(`/tags/search/${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to search tags for "${searchTerm}":`, error);
      throw error;
    }
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    try {
      const response = await api.get<Tag[]>(`/tags/popular/${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch popular tags:', error);
      throw error;
    }
  }

  /**
   * Get tags statistics
   */
  async getTagsStats(): Promise<TagStats> {
    try {
      const response = await api.get<TagStats>('/tags/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tags stats:', error);
      throw error;
    }
  }

  /**
   * Validate if a list of tag names exist
   */
  async validateTags(tagNames: string[]): Promise<Record<string, boolean>> {
    try {
      const response = await api.post<Record<string, boolean>>('/tags/validate', tagNames);
      return response.data;
    } catch (error) {
      console.error('Failed to validate tags:', error);
      throw error;
    }
  }

  /**
   * Get tag names only (for dropdowns and selections)
   */
  async getTagNames(): Promise<string[]> {
    try {
      const tags = await this.getAllTags();
      return tags.map(tag => tag.tag).sort();
    } catch (error) {
      console.error('Failed to fetch tag names:', error);
      throw error;
    }
  }
}

export const tagsService = new TagsService();