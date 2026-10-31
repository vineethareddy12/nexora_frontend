import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  RefreshCw,
  FolderOpen,
  Plus,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Award,
  BookOpen,
  Briefcase,
  HelpCircle,
  X,
  File,
  Loader2,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { documentsApi } from './documentsApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../components/toast/ToastContext';
import { clientCache } from '../../../core/cache/clientCache';
import { TableSkeleton, RefreshBadge, ErrorState, EmptyState } from '../../../components/common/LoadingStates';

// Human-friendly document type labels & badges
const DOCUMENT_TYPE_CONFIG = {
  RESUME: {
    label: 'Resume / CV',
    badgeClass: 'badge-primary',
    icon: FileText,
    description: 'Curriculum vitae for candidate evaluation',
  },
  EDUCATIONAL_CERTIFICATE: {
    label: 'Educational Certificate',
    badgeClass: 'badge-info',
    icon: BookOpen,
    description: 'Degree, diploma, or marks card',
  },
  INTERNSHIP_CERTIFICATE: {
    label: 'Internship Certificate',
    badgeClass: 'badge-warning',
    icon: Award,
    description: 'Proof of completed industry internship',
  },
  EXPERIENCE_CERTIFICATE: {
    label: 'Experience Certificate',
    badgeClass: 'badge-success',
    icon: Briefcase,
    description: 'Relieving letter or service certificate',
  },
  OTHER: {
    label: 'Other Credential',
    badgeClass: 'badge-neutral',
    icon: HelpCircle,
    description: 'Certifications, awards, or supporting credentials',
  },
};

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export default function ApplicantDocumentsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState('ALL');
  const cacheKey = clientCache.makeKey(`applicant_documents_${activeFilter}`, user?.id);
  const cachedData = clientCache.get(cacheKey);

  const [documents, setDocuments] = useState(() => cachedData || []);
  const [loading, setLoading] = useState(!cachedData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected item for replace / delete
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form states
  const [formFile, setFormFile] = useState(null);
  const [formType, setFormType] = useState('RESUME');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Action feedback states
  const [downloadingId, setDownloadingId] = useState(null);

  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Fetch documents on load or filter change
  const fetchDocuments = async (isSilent = false) => {
    try {
      if (!isSilent && documents.length === 0) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setFetchError(null);

      const data = await clientCache.fetchWithDedupe(
        cacheKey,
        () => documentsApi.getDocuments({
          type: activeFilter === 'ALL' ? undefined : activeFilter,
        }),
        15000
      );

      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      if (documents.length === 0) {
        setFetchError(err.message || 'Unable to retrieve your documents repository.');
      } else {
        toast.error(err.message || 'Failed to update documents vault in background.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments(!!cachedData);
  }, [activeFilter, cacheKey]);

  // Handle client-side file selection & validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormError(null);

    if (!file) {
      setFormFile(null);
      return;
    }

    // Check extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFormError(`Invalid format "${ext}". Only PDF, JPG, JPEG, and PNG files are accepted.`);
      setFormFile(null);
      return;
    }

    // Check size
    if (file.size > MAX_SIZE_BYTES) {
      setFormError(`File size (${formatBytes(file.size)}) exceeds the maximum allowed 5 MB limit.`);
      setFormFile(null);
      return;
    }

    setFormFile(file);
  };

  // Upload handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formFile) {
      setFormError('Please select a document file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      await documentsApi.uploadDocument({
        file: formFile,
        type: formType,
        description: formDescription.trim() || undefined,
      });

      toast.success('Document uploaded and stored securely in your vault.', {
        title: 'Upload Complete',
      });
      setIsUploadModalOpen(false);
      resetForm();
      clientCache.invalidate('applicant_documents');
      fetchDocuments(true);
    } catch (err) {
      console.error('Upload failed:', err);
      setFormError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Replace handler
  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!formFile) {
      setFormError('Please select a replacement document file.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await documentsApi.replaceDocument(selectedDoc.id, {
        file: formFile,
        type: formType || selectedDoc.type,
      });

      if (res?.preservedHistoricalVersion) {
        toast.info(
          'A new document version was created. Historical versions used in submitted applications have been safely preserved.',
          { title: 'Version Preserved' }
        );
      } else {
        toast.success('Document replaced successfully.', { title: 'Updated' });
      }

      setIsReplaceModalOpen(false);
      resetForm();
      clientCache.invalidate('applicant_documents');
      fetchDocuments(true);
    } catch (err) {
      console.error('Replace failed:', err);
      setFormError(err.message || 'Failed to replace document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteSubmit = async () => {
    if (!selectedDoc) return;

    try {
      setSubmitting(true);
      const res = await documentsApi.deleteDocument(selectedDoc.id);

      if (res?.archived) {
        toast.info(
          'Document removed from active list and preserved for submitted applications.',
          { title: 'Archived for Applications' }
        );
      } else {
        toast.success('Document removed permanently from your vault.', { title: 'Deleted' });
      }

      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      clientCache.invalidate('applicant_documents');
      fetchDocuments(true);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to delete document.');
    } finally {
      setSubmitting(false);
    }
  };

  // Download handler
  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      await documentsApi.downloadDocument(doc.id, doc.originalFilename);
      toast.success(`Downloaded ${doc.originalFilename}`, { title: 'Download Started' });
    } catch (err) {
      console.error('Download error:', err);
      toast.error(err.message || 'Unable to download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const openReplaceModal = (doc) => {
    setSelectedDoc(doc);
    setFormType(doc.type);
    setFormFile(null);
    setFormError(null);
    setIsReplaceModalOpen(true);
  };

  const openDeleteModal = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormFile(null);
    setFormType('RESUME');
    setFormDescription('');
    setFormError(null);
    setSelectedDoc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
  };

  // Aggregated Stats
  const resumeCount = documents.filter((d) => d.type === 'RESUME').length;
  const certificateCount = documents.filter((d) => d.type !== 'RESUME').length;
  const totalSizeBytes = documents.reduce((acc, curr) => acc + (curr.fileSizeBytes || 0), 0);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%', padding: '0 0.5rem 3rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Resume & Documents Vault
            </h1>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Securely upload, update, and manage your CVs, educational degrees, and professional certificates for job applications.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <RefreshBadge isRefreshing={isRefreshing} onRefresh={() => fetchDocuments(false)} />
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsUploadModalOpen(true);
            }}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              fontWeight: 600,
              borderRadius: '10px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={18} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* 2. Vault Quick Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Documents Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FolderOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Files
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              {documents.length}
            </div>
          </div>
        </div>

        {/* Resumes Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#F0FDF4',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resumes / CVs
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              {resumeCount}
            </div>
          </div>
        </div>

        {/* Certificates Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ECFEFF',
              color: '#0891B2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Certificates
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              {certificateCount}
            </div>
          </div>
        </div>

        {/* Storage Vault Usage Card */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#FAF5FF',
              color: '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Storage Consumed
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              {formatBytes(totalSizeBytes)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { key: 'ALL', label: 'All Documents' },
          { key: 'RESUME', label: 'Resumes' },
          { key: 'EDUCATIONAL_CERTIFICATE', label: 'Educational' },
          { key: 'INTERNSHIP_CERTIFICATE', label: 'Internships' },
          { key: 'EXPERIENCE_CERTIFICATE', label: 'Experience' },
          { key: 'OTHER', label: 'Other' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: activeFilter === tab.key ? 600 : 500,
              background: activeFilter === tab.key ? '#2563EB' : '#FFFFFF',
              color: activeFilter === tab.key ? '#FFFFFF' : '#475569',
              border: activeFilter === tab.key ? '1px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Document List / Table */}
      {fetchError && documents.length === 0 ? (
        <ErrorState
          title="Unable to load documents vault"
          message={fetchError}
          onRetry={() => fetchDocuments(false)}
        />
      ) : loading && documents.length === 0 ? (
        <TableSkeleton rows={4} columns={5} />
      ) : documents.length === 0 ? (
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          {/* Empty State */}
          <div style={{ padding: '4.5rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#94A3B8',
              }}
            >
              <FolderOpen size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              No Documents in this Category
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              {activeFilter === 'ALL'
                ? 'Your document vault is currently empty. Upload your resume or certifications so you can seamlessly attach them to job applications.'
                : `No documents found matching the "${DOCUMENT_TYPE_CONFIG[activeFilter]?.label || activeFilter}" filter.`}
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                if (activeFilter !== 'ALL') setFormType(activeFilter);
                setIsUploadModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
            >
              <Plus size={16} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <>
            {/* Desktop / Tablet Documents Table */}
            <div className="desktop-table-view table-responsive">
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                      Document Name
                    </th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                      Type
                    </th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                      File Size
                    </th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                      Uploaded Date
                    </th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                      Application Status
                    </th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const typeConfig = DOCUMENT_TYPE_CONFIG[doc.type] || DOCUMENT_TYPE_CONFIG.OTHER;
                    const TypeIcon = typeConfig.icon;
                    const isDownloading = downloadingId === doc.id;

                    return (
                      <tr
                        key={doc.id}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Name & File Details */}
                        <td style={{ padding: '1.15rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#2563EB',
                                flexShrink: 0,
                              }}
                            >
                              <TypeIcon size={19} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.925rem', color: '#0F172A', wordBreak: 'break-word' }}>
                                {doc.originalFilename}
                              </div>
                              {doc.metadata?.description && (
                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                                  {doc.metadata.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td style={{ padding: '1.15rem 1.5rem' }}>
                          <span className={`badge ${typeConfig.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                            {typeConfig.label}
                          </span>
                        </td>

                        {/* File Size */}
                        <td style={{ padding: '1.15rem 1.5rem', fontSize: '0.875rem', color: '#475569' }}>
                          {formatBytes(doc.fileSizeBytes)}
                        </td>

                        {/* Upload Date */}
                        <td style={{ padding: '1.15rem 1.5rem', fontSize: '0.875rem', color: '#475569' }}>
                          {formatDate(doc.createdAt)}
                        </td>

                        {/* Application Reference Status */}
                        <td style={{ padding: '1.15rem 1.5rem' }}>
                          {doc.applicationCount > 0 ? (
                            <span
                              className="badge badge-success"
                              style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Attached to active or historical job applications. Replacing or deleting will preserve historical versions safely."
                            >
                              <ShieldCheck size={12} />
                              <span>In {doc.applicationCount} Application{doc.applicationCount > 1 ? 's' : ''}</span>
                            </span>
                          ) : (
                            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                              Ready to Attach
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '1.15rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleDownload(doc)}
                              disabled={isDownloading}
                              title="Download document"
                              style={{
                                padding: '0.45rem 0.65rem',
                                borderRadius: '8px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                color: '#2563EB',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                              }}
                            >
                              {isDownloading ? (
                                <Loader2 size={14} className="spin" />
                              ) : (
                                <Download size={14} />
                              )}
                              <span>Download</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openReplaceModal(doc)}
                              title="Replace with new file"
                              style={{
                                padding: '0.45rem 0.65rem',
                                borderRadius: '8px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                color: '#475569',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                              }}
                            >
                              <RefreshCw size={14} />
                              <span>Replace</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(doc)}
                              title="Delete document"
                              style={{
                                padding: '0.45rem 0.65rem',
                                borderRadius: '8px',
                                background: '#FFFFFF',
                                border: '1px solid #FEE2E2',
                                color: '#EF4444',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                fontSize: '0.8rem',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View (Clean vertical scroll, 100% visible) */}
            <div className="mobile-cards-view" style={{ padding: '1rem' }}>
              {documents.map((doc) => {
                const typeConfig = DOCUMENT_TYPE_CONFIG[doc.type] || DOCUMENT_TYPE_CONFIG.OTHER;
                const TypeIcon = typeConfig.icon;
                const isDownloading = downloadingId === doc.id;

                return (
                  <div
                    key={`card-${doc.id}`}
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
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563EB',
                          flexShrink: 0,
                        }}
                      >
                        <TypeIcon size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A', wordBreak: 'break-word' }}>
                          {doc.originalFilename}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem', alignItems: 'center' }}>
                          <span className={`badge ${typeConfig.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                            {typeConfig.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {formatBytes(doc.fileSizeBytes)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>•</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {formatDate(doc.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        {doc.applicationCount > 0 ? (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShieldCheck size={11} />
                            <span>In {doc.applicationCount} App{doc.applicationCount > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            Ready to Attach
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          disabled={isDownloading}
                          style={{
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            background: '#EFF6FF',
                            border: '1px solid #DBEAFE',
                            color: '#2563EB',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {isDownloading ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
                          <span>Download</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openReplaceModal(doc)}
                          style={{
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                          }}
                        >
                          <RefreshCw size={13} />
                          <span>Replace</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(doc)}
                          style={{
                            padding: '0.45rem 0.55rem',
                            borderRadius: '6px',
                            background: '#FEF2F2',
                            border: '1px solid #FEE2E2',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. UPLOAD DOCUMENT MODAL
      ───────────────────────────────────────────────────────────── */}
      {isUploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(0.5rem, 2.5vw, 1.5rem)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setIsUploadModalOpen(false);
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Upload to Vault
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                  Securely add a resume or credential to your profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={submitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  color: '#B91C1C',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>{formError}</div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              {/* Document Type Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Document Type *
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="RESUME">Resume / Curriculum Vitae (CV)</option>
                  <option value="EDUCATIONAL_CERTIFICATE">Educational Degree / Transcript</option>
                  <option value="INTERNSHIP_CERTIFICATE">Internship Completion Certificate</option>
                  <option value="EXPERIENCE_CERTIFICATE">Work Experience / Relieving Letter</option>
                  <option value="OTHER">Other Professional Credential</option>
                </select>
              </div>

              {/* File Dropzone / Picker */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Select File (PDF, PNG, JPG, JPEG — Max 5 MB) *
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.background = '#EFF6FF';
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#F8FAFC';
                    if (e.dataTransfer.files?.[0]) {
                      const file = e.dataTransfer.files[0];
                      const fakeEvent = { target: { files: [file] } };
                      handleFileChange(fakeEvent);
                    }
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                    style={{ display: 'none' }}
                  />

                  {formFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <FileCheck size={28} color="#2563EB" />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.925rem', color: '#0F172A' }}>{formFile.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{formatBytes(formFile.size)} • Click to change file</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} style={{ color: '#2563EB', margin: '0 auto 0.75rem' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>
                        Click to browse or drag file here
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Supported formats: <strong>PDF, JPG, JPEG, PNG</strong> (Max file size: 5 MB)
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Optional Description */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Document Description / Version Note (Optional)
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 2026 Senior Full Stack Engineer CV"
                  maxLength={255}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={submitting}
                  className="btn btn-secondary"
                  style={{ padding: '0.7rem 1.25rem', fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formFile}
                  className="btn btn-primary"
                  style={{ padding: '0.7rem 1.5rem', fontSize: '0.875rem' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Encrypting & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. REPLACE DOCUMENT MODAL
      ───────────────────────────────────────────────────────────── */}
      {isReplaceModalOpen && selectedDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(0.5rem, 2.5vw, 1.5rem)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setIsReplaceModalOpen(false);
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Replace Document
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                  Upload a revised version of your file.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReplaceModalOpen(false)}
                disabled={submitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Historical Preservation Notice */}
            {selectedDoc.applicationCount > 0 && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  marginBottom: '1.25rem',
                  lineHeight: 1.5,
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '0.1rem', color: '#2563EB' }} />
                <div>
                  <strong>Application Preservation:</strong> This document is attached to {selectedDoc.applicationCount} submitted application(s). Your historical submission records will safely retain the previous file, and this new upload will be used for future job applications.
                </div>
              </div>
            )}

            {/* Current File Info */}
            <div
              style={{
                padding: '0.85rem 1rem',
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <FileText size={20} color="#64748B" />
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Currently Active File:</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>
                  {selectedDoc.originalFilename}
                </div>
              </div>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  color: '#B91C1C',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>{formError}</div>
              </div>
            )}

            <form onSubmit={handleReplaceSubmit}>
              {/* Replacement File Picker */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                  Select New File (PDF, PNG, JPG, JPEG — Max 5 MB) *
                </label>

                <div
                  onClick={() => replaceFileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '1.75rem 1.25rem',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="file"
                    ref={replaceFileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                    style={{ display: 'none' }}
                  />

                  {formFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <FileCheck size={26} color="#2563EB" />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>{formFile.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{formatBytes(formFile.size)} • Click to change file</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} style={{ color: '#2563EB', margin: '0 auto 0.5rem' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                        Select new replacement file
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                        Maximum size: 5 MB (PDF, JPG, JPEG, PNG)
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  disabled={submitting}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formFile}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Replacing File...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Confirm Replacement</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. DELETE CONFIRMATION MODAL
      ───────────────────────────────────────────────────────────── */}
      {isDeleteModalOpen && selectedDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(0.5rem, 2.5vw, 1.5rem)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setIsDeleteModalOpen(false);
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: '#FEF2F2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Delete Document?
            </h3>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Are you sure you want to remove <strong>"{selectedDoc.originalFilename}"</strong>?
            </p>

            {selectedDoc.applicationCount > 0 ? (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  fontSize: '0.825rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Safe Archival Notice</div>
                Because this file was attached to {selectedDoc.applicationCount} past job application(s), it will be safely removed from your active vault while preserving historical records for recruiters.
              </div>
            ) : (
              <p style={{ color: '#64748B', fontSize: '0.825rem', marginBottom: '1.5rem' }}>
                This file is not linked to any job application and will be permanently deleted from the vault.
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="btn"
                style={{
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.875rem',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
