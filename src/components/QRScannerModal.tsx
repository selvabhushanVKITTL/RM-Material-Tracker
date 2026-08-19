import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  AlertTriangle, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Flashlight,
  Sparkles,
  Layers
} from 'lucide-react';
import { MaterialTransaction } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  materials: MaterialTransaction[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  materials,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [matchedMaterial, setMatchedMaterial] = useState<MaterialTransaction | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setMatchedMaterial(null);
      setManualCode('');
      setCameraError(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setCameraError(null);
      setIsScanning(true);

      // Brief delay to ensure DOM element is painted
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!isMounted) return;

      try {
        const html5QrCode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleCodeFound(decodedText);
          },
          () => {
            // Frame analysis ongoing, no QR in view
          }
        );
      } catch (err: any) {
        console.warn('Camera start issue:', err);
        if (isMounted) {
          setCameraError(
            err?.message ||
              'Unable to access camera. Please ensure camera permissions are granted or use the manual ID lookup below.'
          );
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleCodeFound = (code: string) => {
    // Parse decoded text (could be MAT-2026-000001, token, or URL like https://.../material/MAT-2026-000001)
    let extractedId = code.trim();
    if (extractedId.includes('/material/')) {
      extractedId = extractedId.split('/material/')[1]?.split('?')[0] || extractedId;
    } else if (extractedId.startsWith('RMQR:')) {
      extractedId = extractedId.split(':')[1] || extractedId;
    }

    // Find material in database
    const found = materials.find(
      (m) =>
        m.id.toLowerCase() === extractedId.toLowerCase() ||
        m.qrToken === extractedId ||
        m.poNumber.toLowerCase() === extractedId.toLowerCase() ||
        m.rmCode.toLowerCase() === extractedId.toLowerCase()
    );

    if (found) {
      setMatchedMaterial(found);
      stopScanner();
      setTimeout(() => {
        onScanSuccess(found.id);
      }, 500);
    } else {
      // Still pass to parent for not found handler
      onScanSuccess(extractedId);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeFound(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0F172A] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base tracking-tight">Scan Material QR Code</h3>
              <p className="text-[11px] text-slate-400">Rear Camera Active • Point at printed material label</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Camera Viewport */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden min-h-[260px] flex items-center justify-center border border-slate-800 shadow-inner">
            <div id={scannerContainerId} className="w-full h-full" />

            {/* Visual Viewfinder Overlay */}
            {isScanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-56 h-56 border-2 border-blue-400/70 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
                  {/* Corner Reticles */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                  
                  {/* Animated Laser Scanning Line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-blue-400 shadow-[0_0_12px_#60a5fa] animate-bounce top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-white text-xs font-semibold mt-4 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                  Align QR Code inside square
                </p>
              </div>
            )}

            {/* Success Match Flash */}
            {matchedMaterial && (
              <div className="absolute inset-0 bg-emerald-950/90 text-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-2 animate-bounce" />
                <h4 className="text-lg font-bold text-emerald-200">Material Verified</h4>
                <p className="text-sm font-semibold text-white mt-1">{matchedMaterial.id}</p>
                <p className="text-xs text-emerald-300 mt-0.5">{matchedMaterial.materialName}</p>
                <span className="mt-3 px-3 py-1 bg-emerald-800/80 border border-emerald-600 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  Status: {matchedMaterial.currentStatus.replace(/_/g, ' ')}
                </span>
              </div>
            )}

            {/* Camera Error / Permission Fallback */}
            {cameraError && (
              <div className="p-6 text-center text-slate-300 flex flex-col items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-sm font-bold text-white">Camera Access Notice</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  {cameraError}
                </p>
                <button
                  onClick={() => {
                    setCameraError(null);
                    setIsScanning(true);
                  }}
                  className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Camera Connection
                </button>
              </div>
            )}
          </div>

          {/* Manual ID Search Fallback (Crucial for Learning & Desktop) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Manual Token / ID Search</span>
              </label>
              <span className="text-[10px] text-slate-400">Or pick from demo batch below</span>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter MAT-2026-000001 or RM code..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                Lookup
              </button>
            </form>

            {/* Quick Demo Tag Selectors */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Simulate Scanning Demo Materials:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {materials.slice(0, 5).map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => handleCodeFound(mat.id)}
                    className="text-[11px] bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-blue-600 font-bold">{mat.id}</span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[90px]">({mat.rmCode})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-slate-500 text-xs">
          <span className="text-[11px]">Webcam / Android / iOS WebRTC standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
