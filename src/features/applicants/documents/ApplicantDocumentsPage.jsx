import React, { useState } from 'react';
import { Upload, FileText, Trash2, Eye, Download, ShieldCheck, FolderOpen } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ApplicantDocumentsPage() {
  const { user } = useAuth();
  // Real documents state initialized empty - populated when user uploads
  const [documents, setDocuments] = useState([]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Resume & Documents Vault</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Upload and manage your CVs, certificates, and credentials securely for job applications.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        className="glass-panel"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '2px dashed var(--border-subtle)',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--gradient-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--primary)',
          }}
        >
          <Upload size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Upload Document</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Supported formats: <strong>PDF, JPG, JPEG, PNG</strong> (Max file size: 5 MB)
        </p>
        <button
          type="button"
          onClick={() => alert('Document upload vault will connect in Phase 4 (Document Management Module).')}
          className="btn btn-primary"
        >
          <span>Select Document to Upload</span>
        </button>
      </div>

      {/* Uploaded Documents List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Saved Documents</h3>

        {documents.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <FolderOpen size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', marginBottom: '0.3rem' }}>No Documents Uploaded</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
              Your document repository is currently empty. Upload your updated resume or portfolio to attach to future applications.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FileText size={22} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{doc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.type} • {doc.size}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
