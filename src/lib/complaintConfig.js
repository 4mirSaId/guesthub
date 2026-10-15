export const complaintCategories = [
  {
    id: 'housekeeping',
    label: 'Housekeeping',
    department: 'Housekeeping',
    issues: [
      'Room not cleaned',
      'Dirty bathroom',
      'Dirty bedsheets',
      'Dirty towels',
      'Bad smell',
      'Missing amenities',
      'Insects / pests',
      'Trash not removed',
    ],
  },
  {
    id: 'maintenance',
    label: 'Room Equipment & Maintenance',
    department: 'Maintenance',
    issues: [
      'Air conditioning not working',
      'Heating issue',
      'Water leak',
      'No hot water',
      'Low water pressure',
      'Broken furniture',
      'Broken TV',
      'Broken safe',
      'Broken minibar',
      'Power outage',
      'Electrical issue',
    ],
  },
  {
    id: 'it',
    label: 'Internet & Technology',
    department: 'IT',
    issues: ['Wi-Fi not working', 'Slow Wi-Fi', 'TV issue', 'Telephone issue', 'Mobile App issue'],
  },
  {
    id: 'fnb',
    label: 'Food & Beverage',
    department: 'Restaurant',
    issues: [
      'Food quality',
      'Wrong order',
      'Food temperature',
      'Long waiting time',
      'Breakfast issue',
      'Restaurant cleanliness',
      'Room service problem',
    ],
  },
  {
    id: 'service',
    label: 'Staff & Service',
    department: 'Reception',
    issues: ['Reception issue', 'Housekeeping staff', 'Restaurant staff', 'Concierge', 'Slow service', 'Unfriendly staff', 'Poor communication'],
  },
  {
    id: 'noise',
    label: 'Noise',
    department: 'Security',
    issues: ['Neighbor noise', 'Hallway noise', 'Outside traffic', 'Construction', 'Loud music', 'Air conditioning noise'],
  },
  {
    id: 'comfort',
    label: 'Room Comfort',
    department: 'Housekeeping',
    issues: ['Bed uncomfortable', 'Pillow issue', 'Room too hot', 'Room too cold', 'Humidity', 'Bad smell', 'Poor lighting'],
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    department: 'Maintenance',
    issues: ['Toilet issue', 'Shower issue', 'Sink issue', 'Drain blocked', 'No toiletries', 'No towels', 'Mold'],
  },
  {
    id: 'safety',
    label: 'Safety & Security',
    department: 'Security',
    issues: ['Lost key card', 'Door lock issue', 'Theft', 'Suspicious person', 'Emergency'],
  },
  {
    id: 'parking',
    label: 'Parking & Transportation',
    department: 'Reception',
    issues: ['Parking unavailable', 'Shuttle issue', 'Taxi issue', 'Valet delay'],
  },
  {
    id: 'facilities',
    label: 'Hotel Facilities',
    department: 'Maintenance',
    issues: ['Pool', 'Gym', 'Spa', 'Elevator', 'Laundry', 'Business Center'],
  },
  {
    id: 'environment',
    label: 'Environment',
    department: 'Housekeeping',
    issues: ['Smoking smell', 'Public area cleanliness', 'Outdoor maintenance'],
  },
  {
    id: 'special',
    label: 'Special Requests',
    department: 'Reception',
    issues: ['Accessibility', 'Baby equipment', 'Pet issue', 'Extra bed'],
  },
  {
    id: 'other',
    label: 'Other',
    department: 'Reception',
    issues: [],
  },
];

export const complaintStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
export const complaintPriorities = ['low', 'medium', 'high', 'urgent'];

export const statusLabels = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function getCategoryMeta(categoryId) {
  return complaintCategories.find((item) => item.id === categoryId) || complaintCategories[complaintCategories.length - 1];
}

export function getDepartmentForCategory(categoryId) {
  return getCategoryMeta(categoryId)?.department || 'Reception';
}

export function normalizeStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'reviewed' || normalized === 'in progress' || normalized === 'in-progress') {
    return 'in-progress';
  }
  if (normalized === 'resolved') return 'resolved';
  if (normalized === 'closed') return 'closed';
  return 'pending';
}

export function getStatusBadgeClasses(status) {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'in-progress':
      return 'bg-blue-600/20 text-blue-200 border border-blue-500/30';
    case 'resolved':
      return 'bg-emerald-600/20 text-emerald-200 border border-emerald-500/30';
    case 'closed':
      return 'bg-slate-600/30 text-slate-200 border border-slate-500/30';
    default:
      return 'bg-amber-600/20 text-amber-200 border border-amber-500/30';
  }
}

export function getPriorityBadgeClasses(priority) {
  switch (String(priority || '').toLowerCase()) {
    case 'urgent':
      return 'bg-rose-600/20 text-rose-200 border border-rose-500/30';
    case 'high':
      return 'bg-orange-600/20 text-orange-200 border border-orange-500/30';
    case 'medium':
      return 'bg-sky-600/20 text-sky-200 border border-sky-500/30';
    default:
      return 'bg-emerald-600/20 text-emerald-200 border border-emerald-500/30';
  }
}

export function formatDuration(milliseconds) {
  if (!milliseconds || Number.isNaN(milliseconds)) return '—';
  const totalMinutes = Math.max(0, Math.round(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatComplaintDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}
