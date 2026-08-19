import React, { useState } from 'react';
import { User, ViewTab } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { 
  QrCode, 
  Search, 
  ChevronDown, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  Plus
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenScanner: () => void;
  onOpenGateEntry: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  activeTab,
  onTabChange,
  onOpenScanner,
  onOpenGateEntry,
  searchQuery,
  onSearchChange,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const tabs: { id: ViewTab; label: string }[] = [
    { id: 'TRACEABILITY', label: 'Traceability' },
    { id: 'DASHBOARD', label: 'Dashboard' },
    { id: 'REQUESTS', label: 'Requests' },
    { id: 'AUDIT_LOG', label: 'Audit Log' },
    { id: 'ADMIN', label: 'Users & Roles' },
    { id: 'SHOWCASE', label: 'All Screens' },
  ];

  return (
    <header className="h-16 bg-[#0F172A] flex items-center justify-between px-4 sm:px-6 border-b border-slate-700 shadow-md z-30 shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => onTabChange('DASHBOARD')}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-9 h-9 bg-blue-600 group-hover:bg-blue-500 transition-colors rounded-lg flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-md shadow-blue-900/50">
            RM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-white font-bold text-base sm:text-lg tracking-tight">
                TraceMaster <span className="text-blue-400 font-light italic text-sm sm:text-base">Pro</span>
              </h1>
              <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-widest">
                QR Lifecycle
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
              Manufacturing Raw Material Traceability
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links (Desktop) */}
      <nav className="hidden md:flex items-center gap-6">
        <div className="flex gap-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-2 transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Right Controls: Quick Search, QR Scan Button & Active Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Search */}
        <div className="relative hidden xl:block w-52">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search PO, RM, Lot..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/90 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Scan QR Button */}
        <button
          onClick={onOpenScanner}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-2 text-xs font-bold shadow-md shadow-blue-900/40 transition-all cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan QR</span>
        </button>

        {/* Gate User Quick Entry Button */}
        {(currentUser.role === 'GATE_USER' || currentUser.role === 'ADMIN') && (
          <button
            onClick={onOpenGateEntry}
            className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>New Gate Entry</span>
          </button>
        )}

        {/* Role Switcher (Simulated SSO) */}
        <div className="relative pl-2 sm:pl-4 border-l border-slate-700">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity cursor-pointer p-1 rounded-lg hover:bg-slate-800/60"
            title="Click to switch simulated plant user"
          >
            <div className="hidden sm:block text-right">
              <div className="flex items-center justify-end gap-1">
                <p className="text-white text-xs font-bold leading-tight">{currentUser.name}</p>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-blue-400 text-[10px] uppercase font-semibold tracking-wide leading-none mt-0.5">
                {currentUser.roleTitle}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/20">
              {currentUser.avatarInitials}
            </div>
          </button>

          {/* Role Dropdown */}
          {isRoleDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsRoleDropdownOpen(false)}
            >
              <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Switch Plant Role (SSO)</span>
                </div>
                <span className="text-[10px] text-blue-400 font-medium">Learning Mode</span>
              </div>
              <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-800">
                {INITIAL_USERS.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-blue-600/20 text-white' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-slate-700 text-slate-200'
                      }`}>
                        {user.avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold truncate text-white">{user.name}</p>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-blue-400 font-medium truncate">{user.roleTitle}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.department}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
