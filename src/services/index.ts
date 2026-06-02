/**
 * Services index - exports all service instances
 */
export { domainService } from './domainService';
export { featuresService } from './featuresService';
export { tagsService } from './tagsService';
export { default as testbedService } from './testbedService';
export { default as api } from './api';
export { scopeBuilderService } from './scopeBuilderService';
export { default as unifiedInterfaceService } from './unifiedInterfaceService';
export { promptService } from './promptService';

// Re-export types
export type { Domain, DomainCreate, DomainUpdate, DomainType } from './domainService';
export type { 
  Feature, 
  FeatureCreate, 
  FeatureUpdate,
  SYS2Requirement,
  SYS2RequirementCreate,
  SYS2RequirementUpdate
} from './featuresService';
export type { Tag, TagCreate, TagUpdate, TagStats } from './tagsService';
export type { 
  ScopeProcessingRequest,
  ScopeProcessingResponse,
  TemplateStructureResponse,
  AvailableDomain,
  ScopeBuilderValidationResult
} from './scopeBuilderService';
export type {
  InterfaceProcessingRequest,
  VersionedInterfaceProcessingRequest,
  InterfaceSpecValidationRequest,
  InterfaceProcessingResponse,
  EnhancedInterfaceProcessingResponse,
  InterfaceSpecification,
  InterfaceParameter,
  InterfaceVersion,
  EmbeddingStatus
} from './unifiedInterfaceService';
export type {
  PromptType,
  PromptPreviewRequest,
  PromptPreviewResponse,
  PromptTemplate
} from './promptService';