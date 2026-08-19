import React, { useState } from 'react';
import { AuditLogEntry, Stage } from '../types';
import { History, Search, Download, ShieldCheck, Filter, ArrowRight } from 'lucide-react';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
  onSelectMaterialById: (id: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  onSelectMaterialById,
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const filtered = auditLogs.filter((log) => {
    if (stageFilter !== 'ALL' && log.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.materialId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.userRole.toLowerCase().includes(q) ||
        (log.remarks && log.remarks.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'Material ID', 'Stage', 'Action', 'User', 'Role', 'Previous Status', 'New Status', 'Remarks'];
    const rows = filtered.map((l) => [
      `"${l.timestamp}"`,
      `"${l.materialId}"`,
      `"${l.stage}"`,
      `"${l.action}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.previousStatus}"`,
      `"${l.newStatus}"`,
      `"${l.remarks || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `material_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Plant Traceability Audit Ledger</h2>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase tracking-wider">
              Immutable
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Complete cryptographic audit trail of all raw material transitions & operator approvals
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit Ledger (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'GATE_ENTRY', 'INSPECTION', 'GRN', 'MATERIAL_REQUEST', 'MATERIAL_ISSUE'].map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                stageFilter === s
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search material ID, actor, remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Material ID</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Authenticated User</th>
                <th className="py-3 px-4">Remarks & Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    <button
                      onClick={() => onSelectMaterialById(log.materialId)}
                      className="hover:underline cursor-pointer"
                    >
                      {log.materialId}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                    {log.stage.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {log.previousStatus.replace(/_/g, ' ')}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono font-bold">
                        {log.newStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-bold text-slate-900">{log.userName}</p>
                    <span className="text-[10px] text-blue-600 font-medium">{log.userRole}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-sm">
                    {log.remarks || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
