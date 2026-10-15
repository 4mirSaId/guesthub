'use client';

import { useMemo, useState } from 'react';

const SERVICE_CATEGORIES = {
  housekeeping: ['Extra towels', 'Extra pillows', 'Extra blanket', 'Room cleaning', 'Deep cleaning', 'Bed sheet replacement', 'Toiletries refill', 'Toilet paper refill', 'Trash removal', 'Laundry pickup'],
  food: ['Room service', 'Breakfast request', 'Drinks', 'Ice bucket', 'Coffee', 'Tea', 'Snacks'],
  maintenance: ['Air conditioning check', 'TV assistance', 'Wi-Fi assistance', 'Electrical issue', 'Plumbing assistance', 'Light bulb replacement', 'Safe assistance', 'Mini fridge issue'],
  setup: ['Romantic room setup', 'Birthday decoration', 'Honeymoon setup', 'Baby crib', 'Extra bed', 'Workspace setup'],
  assistance: ['Wheelchair', 'Accessibility assistance', 'Medical assistance', 'Childcare information'],
  other: ['Custom request'],
};

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  accepted: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
  'in-progress': 'bg-violet-500/15 text-violet-200 border-violet-500/30',
  completed: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
};

const normalizeStatus = (status) => {
  const value = `${status || 'pending'}`.toLowerCase();
  if (value === 'done' || value === 'completed' || value === 'complete') return 'completed';
  if (value === 'in-progress' || value === 'in progress' || value === 'inprogress') return 'in-progress';
  if (value === 'accepted') return 'accepted';
  if (value === 'cancelled' || value === 'canceled') return 'cancelled';
  return 'pending';
};

const formatStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized.replace('-', ' ').replace(/(^\w|\s+\w)/g, (letter) => letter.toUpperCase());
};

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '—';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const getRequestId = (item, index) => {
  if (item?.requestId) return item.requestId;
  if (item?._id) return `SR-${String(item._id).slice(-6).toUpperCase()}`;
  return `SR-${String(index + 1).padStart(3, '0')}`;
};

const toMinutes = (start, end) => {
  if (!start || !end) return null;
  const diff = new Date(end) - new Date(start);
  return diff > 0 ? Math.round(diff / 60000) : null;
};

