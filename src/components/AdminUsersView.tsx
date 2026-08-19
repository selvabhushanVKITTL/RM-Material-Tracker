import React from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { Users, ShieldCheck, Check, X, Shield, Sparkles } from 'lucide-react';

interface AdminUsersViewProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  currentUser,
  onSelectUser,
}) => {
  const permissionsMatrix = [
    {
      action: 'Create Gate Entry & Print QR',
      roles: ['GATE_USER', 'ADMIN'],
    },
    {
      action: 'Scan QR & Access Material Dossier',
      roles: ['GATE_USER', 'INSPECTOR', 'GRN_USER', 'MATERIAL_REQUEST_USER', 'REQUEST_APPROVER', 'STORE_USER', 'ADMIN'],
    },
    {
      action: 'Approve / Reject / Hold Inspection',
      roles: ['INSPECTOR', 'ADMIN'],
    },
    {
      action: 'Create GRN & Allocate Warehouse Bin',
      roles: ['GRN_USER', 'STORE_USER', 'ADMIN'],
    },
    {
      action: 'Create Production Material Request',
      roles: ['MATERIAL_REQUEST_USER', 'ADMIN'],
    },
    {
      action: 'Approve / Reject Material Requisitions',
      roles: ['REQUEST_APPROVER', 'ADMIN'],
    },
    {
      action: 'Issue Material & Deliver to Shopfloor',
      roles: ['STORE_USER', 'ADMIN'],
    },
    {
      action: 'Override Stages / Plant Audit Export',
      roles: ['ADMIN'],
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Plant Users & Role-Based Access (RBAC)</h2>
        <p className="text-slate-500 text-sm">
          Simulate multi-user factory operations by switching persona identities below
        </p>
      </div>

      {/* User Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_USERS.map((user) => {
          const isCurrent = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {user.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                    <p className="text-blue-600 text-xs font-semibold">{user.roleTitle}</p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <p>
                  <strong className="text-slate-700">Department:</strong> {user.department}
                </p>
                <p className="font-mono text-[11px]">
                  <strong className="text-slate-700">Role Claim:</strong> {user.role}
                </p>
              </div>

              <button
                onClick={() => onSelectUser(user)}
                disabled={isCurrent}
                className={`w-full mt-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                }`}
              >
                {isCurrent ? 'Currently Logged In' : `Switch to ${user.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* RBAC Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Security & Permissions Matrix</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Server-enforced stage boundaries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Workflow Capability</th>
                <th className="py-3 px-2 text-center">Gate User</th>
                <th className="py-3 px-2 text-center">Inspector</th>
                <th className="py-3 px-2 text-center">GRN User</th>
                <th className="py-3 px-2 text-center">Prod User</th>
                <th className="py-3 px-2 text-center">Approver</th>
                <th className="py-3 px-2 text-center">Store User</th>
                <th className="py-3 px-2 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.action}
                  </td>
                  {['GATE_USER', 'INSPECTOR', 'GRN_USER', 'MATERIAL_REQUEST_USER', 'REQUEST_APPROVER', 'STORE_USER', 'ADMIN'].map((role) => {
                    const isAllowed = item.roles.includes(role);
                    return (
                      <td key={role} className="py-3 px-2 text-center">
                        {isAllowed ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
                            <X className="w-3 h-3" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
