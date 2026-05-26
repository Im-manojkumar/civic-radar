import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, AlertOctagon, CheckSquare } from 'lucide-react';
import { TRANSLATIONS } from '@/constants';
import { Language, IssueReport, IssueStatus } from '@/types';
import { generateAdminInsights } from '@/services/geminiService';

interface Props {
  lang: Language;
  issues: IssueReport[];
}

const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981'];

export const AdminView: React.FC<Props> = ({ lang, issues }) => {
  const t = TRANSLATIONS[lang];
  const [insight, setInsight] = useState<string>("Generating insights...");

  useEffect(() => {
    generateAdminInsights(issues).then(setInsight);
  }, [issues]);

  // Analytics Logic
  const statusData = [
    { name: IssueStatus.OPEN, value: issues.filter(i => i.status === IssueStatus.OPEN).length },
    { name: IssueStatus.IN_PROGRESS, value: issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length },
    { name: IssueStatus.RESOLVED, value: issues.filter(i => i.status === IssueStatus.RESOLVED).length },
  ];

  const categoryCount = issues.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryCount).map(key => ({
    name: key,
    value: categoryCount[key]
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-tn-900 to-tn-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-tn-100 mb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            {t.aiInsight}
        </h3>
        <p className="text-lg font-light leading-relaxed">{insight}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{t.reports}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{issues.length}</h3>
                </div>
                <Users className="text-tn-500 w-8 h-8 opacity-20" />
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{t.critical}</p>
                    <h3 className="text-2xl font-bold text-red-600">
                        {issues.filter(i => i.urgency === 'Critical').length}
                    </h3>
                </div>
                <AlertOctagon className="text-red-500 w-8 h-8 opacity-20" />
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{t.resolved}</p>
                    <h3 className="text-2xl font-bold text-emerald-600">
                        {issues.filter(i => i.status === 'Resolved').length}
                    </h3>
                </div>
                <CheckSquare className="text-emerald-500 w-8 h-8 opacity-20" />
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{t.pending}</p>
                    <h3 className="text-2xl font-bold text-amber-500">
                        {issues.filter(i => i.status !== 'Resolved').length}
                    </h3>
                </div>
                <Activity className="text-amber-500 w-8 h-8 opacity-20" />
            </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{t.issueDistribution}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Status Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">{t.recentActivity}</h3>
        </div>
        <div className="divide-y divide-slate-100">
            {issues.slice(0, 5).map(issue => (
                <div key={issue.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900">{issue.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{issue.location} • {new Date(issue.timestamp).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                            issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                        }`}>
                            {issue.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
