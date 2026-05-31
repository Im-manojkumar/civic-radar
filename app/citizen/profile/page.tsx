'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import {
  UserCircle,
  Trophy,
  Star,
  TrendingUp,
  Award,
  Settings,
  Shield,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Palette,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

/* ─── Karma Tier Helpers ─── */
interface KarmaTier {
  name: string;
  emoji: string;
  min: number;
  max: number;
  gradient: string;
  border: string;
  text: string;
  badge: string;
  progressBar: string;
}

const KARMA_TIERS: KarmaTier[] = [
  {
    name: 'Bronze',
    emoji: '🥉',
    min: 0,
    max: 49,
    gradient: 'from-amber-700 via-amber-600 to-yellow-700',
    border: 'border-amber-500/30',
    text: 'text-amber-100',
    badge: 'bg-amber-900/60 text-amber-300 ring-amber-500/40',
    progressBar: 'bg-amber-400',
  },
  {
    name: 'Silver',
    emoji: '🥈',
    min: 50,
    max: 199,
    gradient: 'from-slate-400 via-gray-300 to-slate-500',
    border: 'border-slate-400/30',
    text: 'text-slate-900',
    badge: 'bg-slate-200/60 text-slate-700 ring-slate-400/40',
    progressBar: 'bg-slate-500',
  },
  {
    name: 'Gold',
    emoji: '🥇',
    min: 200,
    max: 499,
    gradient: 'from-amber-500 via-yellow-400 to-orange-500',
    border: 'border-yellow-400/40',
    text: 'text-amber-950',
    badge: 'bg-yellow-200/60 text-yellow-800 ring-yellow-400/40',
    progressBar: 'bg-yellow-400',
  },
  {
    name: 'Diamond',
    emoji: '💎',
    min: 500,
    max: Infinity,
    gradient: 'from-cyan-400 via-blue-500 to-violet-600',
    border: 'border-cyan-400/40',
    text: 'text-white',
    badge: 'bg-cyan-200/60 text-cyan-800 ring-cyan-400/40',
    progressBar: 'bg-cyan-400',
  },
];

function getTier(points: number): KarmaTier {
  return KARMA_TIERS.find((t) => points >= t.min && points <= t.max) ?? KARMA_TIERS[0];
}

function getProgress(points: number, tier: KarmaTier): number {
  if (tier.max === Infinity) return 100;
  const range = tier.max - tier.min + 1;
  return Math.min(100, Math.round(((points - tier.min) / range) * 100));
}

function getNextTier(tier: KarmaTier): KarmaTier | null {
  const idx = KARMA_TIERS.indexOf(tier);
  return idx < KARMA_TIERS.length - 1 ? KARMA_TIERS[idx + 1] : null;
}

/* ─── Status Badge ─── */
const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  open: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  in_progress: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  resolved: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  closed: {
    bg: 'bg-gray-100 dark:bg-gray-800/60',
    text: 'text-gray-600 dark:text-gray-400',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.open;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.icon}
      {status.replace('_', ' ')}
    </span>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon,
  label,
  value,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      {/* Accent glow */}
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${accent}`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CitizenProfilePage() {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  const labels = lang === 'ta' ? labelsTa : labelsEn;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/issues/my');
        setIssues(res.data ?? []);
      } catch {
        setIssues([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const karmaPoints = user?.karma_points ?? 0;
  const tier = getTier(karmaPoints);
  const progress = getProgress(karmaPoints, tier);
  const nextTier = getNextTier(tier);
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : '—';

  const recentIssues = issues.slice(0, 5);
  const upvotesEstimate = Math.floor(karmaPoints / 2);
  const communityImpact = issues.length * 3 + upvotesEstimate;

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* ── Profile Header ── */}
          <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900/70 shadow-sm">
            {/* Decorative gradient bar */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />

            <div className="px-6 sm:px-8 pb-8 flex flex-col sm:flex-row gap-5">
              {/* Avatar (pulled up to overlap gradient) */}
              <div className="-mt-16 z-10 flex justify-center sm:justify-start">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name ?? 'Avatar'}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-xl object-cover bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name ?? 'Citizen'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {user?.email ?? '—'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300/30 dark:ring-indigo-500/30">
                    <Shield className="w-3 h-3" />
                    {user?.role ?? 'Citizen'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <Calendar className="w-3 h-3" />
                    Member since {memberSince}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Karma Card ── */}
          <section
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tier.gradient} ${tier.border} border shadow-lg`}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-black/10 translate-y-1/3 -translate-x-1/4 blur-2xl" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className={`text-sm font-medium ${tier.text} opacity-80 uppercase tracking-wider`}>
                    Karma Points
                  </p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className={`text-5xl font-extrabold ${tier.text} tracking-tight`}>
                      {karmaPoints}
                    </span>
                    <span className="text-3xl">{tier.emoji}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ring-1 ${tier.badge}`}
                >
                  <Trophy className="w-4 h-4" />
                  {tier.name} Tier
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className={`${tier.text} opacity-70`}>
                    {tier.min} pts
                  </span>
                  <span className={`${tier.text} opacity-70`}>
                    {nextTier ? `${tier.max + 1} pts (${nextTier.emoji} ${nextTier.name})` : 'Max Tier'}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tier.progressBar} transition-all duration-700 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <p className={`text-xs ${tier.text} opacity-60 mt-2`}>
                <span className="font-mono">Reports × 10 + Upvotes × 2</span>
              </p>
            </div>
          </section>

          {/* ── Impact Stats Grid ── */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Impact Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<MessageSquare className="w-5 h-5" />}
                label="Issues Reported"
                value={loading ? '…' : issues.length}
                subtitle="Total submissions"
                accent="bg-blue-500"
              />
              <StatCard
                icon={<Star className="w-5 h-5" />}
                label="Upvotes Given"
                value={loading ? '…' : upvotesEstimate}
                subtitle="Estimated from karma"
                accent="bg-amber-500"
              />
              <StatCard
                icon={<Award className="w-5 h-5" />}
                label="Community Impact"
                value={loading ? '…' : communityImpact}
                subtitle="Composite score"
                accent="bg-emerald-500"
              />
            </div>
          </section>

          {/* ── Recent Activity Feed ── */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Recent Activity
            </h2>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading activity…
                </div>
              ) : recentIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No issues reported yet</p>
                  <p className="text-xs mt-1 opacity-70">Start reporting to build your karma!</p>
                </div>
              ) : (
                recentIssues.map((issue: any, idx: number) => (
                  <div
                    key={issue.id ?? idx}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {issue.title ?? 'Untitled Issue'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {issue.created_at
                          ? new Date(issue.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                    </div>
                    <StatusBadge status={issue.status ?? 'open'} />
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Account Settings ── */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              Account Settings
            </h2>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
              {/* Language */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-500 dark:text-sky-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Language</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Content &amp; interface language
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/60 px-3 py-1 rounded-lg">
                  {lang === 'ta' ? 'தமிழ்' : 'English'}
                </span>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-500 dark:text-violet-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Appearance preference
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/60 px-3 py-1 rounded-lg">
                  System
                </span>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Role</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Your access level
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/60 px-3 py-1 rounded-lg capitalize">
                  {user?.role ?? 'citizen'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
