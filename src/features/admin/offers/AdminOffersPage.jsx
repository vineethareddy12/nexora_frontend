import React, { useState } from 'react';
import { Award, Plus, FileText, Download, CheckCircle, RefreshCw, Inbox } from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Standard Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Offer Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Create, issue and track candidate job offers, compensation details, and acceptance statuses.
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
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
              color: '#059669',
            }}
          >
            <Inbox size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Job Offers Issued Yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            Offer letters and digital contracts prepared for candidates in the SELECTED stage will be listed and tracked here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Offer Ref</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Candidate</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Designation</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Version</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>{item.ref}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#0F172A' }}>{item.candidate}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>{item.designation}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>{item.version}</td>
                    <td style={{ padding: '1rem 1.25rem' }}><span className="badge badge-success">{item.status}</span></td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>View Offer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards View */}
          <div className="mobile-cards-view" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>{item.ref}</span>
                    <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{item.candidate}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{item.designation}</div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>{item.status}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9' }}>
                  <button className="btn btn-secondary" style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center' }}>View Offer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
