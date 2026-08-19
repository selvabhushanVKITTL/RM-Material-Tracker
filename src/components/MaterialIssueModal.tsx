import React, { useState } from 'react';
import { X, ArrowUpRight, CheckCircle2, Factory, PackageCheck, AlertCircle, MapPin } from 'lucide-react';
import { MaterialTransaction, User, MaterialIssueRecord, MaterialRequestRecord } from '../types';

interface MaterialIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialTransaction | null;
  currentUser: User;
  onSubmit: (issue: MaterialIssueRecord) => void;
}

export const MaterialIssueModal: React.FC<MaterialIssueModalProps> = ({
  isOpen,
  onClose,
  material,
  currentUser,
  onSubmit,
}) => {
  if (!isOpen || !material) return null;

  // Find the latest approved request
  const approvedReq = material.requests?.find((r) => r.status === 'APPROVED') || material.requests?.[0];
  const targetReqNo = approvedReq?.requestNumber || `REQ-2026-0089`;
  const defaultIssueQty = approvedReq?.requestedQuantity || Math.min(material.availableQuantity, 200);

  const [issueQty, setIssueQty] = useState<number>(defaultIssueQty);
  const [receiver, setReceiver] = useState(approvedReq?.requestedBy || 'J. Das (Shopfloor Supervisor)');
  const [shopfloor, setShopfloor] = useState(approvedReq?.shopfloor || 'Assembly Line 1 - Station 3');
  const [storageLocation, setStorageLocation] = useState(material.storageLocation || 'Warehouse Bay-A4');
  const [remarks, setRemarks] = useState('Physical handover verified with shopfloor custody acknowledgement.');
  const [error, setError] = useState<string | null>(null);

  const available = material.availableQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (issueQty <= 0) {
      setError('Issue quantity must be greater than zero.');
      return;
    }

    if (issueQty > available) {
      setError(
        `Issue Quantity (${issueQty} ${material.uom}) exceeds available warehouse balance (${available} ${material.uom}).`
      );
      return;
    }

    if (!receiver.trim() || !shopfloor.trim()) {
      setError('Please provide receiver name and shopfloor cell destination.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newIssue: MaterialIssueRecord = {
      id: `ISS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      materialId: material.id,
      requestId: approvedReq?.id || targetReqNo,
      requestNumber: targetReqNo,
      issueQuantity: issueQty,
      uom: material.uom,
      issuedBy: currentUser.name,
      receiver: receiver.trim(),
      shopfloor: shopfloor.trim(),
      storageLocation: storageLocation.trim(),
      issueDate: formattedDate,
      remarks: remarks.trim(),
    };

    onSubmit(newIssue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Stage 5 — Material Issue to Shopfloor</h3>
              <p className="text-[11px] text-slate-400">Deduct inventory balance & transfer material custody</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Material & Request Link Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID & PO</span>
              <span className="font-mono font-bold text-blue-700">{material.id}</span>
              <p className="text-slate-600 font-mono text-[11px]">{material.poNumber}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Material</span>
              <p className="font-bold text-slate-900 truncate">{material.materialName}</p>
              <span className="font-mono text-slate-500 text-[10px]">{material.rmCode}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Stock</span>
              <p className="font-extrabold text-blue-600 text-sm">
                {available.toLocaleString()} {material.uom}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requisition #</span>
              <p className="font-mono font-bold text-slate-900">{targetReqNo}</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Issue Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Issue Quantity ({material.uom}) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-blue-600 font-bold">Max: {available} {material.uom}</span>
              </div>
              <input
                type="number"
                required
                min="1"
                max={available}
                step="any"
                value={issueQty}
                onChange={(e) => setIssueQty(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Storage Location */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Dispatched From Bin / Bay <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Receiver Name */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Shopfloor Receiver Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="e.g. J. Das (Shopfloor Supervisor)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Shopfloor Destination */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Shopfloor Destination Cell / Station <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shopfloor}
                onChange={(e) => setShopfloor(e.target.value)}
                placeholder="e.g. Assembly Line 1 - Station 3"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Issued By */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Issued By (Store Officer)
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.roleTitle})`}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600"
              />
            </div>

            {/* Remaining Balance Preview */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Post-Issue Remaining Stock Balance
              </label>
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 flex items-center justify-between">
                <span>Remaining:</span>
                <span className="text-emerald-700">
                  {Math.max(0, available - (issueQty || 0)).toLocaleString()} {material.uom}
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Issue Handover Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Handed over with physical delivery challan signed..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={issueQty > available || issueQty <= 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none active:scale-95 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all cursor-pointer"
            >
              <Factory className="w-4 h-4" />
              Confirm Issue & Deliver to Shopfloor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
