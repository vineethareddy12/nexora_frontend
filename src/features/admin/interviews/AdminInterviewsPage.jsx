import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Video, 
  MapPin, 
  CheckCircle, 
  CalendarX, 
  Search, 
  RotateCcw, 
  X, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Clock,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { interviewsApi } from '../../interviews/interviewsApi';
import { adminReviewApi } from '../review/adminReviewApi';
import { useToast } from '../../../components/toast/ToastContext';

export const formatTime12Hr = (timeStr) => {
  if (!timeStr) return '';
  if (typeof timeStr !== 'string') return String(timeStr);
  const trimmed = timeStr.trim();
  if (trimmed.toLowerCase().includes('am') || trimmed.toLowerCase().includes('pm')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');
  if (isNaN(hours)) return trimmed;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
};

export const calculateEndTime = (startTime, durationMinutes = 45) => {
  if (!startTime || !startTime.includes(':')) return '';
  const [hours, mins] = startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(mins)) return '';
  const endTotalMins = hours * 60 + mins + parseInt(durationMinutes || 45, 10);
  const endHours = Math.floor(endTotalMins / 60) % 24;
  const endM = endTotalMins % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getNextSuggestedTimeString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 25);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(Math.ceil(d.getMinutes() / 15) * 15 % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const normalizeDateToIso = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split(/[-/]/);
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return trimmed;
};

export const getMeetingLifecycle = (item) => {
  if (!item) return { isConcluded: false, isLive: false, isCompleted: false, isCancelled: false, isJoinable: false, isRescheduled: false };

  const isRescheduled = Array.isArray(item.scheduleHistories) && item.scheduleHistories.length > 0;

  if (item.status === 'COMPLETED') {
    return {
      status: 'COMPLETED',
      isCompleted: true,
      isCancelled: false,
      isConcluded: true,
      isLive: false,
      isJoinable: false,
      isRescheduled,
      label: 'Completed',
      badgeClass: 'badge-success',
      description: 'Interview concluded & feedback recorded'
    };
  }

  if (item.status === 'CANCELLED') {
    return {
      status: 'CANCELLED',
      isCompleted: false,
      isCancelled: true,
      isConcluded: true,
      isLive: false,
      isJoinable: false,
      isRescheduled,
      label: 'Cancelled',
      badgeClass: 'badge-danger',
      description: 'Interview was cancelled'
    };
  }

  try {
    const rawDate = item.interviewDate;
    if (!rawDate) return { isConcluded: false, isLive: false, isJoinable: true, isRescheduled, label: 'Scheduled' };

    let year, month, day;
    if (typeof rawDate === 'string' && rawDate.includes('T')) {
      const d = new Date(rawDate);
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    } else if (typeof rawDate === 'string' && rawDate.includes('-')) {
      const parts = rawDate.split('-').map(Number);
      if (parts[0] > 1000) {
        year = parts[0];
        month = parts[1] - 1;
        day = parts[2];
      } else {
        day = parts[0];
        month = parts[1] - 1;
        year = parts[2];
      }
    } else {
      const d = new Date(rawDate);
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    }

    const parseTime = (tStr) => {
      if (!tStr) return { h: 10, m: 0 };
      const str = String(tStr).trim();
      const isPM = str.toLowerCase().includes('pm');
      const isAM = str.toLowerCase().includes('am');
      const clean = str.replace(/(am|pm)/i, '').trim();
      const [h, m] = clean.split(':').map(Number);
      let hours = isNaN(h) ? 10 : h;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      const minutes = isNaN(m) ? 0 : m;
      return { h: hours, m: minutes };
    };

    const startObj = parseTime(item.startTime || item.interviewTime);
    const endObj = item.endTime ? parseTime(item.endTime) : { h: startObj.h, m: startObj.m + 45 };

    const startDateTime = new Date(year, month, day, startObj.h, startObj.m, 0);
    const endDateTime = new Date(year, month, day, endObj.h, endObj.m, 0);

    const now = new Date();
    // 15-minute grace period after scheduled end time
    const expiredCutoff = new Date(endDateTime.getTime() + 15 * 60 * 1000);
    // 15-minute early window
    const earlyJoinWindow = new Date(startDateTime.getTime() - 15 * 60 * 1000);

    if (now > expiredCutoff) {
      return {
        status: 'SCHEDULED',
        isCompleted: false,
        isCancelled: false,
        isConcluded: true,
        isLive: false,
        isJoinable: false,
        isRescheduled,
        label: 'Window Concluded',
        badgeClass: 'badge-secondary',
        description: 'Meeting time has ended (Feedback Pending)'
      };
    }

    if (now >= earlyJoinWindow && now <= expiredCutoff) {
      return {
        status: 'SCHEDULED',
        isCompleted: false,
        isCancelled: false,
        isConcluded: false,
        isLive: true,
        isJoinable: true,
        isRescheduled,
        label: 'Live Now',
        badgeClass: 'badge-success',
        description: 'Meeting is active now'
      };
    }

    return {
      status: 'SCHEDULED',
      isCompleted: false,
      isCancelled: false,
      isConcluded: false,
      isLive: false,
      isJoinable: true,
      isRescheduled,
      label: 'Scheduled',
      badgeClass: 'badge-primary',
      description: 'Upcoming scheduled interview'
    };
  } catch (err) {
    return { isConcluded: false, isLive: false, isJoinable: true, isRescheduled, label: 'Scheduled' };
  }
};

