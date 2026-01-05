// Generic graph types for force-directed visualization

export type NodeType = 'entity' | 'employee' | 'hospital' | 'claim';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  data: Record<string, unknown>;
  parentId?: string;
  childCount?: number;
  expanded?: boolean;
  // D3 force simulation adds these properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
  value?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Raw data types
export interface ClaimStatus {
  status: string;
  submittedDate: string;
  approvedDate?: string;
  remarks?: string;
}

export interface ClaimDocument {
  documentType: string;
  documentId: string;
  uploadedDate: string;
}

export interface InsuranceClaim {
  claimId: string;
  claimType: string;
  hospitalName: string;
  treatmentType: string;
  admissionDate: string;
  dischargeDate: string;
  claimAmount: number;
  approvedAmount: number;
  currency: string;
  claimStatus: ClaimStatus;
  documents: ClaimDocument[];
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
}

export interface EmploymentDetails {
  designation: string;
  department: string;
  dateOfJoining: string;
  employmentType: string;
  status: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface InsuranceDetails {
  policyNumber: string;
  provider: string;
  coverageType: string;
  policyStartDate: string;
  policyEndDate: string;
}

export interface EmployeeData {
  employeeId: string;
  personalDetails: PersonalDetails;
  employmentDetails: EmploymentDetails;
  address: Address;
  insuranceDetails: InsuranceDetails;
  insuranceClaims: InsuranceClaim[];
}

// Normalized data structure
export interface NormalizedData {
  employees: Map<string, EmployeeData>;
  hospitals: Map<string, { name: string; claims: InsuranceClaim[]; employeeIds: string[] }>;
  claims: Map<string, InsuranceClaim & { employeeId: string }>;
}
