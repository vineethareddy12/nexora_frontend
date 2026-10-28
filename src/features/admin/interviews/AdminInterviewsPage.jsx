import React, { useState } from 'react';
import { CalendarClock, Plus, Video, CheckCircle, CalendarX } from 'lucide-react';

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Interview Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Schedule interview rounds, update meeting coordinates, and store candidate evaluations.
          </p>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
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
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Interviews Currently Scheduled</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            Once candidate applications are shortlisted, interview schedules and technical evaluation slots will be managed directly from this module.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                <th style={{ padding: '0.75rem 1rem' }}>Position</th>
                <th style={{ padding: '0.75rem 1rem' }}>Round</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{item.candidate}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.role}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-primary">{item.round}</span></td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.date}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-success">{item.status}</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>Record Feedback</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