export default function AdminInterviewsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roundFilter, setRoundFilter] = useState('ALL');

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Field-level error validation state
  const [formErrors, setFormErrors] = useState({});
  const [rescheduleErrors, setRescheduleErrors] = useState({});

  // Eligible Applications for scheduling
  const [eligibleApplications, setEligibleApplications] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    round: 'TECHNICAL',
    mode: 'ONLINE',
    interviewDate: getTodayDateString(),
    interviewTime: getNextSuggestedTimeString(),
    durationMinutes: 45,
    meetingLink: '',
    location: '',
    interviewerNames: '',
    instructions: '',
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    interviewDate: getTodayDateString(),
    interviewTime: getNextSuggestedTimeString(),
    reason: '',
  });

  const [cancelForm, setCancelForm] = useState({
    reason: '',
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 4,
    recommendation: 'HIRE',
    strengths: '',
    areasOfImprovement: '',
    notes: '',
  });

  const loadData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [metricsData, listData] = await Promise.all([
        interviewsApi.getAdminDashboardMetrics(),
        interviewsApi.getAdminInterviews({
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter,
          search,
        }),
      ]);
      setMetrics(metricsData || { total: 0, scheduled: 0, completed: 0, cancelled: 0 });
      let items = Array.isArray(listData?.interviews)
        ? listData.interviews
        : Array.isArray(listData?.data?.interviews)
        ? listData.data.interviews
        : Array.isArray(listData?.data)
        ? listData.data
        : Array.isArray(listData)
        ? listData
        : [];

      if (roundFilter !== 'ALL') {
        items = items.filter((item) => item.round === roundFilter);
      }

      setInterviews(items);
      const pag = listData?.pagination || listData?.data?.pagination;
      if (pag) setPagination(pag);
    } catch (err) {
      console.error('Failed to load interviews:', err);
      if (!isSilent) toast?.error(err.message || 'Failed to load interviews');
      setInterviews([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);

    // Live auto-polling every 15s (silent, no annoying spinner)
    const pollTimer = setInterval(() => {
      loadData(true);
    }, 15000);

    const handleFocus = () => loadData(true);
    window.addEventListener('focus', handleFocus);

    const handleDataUpdated = () => loadData(true);
    window.addEventListener('nexora:data-updated', handleDataUpdated);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('nexora:data-updated', handleDataUpdated);
    };
  }, [pagination.page, statusFilter, roundFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadData();
  };

  const handleKpiCardClick = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openScheduleModal = async () => {
    try {
      setFormErrors({});
      const today = getTodayDateString();
      const suggestedTime = getNextSuggestedTimeString();
      setScheduleForm({
        applicationId: '',
        round: 'TECHNICAL',
        mode: 'ONLINE',
        interviewDate: today,
        interviewTime: suggestedTime,
        durationMinutes: 45,
        meetingLink: '',
        location: '',
        interviewerNames: '',
        instructions: '',
      });
      // Fetch both SHORTLISTED candidates and candidates with existing interview progress (for Round 2, Round 3, etc.)
      const apps = await adminReviewApi.getApplications({ limit: 100 });
      const candidates = (apps.applications || []).filter((a) =>
        ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'UNDER_REVIEW', 'SELECTED'].includes(a.status)
      );
      setEligibleApplications(candidates);
      setScheduleModalOpen(true);
    } catch (err) {
      toast?.error('Failed to fetch eligible applications: ' + err.message);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!scheduleForm.applicationId) {
      errors.applicationId = 'Candidate selection is mandatory.';
    }

    if (!scheduleForm.round) {
      errors.round = 'Interview round is mandatory.';
    }

    const safeDate = normalizeDateToIso(scheduleForm.interviewDate);
    const todayStr = getTodayDateString();
    const nowTimeStr = getCurrentTimeString();

    if (!safeDate) {
      errors.interviewDate = 'Interview date is mandatory.';
    } else if (safeDate < todayStr) {
      errors.interviewDate = 'Interview date cannot be in the past.';
    }

    if (!scheduleForm.interviewTime) {
      errors.interviewTime = 'Interview start time is mandatory.';
    } else if (safeDate === todayStr && scheduleForm.interviewTime < nowTimeStr) {
      errors.interviewTime = `Cannot schedule in the past. Current time is ${formatTime12Hr(nowTimeStr)}. Please select a future time.`;
    }

    if (scheduleForm.mode === 'ONLINE' && !scheduleForm.meetingLink?.trim()) {
      errors.meetingLink = 'Meeting URL (Google Meet / Zoom) is mandatory for online interviews.';
    }

    if (scheduleForm.mode === 'OFFLINE' && !scheduleForm.location?.trim()) {
      errors.location = 'Office address and room is mandatory for in-person interviews.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast?.error('Please complete all mandatory fields with valid future timings.');
      return;
    }

    setFormErrors({});

    try {
      setSubmitting(true);
      const meetingLinkOrLocation =
        scheduleForm.mode === 'ONLINE'
          ? scheduleForm.meetingLink.trim()
          : scheduleForm.location.trim();

      // Calculate endTime from startTime + duration
      const endTime = calculateEndTime(scheduleForm.interviewTime, scheduleForm.durationMinutes) || '10:45';

      const payload = {
        applicationId: scheduleForm.applicationId,
        round: scheduleForm.round || 'TECHNICAL',
        mode: scheduleForm.mode || 'ONLINE',
        interviewDate: safeDate,
        startTime: scheduleForm.interviewTime,
        endTime,
        meetingLinkOrLocation,
        interviewerName: scheduleForm.interviewerNames?.trim() || undefined,
        instructions: scheduleForm.instructions?.trim() || undefined,
      };

      await interviewsApi.scheduleInterview(payload);
      toast?.success(`Interview scheduled successfully for ${formatTime12Hr(scheduleForm.interviewTime)} – ${formatTime12Hr(endTime)}`);
      setScheduleModalOpen(false);
      loadData();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      console.error('Schedule interview error:', err);
      toast?.error(err.message || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;

    const errors = {};
    const safeDate = normalizeDateToIso(rescheduleForm.interviewDate);
    const todayStr = getTodayDateString();
    const nowTimeStr = getCurrentTimeString();

    if (!safeDate) {
      errors.interviewDate = 'New interview date is mandatory.';
    } else if (safeDate < todayStr) {
      errors.interviewDate = 'Date cannot be in the past.';
    }

    if (!rescheduleForm.interviewTime) {
      errors.interviewTime = 'New start time is mandatory.';
    } else if (safeDate === todayStr && rescheduleForm.interviewTime < nowTimeStr) {
      errors.interviewTime = `Cannot reschedule to past time. Current time is ${formatTime12Hr(nowTimeStr)}.`;
    }

    if (!rescheduleForm.reason?.trim()) {
      errors.reason = 'Reason for rescheduling is mandatory.';
    }

    if (Object.keys(errors).length > 0) {
      setRescheduleErrors(errors);
      toast?.error('Please complete all mandatory fields with valid timings.');
      return;
    }

    setRescheduleErrors({});

    try {
      setSubmitting(true);
      const endTime = calculateEndTime(rescheduleForm.interviewTime, 45) || '10:45';

      await interviewsApi.rescheduleInterview(selectedInterview.id, {
        interviewDate: safeDate,
        startTime: rescheduleForm.interviewTime,
        endTime,
        reason: rescheduleForm.reason.trim(),
      });
      toast?.success(`Interview rescheduled successfully for ${formatTime12Hr(rescheduleForm.interviewTime)} – ${formatTime12Hr(endTime)}`);
      setRescheduleModalOpen(false);
      loadData();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      toast?.error(err.message || 'Failed to reschedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setSubmitting(true);
      await interviewsApi.cancelInterview(selectedInterview.id, {
        reason: cancelForm.reason,
      });
      toast?.success('Interview cancelled');
      setCancelModalOpen(false);
      loadData();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      toast?.error(err.message || 'Failed to cancel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setSubmitting(true);
      const rating = parseInt(feedbackForm.rating);
      await interviewsApi.addFeedback(selectedInterview.id, {
        technicalRating: rating,
        communicationRating: rating,
        problemSolvingRating: rating,
        strengths: feedbackForm.strengths || undefined,
        areasForImprovement: feedbackForm.areasOfImprovement || undefined,
        overallFeedback: feedbackForm.notes || 'Candidate demonstrated strong technical and architectural competence.',
        recommendation:
          feedbackForm.recommendation === 'HIRE'
            ? 'STRONG_HIRE'
            : feedbackForm.recommendation === 'NEXT_ROUND'
            ? 'RECOMMENDED'
            : 'NOT_RECOMMENDED',
      });
      toast?.success('Feedback recorded successfully');
      setFeedbackModalOpen(false);
      loadData();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      toast?.error(err.message || 'Failed to record feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Interview Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Schedule interview rounds, update meeting coordinates, and store candidate evaluations.
          </p>
        </div>

        <button
          type="button"
          onClick={openScheduleModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          onClick={() => handleKpiCardClick('ALL')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to view all interviews"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'ALL' ? '2px solid #2563EB' : '1px solid #BFDBFE',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'ALL' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'ALL' ? '0 8px 20px -4px rgba(37, 99, 235, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Total Interviews</span>
            {statusFilter === 'ALL' && <span style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>{metrics.total || 0}</div>
        </div>

        <div
          onClick={() => handleKpiCardClick('SCHEDULED')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter scheduled interviews"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'SCHEDULED' ? '2px solid #7C3AED' : '1px solid #DDD6FE',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'SCHEDULED' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'SCHEDULED' ? '0 8px 20px -4px rgba(124, 58, 237, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#7C3AED', textTransform: 'uppercase', fontWeight: 700 }}>Scheduled</span>
            {statusFilter === 'SCHEDULED' && <span style={{ fontSize: '0.65rem', background: '#EDE9FE', color: '#5B21B6', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#7C3AED', marginTop: '0.25rem' }}>{metrics.scheduled || 0}</div>
        </div>

        <div
          onClick={() => handleKpiCardClick('COMPLETED')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter completed interviews"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'COMPLETED' ? '2px solid #059669' : '1px solid #A7F3D0',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'COMPLETED' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'COMPLETED' ? '0 8px 20px -4px rgba(5, 150, 105, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>Completed</span>
            {statusFilter === 'COMPLETED' && <span style={{ fontSize: '0.65rem', background: '#D1FAE5', color: '#065F46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{metrics.completed || 0}</div>
        </div>

        <div
          onClick={() => handleKpiCardClick('CANCELLED')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter cancelled interviews"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'CANCELLED' ? '2px solid #DC2626' : '1px solid #FECACA',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'CANCELLED' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'CANCELLED' ? '0 8px 20px -4px rgba(220, 38, 38, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#DC2626', textTransform: 'uppercase', fontWeight: 700 }}>Cancelled</span>
            {statusFilter === 'CANCELLED' && <span style={{ fontSize: '0.65rem', background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#DC2626', marginTop: '0.25rem' }}>{metrics.cancelled || 0}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search candidate name, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '10px' }}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="form-control"
              style={{ width: '100%', borderRadius: '10px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              value={roundFilter}
              onChange={(e) => {
                setRoundFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="form-control"
              style={{ width: '100%', borderRadius: '10px' }}
            >
              <option value="ALL">All Rounds</option>
              <option value="SCREENING">Screening</option>
              <option value="TECHNICAL">Technical Round 1</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="MANAGERIAL">Managerial</option>
              <option value="HR">HR Round</option>
              <option value="FINAL">Final Round</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
              setRoundFilter('ALL');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 1rem' }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Interviews Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
          <RotateCcw className="animate-spin" size={32} style={{ margin: '0 auto 0.75rem' }} />
          <div>Loading interview schedules...</div>
        </div>
      ) : !Array.isArray(interviews) || interviews.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#2563EB',
            }}
          >
            <CalendarX size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Interviews Found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            There are no interview schedules matching your current filter criteria.
          </p>
          <button onClick={openScheduleModal} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            Schedule New Interview
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
            <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Candidate</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Position</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Round & Mode</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date & Time</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(interviews) ? interviews : []).map((item) => {
                  const candidateName = item.applicant?.fullName || 'Candidate';
                  const candidateEmail = item.applicant?.email || '';
                  const jobTitle = item.job?.title || 'Open Position';
                  const isScheduled = item.status === 'SCHEDULED';
                  const meetingUrl = item.meetingLinkOrLocation || item.meetingLink || item.location;
                  const lifecycle = getMeetingLifecycle(item);

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{candidateName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{candidateEmail}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: '#334155' }}>
                        {jobTitle}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                            {item.round.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {item.mode === 'ONLINE' ? <Video size={12} /> : <MapPin size={12} />}
                          <span>{item.mode}</span>
                        </div>
                        {meetingUrl && item.mode === 'ONLINE' && (
                          <div style={{ marginTop: '0.35rem' }}>
                            {lifecycle.isJoinable ? (
                              <a
                                href={meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.2rem 0.55rem',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: lifecycle.isLive ? '#DCFCE7' : '#EFF6FF',
                                  color: lifecycle.isLive ? '#15803D' : '#2563EB',
                                  border: lifecycle.isLive ? '1px solid #86EFAC' : '1px solid #BFDBFE',
                                  borderRadius: '6px',
                                  textDecoration: 'none'
                                }}
                                title={`Join Call: ${meetingUrl}`}
                              >
                                <Video size={12} />
                                <span>{lifecycle.isLive ? 'Join Live Call' : 'Join Call'}</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : lifecycle.isCompleted ? (
                              <span style={{ fontSize: '0.72rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle size={12} />
                                <span>Completed</span>
                              </span>
                            ) : lifecycle.isCancelled ? (
                              <span style={{ fontSize: '0.72rem', color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CalendarX size={12} />
                                <span>Cancelled</span>
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={12} />
                                <span>Time Expired</span>
                              </span>
                            )}
                          </div>
                        )}
                        {meetingUrl && item.mode === 'OFFLINE' && (
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.25rem', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={meetingUrl}>
                            📍 {meetingUrl}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#0F172A', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontWeight: 600 }}>{new Date(item.interviewDate).toLocaleDateString()}</span>
                          {lifecycle.isRescheduled && (
                            <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #FCD34D' }}>
                              Rescheduled
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <Clock size={13} />
                          <span>
                            {item.startTime
                              ? `${formatTime12Hr(item.startTime)} – ${formatTime12Hr(item.endTime)}`
                              : (item.interviewTime || 'Time TBA')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {item.status === 'COMPLETED' ? (
                          <div>
                            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Completed</span>
                            {item.feedbacks && item.feedbacks.length > 0 && (
                              <div style={{ marginTop: '0.25rem', fontSize: '0.72rem', fontWeight: 600 }}>
                                {item.feedbacks[0].recommendation === 'STRONG_HIRE' ? (
                                  <span style={{ color: '#16A34A' }}>✓ Cleared for Offer</span>
                                ) : item.feedbacks[0].recommendation === 'RECOMMENDED' ? (
                                  <span style={{ color: '#2563EB' }}>➔ Cleared for Next Round</span>
                                ) : item.feedbacks[0].recommendation === 'HOLD' ? (
                                  <span style={{ color: '#D97706' }}>⏸ On Hold</span>
                                ) : (
                                  <span style={{ color: '#DC2626' }}>✗ Rejected</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : item.status === 'CANCELLED' ? (
                          <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>Cancelled</span>
                        ) : lifecycle.isConcluded ? (
                          <span className="badge" style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }}>
                            Time Ended
                          </span>
                        ) : lifecycle.isLive ? (
                          <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }}></span>
                            Live Now
                          </span>
                        ) : (
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>Scheduled</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {isScheduled && meetingUrl && item.mode === 'ONLINE' && lifecycle.isJoinable && (
                            <a
                              href={meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                              style={{
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.75rem',
                                background: lifecycle.isLive ? '#16A34A' : '#2563EB',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                textDecoration: 'none'
                              }}
                              title="Open meeting room"
                            >
                              <Video size={13} />
                              <span>{lifecycle.isLive ? 'Join Now' : 'Join Call'}</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {isScheduled && lifecycle.isConcluded && (
                            <button
                              onClick={() => {
                                setSelectedInterview(item);
                                setFeedbackModalOpen(true);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#D97706', borderColor: '#B45309' }}
                              title="Meeting window ended. Record feedback to complete."
                            >
                              Record Feedback
                            </button>
                          )}
                          {isScheduled && !lifecycle.isConcluded && (
                            <button
                              onClick={() => {
                                setSelectedInterview(item);
                                setFeedbackModalOpen(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              title="Record Evaluation & Feedback"
                            >
                              Feedback
                            </button>
                          )}
                          {isScheduled && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedInterview(item);
                                  setRescheduleForm({
                                    interviewDate: item.interviewDate.split('T')[0],
                                    interviewTime: item.interviewTime || item.startTime,
                                    reason: '',
                                  });
                                  setRescheduleModalOpen(true);
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                title="Reschedule"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInterview(item);
                                  setCancelForm({ reason: '' });
                                  setCancelModalOpen(true);
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#DC2626' }}
                                title="Cancel Interview"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {item.status === 'COMPLETED' && (
                            <button
                              onClick={() => {
                                setSelectedInterview(item);
                                setFeedbackModalOpen(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              title="View or update feedback"
                            >
                              <CheckCircle size={12} color="#059669" />
                              <span>Feedback</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards View */}
          <div className="mobile-cards-view" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(Array.isArray(interviews) ? interviews : []).map((item) => {
              const candidateName = item.applicant?.fullName || 'Candidate';
              const candidateEmail = item.applicant?.email || '';
              const jobTitle = item.job?.title || 'Open Position';
              const isScheduled = item.status === 'SCHEDULED';
              const meetingUrl = item.meetingLinkOrLocation || item.meetingLink || item.location;
              const lifecycle = getMeetingLifecycle(item);

              return (
                <div
                  key={`card-${item.id}`}
                  className="card"
                  style={{
                    padding: '1.15rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{candidateName}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{jobTitle}</div>
                    </div>
                    {item.status === 'COMPLETED' ? (
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Completed</span>
                        {item.feedbacks && item.feedbacks.length > 0 && (
                          <div style={{ marginTop: '0.2rem', fontSize: '0.68rem', fontWeight: 600 }}>
                            {item.feedbacks[0].recommendation === 'STRONG_HIRE' ? (
                              <span style={{ color: '#16A34A' }}>✓ Cleared for Offer</span>
                            ) : item.feedbacks[0].recommendation === 'RECOMMENDED' ? (
                              <span style={{ color: '#2563EB' }}>➔ Next Round</span>
                            ) : (
                              <span style={{ color: '#DC2626' }}>✗ Rejected</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : item.status === 'CANCELLED' ? (
                      <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Cancelled</span>
                    ) : lifecycle.isConcluded ? (
                      <span className="badge" style={{ fontSize: '0.7rem', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }}>Time Ended</span>
                    ) : lifecycle.isLive ? (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E' }}></span>
                        Live Now
                      </span>
                    ) : (
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Scheduled</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <strong>Date:</strong> {new Date(item.interviewDate).toLocaleDateString()} at{' '}
                      <span style={{ color: '#2563EB', fontWeight: 600 }}>
                        {item.startTime
                          ? `${formatTime12Hr(item.startTime)} – ${formatTime12Hr(item.endTime)}`
                          : (item.interviewTime || 'TBA')}
                      </span>
                      {lifecycle.isRescheduled && (
                        <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#B45309', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #FCD34D' }}>
                          Rescheduled
                        </span>
                      )}
                    </div>
                    <div><strong>Round:</strong> {item.round} ({item.mode})</div>
                  </div>

                  {meetingUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.85rem', background: lifecycle.isLive ? '#DCFCE7' : '#EFF6FF', border: lifecycle.isLive ? '1px solid #86EFAC' : '1px solid #BFDBFE', borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: lifecycle.isLive ? '#15803D' : '#1E40AF', fontWeight: 600 }}>
                        {item.mode === 'ONLINE' ? <Video size={14} color={lifecycle.isLive ? '#16A34A' : '#2563EB'} /> : <MapPin size={14} color="#D97706" />}
                        <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.mode === 'ONLINE' ? (lifecycle.isJoinable ? (lifecycle.isLive ? 'Session Active Live' : 'Video Meeting Ready') : 'Meeting Session Ended') : meetingUrl}
                        </span>
                      </div>
                      {item.mode === 'ONLINE' && lifecycle.isJoinable && (
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', background: lifecycle.isLive ? '#16A34A' : '#2563EB' }}
                        >
                          <Video size={12} />
                          <span>{lifecycle.isLive ? 'Join Live' : 'Join Call'}</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  )}

                  {isScheduled && (
                    <div style={{ display: 'flex', gap: '0.4rem', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedInterview(item);
                          setFeedbackModalOpen(true);
                        }}
                        className={`btn ${lifecycle.isConcluded ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center', ...(lifecycle.isConcluded ? { background: '#D97706', borderColor: '#B45309' } : {}) }}
                      >
                        {lifecycle.isConcluded ? 'Record Feedback' : 'Feedback'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInterview(item);
                          setRescheduleForm({
                            interviewDate: item.interviewDate.split('T')[0],
                            interviewTime: item.interviewTime || item.startTime,
                            reason: '',
                          });
                          setRescheduleModalOpen(true);
                        }}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center' }}
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <CalendarClock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Schedule Candidate Interview</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Configure round, timeline, and virtual/physical coordinates</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setScheduleModalOpen(false)} 
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#64748B', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Guidance Notice */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#475569' }}>
              <AlertCircle size={16} color="#2563EB" style={{ flexShrink: 0 }} />
              <div>
                <span>Fields marked with <strong style={{ color: '#DC2626' }}>* are mandatory</strong>. For today&apos;s date, start time cannot be in the past (Current time: <strong>{formatTime12Hr(getCurrentTimeString())}</strong>).</span>
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Candidate Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Select Candidate (Shortlisted / Next Round) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={scheduleForm.applicationId}
                    onChange={(e) => {
                      setScheduleForm({ ...scheduleForm, applicationId: e.target.value });
                      if (formErrors.applicationId) setFormErrors((prev) => ({ ...prev, applicationId: undefined }));
                    }}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      border: formErrors.applicationId ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      background: formErrors.applicationId ? '#FEF2F2' : '#FFFFFF'
                    }}
                  >
                    <option value="">-- Choose Candidate Application --</option>
                    {eligibleApplications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.applicant?.fullName} — {app.job?.title} ({app.referenceNumber})
                      </option>
                    ))}
                  </select>
                  {formErrors.applicationId && (
                    <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={13} />
                      <span>{formErrors.applicationId}</span>
                    </div>
                  )}
                </div>

                {/* Round & Mode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Round <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={scheduleForm.round}
                      onChange={(e) => {
                        setScheduleForm({ ...scheduleForm, round: e.target.value });
                        if (formErrors.round) setFormErrors((prev) => ({ ...prev, round: undefined }));
                      }}
                      className="form-control"
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        border: formErrors.round ? '1.5px solid #EF4444' : '1px solid #CBD5E1'
                      }}
                    >
                      <option value="SCREENING">Screening Round</option>
                      <option value="TECHNICAL">Technical Round 1</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                      <option value="MANAGERIAL">Managerial Round</option>
                      <option value="HR">HR Round</option>
                      <option value="FINAL">Final Interview</option>
                    </select>
                    {formErrors.round && (
                      <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={13} />
                        <span>{formErrors.round}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Mode <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={scheduleForm.mode}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    >
                      <option value="ONLINE">Online (Virtual Meeting)</option>
                      <option value="OFFLINE">Offline (In-Person Office)</option>
                    </select>
                  </div>
                </div>

                {/* Date & Start Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Date <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      min={getTodayDateString()}
                      value={scheduleForm.interviewDate}
                      onChange={(e) => {
                        setScheduleForm({ ...scheduleForm, interviewDate: e.target.value });
                        if (formErrors.interviewDate) setFormErrors((prev) => ({ ...prev, interviewDate: undefined }));
                      }}
                      className="form-control"
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        border: formErrors.interviewDate ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                        background: formErrors.interviewDate ? '#FEF2F2' : '#FFFFFF'
                      }}
                    />
                    {formErrors.interviewDate && (
                      <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={13} />
                        <span>{formErrors.interviewDate}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                        Start Time (AM/PM) <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      {scheduleForm.interviewTime && (
                        <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: '#EFF6FF', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                          {formatTime12Hr(scheduleForm.interviewTime)}
                        </span>
                      )}
                    </div>
                    <input
                      type="time"
                      min={scheduleForm.interviewDate === getTodayDateString() ? getCurrentTimeString() : undefined}
                      value={scheduleForm.interviewTime}
                      onChange={(e) => {
                        setScheduleForm({ ...scheduleForm, interviewTime: e.target.value });
                        if (formErrors.interviewTime) setFormErrors((prev) => ({ ...prev, interviewTime: undefined }));
                      }}
                      className="form-control"
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        border: formErrors.interviewTime ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                        background: formErrors.interviewTime ? '#FEF2F2' : '#FFFFFF'
                      }}
                    />
                    {formErrors.interviewTime ? (
                      <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={13} />
                        <span>{formErrors.interviewTime}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: '0.25rem' }}>
                        {scheduleForm.interviewDate === getTodayDateString() ? `Earliest valid today: After ${formatTime12Hr(getCurrentTimeString())}` : 'Future schedule time'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration & Window */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Duration</label>
                    <select
                      value={scheduleForm.durationMinutes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, durationMinutes: Number(e.target.value) })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes (1 hour)</option>
                      <option value={90}>90 minutes (1.5 hours)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Calculated Window (AM/PM)</label>
                    <div style={{ padding: '0.65rem 0.85rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
                      {scheduleForm.interviewTime ? `${formatTime12Hr(scheduleForm.interviewTime)} – ${formatTime12Hr(calculateEndTime(scheduleForm.interviewTime, scheduleForm.durationMinutes))}` : 'Select start time'}
                    </div>
                  </div>
                </div>

                {/* Location / Meeting link */}
                {scheduleForm.mode === 'ONLINE' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Meeting URL (Google Meet / Zoom) <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/abc-defg-hij"
                      value={scheduleForm.meetingLink}
                      onChange={(e) => {
                        setScheduleForm({ ...scheduleForm, meetingLink: e.target.value });
                        if (formErrors.meetingLink) setFormErrors((prev) => ({ ...prev, meetingLink: undefined }));
                      }}
                      className="form-control"
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        border: formErrors.meetingLink ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                        background: formErrors.meetingLink ? '#FEF2F2' : '#FFFFFF'
                      }}
                    />
                    {formErrors.meetingLink && (
                      <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={13} />
                        <span>{formErrors.meetingLink}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Office Address & Room <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nexora Tech Park, Hyderabad - Conference Room 4B"
                      value={scheduleForm.location}
                      onChange={(e) => {
                        setScheduleForm({ ...scheduleForm, location: e.target.value });
                        if (formErrors.location) setFormErrors((prev) => ({ ...prev, location: undefined }));
                      }}
                      className="form-control"
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        border: formErrors.location ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                        background: formErrors.location ? '#FEF2F2' : '#FFFFFF'
                      }}
                    />
                    {formErrors.location && (
                      <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertCircle size={13} />
                        <span>{formErrors.location}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Interviewers (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Arun Kumar (VP Engg), Priya Sharma (Staff Architect)"
                    value={scheduleForm.interviewerNames}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerNames: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Instructions for Candidate</label>
                  <textarea
                    rows={3}
                    placeholder="Please ensure your development environment is ready for live coding."
                    value={scheduleForm.instructions}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, instructions: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setScheduleModalOpen(false)} className="btn btn-secondary" style={{ padding: '0.55rem 1.15rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                  {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalOpen && selectedInterview && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Reschedule Interview</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{selectedInterview?.applicant?.fullName} • {selectedInterview?.round}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setRescheduleModalOpen(false)} 
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#64748B', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Notice */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
              <AlertCircle size={15} color="#2563EB" style={{ flexShrink: 0 }} />
              <span>Timings must be in the future. Current time: <strong>{formatTime12Hr(getCurrentTimeString())}</strong></span>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    New Date <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={rescheduleForm.interviewDate}
                    onChange={(e) => {
                      setRescheduleForm({ ...rescheduleForm, interviewDate: e.target.value });
                      if (rescheduleErrors.interviewDate) setRescheduleErrors((prev) => ({ ...prev, interviewDate: undefined }));
                    }}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      border: rescheduleErrors.interviewDate ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      background: rescheduleErrors.interviewDate ? '#FEF2F2' : '#FFFFFF'
                    }}
                  />
                  {rescheduleErrors.interviewDate && (
                    <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={13} />
                      <span>{rescheduleErrors.interviewDate}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                      New Start Time (AM/PM) <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    {rescheduleForm.interviewTime && (
                      <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: '#EFF6FF', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        {formatTime12Hr(rescheduleForm.interviewTime)}
                      </span>
                    )}
                  </div>
                  <input
                    type="time"
                    min={rescheduleForm.interviewDate === getTodayDateString() ? getCurrentTimeString() : undefined}
                    value={rescheduleForm.interviewTime}
                    onChange={(e) => {
                      setRescheduleForm({ ...rescheduleForm, interviewTime: e.target.value });
                      if (rescheduleErrors.interviewTime) setRescheduleErrors((prev) => ({ ...prev, interviewTime: undefined }));
                    }}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      border: rescheduleErrors.interviewTime ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      background: rescheduleErrors.interviewTime ? '#FEF2F2' : '#FFFFFF'
                    }}
                  />
                  {rescheduleErrors.interviewTime ? (
                    <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={13} />
                      <span>{rescheduleErrors.interviewTime}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                      Selected: <strong>{formatTime12Hr(rescheduleForm.interviewTime) || '10:00 AM'}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Reason for Rescheduling <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Interviewer conflict / Candidate requested change..."
                    value={rescheduleForm.reason}
                    onChange={(e) => {
                      setRescheduleForm({ ...rescheduleForm, reason: e.target.value });
                      if (rescheduleErrors.reason) setRescheduleErrors((prev) => ({ ...prev, reason: undefined }));
                    }}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      border: rescheduleErrors.reason ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      background: rescheduleErrors.reason ? '#FEF2F2' : '#FFFFFF'
                    }}
                  />
                  {rescheduleErrors.reason && (
                    <div style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={13} />
                      <span>{rescheduleErrors.reason}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setRescheduleModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Updating...' : 'Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackModalOpen && selectedInterview && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Interview Feedback & Recommendation</h3>
              <button onClick={() => setFeedbackModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Rating (1 - 5) *</label>
                    <select
                      value={feedbackForm.rating}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    >
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Strong Candidate</option>
                      <option value="3">3 - Meets Expectations</option>
                      <option value="2">2 - Below Expectations</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Evaluation Outcome *</label>
                    <select
                      value={feedbackForm.recommendation}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    >
                      <option value="HIRE">✓ Cleared & Shortlisted for Official Offer (Strong Hire)</option>
                      <option value="NEXT_ROUND">➔ Cleared Round — Advance to Next Interview Round</option>
                      <option value="HOLD">⏸ Keep on Hold (Under Consideration)</option>
                      <option value="NO_HIRE">✗ Evaluation Rejected (Do Not Hire)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Key Strengths</label>
                  <textarea
                    rows={2}
                    placeholder="Excellent problem-solving, clean code structure..."
                    value={feedbackForm.strengths}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Areas of Improvement</label>
                  <textarea
                    rows={2}
                    placeholder="Needs more hands-on depth with distributed caching..."
                    value={feedbackForm.areasOfImprovement}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, areasOfImprovement: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Internal Confidential Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Private notes for recruitment committee only..."
                    value={feedbackForm.notes}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, notes: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setFeedbackModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOpen && selectedInterview && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#DC2626' }}>Cancel Interview</h3>
              <button onClick={() => setCancelModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Are you sure you want to cancel the interview for <strong>{selectedInterview.applicant?.fullName}</strong>? An automated notification and email will be dispatched.
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Reason for Cancellation *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Position closed / Scheduling conflict..."
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setCancelModalOpen(false)} className="btn btn-secondary">
                  Close
                </button>
                <button type="submit" disabled={submitting} className="btn btn-danger" style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.55rem 1.15rem', borderRadius: '8px' }}>
                  {submitting ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
