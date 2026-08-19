import React, { useState } from 'react';
import { 
  ViewTab, 
  MaterialTransaction, 
  User 
} from '../types';
import { 
  Layers, 
  LayoutDashboard, 
  FileText, 
  History, 
  Users, 
  QrCode, 
  Printer, 
  Truck, 
  ClipboardCheck, 
  FileCheck, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles, 
  Eye, 
  ArrowRight,
  CheckCircle2,
  Play,
  Maximize2
} from 'lucide-react';

interface AllScreensGalleryProps {
  onNavigateTab: (tab: ViewTab) => void;
  onOpenGateEntry: () => void;
  onOpenInspection: () => void;
  onOpenGRN: () => void;
  onOpenRequest: () => void;
  onOpenIssue: () => void;
  onOpenQRLabel: () => void;
  onOpenScanner: () => void;
  onOpenConfirmSample: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  selectedMaterial: MaterialTransaction | null;
}

export const AllScreensGallery: React.FC<AllScreensGalleryProps> = ({
  onNavigateTab,
  onOpenGateEntry,
  onOpenInspection,
  onOpenGRN,
  onOpenRequest,
  onOpenIssue,
  onOpenQRLabel,
  onOpenScanner,
  onOpenConfirmSample,
  currentUser,
  onSelectUser,
  selectedMaterial,
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'VIEWS' | 'MODALS'>('ALL');

  const mainViews = [
    {
      id: 'TRACEABILITY' as ViewTab,
      title: 'Material Traceability & Dossier',
      badge: 'Core Screen',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Layers,
      description: 'Central 3-column dossier showing material specifications, supplier details, QR thumbnail, interactive action bar, and vertical lifecycle progress stepper.',
      features: ['3-Column Dossier Card', 'Real-time Stock Balance Meter', 'Interactive Vertical Stepper', 'Embedded Material Audit Ledger'],
      action: () => onNavigateTab('TRACEABILITY'),
      actionLabel: 'Open Traceability View',
    },
    {
      id: 'DASHBOARD' as ViewTab,
      title: 'Manufacturing Operations Dashboard',
      badge: 'Analytics',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: LayoutDashboard,
      description: 'Live KPI summary cards, Recharts daily receipt/consumption trend bars, status distribution donut chart, and clickable material consignment queue.',
      features: ['3 Top KPI Status Blocks', 'Receipt vs Issue Bar Chart', 'Status Distribution Donut', 'Active Consignment Table'],
      action: () => onNavigateTab('DASHBOARD'),
      actionLabel: 'Open Dashboard View',
    },
    {
      id: 'REQUESTS' as ViewTab,
      title: 'Material Requisitions Board',
      badge: 'Approvals Gateway',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: FileText,
      description: 'Departmental demand board for production engineers and department managers to create, review, approve, or reject material allocations.',
      features: ['Filter by Pending/Approved/Rejected', 'Manager Single-Click Approval', 'Shopfloor Station Assignment', 'Live Search by Dept/PO'],
      action: () => onNavigateTab('REQUESTS'),
      actionLabel: 'Open Requisitions View',
    },
    {
      id: 'AUDIT_LOG' as ViewTab,
      title: 'Plant Traceability Audit Ledger',
      badge: 'Immutable Compliance',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: History,
      description: 'Immutable record of every physical and logical state transition across all raw material batches with operator names, role claims, and remarks.',
      features: ['Cryptographic Event Log', 'Previous vs New Status Diff', 'Stage Filtering', '1-Click CSV Export'],
      action: () => onNavigateTab('AUDIT_LOG'),
      actionLabel: 'Open Audit Ledger',
    },
    {
      id: 'ADMIN' as ViewTab,
      title: 'Plant Users & RBAC Matrix',
      badge: 'Security & SSO',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Users,
      description: 'Multi-persona user switcher for simulating all 7 factory roles alongside a comprehensive server-enforced permissions matrix.',
      features: ['7 Switchable Personas', 'Visual Permissions Matrix', 'Role Claim Validation', 'Department Assignment'],
      action: () => onNavigateTab('ADMIN'),
      actionLabel: 'Open Users & RBAC View',
    },
  ];

  const modalWorkflows = [
    {
      id: 'STAGE_1',
      title: 'Stage 1: Gate Inward Entry Modal',
      badge: 'Inward Stage',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Truck,
      description: 'Form to register incoming raw materials at the factory security gate (PO, RM code, vehicle, supplier, inward qty) and generate a unique QR code.',
      trigger: onOpenGateEntry,
      triggerLabel: 'Preview Gate Entry Modal',
    },
    {
      id: 'STAGE_2',
      title: 'Stage 2: Quality Inspection Modal',
      badge: 'QA Stage',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: ClipboardCheck,
      description: 'Quality testing form featuring checklists (Visual, Lab Test Report, Moisture, CoA) and sign-off decisions: Accepted, Rejected (Quarantine), or Hold.',
      trigger: onOpenInspection,
      triggerLabel: 'Preview Inspection Modal',
    },
    {
      id: 'STAGE_3',
      title: 'Stage 3: Goods Receipt Note (GRN) Modal',
      badge: 'Warehouse Inward',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: FileCheck,
      description: 'Warehouse stock inwarding dialog: verifies accepted vs rejected quantities, stamps batch/lot number, and assigns storage bin/bay location.',
      trigger: onOpenGRN,
      triggerLabel: 'Preview GRN Modal',
    },
    {
      id: 'STAGE_4',
      title: 'Stage 4: Material Requisition Modal',
      badge: 'Production Demand',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: FileText,
      description: 'Shopfloor request form with real-time stock balance validation (blocks requests exceeding available warehouse inventory) and station routing.',
      trigger: onOpenRequest,
      triggerLabel: 'Preview Requisition Modal',
    },
    {
      id: 'STAGE_5',
      title: 'Stage 5: Material Issue to Shopfloor Modal',
      badge: 'Custody Handover',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ArrowUpRight,
      description: 'Store dispatch dialog: deducts available warehouse inventory balance and transfers physical custody to the shopfloor supervisor with timestamp.',
      trigger: onOpenIssue,
      triggerLabel: 'Preview Issue Modal',
    },
    {
      id: 'QR_TAG',
      title: 'Printable Industrial QR Tag Thermal Slip',
      badge: 'Hardware Label',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: Printer,
      description: 'Standard 4x3 industrial thermal label layout with vector SVG QR code, material details, PO number, batch lot, and one-click print/download.',
      trigger: onOpenQRLabel,
      triggerLabel: 'Preview Printable QR Tag',
    },
    {
      id: 'QR_SCANNER',
      title: 'Mobile Camera QR Scanner & Lookup',
      badge: 'Camera Scanner',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: QrCode,
      description: 'Mobile-friendly camera viewfinder with camera flip, file image barcode decoder, manual transaction ID lookup, and quick test presets.',
      trigger: onOpenScanner,
      triggerLabel: 'Preview Camera Scanner',
    },
    {
      id: 'CONFIRM_MODAL',
      title: 'Safety Double-Confirmation Guardrail',
      badge: 'Approval Security',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: ShieldAlert,
      description: 'Standardized approval popup showing state transition diff (Previous Status -> New Status), acting operator credentials, and double-confirmation.',
      trigger: onOpenConfirmSample,
      triggerLabel: 'Preview Confirmation Dialog',
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0F172A] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Application Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Raw Material Traceability — Complete Screen Directory
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Preview, explore, and launch every full-screen view and stage modal dialog in the application. Click any screen card below to open it live in the preview.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Screens ({mainViews.length + modalWorkflows.length})
            </button>
            <button
              onClick={() => setActiveCategory('VIEWS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'VIEWS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Full-Screen Views ({mainViews.length})
            </button>
            <button
              onClick={() => setActiveCategory('MODALS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === 'MODALS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Interactive Modals ({modalWorkflows.length})
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
      </div>

      {/* Section 1: Full-Screen Views */}
      {(activeCategory === 'ALL' || activeCategory === 'VIEWS') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-lg">Primary Application Views</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">5 Full-Screen Views</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mainViews.map((view) => {
              const Icon = view.icon;
              return (
                <div
                  key={view.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${view.badgeColor}`}>
                        {view.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1.5">{view.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4">{view.description}</p>

                    <div className="space-y-1.5 mb-4">
                      {view.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={view.action}
                    className="w-full bg-slate-900 hover:bg-blue-600 active:scale-95 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{view.actionLabel}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2: Interactive Stage Modals */}
      {(activeCategory === 'ALL' || activeCategory === 'MODALS') && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-lg">Interactive Workflow Modals & Hardware Labels</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">8 Interactive Dialogs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modalWorkflows.map((modal) => {
              const Icon = modal.icon;
              return (
                <div
                  key={modal.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${modal.badgeColor}`}>
                        {modal.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mb-1">{modal.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-snug mb-3">{modal.description}</p>
                  </div>

                  <button
                    onClick={modal.trigger}
                    className="w-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-transparent py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>{modal.triggerLabel}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 3: 6-Stage Manufacturing Workflow Stepper */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Physical Manufacturing Lifecycle Flow</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">QR-Driven Stage Progression</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: '1. Gate Entry', desc: 'Inward & QR Stamping', action: onOpenGateEntry },
            { step: '2. Inspection', desc: 'QA Spec Verification', action: onOpenInspection },
            { step: '3. GRN Inward', desc: 'Stock Racking & Bin', action: onOpenGRN },
            { step: '4. Requisition', desc: 'Shopfloor Demand', action: onOpenRequest },
            { step: '5. Store Issue', desc: 'Custody Handover', action: onOpenIssue },
            { step: '6. Shopfloor', desc: 'Active Production', action: () => onNavigateTab('TRACEABILITY') },
          ].map((s, idx) => (
            <div
              key={idx}
              onClick={s.action}
              className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-3 rounded-xl cursor-pointer transition-all text-center group"
            >
              <span className="text-[10px] font-extrabold text-blue-600 uppercase block mb-1">
                {s.step}
              </span>
              <p className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-900">{s.desc}</p>
              <span className="text-[10px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-1 block">
                Launch Stage ↗
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
