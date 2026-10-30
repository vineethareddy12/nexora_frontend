import React, { useState } from 'react';
import { History, Shield, CheckCircle, Clock } from 'lucide-react';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Standard Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Administrative Audit Logs
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Immutable records of critical recruitment decisions, offers, stage progressions, and access events.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
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
            <Clock size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Audit Logs Recorded Yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            System events, candidate status changes, offer releases, and administrative actions are logged here automatically.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Action Event</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Initiated By</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Target Entity / Context</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>{item.time}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#0F172A' }}>{item.event}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>{item.actor}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>{item.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards View */}
          <div className="mobile-cards-view" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {logs.map((item) => (
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
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>{item.event}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                  <div><strong>By:</strong> {item.actor}</div>
                  <div><strong>Context:</strong> {item.context}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
