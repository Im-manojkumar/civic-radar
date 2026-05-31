'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Shield,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Category {
  name: string;
  count: number;
}

interface Region {
  name: string;
  total: number;
  resolved: number;
}

interface RecentlyResolved {
  category: string;
  location: string;
  resolved_at: string;
}

interface PublicStats {
  total_issues: number;
  resolved_issues: number;
  in_progress_issues: number;
  open_issues: number;
  resolution_rate: number;
  categories: Category[];
  regions: Region[];
  recently_resolved: RecentlyResolved[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COLORS = [
  '#0ea5e9', // sky-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

/* ------------------------------------------------------------------ */
/*  Small helper components                                            */
/* ------------------------------------------------------------------ */

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`}
    />
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-shadow hover:shadow-md dark:bg-slate-800 dark:ring-slate-700/50">
      {/* Subtle gradient accent strip */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
      />

      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Recharts tooltip                                            */
/* ------------------------------------------------------------------ */

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800">
      {label && (
        <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TransparencyDashboard() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/v1/analytics/public-stats');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PublicStats = await res.json();
        setStats(data);
      } catch (err: unknown) {
        console.error('Failed to load public stats', err);
        setError('Unable to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      {/* ────────────────────── Navbar ────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / brand */}
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
              Civic Radar <span className="text-sky-600 dark:text-sky-400">TN</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Login
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* ────────────────────── Hero ────────────────────── */}
      <header className="relative isolate overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-sky-300/10 blur-3xl dark:bg-sky-500/5" />

        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">
            <Shield className="h-4 w-4" />
            Tamil Nadu Civic Accountability
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Civic Radar{' '}
            <span className="bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Transparency Dashboard
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Real-time civic accountability for Tamil Nadu — tracking public
            issues, government responsiveness, and citizen impact across the
            state.
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-md shadow-sky-600/20 transition-all hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              Login to Report an Issue
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ────────────────────── Main content ────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Error state */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {/* ── KPI Cards ── */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))
          ) : stats ? (
            <>
              <KpiCard
                icon={Users}
                label="Total Issues"
                value={stats.total_issues.toLocaleString()}
                accent="from-sky-500 to-sky-600"
              />
              <KpiCard
                icon={CheckCircle}
                label="Resolved"
                value={stats.resolved_issues.toLocaleString()}
                accent="from-emerald-500 to-emerald-600"
              />
              <KpiCard
                icon={Clock}
                label="In Progress"
                value={stats.in_progress_issues.toLocaleString()}
                accent="from-amber-500 to-amber-600"
              />
              <KpiCard
                icon={TrendingUp}
                label="Resolution Rate"
                value={`${stats.resolution_rate.toFixed(1)}%`}
                accent="from-violet-500 to-violet-600"
              />
            </>
          ) : null}
        </section>

        {/* ── Charts Row ── */}
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Category Donut */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/50">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
              <BarChart2 className="h-5 w-5 text-sky-500" />
              Issue Categories
            </h2>

            {loading ? (
              <Skeleton className="mx-auto mt-6 h-64 w-64 rounded-full" />
            ) : stats?.categories?.length ? (
              <>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categories}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {stats.categories.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
                  {stats.categories.map((cat, idx) => (
                    <span key={cat.name} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                      <span className="text-slate-600 dark:text-slate-400">
                        {cat.name}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        ({cat.count})
                      </span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-6 text-center text-slate-500 dark:text-slate-400">
                No category data available.
              </p>
            )}
          </div>

          {/* Regional Bar Chart */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/50">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
              <MapPin className="h-5 w-5 text-sky-500" />
              Regional Performance
            </h2>

            {loading ? (
              <Skeleton className="mt-6 h-72 w-full" />
            ) : stats?.regions?.length ? (
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.regions}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      className="fill-slate-500 dark:fill-slate-400"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      className="fill-slate-500 dark:fill-slate-400"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="#94a3b8"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                    <Bar
                      dataKey="resolved"
                      name="Resolved"
                      fill="#0ea5e9"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-6 text-center text-slate-500 dark:text-slate-400">
                No regional data available.
              </p>
            )}
          </div>
        </section>

        {/* ── Recently Resolved Feed ── */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Recently Resolved Issues
          </h2>

          <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/50">
            {loading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recently_resolved?.length ? (
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-700">
                {stats.recently_resolved.map((issue, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {issue.category}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {issue.location}
                      </p>
                    </div>

                    <time className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                      {new Date(issue.resolved_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                No recently resolved issues to display.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* ────────────────────── Footer ────────────────────── */}
      <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur dark:border-slate-700/50 dark:bg-slate-900/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-slate-500 sm:flex-row sm:justify-between sm:text-left dark:text-slate-400">
          <p>
            Powered by{' '}
            <span className="font-semibold text-sky-600 dark:text-sky-400">
              Civic Radar TN
            </span>{' '}
            &bull; Open Data Initiative
          </p>

          <div className="flex gap-6">
            <Link
              href="/about"
              className="transition-colors hover:text-sky-600 dark:hover:text-sky-400"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-sky-600 dark:hover:text-sky-400"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-sky-600 dark:hover:text-sky-400"
            >
              Terms
            </Link>
            <a
              href="https://data.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-sky-600 dark:hover:text-sky-400"
            >
              Open Data <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
