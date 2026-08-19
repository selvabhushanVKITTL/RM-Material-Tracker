import React, { useState } from 'react';
import { MaterialTransaction, User, MaterialRequestRecord } from '../types';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Search, 
  ArrowRight, 
  Plus, 
  ShieldCheck,
  QrCode
} from 'lucide-react';

interface RequestsViewProps {
  materials: MaterialTransaction[];
  currentUser: User;
  onApproveRequest: (material: MaterialTransaction, request: MaterialRequestRecord) => void;
  onRejectRequest: (material: MaterialTransaction, request: MaterialRequestRecord) => void;
  onSelectMaterial: (m: MaterialTransaction) => void;
  onOpenScanner: () => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  materials,
  currentUser,
  onApproveRequest,
  onRejectRequest,
  onSelectMaterial,
  onOpenScanner,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');

  // Collect all requests across materials
  const allRequests: { material: MaterialTransaction; request: MaterialRequestRecord }[] = [];
  materials.forEach((m) => {
    if (m.requests) {
      m.requests.forEach((r) => {
        allRequests.push({ material: m, request: r });
      });
    }
  });

  const filtered = allRequests.filter(({ material, request }) => {
    if (filter !== 'ALL' && request.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        request.requestNumber.toLowerCase().includes(q) ||
        material.id.toLowerCase().includes(q) ||
        material.materialName.toLowerCase().includes(q) ||
        request.department.toLowerCase().includes(q) ||
        request.requestedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const canApprove = currentUser.role === 'REQUEST_APPROVER' || currentUser.role === 'ADMIN';

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Material Requisitions</h2>
          <p className="text-slate-500 text-sm">
            Shopfloor demand allocation & managerial approval gateway
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg shadow-blue-200 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Scan QR to Request
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filter === statusKey
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {statusKey}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search request #, dept, material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Requests Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No Requisitions Found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a material with GRN completed status to initiate a requisition.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Material ID & Name</th>
                  <th className="py-3 px-4">Department & Cell</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Qty & Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(({ material, request }) => {
                  const isPending = request.status === 'PENDING';
                  const isApproved = request.status === 'APPROVED';
                  const isRejected = request.status === 'REJECTED';

                  return (
                    <tr key={request.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {request.requestNumber}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectMaterial(material)}
                          className="text-blue-600 hover:text-blue-800 font-mono font-bold block text-left"
                        >
                          {material.id}
                        </button>
                        <p className="text-slate-800 font-semibold truncate max-w-xs">{material.materialName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{request.department}</p>
                        <span className="text-slate-500 text-[10px]">{request.shopfloor}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{request.requestedBy}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-blue-700 text-sm">
                          {request.requestedQuantity.toLocaleString()} {request.uom}
                        </span>
                        <p className="text-[10px] text-slate-400">Req: {request.requiredDate}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                            Pending Approval
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase">
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isPending ? (
                          canApprove ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onApproveRequest(material, request)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md font-bold text-xs shadow-sm cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onRejectRequest(material, request)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md font-bold text-xs cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Requires Approver Role
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] font-medium text-slate-500">
                            {request.approvedBy ? `Signed: ${request.approvedBy}` : 'Completed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
