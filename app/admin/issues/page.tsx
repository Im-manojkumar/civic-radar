'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import {
  ClipboardCheck,
  Filter,
  MapPin,
  Clock,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  Send,
  X,
  RefreshCw,
  Search,
  Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Issue {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  location?: string;
  created_at: string;
  upvotes: number;
  assigned_officer?: string;
  assigned_zone?: string;
  photo_url?: string;
  ai_analysis?: string;
}

interface TimelineEntry {
  id: string;
  action: string;
  comment?: string;
  created_at: string;
  actor?: string;
}

type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
type CategoryFilter =
  | 'ALL'
  | 'Delay'
  | 'Denied'
  | 'Corruption'
  | 'Awareness'
  | 'Access'
  | 'Other';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: StatusFilter[] = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];
const CATEGORY_OPTIONS: CategoryFilter[] = [
  'ALL',
  'Delay',
  'Denied',
  'Corruption',
  'Awareness',
  'Access',
  'Other',
];

const STATUS_META: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  OPEN: {
    label: 'Open',
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function truncate(str: string, len = 100) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/20">
        <CheckCircle className="h-5 w-5 shrink-0" />
        {message}
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.OPEN;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Confirm Modal                                                      */
/* ------------------------------------------------------------------ */

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue Row / Card                                                   */
/* ------------------------------------------------------------------ */

function IssueCard({
  issue,
  onStatusChange,
  onAssign,
  onComment,
  expanded,
  onToggle,
  timeline,
  timelineLoading,
}: {
  issue: Issue;
  onStatusChange: (id: string, newStatus: string) => void;
  onAssign: (id: string, officer: string, zone: string) => void;
  onComment: (id: string, comment: string) => void;
  expanded: boolean;
  onToggle: () => void;
  timeline: TimelineEntry[];
  timelineLoading: boolean;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignInput, setShowAssignInput] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [officerVal, setOfficerVal] = useState(issue.assigned_officer ?? '');
  const [zoneVal, setZoneVal] = useState(issue.assigned_zone ?? '');
  const [commentVal, setCommentVal] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  const handleStatusSelect = (newStatus: string) => {
    setShowStatusMenu(false);
    if (newStatus === issue.status) return;
    setConfirmAction({
      title: 'Change Status',
      message: `Change status from "${STATUS_META[issue.status]?.label}" to "${STATUS_META[newStatus]?.label}"?`,
      action: () => {
        onStatusChange(issue.id, newStatus);
        setConfirmAction(null);
      },
    });
  };

  const handleAssign = () => {
    if (!officerVal.trim()) return;
    setShowAssignInput(false);
    onAssign(issue.id, officerVal.trim(), zoneVal.trim());
  };

  const handleComment = () => {
    if (!commentVal.trim()) return;
    setShowCommentInput(false);
    onComment(issue.id, commentVal.trim());
    setCommentVal('');
  };

  return (
    <>
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.action}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="group border-b border-slate-100 last:border-b-0 dark:border-slate-700/60">
        {/* Main row */}
        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start">
          {/* Photo thumbnail */}
          {issue.photo_url ? (
            <img
              src={issue.photo_url}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 sm:h-14 sm:w-14"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 sm:h-14 sm:w-14">
              <ImageIcon className="h-5 w-5 text-slate-400" />
            </div>
          )}

          {/* Info block */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {issue.category}
              </span>
              <StatusBadge status={issue.status} />
            </div>
            <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              {issue.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {truncate(issue.description, 120)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {issue.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {issue.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {fmtDate(issue.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <ChevronUp className="h-3.5 w-3.5" /> {issue.upvotes} upvotes
              </span>
              {issue.assigned_officer && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {issue.assigned_officer}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap items-start gap-2 sm:flex-nowrap">
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusMenu(!showStatusMenu);
                  setShowAssignInput(false);
                  setShowCommentInput(false);
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Status <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 z-30 mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-700">
                  {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusSelect(s)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-600 ${
                        s === issue.status
                          ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`}
                      />
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assign */}
            <button
              onClick={() => {
                setShowAssignInput(!showAssignInput);
                setShowStatusMenu(false);
                setShowCommentInput(false);
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <User className="h-3.5 w-3.5" /> Assign
            </button>

            {/* Comment */}
            <button
              onClick={() => {
                setShowCommentInput(!showCommentInput);
                setShowStatusMenu(false);
                setShowAssignInput(false);
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Comment
            </button>

            {/* Expand */}
            <button
              onClick={onToggle}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Assign input panel */}
        {showAssignInput && (
          <div className="mx-5 mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Officer Name
              </label>
              <input
                value={officerVal}
                onChange={(e) => setOfficerVal(e.target.value)}
                placeholder="Enter officer name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Zone
              </label>
              <input
                value={zoneVal}
                onChange={(e) => setZoneVal(e.target.value)}
                placeholder="Enter zone"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              onClick={handleAssign}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Assign
            </button>
          </div>
        )}

        {/* Comment input panel */}
        {showCommentInput && (
          <div className="mx-5 mb-4 flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50">
            <textarea
              rows={2}
              value={commentVal}
              onChange={(e) => setCommentVal(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={handleComment}
              disabled={!commentVal.trim()}
              className="shrink-0 rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Expanded detail */}
        {expanded && (
          <div className="mx-5 mb-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/60">
            {/* Full description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Full Description
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {issue.description || '—'}
              </p>
            </div>

            {/* AI Analysis */}
            {issue.ai_analysis && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  AI Analysis
                </h4>
                <div className="mt-1 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200">
                  {issue.ai_analysis}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Timeline
              </h4>
              {timelineLoading ? (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading
                  timeline…
                </div>
              ) : timeline.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">
                  No timeline events yet.
                </p>
              ) : (
                <ol className="relative mt-3 border-l-2 border-slate-200 pl-5 dark:border-slate-700">
                  {timeline.map((entry) => (
                    <li key={entry.id} className="mb-4 last:mb-0">
                      <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 dark:border-slate-800" />
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {entry.action}
                      </p>
                      {entry.comment && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {entry.comment}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {fmtDateTime(entry.created_at)}
                        {entry.actor && ` · ${entry.actor}`}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminIssuesPage() {
  const { token } = useAuthStore();

  /* Data */
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* Filters */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  /* Expanded rows */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timelines, setTimelines] = useState<Record<string, TimelineEntry[]>>(
    {},
  );
  const [timelineLoading, setTimelineLoading] = useState<
    Record<string, boolean>
  >({});

  /* Toast */
  const [toast, setToast] = useState('');

  /* ---- Fetch issues ---- */
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/issues/admin/list?limit=100');
      setIssues(res.data?.issues ?? res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  /* ---- Fetch timeline ---- */
  const fetchTimeline = useCallback(async (issueId: string) => {
    setTimelineLoading((prev) => ({ ...prev, [issueId]: true }));
    try {
      const res = await api.get(`/issues/${issueId}/timeline`);
      setTimelines((prev) => ({
        ...prev,
        [issueId]: res.data?.timeline ?? res.data ?? [],
      }));
    } catch {
      setTimelines((prev) => ({ ...prev, [issueId]: [] }));
    } finally {
      setTimelineLoading((prev) => ({ ...prev, [issueId]: false }));
    }
  }, []);

  /* ---- Toggle expand ---- */
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!timelines[id]) fetchTimeline(id);
    }
  };

  /* ---- Actions ---- */
  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await api.patch(`/issues/${issueId}/status`, {
        new_status: newStatus,
        comment: `Status changed to ${newStatus}`,
      });
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId ? { ...i, status: newStatus as Issue['status'] } : i,
        ),
      );
      setToast(`Status updated to ${STATUS_META[newStatus]?.label ?? newStatus}`);
      // Refresh timeline if expanded
      if (expandedId === issueId) fetchTimeline(issueId);
    } catch {
      setToast('Failed to update status');
    }
  };

  const handleAssign = async (
    issueId: string,
    officer: string,
    zone: string,
  ) => {
    try {
      await api.patch(`/issues/${issueId}/assign`, {
        assigned_officer: officer,
        assigned_zone: zone,
      });
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? { ...i, assigned_officer: officer, assigned_zone: zone }
            : i,
        ),
      );
      setToast(`Assigned to ${officer}`);
      if (expandedId === issueId) fetchTimeline(issueId);
    } catch {
      setToast('Failed to assign officer');
    }
  };

  const handleComment = async (issueId: string, comment: string) => {
    try {
      await api.post(`/issues/${issueId}/comment`, { comment });
      setToast('Comment added');
      if (expandedId === issueId) fetchTimeline(issueId);
    } catch {
      setToast('Failed to add comment');
    }
  };

  /* ---- Filtered list ---- */
  const filtered = issues.filter((i) => {
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
    if (
      searchQuery &&
      !i.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !i.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  /* ---- Render ---- */
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Toast */}
        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
              <ClipboardCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Issue Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {issues.length} total issue{issues.length !== 1 && 's'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchIssues}
            disabled={loading}
            className="flex items-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Status' : STATUS_META[s]?.label ?? s}
              </option>
            ))}
          </select>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as CategoryFilter)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Results info */}
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Showing {filtered.length} of {issues.length} issues
        </div>

        {/* Issues list */}
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="h-10 w-10 text-red-400" />
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                onClick={fetchIssues}
                className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ClipboardCheck className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No issues match your filters.
              </p>
            </div>
          ) : (
            filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onStatusChange={handleStatusChange}
                onAssign={handleAssign}
                onComment={handleComment}
                expanded={expandedId === issue.id}
                onToggle={() => toggleExpand(issue.id)}
                timeline={timelines[issue.id] ?? []}
                timelineLoading={!!timelineLoading[issue.id]}
              />
            ))
          )}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </AppShell>
  );
}
