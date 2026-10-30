import React, { useState, useEffect, useRef } from 'react';
import { Building2, Save, RefreshCw, CheckCircle2, AlertCircle, Globe, Mail, Phone, MapPin, Eye, Shield, Upload, Image, Trash2, LogIn } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { companyApi } from '../../public/company/companyApi';
import { useToast } from '../../../components/toast/ToastContext';

export default function AdminCompanyPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: '',
    shortDescription: '',
    about: '',
    mission: '',
    vision: '',
    areasOfExpertise: '',
    businessCapabilities: '',
    email: '',
    careersEmail: '',
    phone: '',
    secondaryPhone: '',
    address: '',
    operatingHours: '',
    websiteUrl: '',
  });

  useEffect(() => {
    async function loadCompanyData() {
      try {
        setLoading(true);
        setErrorMessage(null);
        let data = null;
        const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);
        if (currentToken) {
          try {
            data = await companyApi.getAdminProfile(currentToken);
          } catch (adminErr) {
            console.warn('Admin profile fetch failed, falling back to public profile:', adminErr);
            data = await companyApi.getPublicProfile().catch(() => null);
          }
        } else {
          data = await companyApi.getPublicProfile().catch(() => null);
        }

        if (data) {
          setFormData({
            companyName: data.companyName || '',
            logoUrl: data.logoUrl || '',
            shortDescription: data.shortDescription || '',
            about: data.about || '',
            mission: data.mission || '',
            vision: data.vision || '',
            areasOfExpertise: Array.isArray(data.areasOfExpertise) ? data.areasOfExpertise.join(', ') : '',
            businessCapabilities: Array.isArray(data.businessCapabilities) ? data.businessCapabilities.join(', ') : '',
            email: data.email || '',
            careersEmail: data.careersEmail || '',
            phone: data.phone || '',
            secondaryPhone: data.secondaryPhone || '',
            address: data.address || '',
            operatingHours: data.operatingHours || '',
            websiteUrl: data.websiteUrl || '',
          });
        }
      } catch (err) {
        console.error('Failed to load company profile:', err);
        setErrorMessage(err.message || 'Unable to fetch company information.');
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();

    const handleAuthenticated = () => {
      loadCompanyData();
    };
    window.addEventListener('nexora:admin-authenticated', handleAuthenticated);
    return () => {
      window.removeEventListener('nexora:admin-authenticated', handleAuthenticated);
    };
  }, [token, accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, SVG, WebP).', { title: 'Invalid Image' });
      setErrorMessage('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image exceeds 2MB limit. Please select an image under 2MB.', { title: 'File Too Large' });
      setErrorMessage('Logo image exceeds 2MB limit. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setFormData((prev) => ({ ...prev, logoUrl: base64Data }));
      setErrorMessage(null);
      toast.info('Logo image loaded into form preview. Click Save to persist.', { title: 'Asset Selected' });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

    try {
      setSaving(true);
      setStatusMessage(null);
      setErrorMessage(null);

      const payload = {
        companyName: formData.companyName.trim(),
        logoUrl: formData.logoUrl.trim() || null,
        shortDescription: formData.shortDescription.trim(),
        about: formData.about.trim(),
        mission: formData.mission.trim(),
        vision: formData.vision.trim(),
        areasOfExpertise: formData.areasOfExpertise
          ? formData.areasOfExpertise.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        businessCapabilities: formData.businessCapabilities
          ? formData.businessCapabilities.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        email: formData.email.trim(),
        careersEmail: formData.careersEmail.trim() || null,
        phone: formData.phone.trim(),
        secondaryPhone: formData.secondaryPhone.trim() || null,
        address: formData.address.trim(),
        operatingHours: formData.operatingHours.trim() || null,
        websiteUrl: formData.websiteUrl.trim() || null,
      };

      await companyApi.updateProfile(payload, currentToken);

      // Show side popup notification!
      toast.success('Corporate company profile and legal details saved successfully!', {
        title: 'Company Profile Updated',
      });
      setStatusMessage('Company settings and corporate profile saved successfully!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update company profile:', err);
      toast.error(err.message || 'Failed to save company information.', {
        title: 'Update Failed',
      });
      setErrorMessage(err.message || 'Failed to save company information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '960px', padding: '3rem 1rem', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading official company profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Standard Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Company Profile & Identity
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Configure corporate legal identity, address, contact coordinates, mission/vision, and public website CMS content.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', color: '#15803D', marginBottom: '1.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#B91C1C', marginBottom: '1.5rem', fontWeight: 600 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Section 1: Corporate Legal Identity */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
            Corporate Legal Identity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Legal Entity Name *
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Official Website URL
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://www.nexoratech.com"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Company Logo / Brand Identity Asset
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px dashed var(--border-subtle)',
                  flexWrap: 'wrap',
                }}
              >
                {/* Logo Preview Box */}
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Company Logo Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.35rem' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Image size={32} color="var(--text-dim)" />
                  )}
                </div>

                {/* Upload action controls */}
                <div style={{ flex: '1 1 min(100%, 250px)' }}>
                  <div className="btn-group-responsive" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Upload size={16} />
                      <span>Upload Logo File</span>
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                        className="btn btn-secondary"
                        style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', color: 'var(--status-danger)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Trash2 size={15} />
                        <span>Remove Logo</span>
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Supported: <strong>PNG, JPG, SVG, WebP</strong> (Max 2 MB). Click to browse or drag and drop onto this area.
                  </div>
                </div>
              </div>

              {/* Optional direct URL input */}
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Or link to an external image URL:</span>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="/assets/logo.svg or https://..."
                  style={{ width: '100%', marginTop: '0.3rem', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.825rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Location */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
            Official Coordinates, Phones & Operating Hours
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Primary Contact Email (General / Info) *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="info@nexoratech.com"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Careers & HR Email
              </label>
              <input
                type="email"
                name="careersEmail"
                value={formData.careersEmail}
                onChange={handleChange}
                placeholder="careers@nexoratech.com"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Primary Phone / Enterprise Desk *
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 93904 66320 / +91 40 4855 2244"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Secondary Phone / Recruitment Hotline
              </label>
              <input
                type="text"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                placeholder="+91 93904 66320"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Operating Hours & Offshore Support Schedule
              </label>
              <input
                type="text"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                placeholder="Monday – Friday: 9:00 AM – 6:30 PM IST (Offshore Delivery Support: 24/7)"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Corporate Headquarters Address *
              </label>
              <textarea
                rows={2}
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="LVS Arcade, Jubilee Enclave, Madhapur, Hitec City, Hyderabad, Telangana 500081, India"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: CMS Content & Mission/Vision */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
            Public CMS & Brand Narratives
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Home-Page Tagline / Short Intro
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                About Us Background Story
              </label>
              <textarea
                rows={3}
                name="about"
                value={formData.about}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Corporate Mission Statement
                </label>
                <textarea
                  rows={3}
                  name="mission"
                  value={formData.mission}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Corporate Vision Statement
                </label>
                <textarea
                  rows={3}
                  name="vision"
                  value={formData.vision}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Areas of Expertise (Comma-separated)
              </label>
              <input
                type="text"
                name="areasOfExpertise"
                value={formData.areasOfExpertise}
                onChange={handleChange}
                placeholder="Cloud Architecture, Enterprise Web Systems, DevOps, AI & Automation"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Business Capabilities (Comma-separated)
              </label>
              <input
                type="text"
                name="businessCapabilities"
                value={formData.businessCapabilities}
                onChange={handleChange}
                placeholder="24/7 Global Delivery, High-Capacity Offshore Pods, SOC2 Process Compliance"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-submit-responsive"
          style={{ alignSelf: 'flex-start', padding: '0.85rem 2.25rem', fontSize: '1rem' }}
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Company Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
