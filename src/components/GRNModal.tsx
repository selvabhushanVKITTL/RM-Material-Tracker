import React, { useState } from 'react';
import { X, FileCheck, Package, MapPin, Hash, AlertCircle, ShieldCheck } from 'lucide-react';
import { MaterialTransaction, User, GRNRecord } from '../types';

interface GRNModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialTransaction | null;
  currentUser: User;
  onSubmit: (grn: GRNRecord) => void;
}

export const GRNModal: React.FC<GRNModalProps> = ({
  isOpen,
  onClose,
  material,
  currentUser,
  onSubmit,
}) => {
  if (!isOpen || !material) return null;

  const defaultGrnNo = `GRN-${material.poNumber.replace('PO-', '')}`;
  const [grnNumber, setGrnNumber] = useState(defaultGrnNo);
  const [acceptedQty, setAcceptedQty] = useState<number>(material.originalQuantity);
  const [rejectedQty, setRejectedQty] = useState<number>(0);
  const [storageLocation, setStorageLocation] = useState('Warehouse Bay-A4, Rack 2');
  const [batchNumber, setBatchNumber] = useState(`LOT-${material.rmCode.replace('RM-', '')}-2608`);
  const [remarks, setRemarks] = useState('Goods verified against PO specification and placed in primary storage.');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!grnNumber.trim() || !storageLocation.trim() || !batchNumber.trim()) {
      setError('Please fill in all mandatory GRN fields.');
      return;
    }

    if (acceptedQty < 0 || rejectedQty < 0) {
      setError('Quantities cannot be negative.');
      return;
    }

    if (acceptedQty + rejectedQty !== material.originalQuantity) {
      setError(
        `Quantity mismatch: Accepted (${acceptedQty}) + Rejected (${rejectedQty}) must equal total inward quantity (${material.originalQuantity} ${material.uom}).`
      );
      return;
    }

    if (acceptedQty <= 0) {
      setError('Accepted quantity must be greater than zero to complete GRN into inventory.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newGRN: GRNRecord = {
      id: grnNumber.trim(),
      materialId: material.id,
      grnNumber: grnNumber.trim(),
      acceptedQuantity: acceptedQty,
      rejectedQuantity: rejectedQty,
      storageLocation: storageLocation.trim(),
      batchLotNumber: batchNumber.trim(),
      grnDate: formattedDate,
      createdBy: currentUser.name,
      remarks: remarks.trim(),
    };

    onSubmit(newGRN);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Stage 3 — Goods Receipt Note (GRN) Creation</h3>
              <p className="text-[11px] text-slate-400">Stock inwarding, bin location assignment & batch tracking</p>
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
          {/* Material Header Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID & PO</span>
              <span className="font-mono font-bold text-blue-700">{material.id}</span>
              <p className="text-slate-600 font-mono text-[11px]">{material.poNumber}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Material</span>
              <p className="font-bold text-slate-900 truncate">{material.materialName}</p>
              <span className="font-mono text-slate-500 text-[10px]">{material.rmCode}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Received Qty</span>
              <p className="font-extrabold text-slate-900">{material.originalQuantity.toLocaleString()} {material.uom}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">QA Status</span>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                QA Approved
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GRN Number */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                GRN Reference Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={grnNumber}
                onChange={(e) => setGrnNumber(e.target.value)}
                placeholder="e.g. GRN-2026-00125"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Batch / Lot Number */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Batch / Lot Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. LOT-CRGO-2608-01"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Accepted Qty */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Accepted Inward Quantity ({material.uom}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={acceptedQty}
                onChange={(e) => setAcceptedQty(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Rejected Qty */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Rejected Inward Quantity ({material.uom})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={rejectedQty}
                onChange={(e) => setRejectedQty(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Storage Location */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Warehouse Storage Bin / Bay Location <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['Warehouse Bay-A4, Rack 2', 'Warehouse Bay-C2, Bin 14', 'Warehouse Yard-D, Stack 01'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setStorageLocation(loc)}
                    className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      storageLocation === loc
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{loc}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="Or type custom bin location..."
                className="w-full mt-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                GRN Processing Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Moisture control confirmed, weight tags verified..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve GRN & Authorize Inventory Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
