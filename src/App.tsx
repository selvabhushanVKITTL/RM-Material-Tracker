import React, { useState } from 'react';
import { 
  MaterialTransaction, 
  User, 
  AuditLogEntry, 
  ViewTab, 
  InspectionRecord, 
  GRNRecord, 
  MaterialRequestRecord, 
  MaterialIssueRecord,
  WorkflowStatus
} from './types';
import { INITIAL_MATERIALS, INITIAL_USERS, INITIAL_AUDIT_LOGS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MaterialTraceabilityView } from './components/MaterialTraceabilityView';
import { RequestsView } from './components/RequestsView';
import { AuditLogView } from './components/AuditLogView';
import { AdminUsersView } from './components/AdminUsersView';
import { AllScreensGallery } from './components/AllScreensGallery';
import { QRScannerModal } from './components/QRScannerModal';
import { QRLabelModal } from './components/QRLabelModal';
import { ActionConfirmationModal } from './components/ActionConfirmationModal';
import { GateEntryModal } from './components/GateEntryModal';
import { InspectionModal } from './components/InspectionModal';
import { GRNModal } from './components/GRNModal';
import { MaterialRequestModal } from './components/MaterialRequestModal';
import { MaterialIssueModal } from './components/MaterialIssueModal';
import confetti from 'canvas-confetti';

