import React, { useState } from 'react';
import { Calendar, Clock, Video, MapPin, AlertCircle, CalendarX } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ApplicantInterviewsPage() {
  const { user } = useAuth();
  // Real interviews state initialized empty
  const [interviews, setInterviews] = useState([]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Interview Schedules</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Details, meeting coordinates, and instructions for upcoming technical and HR interviews.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="card" style={{ padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--text-dim)',
            }}
          >
            <CalendarX size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>No Scheduled Interviews</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
            You do not have any pending or upcoming interview rounds scheduled right now. Once your application is reviewed and shortlisted by our recruitment team, meeting details will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {interviews.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{item.round}</span>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{item.jobTitle}</h3>
                </div>
                <span className="badge badge-success">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
