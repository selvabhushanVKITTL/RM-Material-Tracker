import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { WorkflowStatus } from '../types';

interface ActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  actorName: string;
  actorRole: string;
  previousStatus: WorkflowStatus | string;
  newStatus: WorkflowStatus | string;
  materialId: string;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  variant = 'primary',
  actorName,
  actorRole,
  previousStatus,
  newStatus,
  materialId,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <XCircle className="w-6 h-6 text-rose-600" />,
          button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
          badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
          button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
          badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
          badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        };
      default:
        return {
          icon: <ShieldAlert className="w-6 h-6 text-blue-600" />,
          button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
          badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            {styles.icon}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
              Material: {materialId}
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Transition Preview Card */}
        <div className="mx-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workflow Status Transition:
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-semibold truncate max-w-[150px]">
              {previousStatus.replace(/_/g, ' ')}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold truncate max-w-[150px]">
              {newStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="text-slate-400">Authenticated Actor:</span>
            <span className="font-bold text-slate-800">
              {actorName} <span className="text-slate-400 font-normal">({actorRole})</span>
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer ${styles.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