export default function App() {
  // Global State
  const [materials, setMaterials] = useState<MaterialTransaction[]>(INITIAL_MATERIALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Gate User
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialTransaction | null>(INITIAL_MATERIALS[0]);
  const [activeTab, setActiveTab] = useState<ViewTab>('SHOWCASE');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQRLabelOpen, setIsQRLabelOpen] = useState(false);
  const [qrLabelTarget, setQrLabelTarget] = useState<MaterialTransaction | null>(null);
  const [isGateEntryOpen, setIsGateEntryOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isGRNOpen, setIsGRNOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  // Double-Confirmation Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'primary' | 'danger' | 'warning' | 'success';
    onConfirm: () => void;
    previousStatus: WorkflowStatus | string;
    newStatus: WorkflowStatus | string;
    materialId: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'primary',
    onConfirm: () => {},
    previousStatus: '',
    newStatus: '',
    materialId: '',
  });

  // Helper to record immutable audit log
  const recordAudit = (
    materialId: string,
    stage: string,
    action: string,
    previousStatus: WorkflowStatus | string,
    newStatus: WorkflowStatus | string,
    remarks?: string
  ) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      materialId,
      stage,
      action,
      previousStatus,
      newStatus,
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: formattedDate,
      remarks,
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // 1. Stage 1: Gate Inward Creation
  const handleGateEntrySubmit = (newMaterial: MaterialTransaction) => {
    setMaterials((prev) => [newMaterial, ...prev]);
    setSelectedMaterial(newMaterial);
    recordAudit(
      newMaterial.id,
      'GATE_ENTRY',
      'Gate Inward Entry Registered',
      'GATE_ENTRY_PENDING',
      'GATE_ENTRY_COMPLETED',
      `Consignment inwarded with PO ${newMaterial.poNumber} on vehicle ${newMaterial.vehicleNumber}. Unique QR token stamped.`
    );

    // Open QR printable tag
    setQrLabelTarget(newMaterial);
    setIsQRLabelOpen(true);
    setActiveTab('TRACEABILITY');
    triggerSuccessConfetti();
  };

  // 2. Stage 2: Quality Inspection
  const handleInspectionSubmit = (inspection: InspectionRecord, result: 'ACCEPTED' | 'REJECTED' | 'HOLD') => {
    if (!selectedMaterial) return;

    const previousStatus = selectedMaterial.currentStatus;
    let targetStatus: WorkflowStatus = 'INSPECTION_COMPLETED';
    let variant: 'success' | 'danger' | 'warning' = 'success';
    let actionLabel = 'Approve Quality Inspection';

    if (result === 'REJECTED') {
      targetStatus = 'INSPECTION_REJECTED';
      variant = 'danger';
      actionLabel = 'Reject & Quarantine Material';
    } else if (result === 'HOLD') {
      targetStatus = 'INSPECTION_ON_HOLD';
      variant = 'warning';
      actionLabel = 'Place Material on QA Hold';
    }

    setConfirmConfig({
      isOpen: true,
      title: `${actionLabel}?`,
      message: `Are you sure you want to sign off this inspection as ${result}? This will update the status to ${targetStatus} and append an immutable entry to the plant audit ledger.`,
      confirmLabel: actionLabel,
      variant,
      previousStatus,
      newStatus: targetStatus,
      materialId: selectedMaterial.id,
      onConfirm: () => {
        const updated: MaterialTransaction = {
          ...selectedMaterial,
          currentStatus: targetStatus,
          inspections: [...(selectedMaterial.inspections || []), inspection],
        };

        setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setSelectedMaterial(updated);
        recordAudit(
          selectedMaterial.id,
          'INSPECTION',
          `Inspection ${result === 'ACCEPTED' ? 'Approved' : result === 'REJECTED' ? 'Rejected' : 'Placed on Hold'}`,
          previousStatus,
          targetStatus,
          inspection.remarks
        );

        if (result === 'ACCEPTED') {
          triggerSuccessConfetti();
        }
      },
    });
  };

  // 3. Stage 3: GRN Inward
  const handleGRNSubmit = (grn: GRNRecord) => {
    if (!selectedMaterial) return;

    const previousStatus = selectedMaterial.currentStatus;
    const targetStatus: WorkflowStatus = 'GRN_COMPLETED';

    setConfirmConfig({
      isOpen: true,
      title: 'Approve & Finalize GRN?',
      message: `Are you sure you want to approve GRN ${grn.grnNumber} for ${grn.acceptedQuantity} ${selectedMaterial.uom}? This will initialize available inventory stock in ${grn.storageLocation}.`,
      confirmLabel: 'Approve GRN',
      variant: 'success',
      previousStatus,
      newStatus: targetStatus,
      materialId: selectedMaterial.id,
      onConfirm: () => {
        const updated: MaterialTransaction = {
          ...selectedMaterial,
          currentStatus: targetStatus,
          storageLocation: grn.storageLocation,
          batchLotNumber: grn.batchLotNumber,
          availableQuantity: grn.acceptedQuantity,
          grns: [...(selectedMaterial.grns || []), grn],
        };

        setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setSelectedMaterial(updated);
        recordAudit(
          selectedMaterial.id,
          'GRN',
          'GRN Approved & Stock Racked',
          previousStatus,
          targetStatus,
          `GRN ${grn.grnNumber} created. Accepted ${grn.acceptedQuantity} ${selectedMaterial.uom} stored in ${grn.storageLocation}.`
        );
        triggerSuccessConfetti();
      },
    });
  };

  // 4. Stage 4: Material Requisition
  const handleRequestSubmit = (request: MaterialRequestRecord) => {
    if (!selectedMaterial) return;

    const previousStatus = selectedMaterial.currentStatus;
    const targetStatus: WorkflowStatus = 'MATERIAL_REQUEST_PENDING';

    const updated: MaterialTransaction = {
      ...selectedMaterial,
      currentStatus: targetStatus,
      requests: [...(selectedMaterial.requests || []), request],
    };

    setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelectedMaterial(updated);
    recordAudit(
      selectedMaterial.id,
      'MATERIAL_REQUEST',
      'Material Requisition Submitted',
      previousStatus,
      targetStatus,
      `Requisition ${request.requestNumber} submitted for ${request.requestedQuantity} ${request.uom} for ${request.department}.`
    );
  };

  // Manager Approve Material Request
  const handleApproveRequest = (material: MaterialTransaction, request: MaterialRequestRecord) => {
    const previousStatus = material.currentStatus;
    const targetStatus: WorkflowStatus = 'MATERIAL_REQUEST_APPROVED';

    setConfirmConfig({
      isOpen: true,
      title: 'Approve Material Requisition?',
      message: `Authorize release of ${request.requestedQuantity} ${request.uom} of ${material.materialName} for ${request.department}?`,
      confirmLabel: 'Approve Requisition',
      variant: 'success',
      previousStatus,
      newStatus: targetStatus,
      materialId: material.id,
      onConfirm: () => {
        const updatedRequests = (material.requests || []).map((r) =>
          r.id === request.id
            ? {
                ...r,
                status: 'APPROVED' as const,
                approvedBy: currentUser.name,
                approvedDate: new Date().toISOString().split('T')[0],
              }
            : r
        );

        const updated: MaterialTransaction = {
          ...material,
          currentStatus: targetStatus,
          requests: updatedRequests,
        };

        setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        if (selectedMaterial?.id === material.id) {
          setSelectedMaterial(updated);
        }
        recordAudit(
          material.id,
          'MATERIAL_REQUEST',
          'Requisition Approved by Manager',
          previousStatus,
          targetStatus,
          `Requisition ${request.requestNumber} signed off by ${currentUser.name}. Ready for warehouse store dispatch.`
        );
        triggerSuccessConfetti();
      },
    });
  };

  // Manager Reject Material Request
  const handleRejectRequest = (material: MaterialTransaction, request: MaterialRequestRecord) => {
    const previousStatus = material.currentStatus;
    const targetStatus: WorkflowStatus = 'MATERIAL_REQUEST_REJECTED';

    setConfirmConfig({
      isOpen: true,
      title: 'Decline Material Requisition?',
      message: `Decline requisition ${request.requestNumber}? Material will remain available in warehouse stock.`,
      confirmLabel: 'Decline Requisition',
      variant: 'danger',
      previousStatus,
      newStatus: targetStatus,
      materialId: material.id,
      onConfirm: () => {
        const updatedRequests = (material.requests || []).map((r) =>
          r.id === request.id
            ? {
                ...r,
                status: 'REJECTED' as const,
                approvedBy: currentUser.name,
                approvedDate: new Date().toISOString().split('T')[0],
              }
            : r
        );

        const updated: MaterialTransaction = {
          ...material,
          currentStatus: targetStatus,
          requests: updatedRequests,
        };

        setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        if (selectedMaterial?.id === material.id) {
          setSelectedMaterial(updated);
        }
        recordAudit(
          material.id,
          'MATERIAL_REQUEST',
          'Requisition Declined by Manager',
          previousStatus,
          targetStatus,
          `Requisition ${request.requestNumber} declined by ${currentUser.name}.`
        );
      },
    });
  };

  // 5. Stage 5: Material Issue to Shopfloor
  const handleIssueSubmit = (issue: MaterialIssueRecord) => {
    if (!selectedMaterial) return;

    const previousStatus = selectedMaterial.currentStatus;
    const targetStatus: WorkflowStatus = 'MATERIAL_ISSUED_TO_SHOPFLOOR';
    const newAvailable = Math.max(0, selectedMaterial.availableQuantity - issue.issueQuantity);
    const newIssued = selectedMaterial.issuedQuantity + issue.issueQuantity;

    setConfirmConfig({
      isOpen: true,
      title: 'Confirm Material Dispatch to Shopfloor?',
      message: `Are you sure you want to issue ${issue.issueQuantity} ${selectedMaterial.uom} to ${issue.receiver} at ${issue.shopfloor}? Warehouse balance will decrease to ${newAvailable} ${selectedMaterial.uom}.`,
      confirmLabel: 'Confirm Dispatch',
      variant: 'success',
      previousStatus,
      newStatus: targetStatus,
      materialId: selectedMaterial.id,
      onConfirm: () => {
        const updated: MaterialTransaction = {
          ...selectedMaterial,
          availableQuantity: newAvailable,
          issuedQuantity: newIssued,
          currentStatus: targetStatus,
          issues: [...(selectedMaterial.issues || []), issue],
        };

        setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setSelectedMaterial(updated);
        recordAudit(
          selectedMaterial.id,
          'MATERIAL_ISSUE',
          'Material Dispatched to Shopfloor',
          previousStatus,
          targetStatus,
          `Issued ${issue.issueQuantity} ${selectedMaterial.uom} to receiver ${issue.receiver} for ${issue.shopfloor}.`
        );
        triggerSuccessConfetti();
      },
    });
  };

  // QR Scan Success Handler
  const handleScanSuccess = (decodedId: string) => {
    setIsScannerOpen(false);
    const found = materials.find(
      (m) =>
        m.id.toLowerCase() === decodedId.toLowerCase() ||
        m.qrToken === decodedId ||
        m.poNumber.toLowerCase() === decodedId.toLowerCase() ||
        m.rmCode.toLowerCase() === decodedId.toLowerCase()
    );

    if (found) {
      setSelectedMaterial(found);
      setActiveTab('TRACEABILITY');
    } else {
      alert(`Material identifier "${decodedId}" was not found in the factory database.`);
    }
  };

  // Dispatch Action Modal Trigger
  const handleOpenActionModal = (actionId: string, material: MaterialTransaction) => {
    setSelectedMaterial(material);
    if (actionId === 'PERFORM_INSPECTION' || actionId === 'RE_INSPECT') {
      setIsInspectionOpen(true);
    } else if (actionId === 'CREATE_GRN') {
      setIsGRNOpen(true);
    } else if (actionId === 'CREATE_REQUEST' || actionId === 'CREATE_ADDITIONAL_REQUEST') {
      setIsRequestOpen(true);
    } else if (actionId === 'APPROVE_REQUEST') {
      setActiveTab('REQUESTS');
    } else if (actionId === 'ISSUE_MATERIAL') {
      setIsIssueOpen(true);
    }
  };

  const triggerSuccessConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#6366f1'],
      });
    } catch (e) {
      // Ignore in non-browser or sandbox edge cases
    }
  };

  // Filtered materials by search query
  const filteredMaterials = materials.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      m.rmCode.toLowerCase().includes(q) ||
      m.materialName.toLowerCase().includes(q) ||
      m.poNumber.toLowerCase().includes(q) ||
      m.supplierName.toLowerCase().includes(q) ||
      m.vehicleNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      {/* Top Navigation Header (Slate-900 Navy #0F172A) */}
      <Header
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenGateEntry={() => setIsGateEntryOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main App Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Vertical Icon Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenGateEntry={() => setIsGateEntryOpen(true)}
          userRole={currentUser.role}
        />

        {/* Dynamic Center Stage View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'DASHBOARD' && (
            <DashboardView
              materials={filteredMaterials}
              currentUser={currentUser}
              onSelectMaterial={(m) => {
                setSelectedMaterial(m);
                setActiveTab('TRACEABILITY');
              }}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenGateEntry={() => setIsGateEntryOpen(true)}
            />
          )}

          {activeTab === 'TRACEABILITY' && (
            <MaterialTraceabilityView
              material={selectedMaterial}
              allMaterials={filteredMaterials}
              onSelectMaterial={setSelectedMaterial}
              currentUser={currentUser}
              onOpenActionModal={handleOpenActionModal}
              onOpenQRLabel={(m) => {
                setQrLabelTarget(m);
                setIsQRLabelOpen(true);
              }}
              onOpenScanner={() => setIsScannerOpen(true)}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'REQUESTS' && (
            <RequestsView
              materials={materials}
              currentUser={currentUser}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
              onSelectMaterial={(m) => {
                setSelectedMaterial(m);
                setActiveTab('TRACEABILITY');
              }}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === 'AUDIT_LOG' && (
            <AuditLogView
              auditLogs={auditLogs}
              onSelectMaterialById={(id) => {
                const found = materials.find((m) => m.id === id);
                if (found) {
                  setSelectedMaterial(found);
                  setActiveTab('TRACEABILITY');
                }
              }}
            />
          )}

          {activeTab === 'ADMIN' && (
            <AdminUsersView
              currentUser={currentUser}
              onSelectUser={setCurrentUser}
            />
          )}

          {activeTab === 'SHOWCASE' && (
            <AllScreensGallery
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenGateEntry={() => setIsGateEntryOpen(true)}
              onOpenInspection={() => {
                if (!selectedMaterial) setSelectedMaterial(materials[0]);
                setIsInspectionOpen(true);
              }}
              onOpenGRN={() => {
                if (!selectedMaterial) setSelectedMaterial(materials[0]);
                setIsGRNOpen(true);
              }}
              onOpenRequest={() => {
                if (!selectedMaterial) setSelectedMaterial(materials[0]);
                setIsRequestOpen(true);
              }}
              onOpenIssue={() => {
                if (!selectedMaterial) setSelectedMaterial(materials[0]);
                setIsIssueOpen(true);
              }}
              onOpenQRLabel={() => {
                setQrLabelTarget(selectedMaterial || materials[0]);
                setIsQRLabelOpen(true);
              }}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenConfirmSample={() => {
                setConfirmConfig({
                  isOpen: true,
                  title: 'Approve Material Requisition?',
                  message: 'Are you sure you want to sign off this stage transition? An immutable entry will be stamped in the plant audit ledger.',
                  confirmLabel: 'Confirm Sign-Off',
                  variant: 'success',
                  previousStatus: 'MATERIAL_REQUEST_PENDING',
                  newStatus: 'MATERIAL_REQUEST_APPROVED',
                  materialId: selectedMaterial?.id || 'MAT-2026-000001',
                  onConfirm: () => triggerSuccessConfetti(),
                });
              }}
              currentUser={currentUser}
              onSelectUser={setCurrentUser}
              selectedMaterial={selectedMaterial}
            />
          )}
        </div>
      </main>

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        materials={materials}
      />

      {/* Industrial Printable QR Tag Modal */}
      <QRLabelModal
        isOpen={isQRLabelOpen}
        onClose={() => setIsQRLabelOpen(false)}
        material={qrLabelTarget}
      />

      {/* Stage 1: Gate Inward Entry Modal */}
      <GateEntryModal
        isOpen={isGateEntryOpen}
        onClose={() => setIsGateEntryOpen(false)}
        onSubmit={handleGateEntrySubmit}
        currentUser={currentUser}
        existingCount={materials.length}
      />

      {/* Stage 2: Quality Inspection Modal */}
      <InspectionModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        material={selectedMaterial}
        currentUser={currentUser}
        onSubmit={handleInspectionSubmit}
      />

      {/* Stage 3: GRN Receipt Modal */}
      <GRNModal
        isOpen={isGRNOpen}
        onClose={() => setIsGRNOpen(false)}
        material={selectedMaterial}
        currentUser={currentUser}
        onSubmit={handleGRNSubmit}
      />

      {/* Stage 4: Material Requisition Modal */}
      <MaterialRequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        material={selectedMaterial}
        currentUser={currentUser}
        onSubmit={handleRequestSubmit}
      />

      {/* Stage 5: Material Issue to Shopfloor Modal */}
      <MaterialIssueModal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        material={selectedMaterial}
        currentUser={currentUser}
        onSubmit={handleIssueSubmit}
      />

      {/* Double-Confirmation Guardrail Dialog */}
      <ActionConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        variant={confirmConfig.variant}
        actorName={currentUser.name}
        actorRole={currentUser.roleTitle}
        previousStatus={confirmConfig.previousStatus}
        newStatus={confirmConfig.newStatus}
        materialId={confirmConfig.materialId}
      />
    </div>
  );
}