export default function ServiceRequestDashboard({ serviceRequests = [], updateServiceRequestStatus, serviceUpdating = {} }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const normalizedRequests = useMemo(() => {
    return (serviceRequests || []).map((item, index) => {
      const status = normalizeStatus(item.status);
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      const acceptedAt = item.acceptedAt ? new Date(item.acceptedAt) : null;
      const startedAt = item.startedAt ? new Date(item.startedAt) : null;
      const completedAt = item.completedAt ? new Date(item.completedAt) : null;
      const responseMinutes = toMinutes(createdAt, acceptedAt);
      const completionMinutes = toMinutes(createdAt, completedAt);
      const floor = item.floor || (item.roomNumber ? String(item.roomNumber).replace(/\D/g, '').slice(0, 2) : '—');
      return {
        ...item,
        index,
        id: getRequestId(item, index),
        status,
        createdAt,
        acceptedAt,
        startedAt,
        completedAt,
        responseMinutes,
        completionMinutes,
        floor,
        roomNumber: item.roomNumber || item.room || '—',
        category: item.category || 'other',
        service: item.service || item.type || 'Custom request',
        description: item.description || item.message || '',
        guestName: item.guestName || 'Guest',
      };
    });
  }, [serviceRequests]);

  const filteredRequests = useMemo(() => {
    const queryValue = query.trim().toLowerCase();
    return normalizedRequests.filter((request) => {
      const matchesQuery =
        !queryValue ||
        `${request.id} ${request.guestName} ${request.roomNumber} ${request.category} ${request.service} ${request.description}`
          .toLowerCase()
          .includes(queryValue);
      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesService = serviceFilter === 'all' || request.service === serviceFilter;
      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
      const matchesFloor = floorFilter === 'all' || request.floor === floorFilter;
      const matchesRoom = !roomFilter || `${request.roomNumber}`.toLowerCase().includes(roomFilter.toLowerCase());
      const matchesStart = !startDate || !request.createdAt || request.createdAt >= new Date(startDate);
      const matchesEnd = !endDate || !request.createdAt || request.createdAt <= new Date(`${endDate}T23:59:59`);
      return matchesQuery && matchesCategory && matchesStatus && matchesService && matchesPriority && matchesFloor && matchesRoom && matchesStart && matchesEnd;
    });
  }, [normalizedRequests, query, categoryFilter, statusFilter, serviceFilter, priorityFilter, floorFilter, roomFilter, startDate, endDate]);

  const sortedRequests = useMemo(() => {
    const next = [...filteredRequests];
    next.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'priority') return (Number(b.priority === 'high') - Number(a.priority === 'high')) || (new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return next;
  }, [filteredRequests, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
  const pagedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRequests.slice(start, start + pageSize);
  }, [sortedRequests, currentPage]);

  const metrics = useMemo(() => {
    const total = normalizedRequests.length;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const requestsToday = normalizedRequests.filter((request) => request.createdAt && request.createdAt >= todayStart).length;
    const active = normalizedRequests.filter((request) => ['pending', 'accepted', 'in-progress'].includes(request.status)).length;
    const completedToday = normalizedRequests.filter((request) => request.status === 'completed' && request.completedAt && request.completedAt >= todayStart).length;
    const pending = normalizedRequests.filter((request) => request.status === 'pending').length;
    const responseValues = normalizedRequests.map((request) => request.responseMinutes).filter((value) => value !== null);
    const completionValues = normalizedRequests.map((request) => request.completionMinutes).filter((value) => value !== null);
    const averageResponse = responseValues.length ? Math.round(responseValues.reduce((sum, value) => sum + value, 0) / responseValues.length) : null;
    const averageCompletion = completionValues.length ? Math.round(completionValues.reduce((sum, value) => sum + value, 0) / completionValues.length) : null;
    const occupiedRooms = new Set(normalizedRequests.map((request) => `${request.roomNumber}`).filter((room) => room && room !== '—')).size || 1;
    const requestsPerOccupiedRoom = total ? (total / occupiedRooms).toFixed(1) : '0.0';
    const serviceCounts = normalizedRequests.reduce((accumulator, request) => {
      accumulator[request.service] = (accumulator[request.service] || 0) + 1;
      return accumulator;
    }, {});
    const mostRequestedService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const repeatRequests = normalizedRequests.filter((request) => {
      const sameRoomService = normalizedRequests.filter((item) => item.roomNumber === request.roomNumber && item.service === request.service);
      return sameRoomService.length > 1;
    }).length;
    const followUps = normalizedRequests.filter((request) => request.status === 'pending' && request.createdAt && (now - request.createdAt) / 60000 > 120).length;
    return {
      total,
      requestsToday,
      active,
      completedToday,
      pending,
      averageResponse,
      averageCompletion,
      requestsPerOccupiedRoom,
      mostRequestedService,
      repeatRequests,
      followUps,
    };
  }, [normalizedRequests]);

  const categoryCounts = useMemo(() => {
    return Object.entries(normalizedRequests.reduce((accumulator, request) => {
      accumulator[request.category] = (accumulator[request.category] || 0) + 1;
      return accumulator;
    }, {})).sort((a, b) => b[1] - a[1]);
  }, [normalizedRequests]);

  const statusCounts = useMemo(() => {
    return Object.entries(normalizedRequests.reduce((accumulator, request) => {
      accumulator[request.status] = (accumulator[request.status] || 0) + 1;
      return accumulator;
    }, {}));
  }, [normalizedRequests]);

  const dailyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = Array(7).fill(0);
    normalizedRequests.forEach((request) => {
      if (!request.createdAt) return;
      const dayIndex = (request.createdAt.getDay() + 6) % 7;
      counts[dayIndex] += 1;
    });
    return days.map((day, index) => ({ day, count: counts[index] }));
  }, [normalizedRequests]);

  const hourlyHeatmap = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
    normalizedRequests.forEach((request) => {
      if (!request.createdAt) return;
      hours[request.createdAt.getHours()].count += 1;
    });
    return hours;
  }, [normalizedRequests]);

  const serviceCounts = useMemo(() => {
    return Object.entries(normalizedRequests.reduce((accumulator, request) => {
      accumulator[request.service] = (accumulator[request.service] || 0) + 1;
      return accumulator;
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [normalizedRequests]);

  const completionByCategory = useMemo(() => {
    const groups = normalizedRequests.reduce((accumulator, request) => {
      if (!accumulator[request.category]) accumulator[request.category] = [];
      accumulator[request.category].push(request.completionMinutes);
      return accumulator;
    }, {});
    return Object.entries(groups).map(([name, values]) => {
      const valid = values.filter((value) => value !== null);
      const average = valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : 0;
      return { name, average };
    }).sort((a, b) => b.average - a.average);
  }, [normalizedRequests]);

  const insights = useMemo(() => {
    const items = [];
    if (categoryCounts.length) {
      const topCategory = categoryCounts[0];
      items.push({
        title: `${topCategory[0]} dominates requests`,
        detail: `${topCategory[1]} requests currently in this category.`,
        trend: '↑',
        severity: 'Info',
        action: 'Review staffing and inventory for this area.',
      });
    }
    if (metrics.followUps > 0) {
      items.push({
        title: 'Follow-up demand is rising',
        detail: `${metrics.followUps} requests have been pending beyond the target response window.`,
        trend: '⚠',
        severity: 'Warning',
        action: 'Escalate older requests to the next available team lead.',
      });
    }
    if (metrics.mostRequestedService !== '—') {
      items.push({
        title: `${metrics.mostRequestedService} is trending`,
        detail: 'This service is currently the most requested across the property.',
        trend: '↑',
        severity: 'Info',
        action: 'Stock or prepare extra support for this service.',
      });
    }
    if (metrics.averageCompletion && metrics.averageCompletion > 120) {
      items.push({
        title: 'Completion time needs attention',
        detail: `Average completion is ${formatDuration(metrics.averageCompletion)}.`,
        trend: '↓',
        severity: 'Critical',
        action: 'Review workflows and team capacity for slower tasks.',
      });
    }
    return items.slice(0, 4);
  }, [categoryCounts, metrics]);

  const exportData = useMemo(() => {
    return sortedRequests.map((request) => ({
      requestId: request.id,
      guestName: request.guestName,
      roomNumber: request.roomNumber,
      category: request.category,
      service: request.service,
      status: formatStatus(request.status),
      description: request.description,
      createdAt: request.createdAt?.toISOString() || '',
      acceptedAt: request.acceptedAt?.toISOString() || '',
      startedAt: request.startedAt?.toISOString() || '',
      completedAt: request.completedAt?.toISOString() || '',
      completionTime: request.completionMinutes ? formatDuration(request.completionMinutes) : '',
    }));
  }, [sortedRequests]);

  const handleExport = (type) => {
    if (type === 'csv') {
      const headers = ['requestId', 'guestName', 'roomNumber', 'category', 'service', 'status', 'description', 'createdAt', 'acceptedAt', 'startedAt', 'completedAt', 'completionTime'];
      const rows = exportData.map((row) => headers.map((header) => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'service-requests.csv';
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    }
    if (type === 'excel') {
      const csv = exportData.map((row) => Object.values(row).join('\t')).join('\n');
      const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'service-requests.xls';
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    }
    window.print();
  };

  const resetFilters = () => {
    setQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setServiceFilter('all');
    setPriorityFilter('all');
    setFloorFilter('all');
    setRoomFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Hotel Operations Console</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">Service Requests Command Center</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Track arrivals, staffing, completion times, and service trends in one premium workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handleExport('csv')} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white">Export CSV</button>
            <button type="button" onClick={() => handleExport('excel')} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-500 hover:text-white">Export Excel</button>
            <button type="button" onClick={() => handleExport('pdf')} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-violet-500 hover:text-white">Export PDF</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Total requests</p>
            <p className="mt-2 text-3xl font-semibold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Requests today</p>
            <p className="mt-2 text-3xl font-semibold text-white">{metrics.requestsToday}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Active requests</p>
            <p className="mt-2 text-3xl font-semibold text-amber-300">{metrics.active}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Completed today</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{metrics.completedToday}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Pending requests</p>
          <p className="mt-2 text-2xl font-semibold text-white">{metrics.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Average response</p>
          <p className="mt-2 text-2xl font-semibold text-sky-300">{metrics.averageResponse ? formatDuration(metrics.averageResponse) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Average completion</p>
          <p className="mt-2 text-2xl font-semibold text-violet-300">{metrics.averageCompletion ? formatDuration(metrics.averageCompletion) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Requests per occupied room</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{metrics.requestsPerOccupiedRoom}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-semibold text-white">Requests by category</h4>
              <p className="mt-1 text-sm text-slate-400">Distribution across service teams.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {categoryCounts.length ? categoryCounts.map(([name, count]) => {
              const percentage = Math.round((count / Math.max(1, metrics.total)) * 100);
              return (
                <div key={name}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{name}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800">
                    <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm text-slate-400">No categories yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h4 className="text-xl font-semibold text-white">Requests by status</h4>
          <div className="mt-6 flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#10b981 0deg, #10b981 ${Math.max(1, (statusCounts.find(([name]) => name === 'completed')?.[1] || 0) / Math.max(1, metrics.total) * 360)}deg, #38bdf8 ${Math.max(1, (statusCounts.find(([name]) => name === 'completed')?.[1] || 0) / Math.max(1, metrics.total) * 360)}deg, #38bdf8 ${Math.max(1, ((statusCounts.find(([name]) => name === 'accepted')?.[1] || 0) + (statusCounts.find(([name]) => name === 'completed')?.[1] || 0)) / Math.max(1, metrics.total) * 360)}deg, #f59e0b ${Math.max(1, ((statusCounts.find(([name]) => name === 'accepted')?.[1] || 0) + (statusCounts.find(([name]) => name === 'completed')?.[1] || 0)) / Math.max(1, metrics.total) * 360)}deg, #f43f5e ${Math.max(1, ((statusCounts.find(([name]) => name === 'cancelled')?.[1] || 0) + (statusCounts.find(([name]) => name === 'accepted')?.[1] || 0) + (statusCounts.find(([name]) => name === 'completed')?.[1] || 0)) / Math.max(1, metrics.total) * 360)}deg, #475569 0deg)` }}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-center text-sm font-semibold text-white">{metrics.total}<br />requests</div>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              {statusCounts.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${status === 'completed' ? 'bg-emerald-500' : status === 'accepted' ? 'bg-sky-500' : status === 'in-progress' ? 'bg-violet-500' : status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />{formatStatus(status)}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h4 className="text-xl font-semibold text-white">Daily requests</h4>
          <div className="mt-6 flex h-48 items-end gap-3">
            {dailyTrend.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end rounded-2xl bg-slate-800 p-1">
                  <div className="w-full rounded-xl bg-gradient-to-t from-sky-500 to-emerald-400" style={{ height: `${Math.max(12, (item.count / Math.max(1, metrics.total)) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h4 className="text-xl font-semibold text-white">Peak request hours</h4>
          <div className="mt-6 grid grid-cols-6 gap-2">
            {hourlyHeatmap.map((item) => {
              const intensity = Math.min(100, Math.round((item.count / Math.max(1, metrics.total)) * 100));
              return (
                <div key={item.hour} className="rounded-xl border border-slate-800 p-2 text-center text-[10px] text-slate-300" style={{ backgroundColor: `rgba(34, 211, 238, ${0.15 + intensity / 100})` }}>
                  <div>{item.hour}</div>
                  <div className="mt-1 font-semibold">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h4 className="text-xl font-semibold text-white">Most requested services</h4>
          <div className="mt-6 space-y-4">
            {serviceCounts.length ? serviceCounts.map(([name, count]) => (
              <div key={name}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{name}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${Math.max(12, (count / Math.max(1, metrics.total)) * 100)}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-slate-400">No services yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h4 className="text-xl font-semibold text-white">Average completion time by category</h4>
          <div className="mt-6 space-y-4">
            {completionByCategory.length ? completionByCategory.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{item.name}</span>
                  <span>{formatDuration(item.average)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500" style={{ width: `${Math.min(100, item.average / 2)}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-slate-400">No data yet.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h4 className="text-xl font-semibold text-white">Operational insights</h4>
            <p className="mt-1 text-sm text-slate-400">Automated recommendations based on current request patterns.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {insights.map((insight) => (
            <div key={insight.title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{insight.title}</p>
                  <p className="mt-2 text-sm text-slate-400">{insight.detail}</p>
                  <p className="mt-3 text-sm text-slate-300">Suggested action: {insight.action}</p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">{insight.severity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h4 className="text-xl font-semibold text-white">Request queue</h4>
            <p className="mt-1 text-sm text-slate-400">Search, sort, filter, and manage service delivery.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetFilters} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white">Reset</button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-4">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} placeholder="Search requests" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100" />
          <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100">
            <option value="all">All categories</option>
            {Object.keys(SERVICE_CATEGORIES).map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select value={serviceFilter} onChange={(event) => { setServiceFilter(event.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100">
            <option value="all">All services</option>
            {[...new Set(normalizedRequests.map((request) => request.service))].filter(Boolean).map((service) => <option key={service} value={service}>{service}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => { setPriorityFilter(event.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100">
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <input value={roomFilter} onChange={(event) => { setRoomFilter(event.target.value); setCurrentPage(1); }} placeholder="Room number" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100" />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100" />
          <input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setCurrentPage(1); }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100" />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
          <div className="hidden grid-cols-[0.8fr_1fr_0.7fr_0.9fr_1.2fr_0.8fr_0.9fr] gap-4 bg-slate-950/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 md:grid">
            <span>Request</span>
            <span>Guest</span>
            <span>Room</span>
            <span>Service</span>
            <span>Status</span>
            <span>Created</span>
            <span>Actions</span>
          </div>

          {pagedRequests.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No requests match the current filters.</div>
          ) : (
            pagedRequests.map((request) => (
              <div key={request.id} className="border-t border-slate-800 bg-slate-900/70 px-4 py-4 md:grid md:grid-cols-[0.8fr_1fr_0.7fr_0.9fr_1.2fr_0.9fr_0.9fr] md:items-center md:gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{request.id}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{request.guestName}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.description?.slice(0, 70) || 'No description yet'}</p>
                </div>
                <div className="text-sm text-slate-300">{request.roomNumber}</div>
                <div className="text-sm text-slate-300">{request.service}</div>
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[request.status] || STATUS_STYLES.pending}`}>
                    {formatStatus(request.status)}
                  </span>
                </div>
                <div className="text-sm text-slate-400">{request.createdAt ? request.createdAt.toLocaleString() : '—'}</div>
                <div className="flex flex-wrap gap-2">
                  {request.status !== 'completed' && request.status !== 'cancelled' && (
                    <>
                      {request.status !== 'in-progress' && (
                        <button type="button" onClick={() => updateServiceRequestStatus(request._id, 'accepted')} disabled={serviceUpdating[request._id]} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60">Accept</button>
                      )}
                      {request.status !== 'in-progress' && (
                        <button type="button" onClick={() => updateServiceRequestStatus(request._id, 'in-progress')} disabled={serviceUpdating[request._id]} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60">Start</button>
                      )}
                      <button type="button" onClick={() => updateServiceRequestStatus(request._id, 'completed')} disabled={serviceUpdating[request._id]} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60">Complete</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Showing {pagedRequests.length} of {sortedRequests.length} requests</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-50">Previous</button>
            <button type="button" onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
