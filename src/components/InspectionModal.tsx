import React, { useState } from 'react';
import { 
  X, 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Camera, 
  Upload, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { MaterialTransaction, User, InspectionRecord } from '../types';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialTransaction | null;
  currentUser: User;
  onSubmit: (inspection: InspectionRecord, result: 'ACCEPTED' | 'REJECTED' | 'HOLD') => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  isOpen,
  onClose,
  material,
  currentUser,
  onSubmit,
}) => {
  const [result, setResult] = useState<'ACCEPTED' | 'REJECTED' | 'HOLD'>('ACCEPTED');
  const [remarks, setRemarks] = useState('');
  const [inspectorName, setInspectorName] = useState(currentUser.name);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !material) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!remarks.trim()) {
      setError('Please provide inspection observations and test remarks.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newRecord: InspectionRecord = {
      id: `INSP-2026-${Math.floor(100 + Math.random() * 900)}`,
      materialId: material.id,
      result: result,
      inspectorName: inspectorName.trim() || currentUser.name,
      inspectorId: currentUser.id,
      inspectionDate: formattedDate,
      remarks: remarks.trim(),
      photoUrl: photoPreview || undefined,
    };

    onSubmit(newRecord, result);
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Stage 2 — Material Quality Inspection (QA)</h3>
              <p className="text-[11px] text-slate-400">Perform chemical, physical, and dimensional verification</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Material Summary Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID & RM Code</span>
              <span className="font-mono font-bold text-blue-700">{material.id}</span>
              <p className="text-slate-600 font-semibold truncate">{material.rmCode}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Material Name</span>
              <p className="font-bold text-slate-900 truncate">{material.materialName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inward Quantity</span>
              <p className="font-bold text-slate-900">{material.originalQuantity.toLocaleString()} {material.uom}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier</span>
              <p className="font-semibold text-slate-700 truncate">{material.supplierName}</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Decision Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-2">
              Inspection Quality Decision <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Accepted */}
              <button
                type="button"
                onClick={() => setResult('ACCEPTED')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  result === 'ACCEPTED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-6 h-6 ${result === 'ACCEPTED' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs">Pass & Accept</span>
                <span className="text-[10px] text-slate-400 font-normal">Moves to GRN</span>
              </button>

              {/* Hold */}
              <button
                type="button"
                onClick={() => setResult('HOLD')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  result === 'HOLD'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className={`w-6 h-6 ${result === 'HOLD' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-xs">Place on Hold</span>
                <span className="text-[10px] text-slate-400 font-normal">Lab re-test needed</span>
              </button>

              {/* Rejected */}
              <button
                type="button"
                onClick={() => setResult('REJECTED')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  result === 'REJECTED'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className={`w-6 h-6 ${result === 'REJECTED' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs">Reject & Quarantine</span>
                <span className="text-[10px] text-slate-400 font-normal">Return to Vendor</span>
              </button>
            </div>
          </div>

          {/* Inspector Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Inspector Name & Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Inspector Full Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Inspection Timestamp
              </label>
              <input
                type="text"
                disabled
                value="Auto-Recorded (Current UTC/Local)"
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500"
              />
            </div>
          </div>

          {/* Test Remarks */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Quality Test Remarks & Laboratory Findings <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Verified dimensional tolerance ±0.02mm, tensile strength tested at 450 MPa, surface finish clear..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Photo Attachment (Mock/File) */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
              Inspection Photo / Certificate of Analysis (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Upload Photo / Certificate</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                  <img src={photoPreview} alt="Inspection" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
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
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                result === 'ACCEPTED'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                  : result === 'HOLD'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              Sign Off & Approve QA Inspection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
