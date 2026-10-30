import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Eye, FileText, ArrowRight } from 'lucide-react';

export default function AdminApplicantsPage() {
  // Empty state by default — populated as candidates register
  const [applicants, setApplicants] = useState([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Applicant Directory & Profiles</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Search candidate credentials, educational profiles, and registered applicant accounts.
          </p>
        </div>
      </div>

      {applicants.length === 0 ? (
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
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Registered Applicants Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
            When users register as candidates and configure their technical profiles, their account records and contact coordinates will be searchable here.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" target="_blank" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
              <span>Test Applicant Registration</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Qualification</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Experience</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Registered On</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{a.qualification}</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-info">{a.exp}</span></td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{a.registeredDate}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                        <Eye size={14} />
                        <span style={{ marginLeft: '0.3rem' }}>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
