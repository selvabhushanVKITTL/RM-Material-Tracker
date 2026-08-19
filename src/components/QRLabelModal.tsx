import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Building2, 
  Truck, 
  Calendar,
  CheckCircle
} from 'lucide-react';
import { MaterialTransaction } from '../types';

interface QRLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: MaterialTransaction | null;
}

export const QRLabelModal: React.FC<QRLabelModalProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !material) return null;

  // The payload contains the unique material transaction id and secure verification token
  const qrPayload = `RMQR:${material.id}:${material.qrToken}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base tracking-tight">Material QR Traceability Tag</h3>
              <p className="text-[11px] text-slate-400">Physical Tag • Attach to Container / Pallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Tag Container */}
        <div className="p-6 overflow-y-auto flex flex-col items-center bg-slate-100">
          <div
            ref={printRef}
            id="printable-material-tag"
            className="w-full bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm text-slate-900 relative"
          >
            {/* Tag Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  RAW MATERIAL INWARD TAG
                </span>
                <h4 className="text-xl font-extrabold tracking-tight font-mono text-slate-950 mt-1">
                  {material.id}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Plant ID</span>
                <span className="text-xs font-black text-slate-800">PLANT-UNIT-01</span>
              </div>
            </div>

            {/* QR Code & Key Parameters */}
            <div className="grid grid-cols-12 gap-3 py-4 items-center">
              {/* QR Code Graphic */}
              <div className="col-span-5 flex flex-col items-center justify-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                <QRCodeSVG
                  value={qrPayload}
                  size={120}
                  level="M"
                  includeMargin={false}
                  className="w-full h-auto max-w-[120px]"
                />
                <p className="text-[9px] font-mono font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                  SCAN TO TRACE
                </p>
              </div>

              {/* Specification Grid */}
              <div className="col-span-7 space-y-2 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider leading-none">
                    RM Code & Name
                  </span>
                  <p className="font-bold text-slate-900 text-xs leading-snug">
                    <span className="text-blue-700 font-mono">{material.rmCode}</span>
                    <br />
                    <span className="text-slate-700 font-medium text-[11px]">{material.materialName}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider leading-none">
                      Quantity
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {material.originalQuantity.toLocaleString()} {material.uom}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider leading-none">
                      PO Number
                    </span>
                    <p className="font-bold font-mono text-slate-800 text-xs">{material.poNumber}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider leading-none">
                    Supplier
                  </span>
                  <p className="font-semibold text-slate-800 text-[11px] truncate">{material.supplierName}</p>
                </div>
              </div>
            </div>

            {/* Tag Footer */}
            <div className="border-t-2 border-slate-900 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-slate-400" />
                <span>{material.vehicleNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{material.gateEntryDateTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Industrial Tag
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
