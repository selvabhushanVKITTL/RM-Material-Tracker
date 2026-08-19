import React from 'react';
import { MaterialTransaction, User, UserRole } from '../types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Clock, 
  Truck, 
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getAvailableActions, STATUS_CONFIG } from '../services/stateMachine';

interface DashboardViewProps {
  materials: MaterialTransaction[];
  currentUser: User;
  onSelectMaterial: (m: MaterialTransaction) => void;
  onOpenScanner: () => void;
  onOpenGateEntry: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  materials,
  currentUser,
  onSelectMaterial,
  onOpenScanner,
  onOpenGateEntry,
}) => {
  // Aggregate KPIs
  const totalReceived = materials.reduce((acc, m) => acc + m.originalQuantity, 0);
  const totalIssued = materials.reduce((acc, m) => acc + m.issuedQuantity, 0);
  const rejectedCount = materials.filter((m) => m.currentStatus === 'INSPECTION_REJECTED').length;
  const holdCount = materials.filter((m) => m.currentStatus === 'INSPECTION_ON_HOLD').length;
  
  // Pending actions items requiring attention
  const actionableItems = materials.filter((m) => {
    const assessment = getAvailableActions(m, currentUser.role);
    return assessment.allowedAction !== null;
  });

  const pendingCount = materials.filter((m) => 
    m.currentStatus === 'GATE_ENTRY_COMPLETED' || 
    m.currentStatus === 'INSPECTION_PENDING' || 
    m.currentStatus === 'INSPECTION_COMPLETED' || 
    m.currentStatus === 'MATERIAL_REQUEST_PENDING' ||
    m.currentStatus === 'MATERIAL_REQUEST_APPROVED'
  ).length;

  // Pie chart data by status category
  const statusCounts: Record<string, number> = {};
  materials.forEach((m) => {
    const label = STATUS_CONFIG[m.currentStatus]?.label || m.currentStatus;
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  });

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Bar chart daily receipt mock
  const receiptTrendData = [
    { day: '15-Aug', receipts: 1200, issues: 800 },
    { day: '16-Aug', receipts: 2500, issues: 1500 },
    { day: '17-Aug', receipts: 4000, issues: 2100 },
    { day: '18-Aug', receipts: 3300, issues: 1900 },
    { day: '19-Aug', receipts: 3900, issues: 2400 },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 space-y-8">
      {/* Title & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manufacturing Operations Dashboard</h2>
          <p className="text-slate-500 text-sm">
            Live Raw Material Traceability & Stage Progression Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold text-xs shadow-lg shadow-blue-200 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Scan Material QR
          </button>
          {(currentUser.role === 'GATE_USER' || currentUser.role === 'ADMIN') && (
            <button
              onClick={onOpenGateEntry}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              + Inward Gate Entry
            </button>
          )}
        </div>
      </div>

      {/* Top 3 KPI Cards (Matching Design HTML) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
              Pending Next Stage
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Requires human verification / approval</p>
        </div>

        {/* Issued to Shopfloor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
              Issued to Shopfloor
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {(totalIssued / 1000).toFixed(1)}{' '}
            <span className="text-sm text-slate-400 font-normal">MT</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Active in manufacturing lines</p>
        </div>

        {/* QA Rejections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
              Quarantined / Rejected
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-800">0{rejectedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Non-conforming items locked from workflow</p>
        </div>
      </div>

      {/* Recharts Data Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Inward vs Consumption Trend */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Material Receipt vs Consumption Trend</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit: KG</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receiptTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="receipts" name="Gate Receipts (KG)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="issues" name="Shopfloor Issues (KG)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Material Status Distribution</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {materials.length} Active Batches
            </span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Work Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Raw Material Lifecycle Queue</h3>
            <p className="text-slate-500 text-xs">All active consignments tracked in the manufacturing plant</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
            Current User: {currentUser.roleTitle}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">RM Code & Name</th>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Inward / Avail Qty</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {materials.map((m) => {
                const statusMeta = STATUS_CONFIG[m.currentStatus];
                const assessment = getAvailableActions(m, currentUser.role);

                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMaterial(m)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {m.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 truncate max-w-xs">{m.materialName}</p>
                      <span className="font-mono text-slate-500 text-[10px]">{m.rmCode}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {m.poNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                      {m.supplierName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{m.availableQuantity.toLocaleString()}</span>
                      <span className="text-slate-400"> / {m.originalQuantity.toLocaleString()} {m.uom}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${statusMeta?.badgeBg || 'bg-slate-100'} ${statusMeta?.badgeText || 'text-slate-800'} ${statusMeta?.badgeBorder || 'border-slate-200'}`}
                      >
                        {statusMeta?.label || m.currentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMaterial(m);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                      >
                        <span>View Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
