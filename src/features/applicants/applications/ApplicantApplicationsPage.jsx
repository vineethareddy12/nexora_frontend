import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, Calendar, CheckCircle, ChevronRight, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ApplicantApplicationsPage() {
  const { user } = useAuth();
  // Real applications state - populated from database
  const [applications, setApplications] = useState([]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>My Job Applications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Monitor your application lifecycle, interviews, and status updates in real time.
          </p>
        </div>
        <Link to="/careers" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>
          <span>Explore Open Vacancies</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {applications.length === 0 ? (
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
            <Briefcase size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Job Applications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.75rem' }}>
            You haven't submitted any applications yet. Complete your profile coordinates and browse our open engineering, cloud, and AI roles.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/careers" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <span>View Open Roles</span>
            </Link>
            <Link to="/app/profile" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
              <span>Complete Profile</span>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {applications.map((app) => (
            <div key={app.id} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    Reference: <strong>{app.refNumber}</strong>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{app.jobTitle}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Submitted on {app.appliedDate}</div>
                </div>
                <span className={`badge ${app.badgeClass}`}>{app.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
