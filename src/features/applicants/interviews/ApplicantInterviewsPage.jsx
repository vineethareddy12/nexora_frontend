import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  CalendarX, 
  ExternalLink,
  RotateCcw,
  UserCheck,
  FileText,
  Award,
  ChevronRight
} from 'lucide-react';
import { interviewsApi } from '../../interviews/interviewsApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { clientCache } from '../../../core/cache/clientCache';
import { TableSkeleton, ErrorState, EmptyState, RefreshBadge } from '../../../components/common/LoadingStates';

const formatTime12Hr = (timeStr) => {
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

const getMeetingLifecycle = (item) => {
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
      description: 'Interview session completed'
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
      description: 'Interview cancelled'
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
        description: 'Scheduled meeting window has ended'
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

export default function ApplicantInterviewsPage() {
  const { user } = useAuth();
  const userId = user?.id;

  // Stale-While-Revalidate: Seed initial state from memory cache immediately if available
  const [interviews, setInterviews] = useState(() => clientCache.get('applicant_interviews', userId) || []);
  const [loading, setLoading] = useState(() => !clientCache.isFresh('applicant_interviews', userId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadInterviews = async (isSilent = false) => {
    // If not silent and no cached data exists, show skeleton loader
    if (!isSilent && interviews.length === 0) {
      setLoading(true);
    } else if (isSilent) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const res = await clientCache.fetchWithDedupe(
        'applicant_interviews',
        () => interviewsApi.getApplicantInterviews(),
        { userId, ttl: 45000, force: !isSilent }
      );

      const items = Array.isArray(res?.interviews)
        ? res.interviews
        : Array.isArray(res?.data?.interviews)
        ? res.data.interviews
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setInterviews(items);
    } catch (err) {
      console.error('Failed to load applicant interviews:', err);
      // Only set error banner if we don't already have working data
      if (interviews.length === 0) {
        setError(err.message || 'Failed to load interviews');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadInterviews(false);

    // Silent background poll every 20s
    const pollTimer = setInterval(() => {
      loadInterviews(true);
    }, 20000);

    const handleFocus = () => loadInterviews(true);
    window.addEventListener('focus', handleFocus);

    const handleDataUpdated = () => {
      clientCache.invalidate('applicant_interviews');
      loadInterviews(true);
    };
    window.addEventListener('nexora:data-updated', handleDataUpdated);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('nexora:data-updated', handleDataUpdated);
    };
  }, [userId]);

  // Group interviews by Applied Position / Application
  const groupedPositions = useMemo(() => {
    if (!Array.isArray(interviews) || interviews.length === 0) return [];

    const map = new Map();
    for (const interview of interviews) {
      const appId = interview.applicationId || interview.application?.id || interview.job?.id || 'default';
      if (!map.has(appId)) {
        map.set(appId, {
          appId,
          jobTitle: interview.job?.title || 'Open Position',
          department: interview.job?.department || 'Nexora Technologies',
          referenceNumber: interview.application?.referenceNumber || '',
          interviews: [],
        });
      }
      map.get(appId).interviews.push(interview);
    }

    return Array.from(map.values()).map((group) => {
      // Sort interviews chronologically
      group.interviews.sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
      
      const totalRounds = group.interviews.length;
      const completedRounds = group.interviews.filter((i) => i.status === 'COMPLETED').length;
      const scheduledRounds = group.interviews.filter((i) => i.status === 'SCHEDULED').length;
      const progressPercent = totalRounds > 0 ? Math.round((completedRounds / totalRounds) * 100) : 0;
      
      return {
        ...group,
        totalRounds,
        completedRounds,
        scheduledRounds,
        progressPercent,
      };
    });
  }, [interviews]);

  return (
    <div style={{ width: '100%', maxWidth: '1060px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Interview Schedules & Progress
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Track stage progression, meeting coordinates, and evaluation status for each applied position.
          </p>
        </div>
        <RefreshBadge isRefreshing={isRefreshing} />
      </div>

      {loading && interviews.length === 0 ? (
        <TableSkeleton rows={3} cols={4} />
      ) : error && interviews.length === 0 ? (
        <ErrorState
          title="Unable to Load Interviews"
          message={error}
          onRetry={() => loadInterviews(false)}
        />
      ) : !Array.isArray(interviews) || interviews.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No Scheduled Interviews"
          description="You do not have any active or past interview schedules at this time. Once shortlisted for a round, your meeting coordinates and instructions will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groupedPositions.map((pos) => (
            <div
              key={pos.appId}
              className="card"
              style={{
                padding: '1.75rem',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Position Header & Overall Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.76rem', padding: '0.2rem 0.65rem' }}>
                      {pos.department}
                    </span>
                    {pos.referenceNumber && (
                      <span style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>
                        Ref: {pos.referenceNumber}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {pos.jobTitle}
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: pos.progressPercent === 100 ? '#059669' : '#2563EB' }}>
                    {pos.completedRounds} of {pos.totalRounds} Rounds Cleared ({pos.progressPercent}%)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {pos.scheduledRounds > 0
                      ? `${pos.scheduledRounds} round(s) currently active / scheduled`
                      : pos.progressPercent === 100
                      ? '✓ All interview stages completed!'
                      : 'Next stage pending schedule'}
                  </div>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.35rem', border: '1px solid #E2E8F0' }}>
                <div
                  style={{
                    width: `${pos.progressPercent}%`,
                    height: '100%',
                    background: pos.progressPercent === 100
                      ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)',
                    borderRadius: '9999px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>

              {/* Pipeline Round Stepper Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem', padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginRight: '0.25rem' }}>
                  Stages:
                </span>
                {pos.interviews.map((item, idx) => {
                  const isCompleted = item.status === 'COMPLETED';
                  const isScheduled = item.status === 'SCHEDULED';
                  return (
                    <div
                      key={`step-${item.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: isCompleted ? '#DCFCE7' : isScheduled ? '#EFF6FF' : '#F1F5F9',
                        color: isCompleted ? '#15803D' : isScheduled ? '#1E40AF' : '#64748B',
                        border: isCompleted ? '1px solid #86EFAC' : isScheduled ? '1px solid #BFDBFE' : '1px solid #CBD5E1',
                      }}
                    >
                      {isCompleted ? <CheckCircle size={13} color="#16A34A" /> : isScheduled ? <Clock size={13} color="#2563EB" /> : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />}
                      <span>{idx + 1}. {item.round.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>({isCompleted ? 'Cleared' : item.status.toLowerCase()})</span>
                    </div>
                  );
                })}
              </div>

              {/* Individual Interview Cards for this Applied Role */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {pos.interviews.map((item) => {
            const isOnline = item.mode === 'ONLINE';
            const isScheduled = item.status === 'SCHEDULED';
            const lifecycle = getMeetingLifecycle(item);
            const meetingUrl = item.meetingLinkOrLocation || item.meetingLink || item.location;
            const interviewDate = new Date(item.interviewDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '1.75rem',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                        {item.round.replace('_', ' ')}
                      </span>
                      {lifecycle.isRescheduled && (
                        <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #FCD34D', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <RotateCcw size={12} />
                          <span>Rescheduled</span>
                        </span>
                      )}
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Application: {item.application?.referenceNumber}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {item.job?.title || 'Open Position'}
                    </h3>
                  </div>

                  {item.status === 'COMPLETED' ? (
                    <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Completed</span>
                  ) : item.status === 'CANCELLED' ? (
                    <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Cancelled</span>
                  ) : lifecycle.isConcluded ? (
                    <span className="badge" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }}>Meeting Ended</span>
                  ) : lifecycle.isLive ? (
                    <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }}></span>
                      Live Now
                    </span>
                  ) : (
                    <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>Scheduled</span>
                  )}
                </div>

                {/* Reschedule Alert Banner */}
                {lifecycle.isRescheduled && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.15rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <RotateCcw size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.82rem', color: '#92400E' }}>
                      <strong>Schedule Updated:</strong> This interview was rescheduled to <strong>{interviewDate}</strong> at <strong>{formatTime12Hr(item.startTime)} – {formatTime12Hr(item.endTime)}</strong>. A confirmation email has been dispatched with the updated coordinates.
                      {item.scheduleHistories?.[0]?.reason && (
                        <div style={{ marginTop: '0.2rem' }}>
                          <em>Reason: {item.scheduleHistories[0].reason}</em>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <Calendar size={18} color="#2563EB" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Date</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>{interviewDate}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <Clock size={18} color="#2563EB" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Time (AM/PM)</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                        {item.startTime
                          ? `${formatTime12Hr(item.startTime)} – ${formatTime12Hr(item.endTime)}`
                          : (item.interviewTime || 'Time TBA')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    {isOnline ? (
                      <Video size={18} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                    ) : (
                      <MapPin size={18} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Mode</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                        {item.mode === 'ONLINE' ? 'Online Video Call' : 'In-Person Office'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Meeting Coordinates & Expiry States */}
                {item.status === 'COMPLETED' ? (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', marginBottom: '1rem', gap: '0.65rem' }}>
                    <CheckCircle size={18} color="#15803D" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>Interview Session Completed</div>
                      <div style={{ fontSize: '0.78rem', color: '#15803D' }}>Thank you for attending this round. Your evaluation is being finalized by the recruitment panel.</div>
                    </div>
                  </div>
                ) : item.status === 'CANCELLED' ? (
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '1rem', gap: '0.65rem' }}>
                    <CalendarX size={18} color="#B91C1C" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991B1B' }}>Interview Cancelled</div>
                      <div style={{ fontSize: '0.78rem', color: '#B91C1C' }}>{item.cancellationReason || 'This scheduled interview was cancelled by the recruitment team.'}</div>
                    </div>
                  </div>
                ) : isOnline && meetingUrl && lifecycle.isConcluded ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={18} color="#64748B" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Meeting Session Ended</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>The scheduled time window ({formatTime12Hr(item.startTime)} – {formatTime12Hr(item.endTime)}) has passed. Access link is expired.</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, padding: '0.35rem 0.75rem', background: '#F1F5F9', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      Link Expired
                    </span>
                  </div>
                ) : isOnline && meetingUrl && lifecycle.isJoinable ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: lifecycle.isLive ? '#F0FDF4' : '#EFF6FF', border: lifecycle.isLive ? '1px solid #86EFAC' : '1px solid #BFDBFE', borderRadius: '10px', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Video size={18} color={lifecycle.isLive ? '#15803D' : '#2563EB'} />
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: lifecycle.isLive ? '#166534' : '#1E40AF' }}>
                          {lifecycle.isLive ? 'Live Meeting Session Active' : 'Online Meeting Access Link Ready'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: lifecycle.isLive ? '#15803D' : '#3B82F6' }}>
                          {lifecycle.isLive ? 'Interviewers are expecting you now' : 'You can join 10-15 minutes prior to check audio/video'}
                        </div>
                      </div>
                    </div>
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', background: lifecycle.isLive ? '#16A34A' : '#2563EB' }}
                    >
                      <Video size={15} />
                      <span>{lifecycle.isLive ? 'Join Live Meeting' : 'Join Meeting'}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ) : !isOnline && meetingUrl ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.85rem 1.25rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', marginBottom: '1rem' }}>
                    <MapPin size={18} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem', color: '#92400E' }}>
                      <strong>Office Address:</strong> {meetingUrl}
                    </div>
                  </div>
                ) : null}

                {item.instructions && (
                  <div style={{ fontSize: '0.85rem', color: '#475569', background: '#F8FAFC', padding: '0.85rem 1.25rem', borderRadius: '10px' }}>
                    <strong style={{ color: '#0F172A' }}>Instructions from Recruitment Team:</strong>
                    <p style={{ margin: '0.25rem 0 0 0' }}>{item.instructions}</p>
                  </div>
                )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
