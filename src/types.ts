export type Stage = 
  | 'GATE_ENTRY'
  | 'INSPECTION'
  | 'GRN'
  | 'MATERIAL_REQUEST'
  | 'MATERIAL_ISSUE'
  | 'SHOPFLOOR';

export type WorkflowStatus =
  | 'GATE_ENTRY_PENDING'
  | 'GATE_ENTRY_COMPLETED'
  | 'INSPECTION_PENDING'
  | 'INSPECTION_COMPLETED'
  | 'INSPECTION_REJECTED'
  | 'INSPECTION_ON_HOLD'
  | 'GRN_PENDING'
  | 'GRN_COMPLETED'
  | 'MATERIAL_REQUEST_PENDING'
  | 'MATERIAL_REQUEST_APPROVED'
  | 'MATERIAL_REQUEST_REJECTED'
  | 'MATERIAL_ISSUE_PENDING'
  | 'MATERIAL_ISSUED'
  | 'MATERIAL_ISSUED_TO_SHOPFLOOR';

export type UserRole =
  | 'GATE_USER'
  | 'INSPECTOR'
  | 'GRN_USER'
  | 'MATERIAL_REQUEST_USER'
  | 'REQUEST_APPROVER'
  | 'STORE_USER'
  | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatarInitials: string;
}

export interface MaterialTransaction {
  id: string; // e.g. MAT-2026-000001
  poNumber: string;
  rmCode: string;
  materialName: string;
  supplierName: string;
  vehicleNumber: string;
  originalQuantity: number;
  availableQuantity: number;
  issuedQuantity: number;
  uom: string; // KG, MTR, PCS, LTR, MT
  currentStatus: WorkflowStatus;
  storageLocation?: string;
  batchLotNumber?: string;
  gateEntryDateTime: string;
  gateRemarks?: string;
  qrToken: string;
  createdBy: string;
  inspections?: InspectionRecord[];
  grns?: GRNRecord[];
  requests?: MaterialRequestRecord[];
  issues?: MaterialIssueRecord[];
}

export interface InspectionRecord {
  id: string;
  materialId: string;
  result: 'ACCEPTED' | 'REJECTED' | 'HOLD';
  inspectorName: string;
  inspectorId: string;
  inspectionDate: string;
  remarks: string;
  photoUrl?: string;
}

export interface GRNRecord {
  id: string;
  materialId: string;
  grnNumber: string;
  acceptedQuantity: number;
  rejectedQuantity: number;
  storageLocation: string;
  batchLotNumber: string;
  grnDate: string;
  createdBy: string;
  remarks?: string;
}

export interface MaterialRequestRecord {
  id: string;
  materialId: string;
  requestNumber: string;
  department: string;
  shopfloor: string;
  requestedBy: string;
  requestedQuantity: number;
  uom: string;
  requiredDate: string;
  purpose: string;
  remarks?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedDate?: string;
  approvalRemarks?: string;
}

export interface MaterialIssueRecord {
  id: string;
  materialId: string;
  requestId: string;
  requestNumber: string;
  issueQuantity: number;
  uom: string;
  issuedBy: string;
  receiver: string;
  shopfloor: string;
  storageLocation: string;
  issueDate: string;
  remarks?: string;
}

export interface AuditLogEntry {
  id: string;
  materialId: string;
  stage: Stage | string;
  action: string;
  previousStatus: WorkflowStatus | string;
  newStatus: WorkflowStatus | string;
  userName: string;
  userRole: UserRole | string;
  timestamp: string;
  remarks?: string;
  metadata?: Record<string, any>;
}

export type ViewTab = 'DASHBOARD' | 'TRACEABILITY' | 'GATE_ENTRY' | 'REQUESTS' | 'AUDIT_LOG' | 'ADMIN' | 'SHOWCASE';
