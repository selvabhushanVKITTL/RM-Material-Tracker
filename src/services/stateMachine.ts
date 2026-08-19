import { WorkflowStatus, UserRole, MaterialTransaction } from '../types';

export interface WorkflowAction {
  id: string;
  label: string;
  stage: string;
  targetStatus: WorkflowStatus;
  requiredRole: UserRole[];
  description: string;
  iconName: string;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}

export const WORKFLOW_STAGES = [
  { id: 'GATE_ENTRY', label: 'Gate Entry', icon: 'Truck' },
  { id: 'INSPECTION', label: 'Inspection', icon: 'ClipboardCheck' },
  { id: 'GRN', label: 'GRN Processing', icon: 'FileCheck' },
  { id: 'MATERIAL_REQUEST', label: 'Material Request', icon: 'FileText' },
  { id: 'MATERIAL_ISSUE', label: 'Material Issue', icon: 'ArrowUpRight' },
  { id: 'SHOPFLOOR', label: 'Shopfloor Consumption', icon: 'Factory' },
] as const;

export const STATUS_CONFIG: Record<
  WorkflowStatus,
  {
    label: string;
    stageIndex: number;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    description: string;
  }
> = {
  GATE_ENTRY_PENDING: {
    label: 'Gate Entry Pending',
    stageIndex: 0,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'Vehicle arrived at gate, awaiting formal registration.',
  },
  GATE_ENTRY_COMPLETED: {
    label: 'Gate Entry Completed',
    stageIndex: 0,
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    description: 'Material logged at gate and QR tag generated. Ready for inspection.',
  },
  INSPECTION_PENDING: {
    label: 'Inspection Pending',
    stageIndex: 1,
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    description: 'Awaiting quality test and inspector verification.',
  },
  INSPECTION_COMPLETED: {
    label: 'Inspection Approved',
    stageIndex: 1,
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'Passed quality assurance. Ready for GRN creation.',
  },
  INSPECTION_ON_HOLD: {
    label: 'Inspection On Hold',
    stageIndex: 1,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    description: 'Temporarily held for lab re-test or supplier clarification.',
  },
  INSPECTION_REJECTED: {
    label: 'Inspection Rejected',
    stageIndex: 1,
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-300',
    description: 'Failed QA criteria. Material quarantined for return to supplier.',
  },
  GRN_PENDING: {
    label: 'GRN Pending',
    stageIndex: 2,
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    description: 'Approved by QA, waiting for warehouse GRN receipt and bin assignment.',
  },
  GRN_COMPLETED: {
    label: 'GRN Completed',
    stageIndex: 2,
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
    badgeBorder: 'border-green-300',
    description: 'Goods received, inventory stocked in warehouse bin and available for issue.',
  },
  MATERIAL_REQUEST_PENDING: {
    label: 'Request Pending Approval',
    stageIndex: 3,
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    description: 'Shopfloor requisition submitted, awaiting manager sign-off.',
  },
  MATERIAL_REQUEST_APPROVED: {
    label: 'Material Request Approved',
    stageIndex: 3,
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    description: 'Requisition signed off. Ready for warehouse store dispatch.',
  },
  MATERIAL_REQUEST_REJECTED: {
    label: 'Material Request Rejected',
    stageIndex: 3,
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    badgeBorder: 'border-red-200',
    description: 'Requisition declined by plant manager.',
  },
  MATERIAL_ISSUE_PENDING: {
    label: 'Issue in Progress',
    stageIndex: 4,
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    description: 'Store personnel picking material from bin.',
  },
  MATERIAL_ISSUED: {
    label: 'Material Issued',
    stageIndex: 4,
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'Material transferred from warehouse to shopfloor custody.',
  },
  MATERIAL_ISSUED_TO_SHOPFLOOR: {
    label: 'Issued to Shopfloor',
    stageIndex: 5,
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300',
    description: 'Fully delivered and active in shopfloor manufacturing stream.',
  },
};

/**
 * Deterministic transition rules
 */
