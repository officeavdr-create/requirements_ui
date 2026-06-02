// export interface Interface {
//   id: number;
//   interface_name: string;
//   interface_type: string;
//   interface_description?: string;
//   parameter_name?: string;
//   parameter_type?: string;
//   parameter_description?: string;
//   return_type?: string;
//   return_description?: string;
//   notifications?: string;
//   api_reference?: string;
//   version: string;
//   created_at?: string;
//   updated_at?: string;
//   similarity_score?: number;
// }

// export interface InterfaceSearchRequest {
//   query: string;
//   version?: string;
//   top_k?: number;
//   similarity_threshold?: number;
// }

// export interface InterfaceSearchResponse {
//   interfaces: Interface[];
//   total_count: number;
//   query: string;
// }

// export interface VersionResponse {
//   versions: string[];
// }

// export interface GenerateDiagramRequest {
//   requirements: string;
//   selected_interfaces: Interface[];
// }

// export interface GenerateDiagramResponse {
//   mermaid_code: string;
//   selected_interfaces_count: number;
//   requirements: string;
// }

// export interface UploadResponse {
//   message: string;
//   count: number;
//   filename: string;
// }
// export interface Interface {
//   id: number;
//   interface_name: string;
//   interface_type: string;
//   interface_description?: string;
//   parameter_name?: string;
//   parameter_type?: string;
//   parameter_description?: string;
//   return_type?: string;
//   return_description?: string;
//   notifications?: string;
//   api_reference?: string;
//   domain_id:string;
//   version: string;
//   created_at?: string;
//   updated_at?: string;
//   similarity_score?: number;
// }
export interface Interface {
  id: number;
  interface_name: string;
  interface_type: string;
  interface_description?: string;
  parameter_name?: string;
  parameter_type?: string;
  parameter_description?: string;
  return_type?: string;
  return_description?: string;
  notifications?: string;
  api_reference?: string;
  domain_id?: string;
  version: string;
  created_at?: string;
  updated_at?: string;
  similarity_score?: number;
  
  // Add domain information
  domain_name?: string; // This will store the domain name
}

export interface InterfaceSearchRequest {
  query: string;
  requirements?: string;
  version?: string;
  top_k?: number;
  similarity_threshold?: number;
  domain_id: string;
}

export interface InterfaceSearchResponse {
  interfaces: Interface[];
  total_count: number;
  query: string;
}

export interface VersionResponse {
  versions: string[];
}
export interface Domain {
  id: string;
  name: string;
}

export type DomainResponse = Domain[];

// export interface GenerateDiagramRequest {
//   requirements: string;
//   selected_interfaces: Interface[];
// }
// export interface GenerateDiagramRequest {
//   requirements: string;
//   selected_interfaces: Interface[];
//   enhance_requirements?: boolean; // Add this optional field
//   include_domain_knowledge?: boolean;
//   enhanced_requirements?: string | null; 
  
// }
export interface GenerateDiagramRequest {
  requirements: string;
  selected_interfaces: Interface[];
  enhance_requirements?: boolean;
  include_domain_knowledge?: boolean;
  enhanced_requirements?: string; // Add this field
  custom_prompt?: string;
  diagram_prompt?: string;
  model_name?:string;
}


export interface GenerateDiagramResponse {
  mermaid_code: string;
  selected_interfaces_count: number;
  requirements: string;
  enhanced_requirements?: string; 
}

export interface UploadResponse {
  message: string;
  count: number;
  filename: string;
}