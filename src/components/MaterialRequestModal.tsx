import React, { useState } from 'react';
import { X, FileText, AlertCircle, Sparkles, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { MaterialTransaction, User, MaterialRequestRecord } from '../types';

interface MaterialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialTransaction | null;
  currentUser: User;
  onSubmit: (request: MaterialRequestRecord) => void;
}

export const MaterialRequestModal: React.FC<MaterialRequestModalProps> = ({
  isOpen,
  onClose,
  material,
  currentUser,
  onSubmit,
}) => {
  if (!isOpen || !material) return null;

  const defaultReqNo = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const [requestNumber, setRequestNumber] = useState(defaultReqNo);
  const [department, setDepartment] = useState(currentUser.department || 'Transformer Assembly Unit');
  const [shopfloor, setShopfloor] = useState('Assembly Line 1 - Station 3');
  const [requestedQty, setRequestedQty] = useState<number | ''>('');
  const [requiredDate, setRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('Primary production batch for Job Order #JO-');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  const available = material.availableQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requestedQty || Number(requestedQty) <= 0) {
      setError('Please specify a valid requested quantity greater than zero.');
      return;
    }

    if (Number(requestedQty) > available) {
      setError(
        `Insufficient Material Quantity! You requested ${requestedQty} ${material.uom}, but only ${available} ${material.uom} is currently available in warehouse stock.`
      );
      return;
    }

    if (!department.trim() || !shopfloor.trim() || !purpose.trim()) {
      setError('Please fill in all mandatory shopfloor requisition fields.');
      return;
    }

    const newRequest: MaterialRequestRecord = {
      id: requestNumber.trim(),
      materialId: material.id,
      requestNumber: requestNumber.trim(),
      department: department.trim(),
      shopfloor: shopfloor.trim(),
      requestedBy: currentUser.name,
      requestedQuantity: Number(requestedQty),
      uom: material.uom,
      requiredDate: requiredDate,
      purpose: purpose.trim(),
      remarks: remarks.trim() || undefined,
      status: 'PENDING',
    };

    onSubmit(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Stage 4 — Production Material Requisition</h3>
              <p className="text-[11px] text-slate-400">Request material allocation from verified warehouse stock</p>
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
          {/* Material Stock Balance Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Material ID</span>
              <span className="font-mono font-bold text-blue-700">{material.id}</span>
              <p className="text-slate-600 font-mono text-[11px]">{material.rmCode}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
              <p className="font-bold text-slate-900 truncate">{material.materialName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Stock</span>
              <p className="font-extrabold text-blue-600 text-sm">
                {available.toLocaleString()} {material.uom}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Storage Bin</span>
              <p className="font-semibold text-slate-700 truncate">{material.storageLocation || 'Warehouse Main'}</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Request Number */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Requisition Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={requestNumber}
                onChange={(e) => setRequestNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Requested Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Requested Qty ({material.uom}) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-blue-600 font-bold">Max: {available} {material.uom}</span>
              </div>
              <input
                type="number"
                required
                min="1"
                max={available}
                step="any"
                value={requestedQty}
                onChange={(e) => setRequestedQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`Enter quantity <= ${available}`}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
              {requestedQty && Number(requestedQty) > available && (
                <p className="text-[10px] text-rose-600 font-bold mt-1">
                  ⚠️ Exceeds available stock of {available} {material.uom}!
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Requesting Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Transformer Assembly Unit">Transformer Assembly Unit</option>
                <option value="Foundry & Die Casting">Foundry & Die Casting</option>
                <option value="Core Slitting & Stamping">Core Slitting & Stamping</option>
                <option value="HV Testing & Substation Lab">HV Testing & Substation Lab</option>
                <option value="Maintenance & Plant Engineering">Maintenance & Plant Engineering</option>
              </select>
            </div>

            {/* Shopfloor Destination */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Shopfloor Target Cell / Station <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shopfloor}
                onChange={(e) => setShopfloor(e.target.value)}
                placeholder="e.g. Winding Station 3, Assembly Line 1"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Required Date */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Required On Shopfloor By <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Requisitioner */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Requested By
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.roleTitle})`}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600"
              />
            </div>

            {/* Purpose */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Production Purpose / Job Order Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. High voltage coil winding for Job Order #JO-8821"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Additional Handling Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Forklift pallet transit required by 2:00 PM shift..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
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
              disabled={Number(requestedQty) > available || Number(requestedQty) <= 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none active:scale-95 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Submit Material Request for Manager Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
