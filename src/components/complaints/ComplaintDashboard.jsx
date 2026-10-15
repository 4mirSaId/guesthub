'use client';

import { useMemo, useState } from 'react';
import {
  complaintCategories,
  complaintPriorities,
  complaintStatuses,
  formatComplaintDate,
  formatDuration,
  getDepartmentForCategory,
  getPriorityBadgeClasses,
  getStatusBadgeClasses,
  normalizeStatus,
  priorityLabels,
  statusLabels,
} from '@/lib/complaintConfig';

function StatCard({ label, value, tone }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/20">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function BarChart({ data, color }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
            <span>{item.label}</span>
            <span className="font-semibold text-white">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div className="h-2 rounded-full" style={{ width: `${(item.value / maxValue) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, total }) {
  const segments = data.map((entry, index) => {
    const start = data.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const percent = total === 0 ? 0 : (entry.value / total) * 100;
    const length = (percent / 100) * circumference;
    return { ...entry, start, length, radius, circumference };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-slate-950/70">
        <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#34d399 0deg ${Math.max(0, (segments[0]?.length || 0) / (segments[0]?.circumference || 1)) * 360}deg, #38bdf8 0deg 220deg, #f59e0b 0deg 300deg, #fb7185 0deg 360deg)` }} />
        <div className="absolute inset-5 rounded-full bg-slate-950" />
        <div className="relative text-center">
          <p className="text-3xl font-semibold text-white">{total}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 text-sm text-slate-300">
        {segments.map((entry) => (
          <div key={entry.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.label}
            </span>
            <span className="font-semibold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaChart({ data }) {
  const points = data.map((item, index) => {
    const x = 10 + (index / Math.max(data.length - 1, 1)) * 280;
    const y = 110 - item.value * 18;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <svg viewBox="0 0 300 130" className="w-full">
        <path d={`M 10 110 L ${points.join(' L ')} L 290 110 Z`} fill="rgba(52,211,153,0.14)" />
        <polyline points={points.join(' ')} fill="none" stroke="#34d399" strokeWidth="3" />
      </svg>
      <div className="mt-2 flex justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function ComplaintDashboard({ complaints, onUpdateStatus }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [chartView, setChartView] = useState('weekly');
  const [sortBy, setSortBy] = useState('newest');

  const filteredComplaints = useMemo(() => {
    return (complaints || []).filter((complaint) => {
      const normalizedStatus = normalizeStatus(complaint.status);
      const query = search.toLowerCase();
      const matchesSearch =
        !query ||
        complaint.fullName?.toLowerCase().includes(query) ||
        complaint.roomNumber?.toLowerCase().includes(query) ||
        complaint.description?.toLowerCase().includes(query) ||
        complaint.category?.toLowerCase().includes(query) ||
        complaint.subcategory?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || String(complaint.priority || '').toLowerCase() === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
      const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : null;
      const matchesFrom = !dateFrom || !createdAt || createdAt >= new Date(dateFrom);
      const matchesTo = !dateTo || !createdAt || createdAt <= new Date(dateTo);
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesFrom && matchesTo;
    });
  }, [complaints, search, statusFilter, priorityFilter, categoryFilter, dateFrom, dateTo]);

  const sortedComplaints = useMemo(() => {
    const data = [...filteredComplaints];
    data.sort((left, right) => {
      const leftDate = new Date(left.createdAt || 0).getTime();
      const rightDate = new Date(right.createdAt || 0).getTime();
      if (sortBy === 'oldest') return leftDate - rightDate;
      return rightDate - leftDate;
    });
    return data;
  }, [filteredComplaints, sortBy]);

  const stats = useMemo(() => {
    const total = sortedComplaints.length;
    const pending = sortedComplaints.filter((complaint) => normalizeStatus(complaint.status) === 'pending').length;
    const inProgress = sortedComplaints.filter((complaint) => normalizeStatus(complaint.status) === 'in-progress').length;
    const resolved = sortedComplaints.filter((complaint) => normalizeStatus(complaint.status) === 'resolved' || normalizeStatus(complaint.status) === 'closed').length;
    const open = pending + inProgress;
    const highPriority = sortedComplaints.filter((complaint) => ['high', 'urgent'].includes(String(complaint.priority || '').toLowerCase())).length;
    const urgent = sortedComplaints.filter((complaint) => String(complaint.priority || '').toLowerCase() === 'urgent').length;
    const resolvedDurations = sortedComplaints
      .filter((complaint) => complaint.resolutionTime)
      .map((complaint) => new Date(complaint.resolutionTime).getTime() - new Date(complaint.createdAt).getTime())
      .filter((value) => Number.isFinite(value) && value > 0);
    const averageResolutionTime = resolvedDurations.length
      ? resolvedDurations.reduce((sum, value) => sum + value, 0) / resolvedDurations.length
      : 0;
    const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);
    return { total, open, pending, inProgress, resolved, averageResolutionTime, resolutionRate, highPriority, urgent };
  }, [sortedComplaints]);

  const categoryData = useMemo(() => {
    const counts = complaintCategories.map((category) => ({ label: category.label, value: 0 }));
    sortedComplaints.forEach((complaint) => {
      const category = complaintCategories.find((item) => item.id === complaint.category);
      const target = counts.find((item) => item.label === (category?.label || 'Other'));
      if (target) target.value += 1;
    });
    return counts.filter((item) => item.value > 0).slice(0, 6);
  }, [sortedComplaints]);

  const priorityData = useMemo(() => {
    return complaintPriorities.map((priority) => ({
      label: priorityLabels[priority],
      value: sortedComplaints.filter((complaint) => String(complaint.priority || '').toLowerCase() === priority).length,
      color: priority === 'urgent' ? '#fb7185' : priority === 'high' ? '#f59e0b' : priority === 'medium' ? '#38bdf8' : '#34d399',
    })).filter((item) => item.value > 0);
  }, [sortedComplaints]);

  const statusData = useMemo(() => {
    return complaintStatuses.map((status) => ({
      label: statusLabels[status],
      value: sortedComplaints.filter((complaint) => normalizeStatus(complaint.status) === status).length,
      color: status === 'pending' ? '#f59e0b' : status === 'in-progress' ? '#38bdf8' : status === 'resolved' ? '#34d399' : '#64748b',
    })).filter((item) => item.value > 0);
  }, [sortedComplaints]);

  const issueData = useMemo(() => {
    const counts = {};
    sortedComplaints.forEach((complaint) => {
      const issue = complaint.subcategory || 'Unspecified';
      counts[issue] = (counts[issue] || 0) + 1;
    });
    return Object.entries(counts).sort((left, right) => right[1] - left[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
  }, [sortedComplaints]);

  const departmentData = useMemo(() => {
    const counts = {};
    sortedComplaints.forEach((complaint) => {
      const department = complaint.department || getDepartmentForCategory(complaint.category);
      counts[department] = (counts[department] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value);
  }, [sortedComplaints]);

  const floorData = useMemo(() => {
    const counts = {};
    sortedComplaints.forEach((complaint) => {
      const roomNumber = String(complaint.roomNumber || '').trim();
      const match = roomNumber.match(/\d+/);
      const floor = match ? Math.max(1, Math.floor(Number(match[0]) / 100)) : 'Unknown';
      counts[floor] = (counts[floor] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label: `Floor ${label}`, value })).sort((left, right) => right.value - left.value);
  }, [sortedComplaints]);

  const roomData = useMemo(() => {
    const counts = {};
    sortedComplaints.forEach((complaint) => {
      const room = complaint.roomNumber || 'Unknown';
      counts[room] = (counts[room] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value).slice(0, 6);
  }, [sortedComplaints]);

  const hourlyData = useMemo(() => {
    const counts = Array.from({ length: 24 }, (_, hour) => ({ label: `${hour}:00`, value: 0 }));
    sortedComplaints.forEach((complaint) => {
      const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      counts[createdAt.getHours()].value += 1;
    });
    return counts.filter((item) => item.value > 0);
  }, [sortedComplaints]);

  const timeSeries = useMemo(() => {
    const buckets = chartView === 'daily' ? 7 : chartView === 'monthly' ? 6 : 8;
    const values = [];
    for (let index = buckets - 1; index >= 0; index -= 1) {
      const date = new Date();
      if (chartView === 'monthly') {
        date.setMonth(date.getMonth() - index);
        values.push({ label: date.toLocaleDateString('en', { month: 'short' }), value: 0 });
      } else if (chartView === 'daily') {
        date.setDate(date.getDate() - index);
        values.push({ label: date.toLocaleDateString('en', { weekday: 'short' }), value: 0 });
      } else {
        date.setDate(date.getDate() - index * 7);
        values.push({ label: `W${index + 1}`, value: 0 });
      }
    }

    sortedComplaints.forEach((complaint) => {
      const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const bucketIndex = chartView === 'monthly'
        ? values.findIndex((item) => item.label === createdAt.toLocaleDateString('en', { month: 'short' }))
        : chartView === 'daily'
          ? values.findIndex((item) => item.label === createdAt.toLocaleDateString('en', { weekday: 'short' }))
          : values.findIndex((item) => item.label === `W${Math.ceil((createdAt.getDate() + 6 - createdAt.getDay()) / 7)}`);
      if (bucketIndex >= 0) values[bucketIndex].value += 1;
    });
    return values.filter((item) => item.value > 0);
  }, [chartView, sortedComplaints]);

  const insights = useMemo(() => {
    const items = [];
    if (sortedComplaints.length === 0) return items;
    const topCategory = categoryData[0];
    const topIssue = issueData[0];
    const peakHour = hourlyData[0];
    const topRoom = roomData[0];
    if (topCategory) {
      items.push(`${topCategory.label} generates ${Math.round((topCategory.value / sortedComplaints.length) * 100)}% of all complaints.`);
    }
    if (topIssue) {
      items.push(`${topIssue.label} was reported ${topIssue.value} times in the current view.`);
    }
    if (peakHour) {
      items.push(`Most complaints cluster around ${peakHour.label}.`);
    }
    if (topRoom) {
      items.push(`${topRoom.label} has the highest complaint volume in this selection.`);
    }
    if (stats.averageResolutionTime) {
      items.push(`Average resolution time is ${formatDuration(stats.averageResolutionTime)}.`);
    }
    return items;
  }, [categoryData, hourlyData, issueData, roomData, sortedComplaints.length, stats.averageResolutionTime]);

  const exportCsv = () => {
    const rows = [
      ['Guest Name', 'Room Number', 'Category', 'Subcategory', 'Priority', 'Status', 'Created At', 'Description'],
      ...sortedComplaints.map((complaint) => [
        complaint.fullName || '',
        complaint.roomNumber || '',
        complaint.category || '',
        complaint.subcategory || '',
        complaint.priority || '',
        normalizeStatus(complaint.status),
        complaint.createdAt || '',
        (complaint.description || complaint.complaintText || '').replace(/\n/g, ' '),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'complaints.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Complaints intelligence</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Hotel complaint command center</h2>
            <p className="mt-2 text-sm text-slate-400">Track, prioritize, and resolve guest concerns with a premium operations view.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={exportCsv} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white">
              Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className="rounded-2xl border border-emerald-600/40 bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-600/20">
              Export PDF
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500" placeholder="Guest, room, issue" />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500">
              <option value="all">All statuses</option>
              {complaintStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Priority</span>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500">
              <option value="all">All priorities</option>
              {complaintPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500">
              <option value="all">All categories</option>
              {complaintCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">From</span>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">To</span>
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Trend view</span>
            <select value={chartView} onChange={(event) => setChartView(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none focus:border-emerald-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total complaints" value={stats.total} tone="text-white" />
        <StatCard label="Open complaints" value={stats.open} tone="text-sky-300" />
        <StatCard label="Pending" value={stats.pending} tone="text-amber-300" />
        <StatCard label="In progress" value={stats.inProgress} tone="text-blue-300" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resolved" value={stats.resolved} tone="text-emerald-300" />
        <StatCard label="Average resolution time" value={formatDuration(stats.averageResolutionTime)} tone="text-violet-300" />
        <StatCard label="Resolution rate" value={`${stats.resolutionRate}%`} tone="text-emerald-300" />
        <StatCard label="High priority" value={stats.highPriority} tone="text-orange-300" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Complaints by category</h3>
            <span className="text-sm text-slate-400">Bar chart</span>
          </div>
          <BarChart data={categoryData} color="#34d399" />
        </div>
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Complaints by priority</h3>
            <span className="text-sm text-slate-400">Pie chart</span>
          </div>
          <DonutChart data={priorityData} total={stats.total} />
        </div>
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Complaints by status</h3>
            <span className="text-sm text-slate-400">Donut chart</span>
          </div>
          <DonutChart data={statusData} total={stats.total} />
        </div>
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Complaints over time</h3>
            <span className="text-sm text-slate-400">Trend line</span>
          </div>
          <AreaChart data={timeSeries} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Most reported issues</h3>
            <span className="text-sm text-slate-400">Horizontal bars</span>
          </div>
          <BarChart data={issueData} color="#38bdf8" />
        </div>
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Complaints by department</h3>
            <span className="text-sm text-slate-400">Insights</span>
          </div>
          <BarChart data={departmentData} color="#f59e0b" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Complaints by floor</h3>
            <span className="text-sm text-slate-400">Operational focus</span>
          </div>
          <BarChart data={floorData} color="#fb7185" />
        </div>
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Complaints by room</h3>
            <span className="text-sm text-slate-400">Top issues</span>
          </div>
          <BarChart data={roomData} color="#a78bfa" />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Smart insights</h3>
          <span className="text-sm text-slate-400">Automated signals</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insights.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">No insights available yet.</div>
          ) : (
            insights.map((insight) => (
              <div key={insight} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                {insight}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Complaint queue</h3>
          <span className="text-sm text-slate-400">{sortedComplaints.length} visible</span>
        </div>
        <div className="space-y-4">
          {sortedComplaints.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-400">No complaints match the current filters.</div>
          ) : (
            sortedComplaints.map((complaint) => {
              const normalizedStatus = normalizeStatus(complaint.status);
              const priority = String(complaint.priority || 'medium').toLowerCase();
              return (
                <div key={complaint._id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold text-white">{complaint.fullName || 'Guest'}</h4>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(normalizedStatus)}`}>
                          {statusLabels[normalizedStatus]}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadgeClasses(priority)}`}>
                          {priorityLabels[priority] || 'Medium'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                        <span>Room {complaint.roomNumber || '—'}</span>
                        <span>•</span>
                        <span>{complaint.category || 'Other'}</span>
                        <span>•</span>
                        <span>{complaint.subcategory || 'Unspecified'}</span>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{complaint.description || complaint.complaintText || 'No description provided.'}</p>
                      <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-500">
                        <span>Created {formatComplaintDate(complaint.createdAt)}</span>
                        <span>Response {complaint.responseTime ? formatComplaintDate(complaint.responseTime) : 'Pending'}</span>
                        <span>Resolution {complaint.resolutionTime ? formatComplaintDate(complaint.resolutionTime) : 'Pending'}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-col">
                      {normalizedStatus !== 'in-progress' && (
                        <button type="button" onClick={() => onUpdateStatus(complaint._id, 'in-progress')} className="rounded-2xl bg-blue-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                          Mark in progress
                        </button>
                      )}
                      {normalizedStatus !== 'resolved' && normalizedStatus !== 'closed' && (
                        <button type="button" onClick={() => onUpdateStatus(complaint._id, 'resolved')} className="rounded-2xl bg-emerald-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
                          Mark resolved
                        </button>
                      )}
                      {normalizedStatus !== 'closed' && (
                        <button type="button" onClick={() => onUpdateStatus(complaint._id, 'closed')} className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600">
                          Close case
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
