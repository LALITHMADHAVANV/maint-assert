'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  Crown,
  ShieldAlert,
  Zap,
  Building,
  IndianRupee,
  FileText,
  User,
  CheckCheck,
  RotateCcw,
  Sparkles,
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
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

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

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBroadcastSent(true);
    showToast(`Executive Directive broadcasted to all 4 sewing lines & maintenance floor!`, 'success');
    setTimeout(() => {
      setBroadcastText('');
      setBroadcastSent(false);
    }, 2500);
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
            <div className="text-xl font-extrabold text-indigo-700">Line 01 & 02</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Critical Messages Feed & Executive Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Critical Part Message Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Critical Part Messages Inbox ({filteredRequisitions.length})
              </h2>
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filter === 'PENDING'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Needs Action ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('APPROVED')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filter === 'APPROVED'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Messages
              </button>
            </div>
          </div>

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
            filteredRequisitions.map((req) => {
              const isPending = req.status === 'PENDING_CEO_APPROVAL';
              const isApproved = req.status === 'APPROVED_BY_CEO';
              const isInfoOpen = !!expandedInfoMap[req.id];

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-xl border p-4 shadow-xs transition space-y-3 ${
                    isPending
                      ? 'border-rose-300 bg-rose-50/10'
                      : isApproved
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top row: Status Badge + ID + Cost + Time */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Emergency Request</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Authorized</span>
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-slate-700">{req.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">CapEx: </span>
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        ₹{req.estimatedCost?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Middle row: Machine, Line, Component and (i) Info icon button */}
                  <div className="flex items-center justify-between gap-3 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-900 text-white text-[11px]">
                        {req.targetMachineId || 'Plant Core'}
                      </span>
                      <span className="text-slate-600 font-semibold">{req.targetLine}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="font-bold text-slate-800">{req.partName}</span>
                      <span className="text-slate-500 font-mono">
                        ({req.quantity} {req.unit})
                      </span>
                    </div>

                    {/* (i) Icon Button to toggle Mechanic Technical Justification */}
                    <button
                      type="button"
                      onClick={() => toggleInfo(req.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold shrink-0 ${
                        isInfoOpen
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 hover:text-indigo-600 border-slate-200 hover:border-indigo-300'
                      }`}
                      title="Click to view Mechanic Technical Justification"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isInfoOpen ? 'Hide' : 'Info'}</span>
                    </button>
                  </div>

                  {/* Collapsible Justification Drawer */}
                  {isInfoOpen && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-950 space-y-1 animate-in fade-in duration-100">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>Mechanic Technical Justification:</span>
                        <span className="font-normal text-[11px] text-amber-700">({req.requestedBy})</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed font-sans pl-5">
                        &ldquo;{req.justification || 'Emergency repair replacement component needed for halted sewing operation.'}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Audit Trail if already reviewed */}
                  {req.reviewedBy && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      ✓ Authorized by {req.reviewedBy} on {new Date(req.reviewedAt || '').toLocaleDateString()}
                    </div>
                  )}

                  {/* Action Bar (Small Grant & Decline buttons) */}
                  {isPending && isCeoOrAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Grant</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Col: CEO Emergency Directive Broadcast */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Broadcast Executive Directive</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Send an urgent executive memo or maintenance instruction directly to floor supervisors, tool crib storekeepers, and mechanics.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <textarea
                rows={4}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="e.g. NOTICE: All Line 02 Overlocks must undergo looper gap verification before 4:00 PM shift changeover..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-slate-800 transition"
              />

              <button
                type="submit"
                disabled={!broadcastText.trim() || broadcastSent}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcastSent ? 'Transmitted to Floor!' : 'Broadcast to Floor Units'}</span>
              </button>
            </form>
          </div>

          {/* Quick Authority Guidelines */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl p-5 border border-purple-200/70 space-y-3">
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-purple-700" />
              <span>Executive Authorization Policy</span>
            </h4>
            <ul className="text-xs text-purple-900/80 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Critical Needs (High Value / CapEx):</strong> Halts export line sewing. Automatically routed to CEO inbox with high priority.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Urgent Needs (Operational Spare):</strong> Fast-tracked directly by Plant Maintenance Manager.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Monthly Indents:</strong> Aggregated in advance by Senior Mechanics and fulfilled by Tool Crib Store In-Charge.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
