import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  FileText, 
  Download, 
  Upload,
  CheckCircle, 
  RefreshCw, 
  Inbox, 
  Search, 
  X, 
  Send, 
  AlertTriangle, 
  Eye, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar
} from 'lucide-react';
import { offersApi } from '../../offers/offersApi';
import { interviewsApi } from '../../interviews/interviewsApi';
import { adminReviewApi } from '../review/adminReviewApi';
import { useToast } from '../../../components/toast/ToastContext';

export default function AdminOffersPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, draft: 0, issued: 0, accepted: 0, declined: 0, withdrawn: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [issueConfirmModalOpen, setIssueConfirmModalOpen] = useState(false);
  const [offerToIssue, setOfferToIssue] = useState(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);

  // Eligible Applications for offer creation
  const [eligibleApplications, setEligibleApplications] = useState([]);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    applicationId: '',
    designation: '',
    employmentType: 'FULL_TIME',
    salary: '',
    currency: 'INR',
    joiningDate: '',
    expiryDate: '',
    termsAndConditions: 'Standard 3-month probation period applies. Employment subject to satisfactory background checks.',
    notes: '',
  });

  const [withdrawReason, setWithdrawReason] = useState('');

  const loadData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [metricsData, listData] = await Promise.all([
        offersApi.getAdminMetrics(),
        offersApi.getAdminOffers({
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter,
          search,
        }),
      ]);
      setMetrics(metricsData || {});
      setOffers(listData.data || []);
      if (listData.pagination) setPagination(listData.pagination);
    } catch (err) {
      console.error('Failed to load offers:', err);
      if (!isSilent) toast?.showError(err.message || 'Failed to load offers');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);

    // Auto-poll every 15s silently without flashing the loading spinner
    const pollTimer = setInterval(() => {
      loadData(true);
    }, 15000);

    // Refresh silently when user focuses back on window
    const handleFocus = () => loadData(true);
    window.addEventListener('focus', handleFocus);

    // Refresh when actions happen in other components
    const handleDataUpdated = () => loadData(true);
    window.addEventListener('nexora:data-updated', handleDataUpdated);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('nexora:data-updated', handleDataUpdated);
    };
  }, [pagination.page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadData();
  };

  const handleKpiCardClick = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePreview = async (offer) => {
    setSelectedOffer(offer);
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewHtml('');
    try {
      const html = await offersApi.getOfferHtml(offer.id, 'admin');
      setPreviewHtml(html);
    } catch (err) {
      console.error('Failed to load offer preview:', err);
      toast?.showError(err.message || 'Failed to load offer letter preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      // Find candidate applications eligible for offer
      // Fetch applications along with interviews to determine exact interview clearance
      const [appsRes, interviewsRes] = await Promise.all([
        adminReviewApi.getApplications({ limit: 100 }),
        interviewsApi.getAdminInterviews({ limit: 100 }).catch(() => ({ interviews: [] })),
      ]);

      const allInterviews = interviewsRes?.interviews || interviewsRes?.data?.interviews || interviewsRes?.data || [];

      // Map application clearance details
      // Filter candidates: Only candidates whose interviews are completed and cleared (or status is SELECTED / OFFER_EXTENDED with completed interviews)
      const candidates = (appsRes.applications || [])
        .map((app) => {
          // Find all interviews for this application
          const appInterviews = allInterviews.filter((i) => i.applicationId === app.id);
          const completedRounds = appInterviews.filter((i) => i.status === 'COMPLETED');
          const clearedRounds = completedRounds.filter((i) => {
            const rec = i.feedbacks?.[0]?.recommendation;
            return rec === 'STRONG_HIRE' || rec === 'RECOMMENDED' || !rec;
          });
          const hasPendingInterviews = appInterviews.some((i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED');
          const isRejected = appInterviews.some((i) => i.feedbacks?.[0]?.recommendation === 'NOT_RECOMMENDED') || app.status === 'REJECTED';

          return {
            ...app,
            totalInterviewsCount: appInterviews.length,
            completedRoundsCount: completedRounds.length,
            clearedRoundsCount: clearedRounds.length,
            clearedRoundNames: clearedRounds.map((r) => r.round.replace('_', ' ')).join(', '),
            hasClearedInterviews: clearedRounds.length > 0,
            hasPendingInterviews,
            isRejected,
          };
        })
        .filter((app) => {
          // Exclude rejected candidates
          if (app.isRejected) return false;
          // Exclude candidates with pending scheduled interviews
          if (app.hasPendingInterviews) return false;
          // Must either be officially SELECTED or have cleared interview rounds
          if (app.status === 'SELECTED' || app.status === 'OFFER_EXTENDED') {
            return true;
          }
          // Or candidate whose interviews are all completed & cleared
          return app.hasClearedInterviews && app.completedRoundsCount > 0;
        });

      setEligibleApplications(candidates);
      setCreateModalOpen(true);
    } catch (err) {
      toast?.showError('Failed to load candidates: ' + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.applicationId) {
      toast?.showError('Please select a candidate application');
      return;
    }
    try {
      setSubmitting(true);
      const created = await offersApi.createOffer({
        applicationId: createForm.applicationId,
        designation: createForm.designation,
        employmentType: createForm.employmentType,
        salary: createForm.salary ? parseFloat(createForm.salary) : undefined,
        currency: createForm.currency,
        joiningDate: createForm.joiningDate,
        expiryDate: createForm.expiryDate || undefined,
        termsAndConditions: createForm.termsAndConditions,
        notes: createForm.notes,
      });

      // Upload attached PDF if provided
      if (selectedPdfFile && created?.id) {
        try {
          await offersApi.uploadOfferAttachment(created.id, selectedPdfFile);
        } catch (attachErr) {
          toast?.showError('Offer created, but failed to attach PDF: ' + attachErr.message);
        }
      }

      toast?.showSuccess('Draft offer letter created');
      setCreateModalOpen(false);
      setSelectedPdfFile(null);
      setCreateForm({
        applicationId: '',
        designation: '',
        employmentType: 'FULL_TIME',
        salary: '',
        currency: 'INR',
        joiningDate: '',
        expiryDate: '',
        termsAndConditions: 'Standard 3-month probation period applies. Employment subject to satisfactory background checks.',
        notes: '',
      });
      loadData();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      toast?.showError(err.message || 'Failed to create offer');
    } finally {
      setSubmitting(false);
    }
  };

  const openIssueModal = (offer) => {
    setOfferToIssue(offer);
    setIssueConfirmModalOpen(true);
  };

  const handleConfirmIssue = async () => {
    if (!offerToIssue || submitting) return;
    if (!offerToIssue.attachment) {
      toast?.showError('A signed offer letter PDF attachment is mandatory before issuing. Please upload the PDF document.');
      return;
    }
    try {
      setSubmitting(true);
      await offersApi.issueOffer(offerToIssue.id);
      toast?.showSuccess(`Offer ${offerToIssue.offerCode} issued successfully to ${offerToIssue.applicant?.fullName || 'candidate'}`);
      setIssueConfirmModalOpen(false);
      setOfferToIssue(null);
      loadData();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      toast?.showError(err.message || 'Failed to issue offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffer || submitting) return;
    try {
      setSubmitting(true);
      await offersApi.withdrawOffer(selectedOffer.id, withdrawReason);
      toast?.showSuccess(`Offer ${selectedOffer.offerCode} withdrawn`);
      setWithdrawModalOpen(false);
      setWithdrawReason('');
      loadData();
      window.dispatchEvent(new CustomEvent('nexora:data-updated'));
    } catch (err) {
      toast?.showError(err.message || 'Failed to withdraw offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Offer Letter Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Create, issue and track candidate job offers, compensation details, and acceptance statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>Prepare Job Offer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          onClick={() => handleKpiCardClick('ALL')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter all offers"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'ALL' ? '2px solid #2563EB' : '1px solid #BFDBFE',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'ALL' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'ALL' ? '0 8px 20px -4px rgba(37, 99, 235, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Total Offers</span>
            {statusFilter === 'ALL' && <span style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>{metrics.total || 0}</div>
        </div>

        <div
          onClick={() => handleKpiCardClick('DRAFT')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter draft offers"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'DRAFT' ? '2px solid #D97706' : '1px solid #FDE68A',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'DRAFT' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'DRAFT' ? '0 8px 20px -4px rgba(217, 119, 6, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#D97706', textTransform: 'uppercase', fontWeight: 700 }}>Drafts</span>
            {statusFilter === 'DRAFT' && <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#D97706', marginTop: '0.25rem' }}>{metrics.draft || 0}</div>
        </div>

        <div
          onClick={() => handleKpiCardClick('ISSUED')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter issued offers"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'ISSUED' ? '2px solid #2563EB' : '1px solid #DBEAFE',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'ISSUED' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'ISSUED' ? '0 8px 20px -4px rgba(37, 99, 235, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#2563EB', textTransform: 'uppercase', fontWeight: 700 }}>Issued</span>
            {statusFilter === 'ISSUED' && <span style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563EB', marginTop: '0.25rem' }}>{metrics.issued || 0}</div>
        </div>

        <div
          onClick={() => handleKpiCardClick('ACCEPTED')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter accepted offers"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'ACCEPTED' ? '2px solid #059669' : '1px solid #A7F3D0',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'ACCEPTED' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'ACCEPTED' ? '0 8px 20px -4px rgba(5, 150, 105, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>Accepted</span>
            {statusFilter === 'ACCEPTED' && <span style={{ fontSize: '0.65rem', background: '#D1FAE5', color: '#065F46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{metrics.accepted || 0}</div>
        </div>

        <div
          onClick={() => handleKpiCardClick('DECLINED')}
          className="card"
          role="button"
          tabIndex={0}
          title="Click to filter declined offers"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            border: statusFilter === 'DECLINED' ? '2px solid #DC2626' : '1px solid #FECACA',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            transform: statusFilter === 'DECLINED' ? 'scale(1.02)' : 'none',
            boxShadow: statusFilter === 'DECLINED' ? '0 8px 20px -4px rgba(220, 38, 38, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#DC2626', textTransform: 'uppercase', fontWeight: 700 }}>Declined</span>
            {statusFilter === 'DECLINED' && <span style={{ fontSize: '0.65rem', background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#DC2626', marginTop: '0.25rem' }}>{metrics.declined || 0}</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search offer code, candidate, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '10px' }}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="form-control"
              style={{ width: '100%', borderRadius: '10px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 1rem' }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Offers Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
          <RotateCcw className="animate-spin" size={32} style={{ margin: '0 auto 0.75rem' }} />
          <div>Loading offers...</div>
        </div>
      ) : offers.length === 0 ? (
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Job Offers Found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            There are no offer records matching your current criteria.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            Create New Offer
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
            <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Offer Ref</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Candidate</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Designation & Package</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Joining Date</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const candidateName = offer.applicant?.fullName || 'Candidate';
                  const candidateEmail = offer.applicant?.email || '';
                  const salaryDisplay = offer.salary ? `${offer.currency} ${Number(offer.salary).toLocaleString('en-IN')}` : 'Not specified';
                  const isDraft = offer.status === 'DRAFT';
                  const isIssued = offer.status === 'ISSUED';

                  return (
                    <tr key={offer.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                        {offer.offerCode}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{candidateName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{candidateEmail}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{offer.designation}</div>
                        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>{salaryDisplay} / yr</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#0F172A', fontSize: '0.85rem' }}>
                        {new Date(offer.joiningDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          className={`badge ${
                            offer.status === 'ACCEPTED'
                              ? 'badge-success'
                              : offer.status === 'DECLINED' || offer.status === 'WITHDRAWN'
                              ? 'badge-danger'
                              : offer.status === 'ISSUED'
                              ? 'badge-primary'
                              : 'badge-warning'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {offer.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {offer.attachment ? (
                            <button
                              type="button"
                              onClick={() => offersApi.downloadOfferAttachment(offer.id, 'admin')}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#1D4ED8' }}
                              title={`Download attached PDF (${offer.attachment.originalFilename})`}
                            >
                              <FileText size={13} />
                              <span>PDF</span>
                            </button>
                          ) : isDraft ? (
                            <label
                              style={{ cursor: 'pointer', padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Upload mandatory PDF attachment before issuing"
                            >
                              <Upload size={13} />
                              <span>Attach PDF</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      await offersApi.uploadOfferAttachment(offer.id, file);
                                      toast?.showSuccess('PDF attached to offer draft.');
                                      loadData(true);
                                    } catch (err) {
                                      toast?.showError(err.message || 'Failed to attach PDF');
                                    }
                                  }
                                }}
                              />
                            </label>
                          ) : null}

                          <button
                            onClick={() => handlePreview(offer)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            title="Preview Offer Letter"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>

                          {isDraft && (
                            <button
                              onClick={() => openIssueModal(offer)}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              title="Issue to Candidate"
                            >
                              <Send size={13} />
                              <span>Issue</span>
                            </button>
                          )}

                          {isIssued && (
                            <button
                              onClick={() => {
                                setSelectedOffer(offer);
                                setWithdrawModalOpen(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#DC2626' }}
                              title="Withdraw Offer"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards View */}
          <div className="mobile-cards-view" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {offers.map((offer) => {
              const candidateName = offer.applicant?.fullName || 'Candidate';
              const salaryDisplay = offer.salary ? `${offer.currency} ${Number(offer.salary).toLocaleString('en-IN')}` : 'Not specified';
              const isDraft = offer.status === 'DRAFT';
              const isIssued = offer.status === 'ISSUED';

              return (
                <div
                  key={`card-${offer.id}`}
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
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                        {offer.offerCode}
                      </span>
                      <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                        {candidateName}
                      </h4>
                      <div style={{ fontSize: '0.825rem', color: '#334155' }}>{offer.designation}</div>
                    </div>
                    <span
                      className={`badge ${
                        offer.status === 'ACCEPTED'
                          ? 'badge-success'
                          : offer.status === 'DECLINED' || offer.status === 'WITHDRAWN'
                          ? 'badge-danger'
                          : offer.status === 'ISSUED'
                          ? 'badge-primary'
                          : 'badge-warning'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {offer.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                    <div><strong>Package:</strong> {salaryDisplay} / yr</div>
                    <div><strong>Joining Date:</strong> {new Date(offer.joiningDate).toLocaleDateString()}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handlePreview(offer)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      Preview Letter
                    </button>
                    {isDraft && (
                      <button
                        onClick={() => openIssueModal(offer)}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center' }}
                      >
                        Issue Offer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE OFFER MODAL */}
      {createModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Prepare Official Job Offer</h3>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Select Candidate Application *
                  </label>
                  <select
                    required
                    value={createForm.applicationId}
                    onChange={(e) => {
                      const appId = e.target.value;
                      const app = eligibleApplications.find((a) => a.id === appId);
                      setCreateForm({
                        ...createForm,
                        applicationId: appId,
                        designation: app?.job?.title || createForm.designation,
                      });
                    }}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    <option value="">-- Choose Candidate --</option>
                    {eligibleApplications.map((app) => {
                      const clearanceText = app.hasClearedInterviews
                        ? `✓ [Interview Cleared: ${app.clearedRoundNames}]`
                        : app.status === 'SELECTED'
                        ? '★ [Selected for Offer]'
                        : '[Interview Pending]';
                      return (
                        <option key={app.id} value={app.id}>
                          {app.applicant?.fullName} — {app.job?.title} ({app.referenceNumber}) {clearanceText}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Official Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="Senior Full Stack Engineer"
                      value={createForm.designation}
                      onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Employment Type *</label>
                    <select
                      value={createForm.employmentType}
                      onChange={(e) => setCreateForm({ ...createForm, employmentType: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Annual Compensation (CTC) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      placeholder="e.g. 1800000"
                      value={createForm.salary}
                      onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Currency *</label>
                    <select
                      value={createForm.currency}
                      onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Joining Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={createForm.joiningDate}
                      onChange={(e) => setCreateForm({ ...createForm, joiningDate: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Offer Acceptance Deadline</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={createForm.expiryDate}
                      onChange={(e) => setCreateForm({ ...createForm, expiryDate: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Terms & Contingencies</label>
                  <textarea
                    rows={3}
                    value={createForm.termsAndConditions}
                    onChange={(e) => setCreateForm({ ...createForm, termsAndConditions: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>

                {/* PDF Attachment Upload (Mandatory before issuing) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Attach Official Offer Letter PDF (Required before issuing) *
                  </label>
                  <div style={{ padding: '1rem', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <label
                        className="btn btn-secondary"
                        style={{ cursor: 'pointer', padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Upload size={14} />
                        <span>Select PDF Document</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                                toast?.showError('Only PDF files are accepted for offer letters.');
                                return;
                              }
                              if (file.size > 10 * 1024 * 1024) {
                                toast?.showError('Offer letter PDF cannot exceed 10 MB.');
                                return;
                              }
                              setSelectedPdfFile(file);
                            }
                          }}
                        />
                      </label>
                      {selectedPdfFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                          <CheckCircle size={15} />
                          <span>{selectedPdfFile.name} ({(selectedPdfFile.size / 1024).toFixed(1)} KB)</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPdfFile(null)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          No PDF attached yet. You can attach it now or while offer is in DRAFT.
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                    Upload your organization's signed offer letter PDF. The candidate will review and download this official PDF attachment from their candidate hub.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating Draft...' : 'Save Draft Offer'}
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
                  Offer Letter Preview — {selectedOffer.offerCode}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Candidate: <strong>{selectedOffer.applicant?.fullName}</strong> &bull; {selectedOffer.designation}
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
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading official offer letter preview...</span>
                </div>
              ) : previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Offer Letter Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#DC2626' }}>
                  Failed to render preview. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ISSUE OFFER MODAL (Replaces window.confirm popup) */}
      {issueConfirmModalOpen && offerToIssue && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Send size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Issue Official Offer</h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Offer Ref: <code>{offerToIssue.offerCode}</code></div>
                </div>
              </div>
              <button onClick={() => !submitting && setIssueConfirmModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to issue this employment offer to <strong>{offerToIssue.applicant?.fullName || 'the candidate'}</strong>?
              </p>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Position:</span>
                  <strong style={{ color: '#0F172A' }}>{offerToIssue.designation}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Annual Package:</span>
                  <strong style={{ color: '#059669' }}>
                    {offerToIssue.salary ? `${offerToIssue.currency} ${Number(offerToIssue.salary).toLocaleString('en-IN')} / yr` : 'Not specified'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Joining Date:</span>
                  <strong style={{ color: '#0F172A' }}>{new Date(offerToIssue.joiningDate).toLocaleDateString()}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#059669" />
                <span>An official email and in-app candidate notification will be sent automatically.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIssueConfirmModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmIssue}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {submitting ? (
                  <>
                    <RotateCcw className="animate-spin" size={16} />
                    <span>Issuing Offer...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Official Offer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {withdrawModalOpen && selectedOffer && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#DC2626' }}>Withdraw Employment Offer</h3>
              <button onClick={() => setWithdrawModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Are you sure you want to withdraw offer <strong>{selectedOffer.offerCode}</strong> issued to <strong>{selectedOffer.applicant?.fullName}</strong>?
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Reason for Withdrawal *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Candidate unresponsive / Position rescinded / Discrepancy during verification..."
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={() => setWithdrawModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-danger" style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.55rem 1.15rem', borderRadius: '8px' }}>
                  {submitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
