import React, { useState, useEffect } from 'react';
import { 
  History, 
  Shield, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  X,
  User,
  Activity
} from 'lucide-react';
import { auditApi } from '../../audit/auditApi';
import { useToast } from '../../../components/toast/ToastContext';

export default function AdminActivityPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Metadata Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await auditApi.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        search,
        action: actionFilter,
        actorRole: roleFilter,
      });
      setLogs(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast?.showError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [pagination.page, actionFilter, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadLogs();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Standard Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', borderRadius: '16px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Shield size={14} />
            <span>Compliance & Security Audit Trail</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Administrative Audit Logs
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Immutable records of critical recruitment decisions, offers, stage progressions, and access events.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '0.55rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search description, email, action type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '10px' }}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="form-control"
              style={{ width: '100%', borderRadius: '10px' }}
            >
              <option value="ALL">All Actions</option>
              <option value="APPLICATION_SUBMITTED">Application Submitted</option>
              <option value="STATUS_UPDATED">Status Updated</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="INTERVIEW_RESCHEDULED">Interview Rescheduled</option>
              <option value="INTERVIEW_CANCELLED">Interview Cancelled</option>
              <option value="INTERVIEW_FEEDBACK">Interview Feedback</option>
              <option value="OFFER_CREATED">Offer Created</option>
              <option value="OFFER_ISSUED">Offer Issued</option>
              <option value="OFFER_ACCEPTED">Offer Accepted</option>
              <option value="OFFER_DECLINED">Offer Declined</option>
              <option value="OFFER_WITHDRAWN">Offer Withdrawn</option>
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="form-control"
              style={{ width: '100%', borderRadius: '10px' }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="APPLICANT">Applicant</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setActionFilter('ALL');
              setRoleFilter('ALL');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 1rem' }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Logs Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
          <RotateCcw className="animate-spin" size={32} style={{ margin: '0 auto 0.75rem' }} />
          <div>Loading audit trail...</div>
        </div>
      ) : logs.length === 0 ? (
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Audit Logs Found</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            No administrative or candidate events matched your current search and filter criteria.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          {/* Desktop Table View */}
          <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
            <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Action Event</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Actor</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Entity</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Description</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const dateStr = new Date(log.createdAt).toLocaleString();
                  const roleBadge = log.actorRole === 'ADMIN' ? 'badge-primary' : 'badge-neutral';

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>
                          {log.actorEmail || 'System'}
                        </div>
                        {log.actorRole && (
                          <span className={`badge ${roleBadge}`} style={{ fontSize: '0.65rem' }}>
                            {log.actorRole}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.825rem' }}>
                        <div>{log.entityType || '—'}</div>
                        {log.entityId && (
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                            {log.entityId.substring(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#334155', fontSize: '0.85rem', maxWidth: '320px' }}>
                        {log.description}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards View */}
          <div className="mobile-cards-view" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {logs.map((log) => {
              const dateStr = new Date(log.createdAt).toLocaleString();
              return (
                <div
                  key={`card-${log.id}`}
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
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>{dateStr}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 500 }}>
                    {log.description}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                    <span>By: {log.actorEmail || 'System'}</span>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      Inspect
                    </button>
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

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Audit Log Inspection</h3>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Action</strong>
                <span className="badge badge-primary" style={{ fontFamily: 'monospace', marginTop: '0.2rem' }}>{selectedLog.action}</span>
              </div>

              <div>
                <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Description</strong>
                <p style={{ margin: '0.2rem 0 0', color: '#0F172A' }}>{selectedLog.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Actor Email</strong>
                  <span style={{ color: '#0F172A' }}>{selectedLog.actorEmail || 'System'}</span>
                </div>
                <div>
                  <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Actor Role</strong>
                  <span style={{ color: '#0F172A' }}>{selectedLog.actorRole || 'SYSTEM'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Entity Type</strong>
                  <span style={{ color: '#0F172A' }}>{selectedLog.entityType || '—'}</span>
                </div>
                <div>
                  <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Entity ID</strong>
                  <span style={{ color: '#0F172A', fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedLog.entityId || '—'}</span>
                </div>
              </div>

              <div>
                <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Timestamp</strong>
                <span style={{ color: '#0F172A' }}>{new Date(selectedLog.createdAt).toUTCString()}</span>
              </div>

              {selectedLog.metadata && (
                <div>
                  <strong style={{ color: '#64748B', display: 'block', textTransform: 'uppercase', fontSize: '0.75rem' }}>Raw Metadata</strong>
                  <pre style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', overflowX: 'auto', border: '1px solid #E2E8F0', marginTop: '0.25rem' }}>
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <button type="button" onClick={() => setSelectedLog(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
