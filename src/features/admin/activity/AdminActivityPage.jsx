import React, { useState } from 'react';
import { History, Shield, CheckCircle, Clock } from 'lucide-react';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Administrative Audit Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Immutable records of critical recruitment decisions, offers, and access events.
        </p>
      </div>

      {logs.length === 0 ? (
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
            <Clock size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Audit Logs Recorded Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            System events, recruitment status changes, offer letters, and administrative actions will be logged here automatically.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action Event</th>
                <th style={{ padding: '0.75rem 1rem' }}>Initiated By</th>
                <th style={{ padding: '0.75rem 1rem' }}>Target Entity / Context</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.time}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-primary">{item.action}</span></td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{item.user}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{item.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
