import React, { useState } from 'react';
import { X, Truck, QrCode, Sparkles, Building, FileText, Hash, AlertCircle } from 'lucide-react';
import { MaterialTransaction, User } from '../types';

interface GateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newMaterial: MaterialTransaction) => void;
  currentUser: User;
  existingCount: number;
}

export const GateEntryModal: React.FC<GateEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  existingCount,
}) => {
  const [poNumber, setPoNumber] = useState('PO-2026-00');
  const [rmCode, setRmCode] = useState('RM-');
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [uom, setUom] = useState('KG');
  const [supplierName, setSupplierName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!poNumber.trim() || !rmCode.trim() || !materialName.trim() || !quantity || !supplierName.trim() || !vehicleNumber.trim()) {
      setError('Please fill in all mandatory gate entry fields.');
      return;
    }

    if (Number(quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    // Generate unique ID e.g. MAT-2026-000007
    const seq = (existingCount + 1).toString().padStart(6, '0');
    const newId = `MAT-2026-${seq}`;
    const token = `tok_mat_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newMaterial: MaterialTransaction = {
      id: newId,
      poNumber: poNumber.toUpperCase().trim(),
      rmCode: rmCode.toUpperCase().trim(),
      materialName: materialName.trim(),
      supplierName: supplierName.trim(),
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      originalQuantity: Number(quantity),
      availableQuantity: Number(quantity),
      issuedQuantity: 0,
      uom: uom,
      currentStatus: 'GATE_ENTRY_COMPLETED',
      gateEntryDateTime: formattedDate,
      gateRemarks: remarks.trim() || 'Passed inward weighbridge and physical seal check.',
      qrToken: token,
      createdBy: currentUser.name,
      inspections: [],
      grns: [],
      requests: [],
      issues: [],
    };

    onSubmit(newMaterial);
    onClose();
  };

  const handlePreloadSample = () => {
    setPoNumber('PO-2026-00210');
    setRmCode('RM-SS-SHEET-304');
    setMaterialName('Stainless Steel Sheet Grade 304 (2mm Cold Rolled)');
    setQuantity(2400);
    setUom('KG');
    setSupplierName('Jindal Stainless Global Ltd');
    setVehicleNumber('DL-01-AB-9921');
    setRemarks('Coils wrapped in plastic sheets. No transit damage visible.');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Stage 1 — Raw Material Gate Inward Entry</h3>
              <p className="text-[11px] text-slate-400">Log vehicle, PO and generate unique QR traceability token</p>
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
          {/* Quick Preload Sample Bar */}
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs">
            <span className="text-blue-800 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Testing Gate Inward Flow?
            </span>
            <button
              type="button"
              onClick={handlePreloadSample}
              className="text-xs bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 font-bold px-3 py-1 rounded-md shadow-sm transition-colors cursor-pointer"
            >
              Fill Sample Consignment Data
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PO Number */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                PO Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO-2026-00125"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* RM Code */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Raw Material Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={rmCode}
                onChange={(e) => setRmCode(e.target.value)}
                placeholder="e.g. RM-CRGO-001"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Material Name */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Material Description / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g. CRGO Electrical Steel (0.27mm Core Grade)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Received Inward Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 1000"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* UOM */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Unit of Measure (UOM) <span className="text-rose-500">*</span>
              </label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="KG">KG (Kilograms)</option>
                <option value="MT">MT (Metric Tonnes)</option>
                <option value="MTR">MTR (Meters)</option>
                <option value="PCS">PCS (Pieces)</option>
                <option value="LTR">LTR (Liters)</option>
                <option value="BOX">BOX (Boxes / Cartons)</option>
              </select>
            </div>

            {/* Supplier Name */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Supplier / Vendor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. ABC Steel Industries Ltd"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Vehicle / Truck Reg Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. TN-38-AB-1234"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 uppercase font-mono"
              />
            </div>

            {/* Gate Remarks */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Gate Entry Remarks / Weighbridge Note
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any special packing conditions, seal numbers, or delivery challan notes..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              Recorded by: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.roleTitle})
            </span>
            <span className="font-mono text-slate-500">Auto-ID Sequence: MAT-2026-XXXXXX</span>
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
              <QrCode className="w-4 h-4" />
              Submit Gate Inward & Generate QR Tag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
