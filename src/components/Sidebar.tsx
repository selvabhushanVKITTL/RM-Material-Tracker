import React from 'react';
import { ViewTab, UserRole } from '../types';
import {
  LayoutDashboard,
  Layers,
  Truck,
  FileText,
  QrCode,
  History,
  Users,
  ShieldCheck,
  Eye
} from 'lucide-react';

interface SidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenScanner: () => void;
  onOpenGateEntry: () => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenScanner,
  onOpenGateEntry,
  userRole,
}) => {
  const navItems = [
    {
      id: 'DASHBOARD' as ViewTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      action: () => onTabChange('DASHBOARD'),
    },
    {
      id: 'TRACEABILITY' as ViewTab,
      label: 'Material Traceability',
      icon: Layers,
      action: () => onTabChange('TRACEABILITY'),
    },
    {
      id: 'GATE_ENTRY' as ViewTab,
      label: 'Gate Inward Entry',
      icon: Truck,
      action: onOpenGateEntry,
      highlight: userRole === 'GATE_USER' || userRole === 'ADMIN',
    },
    {
      id: 'REQUESTS' as ViewTab,
      label: 'Material Requests',
      icon: FileText,
      action: () => onTabChange('REQUESTS'),
    },
    {
      id: 'AUDIT_LOG' as ViewTab,
      label: 'Audit Trail Ledger',
      icon: History,
      action: () => onTabChange('AUDIT_LOG'),
    },
    {
      id: 'ADMIN' as ViewTab,
      label: 'Roles & Plant Admin',
      icon: Users,
      action: () => onTabChange('ADMIN'),
    },
    {
      id: 'SHOWCASE' as ViewTab,
      label: 'All Screens Showcase',
      icon: Eye,
      action: () => onTabChange('SHOWCASE'),
    },
  ];

  return (
    <aside className="w-16 sm:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 shrink-0 select-none z-20">
      {/* Primary Scanner Quick Icon */}
      <button
        onClick={onOpenScanner}
        title="Scan QR Code with Camera"
        className="w-11 h-11 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 transition-all cursor-pointer group relative"
      >
        <QrCode className="w-5 h-5" />
        <span className="sr-only">Scan QR</span>
        {/* Tooltip */}
        <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          Scan QR (Camera)
        </span>
      </button>

      <div className="w-8 h-px bg-slate-200" />

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center gap-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100 font-bold'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Role Indicator */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <div 
          title={`Active Role: ${userRole}`}
          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-semibold cursor-help"
        >
          <ShieldCheck className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </aside>
  );
};
