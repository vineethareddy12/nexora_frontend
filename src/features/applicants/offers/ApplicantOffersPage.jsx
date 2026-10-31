import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Check, 
  X, 
  FileText, 
  Calendar, 
  Inbox, 
  RotateCcw,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { offersApi } from '../../offers/offersApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../components/toast/ToastContext';
import { clientCache } from '../../../core/cache/clientCache';
import { TableSkeleton, ErrorState, EmptyState, RefreshBadge } from '../../../components/common/LoadingStates';

export default function ApplicantOffersPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const toast = useToast();

  const [offers, setOffers] = useState(() => clientCache.get('applicant_offers', userId) || []);
  const [loading, setLoading] = useState(() => !clientCache.isFresh('applicant_offers', userId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [decisionType, setDecisionType] = useState('ACCEPTED'); // ACCEPTED or DECLINED
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOffers = async (isSilent = false) => {
    if (!isSilent && offers.length === 0) {
      setLoading(true);
    } else if (isSilent) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const res = await clientCache.fetchWithDedupe(
        'applicant_offers',
        () => offersApi.getApplicantOffers(),
        { userId, ttl: 45000, force: !isSilent }
      );
      setOffers(res.data || []);
    } catch (err) {
      console.error('Failed to load applicant offers:', err);
      if (offers.length === 0) {
        setError(err.message || 'Failed to load offers');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOffers(false);

    // Auto-poll every 20s silently
    const pollTimer = setInterval(() => {
      loadOffers(true);
    }, 20000);

    const handleFocus = () => loadOffers(true);
    window.addEventListener('focus', handleFocus);

    const handleDataUpdated = () => {
      clientCache.invalidate('applicant_offers');
      loadOffers(true);
    };
    window.addEventListener('nexora:data-updated', handleDataUpdated);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('nexora:data-updated', handleDataUpdated);
    };
  }, [userId]);

  const handlePreview = async (offer) => {
    setSelectedOffer(offer);
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewHtml('');
    try {
      const html = await offersApi.getOfferHtml(offer.id, 'applicant');
      setPreviewHtml(html);
    } catch (err) {
      console.error('Failed to load offer preview:', err);
      toast?.showError(err.message || 'Failed to load offer letter preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffer || submitting) return;
    try {
      setSubmitting(true);
      await offersApi.respondToOffer(selectedOffer.id, decisionType, decisionNotes);
      toast?.showSuccess(
        decisionType === 'ACCEPTED'
          ? 'Congratulations! You have accepted the offer.'
          : 'Your decision to decline the offer has been submitted.'
      );
      setDecisionModalOpen(false);
      setDecisionNotes('');
      loadOffers();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      toast?.showError(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Official Job Offers
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Review issued offer letters, inspect compensation breakdowns, and confirm your employment decision.
          </p>
        </div>
        <RefreshBadge isRefreshing={isRefreshing} />
      </div>

      {loading && offers.length === 0 ? (
        <TableSkeleton rows={3} cols={4} />
      ) : error && offers.length === 0 ? (
        <ErrorState
          title="Unable to Load Job Offers"
          message={error}
          onRetry={() => loadOffers(false)}
        />
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Job Offers Issued Yet"
          description="There are no active official job offer letters linked to your candidate account at this time."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {offers.map((offer) => {
            const isIssued = offer.status === 'ISSUED';
            const isAccepted = offer.status === 'ACCEPTED';
            const isDeclined = offer.status === 'DECLINED';
            const isWithdrawn = offer.status === 'WITHDRAWN';
            const salaryDisplay = offer.salary ? `${offer.currency} ${Number(offer.salary).toLocaleString('en-IN')}` : 'As specified';

            return (
              <div
                key={offer.id}
                className="card"
                style={{
                  padding: '1.75rem',
                  background: '#FFFFFF',
                  border: isIssued ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.25rem', fontFamily: 'monospace', fontWeight: 700 }}>
                      OFFER REF: {offer.offerCode}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                      {offer.designation}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                      Position: {offer.job?.title || offer.designation} • {offer.job?.department || 'Nexora Technologies'}
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      isAccepted
                        ? 'badge-success'
                        : isDeclined || isWithdrawn
                        ? 'badge-danger'
                        : 'badge-primary'
                    }`}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                  >
                    {offer.status}
                  </span>
                </div>

                {/* Compensation & Joining Info */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                    gap: '1rem',
                    padding: '1.15rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Annual Compensation (CTC)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                      {salaryDisplay} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }}>/ annum</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Anticipated Joining Date</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                      {new Date(offer.joiningDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Employment Type</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                      {(offer.employmentType || 'FULL_TIME').replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <button
                    onClick={() => handlePreview(offer)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.15rem' }}
                  >
                    <Eye size={16} />
                    <span>View & Print Official Letter</span>
                  </button>

                  {isIssued && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedOffer(offer);
                          setDecisionType('DECLINED');
                          setDecisionModalOpen(true);
                        }}
                        className="btn btn-secondary"
                        style={{ color: '#DC2626', borderColor: '#FECACA', padding: '0.55rem 1rem' }}
                      >
                        Decline Offer
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOffer(offer);
                          setDecisionType('ACCEPTED');
                          setDecisionModalOpen(true);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Check size={16} />
                        <span>Accept Offer</span>
                      </button>
                    </div>
                  )}

                  {isAccepted && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                      <CheckCircle size={18} />
                      <span>Offer Accepted on {offer.respondedAt ? new Date(offer.respondedAt).toLocaleDateString() : 'Record'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DECISION MODAL */}
      {decisionModalOpen && selectedOffer && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: decisionType === 'ACCEPTED' ? '#059669' : '#DC2626' }}>
                {decisionType === 'ACCEPTED' ? 'Accept Employment Offer' : 'Decline Employment Offer'}
              </h3>
              <button onClick={() => setDecisionModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDecisionSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0 }}>
                  {decisionType === 'ACCEPTED' ? (
                    <>
                      By accepting, you confirm your intent to join Nexora Technologies as <strong>{selectedOffer.designation}</strong>. Our onboarding team will contact you with next steps.
                    </>
                  ) : (
                    <>
                      Are you sure you wish to decline the offer for <strong>{selectedOffer.designation}</strong>? This decision cannot be reversed.
                    </>
                  )}
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    {decisionType === 'ACCEPTED' ? 'Comments / Expected Onboarding Availability (Optional)' : 'Reason for Declining (Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={decisionType === 'ACCEPTED' ? 'Excited to join the engineering team!' : 'Accepted another offer / Location preference...'}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setDecisionModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    background: decisionType === 'ACCEPTED' ? '#059669' : '#DC2626',
                    borderColor: decisionType === 'ACCEPTED' ? '#059669' : '#DC2626',
                  }}
                >
                  {submitting ? 'Submitting...' : decisionType === 'ACCEPTED' ? 'Confirm Acceptance' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewModalOpen && selectedOffer && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '960px', height: '90vh', background: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  Official Offer Letter — {selectedOffer.offerCode}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {selectedOffer.designation} &bull; Nexora Technologies Inc.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {previewHtml && (
                  <button
                    type="button"
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(previewHtml);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => printWindow.print(), 300);
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                  >
                    <Download size={14} />
                    <span>Print / Save PDF</span>
                  </button>
                )}
                <button onClick={() => setPreviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', background: '#F8FAFC' }}>
              {previewLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', gap: '0.75rem' }}>
                  <RotateCcw className="animate-spin" size={32} color="#2563EB" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading official offer letter...</span>
                </div>
              ) : previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Official Offer Letter"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#DC2626' }}>
                  Failed to render offer letter preview. Please refresh and try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
