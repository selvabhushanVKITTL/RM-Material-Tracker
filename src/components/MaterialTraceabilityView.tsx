import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  MaterialTransaction, 
  User, 
  AuditLogEntry, 
  WorkflowStatus 
} from '../types';
import { 
  STATUS_CONFIG, 
  WORKFLOW_STAGES, 
  getAvailableActions 
} from '../services/stateMachine';
import { 
  QrCode, 
  Printer, 
  Check, 
  Clock, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  FileText, 
  ClipboardCheck, 
  FileCheck, 
  ArrowUpRight, 
  Layers,
  Search,
  ShieldAlert,
  Sparkles,
  Building,
  Truck,
  Package,
  History
} from 'lucide-react';

interface MaterialTraceabilityViewProps {
  material: MaterialTransaction | null;
  allMaterials: MaterialTransaction[];
  onSelectMaterial: (m: MaterialTransaction) => void;
  currentUser: User;
  onOpenActionModal: (actionId: string, material: MaterialTransaction) => void;
  onOpenQRLabel: (material: MaterialTransaction) => void;
  onOpenScanner: () => void;
  auditLogs: AuditLogEntry[];
}

export const MaterialTraceabilityView: React.FC<MaterialTraceabilityViewProps> = ({
  material,
  allMaterials,
  onSelectMaterial,
  currentUser,
  onOpenActionModal,
  onOpenQRLabel,
  onOpenScanner,
  auditLogs,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'DETAILS' | 'AUDIT'>('DETAILS');

  if (!material) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Select or Scan a Material</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
          Scan a QR code from a mobile device or choose a raw material from the inventory queue below.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onOpenScanner}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-200 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Open Camera Scanner
          </button>
          {allMaterials.length > 0 && (
            <button
              onClick={() => onSelectMaterial(allMaterials[0])}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer"
            >
              View Sample ({allMaterials[0].id})
            </button>
          )}
        </div>
      </div>
    );
  }

  const statusMeta = STATUS_CONFIG[material.currentStatus] || {
    label: material.currentStatus.replace(/_/g, ' '),
    stageIndex: 0,
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
  };

  const actionAssessment = getAvailableActions(material, currentUser.role);
  const materialLogs = auditLogs.filter((log) => log.materialId === material.id);

  // Compute stage progression checkmarks
  const getStageStatus = (stageIndex: number) => {
    if (material.currentStatus === 'INSPECTION_REJECTED' && stageIndex >= 1) {
      return stageIndex === 1 ? 'REJECTED' : 'BLOCKED';
    }
    if (material.currentStatus === 'INSPECTION_ON_HOLD' && stageIndex === 1) {
      return 'HOLD';
    }
    if (statusMeta.stageIndex > stageIndex) return 'COMPLETED';
    if (statusMeta.stageIndex === stageIndex) return 'CURRENT';
    return 'PENDING';
  };

  const qrPayload = `RMQR:${material.id}:${material.qrToken}`;

  // Inventory usage percentage
  const totalQty = material.originalQuantity || 1;
  const availableQty = material.availableQuantity;
  const issuedQty = material.issuedQuantity;
  const availablePercent = Math.min(100, Math.max(0, (availableQty / totalQty) * 100));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Top Bar / Material Selector Switcher */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Material:
            </span>
            <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {material.id}
            </span>
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline truncate max-w-xs">
            {material.materialName}
          </span>
        </div>

        {/* Quick Material Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-0.5">
            {allMaterials.map((m) => {
              const isSelected = m.id === material.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMaterial(m)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-blue-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {m.id.replace('MAT-2026-', '#')}
                </button>
              );
            })}
          </div>
          <button
            onClick={onOpenScanner}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer ml-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Scan</span>
          </button>
        </div>
      </div>

      {/* Main Workspace 12-Column Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Center 8 Columns: Material Dossier & Actions */}
        <section className="lg:col-span-8 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Main Dossier Card (Matching Design HTML) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Dossier Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-800 text-sm tracking-wide">
                  MATERIAL DETAILS: <span className="font-mono text-blue-700">{material.id}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">({material.rmCode})</span>
              </div>
              <span
                className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider border ${statusMeta.badgeBg} ${statusMeta.badgeText} ${statusMeta.badgeBorder}`}
              >
                {statusMeta.label}
              </span>
            </div>

            {/* 3-Column Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {/* Column 1 */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Material Name
                  </label>
                  <p className="text-slate-900 font-semibold text-sm leading-snug">{material.materialName}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    RM Code
                  </label>
                  <p className="text-blue-700 font-mono font-bold text-sm">{material.rmCode}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    PO Number
                  </label>
                  <p className="text-slate-800 font-mono font-semibold text-sm">{material.poNumber}</p>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Supplier Name
                  </label>
                  <p className="text-slate-900 font-semibold text-sm leading-snug">{material.supplierName}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Vehicle Number
                  </label>
                  <p className="text-slate-800 font-mono font-semibold text-sm">{material.vehicleNumber}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Current Location
                  </label>
                  <p className="text-slate-900 font-semibold text-sm">
                    {material.storageLocation || 'Awaiting GRN Bin Assignment'}
                  </p>
                </div>
              </div>

              {/* Column 3: Interactive QR Thumbnail */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center items-center gap-2 text-center">
                <div 
                  onClick={() => onOpenQRLabel(material)}
                  className="w-32 h-32 bg-white border border-slate-200 p-2 rounded-lg shadow-inner flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors group relative"
                  title="Click to view printable industrial tag"
                >
                  <QRCodeSVG
                    value={qrPayload}
                    size={104}
                    level="M"
                    includeMargin={false}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 text-white rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <Printer className="w-6 h-6 text-blue-400 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Print Tag</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-slate-600 uppercase">
                    ID: {material.id}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenQRLabel(material)}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wide cursor-pointer mt-0.5 inline-flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    Print Tag
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar (Context-Driven & Role-Aware) */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-3">
              {/* Dynamic Primary Stage Action Button */}
              {actionAssessment.allowedAction ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onOpenActionModal(actionAssessment.allowedAction!.id, material)}
                    disabled={!actionAssessment.hasRolePermission}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                      actionAssessment.hasRolePermission
                        ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-200'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {actionAssessment.allowedAction.id === 'PERFORM_INSPECTION' && <ClipboardCheck className="w-4 h-4" />}
                    {actionAssessment.allowedAction.id === 'CREATE_GRN' && <FileCheck className="w-4 h-4" />}
                    {actionAssessment.allowedAction.id === 'CREATE_REQUEST' && <FileText className="w-4 h-4" />}
                    {actionAssessment.allowedAction.id === 'APPROVE_REQUEST' && <Check className="w-4 h-4" />}
                    {actionAssessment.allowedAction.id === 'ISSUE_MATERIAL' && <ArrowUpRight className="w-4 h-4" />}
                    <span>{actionAssessment.allowedAction.label}</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab(activeSubTab === 'AUDIT' ? 'DETAILS' : 'AUDIT')}
                    className="px-5 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-slate-400" />
                    {activeSubTab === 'AUDIT' ? 'Hide Audit Log' : 'View Audit Trail'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {actionAssessment.reasonIfNotAllowed || 'Workflow completed for this material.'}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveSubTab(activeSubTab === 'AUDIT' ? 'DETAILS' : 'AUDIT')}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold cursor-pointer"
                  >
                    {activeSubTab === 'AUDIT' ? 'Hide History' : 'View History'}
                  </button>
                </div>
              )}

              {/* Permission Hint if active user cannot execute stage */}
              {!actionAssessment.hasRolePermission && actionAssessment.reasonIfNotAllowed && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{actionAssessment.reasonIfNotAllowed}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">
                    Current: {currentUser.roleTitle}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail Ledger Table for this specific material */}
          {activeSubTab === 'AUDIT' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
              <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Immutable Audit Trail for {material.id}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {materialLogs.length} verified lifecycle events
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Date & Time</th>
                      <th className="py-2.5 px-4">Stage</th>
                      <th className="py-2.5 px-4">User & Role</th>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Resulting Status</th>
                      <th className="py-2.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {materialLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {log.stage.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{log.userName}</span>
                          <span className="text-[10px] text-blue-600 block">{log.userRole}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {log.newStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">
                          {log.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Specifications Detail Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Total Inward Qty
              </span>
              <p className="text-xl font-bold text-slate-900">
                {material.originalQuantity.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-medium">{material.uom}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Logged at Gate on {material.gateEntryDateTime}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Available In Store
              </span>
              <p className="text-xl font-bold text-blue-600">
                {material.availableQuantity.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-medium">{material.uom}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Ready for production issue</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Issued to Shopfloor
              </span>
              <p className="text-xl font-bold text-emerald-600">
                {material.issuedQuantity.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-medium">{material.uom}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Delivered to manufacturing line</p>
            </div>
          </div>
        </section>

        {/* Right 4 Columns / Aside: Workflow Progress Timeline (Matching Design HTML) */}
        <aside className="lg:col-span-4 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col p-6 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Workflow Progress
          </h3>

          {/* Vertical Stepper Timeline */}
          <div className="flex-1 relative pl-6 space-y-9">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[9px] top-2 bottom-8 w-px bg-slate-200" />

            {WORKFLOW_STAGES.map((stage, idx) => {
              const stageState = getStageStatus(idx);
              const isCompleted = stageState === 'COMPLETED';
              const isCurrent = stageState === 'CURRENT';
              const isRejected = stageState === 'REJECTED';
              const isHold = stageState === 'HOLD';

              // Find actor & timestamp from inspections, grns, requests, issues
              let actorText = '';
              let timeText = 'Pending';

              if (idx === 0) {
                // Gate
                actorText = `By: ${material.createdBy || 'Gate User'}`;
                timeText = material.gateEntryDateTime;
              } else if (idx === 1 && material.inspections && material.inspections.length > 0) {
                const insp = material.inspections[material.inspections.length - 1];
                actorText = `By: ${insp.inspectorName}`;
                timeText = insp.inspectionDate;
              } else if (idx === 2 && material.grns && material.grns.length > 0) {
                const grn = material.grns[0];
                actorText = `By: ${grn.createdBy}`;
                timeText = grn.grnDate;
              } else if (idx === 3 && material.requests && material.requests.length > 0) {
                const req = material.requests[0];
                actorText = `By: ${req.requestedBy}`;
                timeText = req.requiredDate;
              } else if (idx === 4 && material.issues && material.issues.length > 0) {
                const iss = material.issues[0];
                actorText = `By: ${iss.issuedBy}`;
                timeText = iss.issueDate;
              } else if (idx === 5 && material.currentStatus === 'MATERIAL_ISSUED_TO_SHOPFLOOR') {
                actorText = 'In Shopfloor Stream';
                timeText = 'Active';
              }

              return (
                <div
                  key={stage.id}
                  className={`relative flex items-start gap-4 transition-opacity ${
                    stageState === 'PENDING' || stageState === 'BLOCKED' ? 'opacity-45' : 'opacity-100'
                  }`}
                >
                  {/* Node Circle */}
                  {isCompleted && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white ring-4 ring-green-50 shadow-sm absolute -left-[27px] z-10">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {isCurrent && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-blue-100 shadow-sm absolute -left-[27px] z-10 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}

                  {isRejected && (
                    <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white ring-4 ring-rose-100 shadow-sm absolute -left-[27px] z-10">
                      <XCircle className="w-3 h-3" />
                    </div>
                  )}

                  {isHold && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white ring-4 ring-amber-100 shadow-sm absolute -left-[27px] z-10">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}

                  {(stageState === 'PENDING' || stageState === 'BLOCKED') && (
                    <div className="w-5 h-5 rounded-full bg-slate-300 ring-4 ring-slate-100 absolute -left-[27px] z-10" />
                  )}

                  {/* Stage Text */}
                  <div>
                    <p className="text-sm font-bold text-slate-800">{stage.label}</p>
                    <p className="text-[11px] text-slate-500">{timeText}</p>
                    {actorText && (
                      <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5">
                        {actorText}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inventory Snapshot (Matching Design HTML) */}
          <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Inventory Balance Snapshot
            </p>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-semibold text-slate-700">Available Stock</span>
              <span className="font-bold text-blue-600 font-mono">
                {availableQty.toLocaleString()} {material.uom}
              </span>
            </div>
            {/* Progress Meter */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${availablePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>Issued: {issuedQty.toLocaleString()} {material.uom}</span>
              <span>Total: {totalQty.toLocaleString()} {material.uom}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
