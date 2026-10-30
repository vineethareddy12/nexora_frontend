import React, { useState } from 'react';
import { Award, Download, Check, X, FileText, Calendar, Inbox } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ApplicantOffersPage() {
  const { user } = useAuth();
  // Real offers state initialized empty
  const [offers, setOffers] = useState([]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Official Job Offers</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Review issued offer letters, download official PDF copies, and indicate offer acceptance.
        </p>
      </div>

      {offers.length === 0 ? (
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
            <Award size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>No Job Offers Issued Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
            There are no official job offer letters linked to your candidate account at this time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {offers.map((offer) => (
            <div key={offer.id} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    Reference: <strong>{offer.offerRef}</strong>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{offer.designation}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Position: {offer.jobTitle}</div>
                </div>
                <span className="badge badge-success">{offer.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
