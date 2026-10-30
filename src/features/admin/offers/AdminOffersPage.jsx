import React, { useState } from 'react';
import { Award, Plus, FileText, Download, CheckCircle, RefreshCw, Inbox } from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Offer Letter Operations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Draft, preview, issue, and track official PDF employment offers.
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="glass-panel" style={{ padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)', textAlign: 'center' }}>
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
            <Inbox size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Job Offers Issued Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            Offer letters and digital PDF contracts prepared for selected candidates will be listed and tracked here.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive">
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Offer Ref</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Designation</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Version</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{item.ref}</td>
                    <td style={{ padding: '1rem' }}>{item.candidate}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.role}</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-info">{item.version}</span></td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-success">{item.status}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', marginRight: '0.5rem', fontSize: '0.8rem' }}>
                        <Download size={14} />
                        <span style={{ marginLeft: '0.3rem' }}>Preview PDF</span>
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                        <RefreshCw size={14} />
                        <span style={{ marginLeft: '0.3rem' }}>Revise</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards View */}
          <div className="mobile-cards-view">
            {offers.map((item) => (
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
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>
                      {item.ref}
                    </span>
                    <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                      {item.candidate}
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{item.role}</div>
                  </div>
                  <span className="badge badge-success">{item.status}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B' }}>
                  <span className="badge badge-info">{item.version}</span>
                </div>

                <div className="admin-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <Download size={14} />
                    <span>Preview PDF</span>
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <RefreshCw size={14} />
                    <span>Revise</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
