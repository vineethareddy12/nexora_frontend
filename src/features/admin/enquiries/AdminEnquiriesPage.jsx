import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, CheckCircle2, AlertCircle, RefreshCw, X, Trash2, Search, Clock, Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { enquiryApi } from '../../public/contact/api/enquiryApi';
import { useToast } from '../../../components/toast/ToastContext';

export default function AdminEnquiriesPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [modalStatus, setModalStatus] = useState('NEW');
  const [modalNotes, setModalNotes] = useState('');

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm.trim() || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      };
      const res = await enquiryApi.getAdminEnquiries(params, token);
      setEnquiries(res.items || res.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError(err.message || 'Failed to load contact enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnquiries();
    }, 250);

    const handleAuth = () => fetchEnquiries();
    window.addEventListener('nexora:admin-authenticated', handleAuth);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('nexora:admin-authenticated', handleAuth);
    };
  }, [searchTerm, filterStatus, token, accessToken]);

  const handleOpenDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setModalStatus(enquiry.status || 'NEW');
    setModalNotes(enquiry.adminNotes || '');
    setModalOpen(true);
  };

  const handleUpdateStatusAndNotes = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

    try {
      setSavingNotes(true);
      await enquiryApi.updateEnquiryStatus(selectedEnquiry.id, modalStatus, modalNotes, currentToken);
      toast.success(`Enquiry from "${selectedEnquiry.fullName}" updated!`, { title: 'Status Saved' });
      setModalOpen(false);
      fetchEnquiries();
    } catch (err) {
      toast.error(err.message || 'Failed to update enquiry status/notes.', { title: 'Update Failed' });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (enquiry) => {
    if (!window.confirm(`Are you sure you want to delete enquiry from "${enquiry.fullName}"?`)) {
      return;
    }
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);
    try {
      await enquiryApi.deleteEnquiry(enquiry.id, currentToken);
      toast.success(`Enquiry from "${enquiry.fullName}" was deleted.`, { title: 'Enquiry Deleted' });
      fetchEnquiries();
    } catch (err) {
      toast.error(err.message || 'Failed to delete enquiry.', { title: 'Delete Failed' });
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Standard Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Client Inbound Enquiries
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Review inbound client inquiries, manage response workflow, and record confidential admin remarks.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.5rem', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
          >
            <option value="ALL">All Enquiry Statuses</option>
            <option value="NEW">New (Unreviewed)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table & Mobile Cards */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <RefreshCw className="animate-spin" size={28} color="#2563EB" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B', margin: 0 }}>Loading enquiries...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#DC2626' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
            <p>{error}</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <MessageSquare size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Enquiries Found</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Inbound website contact messages will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Sender</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Subject</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Received</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '220px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.fullName}>{item.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.email}>{item.email}</div>
                        {item.phone && <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.phone}</div>}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.subject}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.message}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {item.status === 'NEW' && <span className="badge badge-warning">New</span>}
                        {item.status === 'IN_PROGRESS' && <span className="badge badge-info">In Progress</span>}
                        {item.status === 'RESOLVED' && <span className="badge badge-success">Resolved</span>}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenDetails(item)}
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View */}
            <div className="mobile-cards-view" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {enquiries.map((item) => (
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
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{item.fullName}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', wordBreak: 'break-all' }}>{item.email}</div>
                    </div>
                    {item.status === 'NEW' && <span className="badge badge-warning">New</span>}
                    {item.status === 'IN_PROGRESS' && <span className="badge badge-info">In Progress</span>}
                    {item.status === 'RESOLVED' && <span className="badge badge-success">Resolved</span>}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{item.subject}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {item.message}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenDetails(item)}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={13} />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Message & Update Status Modal */}
      {modalOpen && selectedEnquiry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 2.5vw, 1.5rem)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)', padding: 'clamp(1.25rem, 4vw, 2rem)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Inbound Enquiry</span>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{selectedEnquiry.subject}</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Received on {new Date(selectedEnquiry.createdAt).toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Sender Name</div>
                  <div style={{ fontWeight: 600 }}>{selectedEnquiry.fullName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Email Address</div>
                  <div style={{ color: 'var(--accent)' }}>{selectedEnquiry.email}</div>
                </div>
                {selectedEnquiry.phone && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Phone Number</div>
                    <div>{selectedEnquiry.phone}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Message Content
              </label>
              <div style={{ padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {selectedEnquiry.message}
              </div>
            </div>

            <form onSubmit={handleUpdateStatusAndNotes} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Update Enquiry Lifecycle Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                >
                  <option value="NEW">New (Unresolved)</option>
                  <option value="IN_PROGRESS">In Progress (Under Review / Contacted)</option>
                  <option value="RESOLVED">Resolved (Completed)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Confidential Admin Notes (Internal Only)
                </label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Record follow-up actions, team assignment, or meeting dates..."
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Close
                </button>
                <button type="submit" disabled={savingNotes} className="btn btn-primary" style={{ minWidth: '150px' }}>
                  {savingNotes ? 'Saving...' : 'Update Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
