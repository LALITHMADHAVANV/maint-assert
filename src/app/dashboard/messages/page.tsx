'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Crown,
  ShieldAlert,
  Building,
  IndianRupee,
  FileText,
  CheckCheck,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PartRequisition } from '@/types/cmms';
import {
  subscribeRequisitions,
  approveRequisition,
  rejectRequisition,
} from '@/lib/services/cmmsService';

export default function CeoMessagesPage() {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [requisitions, setRequisitions] = useState<PartRequisition[]>([]);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [expandedInfoMap, setExpandedInfoMap] = useState<Record<string, boolean>>({});

  const toggleInfo = (id: string) => {
    setExpandedInfoMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isCeoOrAdmin = role === 'CEO' || role === 'ADMIN' || role === 'ASSET_MANAGER';

  useEffect(() => {
    const unsub = subscribeRequisitions((reqs) => {
      // Filter for requisitions requiring CEO approval or marked as critical
      const ceoMessages = reqs.filter(
        (r) => r.type === 'CRITICAL_CEO' || r.requiresCeoApproval || r.urgency === 'CRITICAL_CEO_APPROVAL'
      );
      setRequisitions(ceoMessages);
    });

    return () => unsub();
  }, []);

  const pendingCount = requisitions.filter((r) => r.status === 'PENDING_CEO_APPROVAL').length;
  const approvedCount = requisitions.filter((r) => r.status === 'APPROVED_BY_CEO').length;
  const totalCapexRequested = requisitions.reduce((acc, r) => acc + (r.estimatedCost || 0), 0);
  const pendingCapex = requisitions
    .filter((r) => r.status === 'PENDING_CEO_APPROVAL')
    .reduce((acc, r) => acc + (r.estimatedCost || 0), 0);

  const handleApprove = async (id: string) => {
    const note = remarksMap[id] || 'Emergency purchase approved under executive maintenance contingency reserve.';
    try {
      await approveRequisition(
        id,
        user?.name ? `${user.name} (CEO)` : 'Dr. K. Ramanathan (CEO)',
        note,
        'APPROVED_BY_CEO'
      );
      showToast('Executive authorization granted! Purchase order dispatched to Tool Crib & Floor.', 'success');
      setRemarksMap((prev) => ({ ...prev, [id]: '' }));
    } catch (e) {
      showToast('Error approving critical request', 'error');
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    const note = remarksMap[id] || 'Declined: Seek alternate floor machine cannibalization or buffer reserve.';
    try {
      await rejectRequisition(
        id,
        user?.name ? `${user.name} (CEO)` : 'Dr. K. Ramanathan (CEO)',
        note
      );
      showToast('Request returned with executive instructions.', 'info');
      setRemarksMap((prev) => ({ ...prev, [id]: '' }));
    } catch (e) {
      showToast('Error declining request', 'error');
      console.error(e);
    }
  };

  const filteredRequisitions = requisitions.filter((r) => {
    if (filter === 'PENDING') return r.status === 'PENDING_CEO_APPROVAL';
    if (filter === 'APPROVED') return r.status === 'APPROVED_BY_CEO';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Executive Header Banner */}
      <div className="bg-white text-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs border border-purple-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Executive Office &amp; Chief Executive Decision Desk</span>
              </span>
              <span className="text-xs text-purple-700 font-mono font-semibold">
                {user?.name || 'Dr. K. Ramanathan'} ({role || 'CEO'})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Critical Spare Parts &amp; Emergency Approvals
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Real-time urgent breakdown dispatches and line-stoppage part requests requiring immediate CEO financial authorization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-purple-50/80 border border-purple-200 rounded-xl px-4 py-2.5 text-right shadow-2xs">
              <span className="block text-[11px] uppercase tracking-wider text-purple-800 font-bold">
                Pending Decisions
              </span>
              <div className="flex items-center justify-end gap-2">
                {pendingCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
                <span className="text-2xl font-black text-rose-600">{pendingCount}</span>
              </div>
            </div>

            <div className="bg-purple-50/80 border border-purple-200 rounded-xl px-4 py-2.5 text-right shadow-2xs">
              <span className="block text-[11px] uppercase tracking-wider text-purple-800 font-bold">
                Emergency Budget Impact
              </span>
              <span className="text-2xl font-black text-amber-700 font-mono">₹{pendingCapex.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Authority Advisory Banner */}
      {!isCeoOrAdmin && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">Executive Authority Restricted:</span> You are viewing the CEO Approval Desk in read-only mode as <span className="font-mono font-bold uppercase">{role || 'GUEST'}</span>. Only <strong>CEO Dr. K. Ramanathan</strong> or <strong>Plant Admin</strong> has authority to approve or decline critical capital spare orders.
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Critical Requests</div>
            <div className="text-xl font-extrabold text-slate-900">{pendingCount} Pending</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Executive Approvals</div>
            <div className="text-xl font-extrabold text-emerald-700">{approvedCount} Authorized</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Emergency CapEx</div>
            <div className="text-xl font-extrabold text-slate-900">₹{totalCapexRequested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Protected Lines</div>
            <div className="text-xl font-extrabold text-indigo-700">Line 01 &amp; 02</div>
          </div>
        </div>
      </div>

      {/* Critical Part Messages Feed in Grid */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Critical Part Messages Inbox
              </h2>
              <p className="text-[11px] text-slate-500">
                Showing {filteredRequisitions.length} urgent part requisitions
              </p>
            </div>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filter === 'PENDING'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Action ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filter === 'APPROVED'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Messages ({requisitions.length})
            </button>
          </div>
        </div>

        {/* Grid display */}
        {filteredRequisitions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">All Clear! No Pending Critical Halts</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no emergency part replacement requests awaiting CEO approval at this time. All factory lines are operating normally.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequisitions.map((req) => {
              const isPending = req.status === 'PENDING_CEO_APPROVAL';
              const isApproved = req.status === 'APPROVED_BY_CEO';
              const isInfoOpen = !!expandedInfoMap[req.id];

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all duration-150 flex flex-col justify-between hover:shadow-md ${
                    isPending
                      ? 'border-rose-300 ring-1 ring-rose-200/50 bg-rose-50/10'
                      : isApproved
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Status badge + ID + Time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Emergency</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Authorized</span>
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {req.id}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Machine & Line Tag */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-slate-900 text-white text-[11px]">
                        {req.targetMachineId || 'Plant Core'}
                      </span>
                      <span className="px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 text-[11px] border border-indigo-200">
                        {req.targetLine}
                      </span>
                      {req.sku && (
                        <span className="font-mono text-[10px] text-slate-400">
                          SKU: {req.sku}
                        </span>
                      )}
                    </div>

                    {/* Part Name & Quantity */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2" title={req.partName}>
                        {req.partName}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium mt-1">
                        Quantity Required: <strong className="text-slate-800">{req.quantity} {req.unit}</strong>
                      </div>
                    </div>

                    {/* Estimated CapEx Cost Box */}
                    <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Estimated CapEx
                      </span>
                      <span className="text-base font-black font-mono text-slate-900">
                        ₹{req.estimatedCost?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Technical Justification Drawer with Toggle */}
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>Justification</span>
                          <span className="font-normal text-[10px] text-amber-700">({req.requestedBy})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleInfo(req.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer flex items-center gap-0.5"
                        >
                          <Info className="w-3 h-3" />
                          <span>{isInfoOpen ? 'Less' : 'Details'}</span>
                        </button>
                      </div>
                      <p className={`text-[11px] text-amber-900/90 leading-relaxed italic ${isInfoOpen ? '' : 'line-clamp-2'}`}>
                        &ldquo;{req.justification || 'Emergency repair replacement component needed for halted sewing operation.'}&rdquo;
                      </p>
                    </div>

                    {/* Audit Trail if already reviewed */}
                    {req.reviewedBy && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Authorized by <strong>{req.reviewedBy}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Action Bar (Grant & Decline buttons for pending requests) */}
                  {isPending && isCeoOrAdmin && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mt-4">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Grant</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
