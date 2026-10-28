import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, Filter, Eye, CheckCircle2, Briefcase, ArrowRight } from 'lucide-react';

export default function AdminApplicationsPage() {
  // Empty state by default — populated as candidates apply
  const [apps, setApps] = useState([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Recruitment Applications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review candidate submissions, advance recruitment stages, and evaluate profiles.
          </p>
        </div>
        <Link to="/admin/jobs" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <span>Manage Vacancies</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {apps.length === 0 ? (
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
            <FileCheck2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Applications Received Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
            When candidates apply to published jobs on the Careers portal, their applications, uploaded resumes, and contact coordinates will be listed here.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/admin/jobs" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
              <span>Review Published Jobs</span>
            </Link>
            <Link to="/careers" target="_blank" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
              <span>Visit Careers Page</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Reference #</th>
                <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                <th style={{ padding: '0.75rem 1rem' }}>Job Posting</th>
                <th style={{ padding: '0.75rem 1rem' }}>Applied Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{item.ref}</td>
                  <td style={{ padding: '1rem' }}>{item.candidate}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.job}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.date}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-info">{item.status}</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                      <Eye size={14} />
                      <span style={{ marginLeft: '0.3rem' }}>Review Details</span>
                    </button>
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