export function getAvailableActions(
  material: MaterialTransaction,
  userRole: UserRole
): {
  allowedAction: WorkflowAction | null;
  reasonIfNotAllowed?: string;
  hasRolePermission: boolean;
} {
  const status = material.currentStatus;

  // Terminal / Hold states
  if (status === 'INSPECTION_REJECTED') {
    return {
      allowedAction: null,
      reasonIfNotAllowed: 'This material was REJECTED during QA inspection and cannot proceed through the workflow.',
      hasRolePermission: false,
    };
  }

  if (status === 'INSPECTION_ON_HOLD') {
    const canReinspect = userRole === 'INSPECTOR' || userRole === 'ADMIN';
    return {
      allowedAction: canReinspect
        ? {
            id: 'RE_INSPECT',
            label: 'Re-evaluate Held Material',
            stage: 'INSPECTION',
            targetStatus: 'INSPECTION_COMPLETED',
            requiredRole: ['INSPECTOR', 'ADMIN'],
            description: 'Perform secondary test to lift or uphold hold status.',
            iconName: 'ClipboardCheck',
            variant: 'warning',
          }
        : null,
      reasonIfNotAllowed: canReinspect
        ? undefined
        : 'Material is on HOLD. Only an authorized Inspector or Admin can re-evaluate it.',
      hasRolePermission: canReinspect,
    };
  }

  // 1. Gate Entry Completed -> Needs Inspection
  if (status === 'GATE_ENTRY_COMPLETED' || status === 'INSPECTION_PENDING') {
    const hasRole = userRole === 'INSPECTOR' || userRole === 'ADMIN';
    return {
      allowedAction: {
        id: 'PERFORM_INSPECTION',
        label: 'Perform Material Inspection',
        stage: 'INSPECTION',
        targetStatus: 'INSPECTION_COMPLETED',
        requiredRole: ['INSPECTOR', 'ADMIN'],
        description: 'Record quality parameters, accept/reject decision, and attach inspection photo.',
        iconName: 'ClipboardCheck',
        variant: 'primary',
      },
      reasonIfNotAllowed: hasRole ? undefined : 'Only an Inspector or Admin can perform and approve Material Inspection.',
      hasRolePermission: hasRole,
    };
  }

  // 2. Inspection Completed -> Needs GRN
  if (status === 'INSPECTION_COMPLETED' || status === 'GRN_PENDING') {
    const hasRole = userRole === 'GRN_USER' || userRole === 'ADMIN' || userRole === 'STORE_USER';
    return {
      allowedAction: {
        id: 'CREATE_GRN',
        label: 'Create Goods Receipt Note (GRN)',
        stage: 'GRN',
        targetStatus: 'GRN_COMPLETED',
        requiredRole: ['GRN_USER', 'STORE_USER', 'ADMIN'],
        description: 'Verify accepted quantity, allocate warehouse storage bin, and assign batch number.',
        iconName: 'FileCheck',
        variant: 'primary',
      },
      reasonIfNotAllowed: hasRole ? undefined : 'Only a GRN Officer or Store Admin can generate and approve a GRN.',
      hasRolePermission: hasRole,
    };
  }

  // 3. GRN Completed -> Available for Material Request (if stock available)
  if (status === 'GRN_COMPLETED' || status === 'MATERIAL_REQUEST_REJECTED') {
    if (material.availableQuantity <= 0) {
      return {
        allowedAction: null,
        reasonIfNotAllowed: 'All available stock for this material has already been issued to the shopfloor.',
        hasRolePermission: false,
      };
    }

    const hasRole = userRole === 'MATERIAL_REQUEST_USER' || userRole === 'ADMIN';
    return {
      allowedAction: {
        id: 'CREATE_REQUEST',
        label: 'Initiate Material Request',
        stage: 'MATERIAL_REQUEST',
        targetStatus: 'MATERIAL_REQUEST_PENDING',
        requiredRole: ['MATERIAL_REQUEST_USER', 'ADMIN'],
        description: 'Request material from available stock for production assembly line.',
        iconName: 'FileText',
        variant: 'primary',
      },
      reasonIfNotAllowed: hasRole ? undefined : 'Only Production Requisitioners or Admin can initiate a Material Request.',
      hasRolePermission: hasRole,
    };
  }

  // 4. Request Pending -> Needs Approval
  if (status === 'MATERIAL_REQUEST_PENDING') {
    const hasRole = userRole === 'REQUEST_APPROVER' || userRole === 'ADMIN';
    return {
      allowedAction: {
        id: 'APPROVE_REQUEST',
        label: 'Review & Approve Request',
        stage: 'MATERIAL_REQUEST',
        targetStatus: 'MATERIAL_REQUEST_APPROVED',
        requiredRole: ['REQUEST_APPROVER', 'ADMIN'],
        description: 'Review production requisition and authorize store dispatch.',
        iconName: 'CheckCircle2',
        variant: 'primary',
      },
      reasonIfNotAllowed: hasRole ? undefined : 'Only a Plant Approver or Manager can approve Material Requests.',
      hasRolePermission: hasRole,
    };
  }

  // 5. Request Approved -> Needs Material Issue
  if (status === 'MATERIAL_REQUEST_APPROVED' || status === 'MATERIAL_ISSUE_PENDING') {
    const hasRole = userRole === 'STORE_USER' || userRole === 'ADMIN';
    return {
      allowedAction: {
        id: 'ISSUE_MATERIAL',
        label: 'Issue Material to Shopfloor',
        stage: 'MATERIAL_ISSUE',
        targetStatus: 'MATERIAL_ISSUED_TO_SHOPFLOOR',
        requiredRole: ['STORE_USER', 'ADMIN'],
        description: 'Confirm physical dispatch from storage bin to receiver on shopfloor.',
        iconName: 'ArrowUpRight',
        variant: 'primary',
      },
      reasonIfNotAllowed: hasRole ? undefined : 'Only Store & Warehouse personnel can issue material.',
      hasRolePermission: hasRole,
    };
  }

  // 6. Material Issued -> Can initiate another request if remaining stock > 0
  if (status === 'MATERIAL_ISSUED' || status === 'MATERIAL_ISSUED_TO_SHOPFLOOR') {
    if (material.availableQuantity > 0) {
      const hasRole = userRole === 'MATERIAL_REQUEST_USER' || userRole === 'ADMIN';
      return {
        allowedAction: {
          id: 'CREATE_ADDITIONAL_REQUEST',
          label: `Request Remaining Stock (${material.availableQuantity} ${material.uom} left)`,
          stage: 'MATERIAL_REQUEST',
          targetStatus: 'MATERIAL_REQUEST_PENDING',
          requiredRole: ['MATERIAL_REQUEST_USER', 'ADMIN'],
          description: `Create new requisition for remaining balance of ${material.availableQuantity} ${material.uom}.`,
          iconName: 'FileText',
          variant: 'primary',
        },
        reasonIfNotAllowed: hasRole ? undefined : 'Only Production Requisitioners can request remaining stock.',
        hasRolePermission: hasRole,
      };
    } else {
      return {
        allowedAction: null,
        reasonIfNotAllowed: 'Batch fully consumed and issued to shopfloor. Traceability history is complete.',
        hasRolePermission: false,
      };
    }
  }

  return {
    allowedAction: null,
    reasonIfNotAllowed: 'No pending actions required for this material at this time.',
    hasRolePermission: false,
  };
}
