// Type definitions matching backend schemas
export enum ProcessingStatus {
  PENDING = "pending",
  UPLOADING = "uploading", 
  PROCESSING_DOMAIN = "processing_domain",
  GENERATING_EMBEDDINGS = "generating_embeddings",
  PROCESSING_SYS2 = "processing_sys2", 
  GENERATING_SWE1 = "generating_swe1",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file_path?: string;
  file_size?: number;
  file_name?: string;
}

export interface SessionStatusResponse {
  session_id: string;
  status: ProcessingStatus;
  message: string;
  progress_percentage?: number;
  current_step?: string;
  created_at: string;
  updated_at: string;
  error_details?: string;
}

export interface DomainTestbedRequest {
  session_name?: string;
  regenerate_embeddings?: boolean;
}

export interface DomainTestbedResponse {
  session_id: string;
  status: ProcessingStatus;
  message: string;
  domain_file_uploaded?: boolean;
  sys2_file_uploaded?: boolean;
  output_file_path?: string;
}

export interface HealthResponse {
  status: string;
  message?: string;
  database?: Record<string, any>;
  ollama?: Record<string, any>;
}
