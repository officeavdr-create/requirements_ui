// Domain types
export interface Domain {
  id?: string;
  domain_id?: string;
  domain_name: string;
  domain_type: string;
  created_at?: string;
  updated_at?: string;
}

export interface DomainWithMetadata extends Domain {
  has_scope_document: boolean;
  scope_sections_count: number;
  interfaces_count: number;
  last_embedding_update: string | null;
}

// Interface types
export interface Interface {
  id: string;
  interface_name: string;
  description: string;
  interface_type: string;
  confidence_score: number;
  domain_id: string;
  domain_name?: string;
  parameters?: any;
  enhanced_by_ai?: boolean;
}

// Session types
export interface SessionInfo {
  sessionId: string;
  sessionName?: string;
  status: ProcessingStatus;
  currentStep?: string;
  progressPercentage?: number;
  errorDetails?: string;
  domainFilePath?: string;
  sys2FilePath?: string;
  outputFilePath?: string;
  selectedDomainIds?: string[];
  selectedInterfaceIds?: string[];
}

// Processing status enum
export enum ProcessingStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING_DOMAIN = 'processing_domain',
  GENERATING_EMBEDDINGS = 'generating_embeddings',
  PROCESSING_SYS2 = 'processing_sys2',
  GENERATING_SWE1 = 'generating_swe1',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// File format enum
export enum FileFormat {
  MARKDOWN = 'markdown',
  EXCEL = 'excel',
  CSV = 'csv'
}

// EPIC 8 types
export interface MultiDomainInterfaceRequest {
  domain_ids: string[];
}

export interface DomainSelectionRequest {
  session_id: string;
  selected_domain_ids: string[];
}

export interface InterfaceSelectionRequest {
  session_id: string;
  selected_interface_ids: string[];
}

export interface EnhancedSWE1GenerationRequest {
  session_id: string;
  use_selected_domains: boolean;
  use_selected_interfaces: boolean;
  output_format: string;
  include_traceability: boolean;
  max_context_chunks: number;
}

export interface RequirementTraceability {
  sys2_id: string;
  rationale: string;
  domain_aspects: string[];
  domains_used: string[];
  interfaces_used: string[];
}