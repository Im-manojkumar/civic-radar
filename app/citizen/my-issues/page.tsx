'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import {
  ClipboardList,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Camera,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  location: string;
  created_at: string;
  upvotes: number;
  photo_url?: string;
}

interface TimelineEntry {
  id: string;
  timestamp: string;
  old_status: string;
  new_status: string;
  comment?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  roads: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  water: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  electricity: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  sanitation: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  safety: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  pollution: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  transport: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const STATUS_CONFIG: Record<
  string,
  { emoji: string; label: string; classes: string }
> = {
  OPEN: {
    emoji: '🔴',
    label: 'Open',
    classes:
      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  IN_PROGRESS: {
    emoji: '🟡',
    label: 'In Progress',
    classes:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  RESOLVED: {
    emoji: '🟢',
    label: 'Resolved',
    classes:
      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimestamp(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline Component                                                 */
/* ------------------------------------------------------------------ */

function Timeline({
  issueId,
  isOpen,
}: {
  issueId: string;
  isOpen: boolean;
}) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(`/issues/${issueId}/timeline`)
      .then((res) => {
        if (!cancelled) setEntries(res.data ?? res);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load timeline.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [issueId, isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
          Loading timeline…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-red-500 dark:text-red-400">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-4 text-sm text-slate-400 dark:text-slate-500">
        No status changes recorded yet.
      </p>
    );
  }

  return (
    <div className="relative mt-2 pl-4">
      {/* vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-600" />

      <ul className="space-y-4">
        {entries.map((entry) => {
          const oldCfg = STATUS_CONFIG[entry.old_status] ?? {
            emoji: '⚪',
            label: entry.old_status,
          };
          const newCfg = STATUS_CONFIG[entry.new_status] ?? {
            emoji: '⚪',
            label: entry.new_status,
          };

          return (
            <li key={entry.id} className="relative flex gap-3">
              {/* dot */}
              <span className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-800" />

              <div className="min-w-0">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatTimestamp(entry.timestamp)}
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {oldCfg.emoji} {oldCfg.label}{' '}
                  <span className="mx-1 text-slate-400">→</span>{' '}
                  {newCfg.emoji} {newCfg.label}
                </p>
                {entry.comment && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {entry.comment}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue Card                                                         */
/* ------------------------------------------------------------------ */

function IssueCard({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);

  const statusCfg = STATUS_CONFIG[issue.status] ?? {
    emoji: '⚪',
    label: issue.status,
    classes: 'bg-slate-100 text-slate-600',
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-slate-200
                 dark:bg-slate-800 dark:border-slate-700
                 transition-shadow hover:shadow-md"
    >
      {/* Main content */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
      >
        {/* Top row: category + status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getCategoryColor(
              issue.category
            )}`}
          >
            {issue.category}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCfg.classes}`}
          >
            {statusCfg.emoji} {statusCfg.label}
          </span>
        </div>

        {/* Photo thumbnail */}
        {issue.photo_url && (
          <div className="relative mb-3 overflow-hidden rounded-lg aspect-video bg-slate-100 dark:bg-slate-700">
            <img
              src={issue.photo_url}
              alt={issue.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5">
              <Camera className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        )}

        {/* Title & description */}
        <h3 className="font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">
          {issue.title}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {issue.description}
        </p>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {issue.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(issue.created_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {issue.upvotes}
          </span>
        </div>

        {/* Expand / collapse indicator */}
        <div className="mt-3 flex items-center justify-center text-slate-400 dark:text-slate-500">
          {expanded ? (
            <ChevronUp className="h-5 w-5 transition-transform" />
          ) : (
            <ChevronDown className="h-5 w-5 transition-transform" />
          )}
        </div>
      </button>

      {/* Expanded timeline */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 pb-5">
          <h4 className="mt-4 mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Status Timeline
          </h4>
          <Timeline issueId={issue.id} isOpen={expanded} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MyIssuesPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get('/issues/my')
      .then((res) => {
        if (!cancelled) setIssues(res.data ?? res);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load your issues.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* -------- Header -------- */}
        <div className="mb-8 flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white sm:text-3xl">
            {t.myIssues ?? 'My Issues'}
          </h1>
          {!loading && (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {issues.length}
            </span>
          )}
        </div>

        {/* -------- Loading -------- */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {/* -------- Error -------- */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
            <p className="text-slate-600 dark:text-slate-300">{error}</p>
          </div>
        )}

        {/* -------- Empty state -------- */}
        {!loading && !error && issues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-indigo-50 p-4 dark:bg-indigo-900/30">
              <ClipboardList className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {t.noIssuesTitle ?? "You haven't reported any issues yet."}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {t.noIssuesSubtitle ?? 'Start making a difference!'}
            </p>
          </div>
        )}

        {/* -------- Issue grid -------- */}
        {!loading && !error && issues.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
