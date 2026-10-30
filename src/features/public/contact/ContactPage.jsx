import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { companyApi } from '../company/companyApi';
import { enquiryApi } from './api/enquiryApi';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      try {
        const data = await companyApi.getPublicProfile();
        setCompany(data);
      } catch (err) {
        console.error('Failed to load company profile on contact page:', err);
      } finally {
        setLoadingCompany(false);
      }
    }
    loadCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await enquiryApi.submitEnquiry({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setSubmitError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(3rem, 5vw, 5rem) clamp(1rem, 3vw, 1.5rem)', background: '#FFFFFF' }}>
      {/* 1. Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>
          Get in Touch
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
            marginBottom: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
          }}
        >
          Contact {company?.companyName || 'Nexora Technologies'}
        </h1>
        <p
          style={{
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto',
            fontSize: '1.1rem',
            lineHeight: 1.7,
          }}
        >
          Whether you are exploring a software engineering partnership or seeking recruitment and career
          opportunities, our enterprise team is here to assist you.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1.5rem, 3.5vw, 3rem)',
          alignItems: 'start',
        }}
      >
        {/* 2. Contact Information Cards (Left Column) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Headquarters Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#2563EB',
                }}
              >
                <MapPin size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700, color: '#0F172A' }}>
                  Corporate Headquarters
                </h4>
                <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
                  {company?.address ||
                    'LVS Arcade, Jubilee Enclave, Madhapur, Hitec City, Hyderabad, Telangana 500081, India'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Desks Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#ECFEFF',
                  border: '1px solid #A5F3FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#06B6D4',
                }}
              >
                <Phone size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700, color: '#0F172A' }}>
                  Direct Contact Desks
                </h4>
                <p style={{ color: '#475569', fontSize: '0.925rem', margin: '0 0 0.35rem 0' }}>
                  <strong style={{ color: '#0F172A' }}>Enterprise Desk:</strong>{' '}
                  {company?.phone || '+91 40 4855 2244'}
                </p>
                <p style={{ color: '#475569', fontSize: '0.925rem', margin: 0 }}>
                  <strong style={{ color: '#0F172A' }}>Recruitment Hotline:</strong>{' '}
                  {company?.secondaryPhone || '+91 93904 66320'}
                </p>
              </div>
            </div>
          </div>

          {/* Electronic Mail Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#F1F5FF',
                  border: '1px solid #DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#2563EB',
                }}
              >
                <Mail size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700, color: '#0F172A' }}>
                  Electronic Mail
                </h4>
                <p style={{ color: '#475569', fontSize: '0.925rem', margin: '0 0 0.35rem 0' }}>
                  <strong style={{ color: '#0F172A' }}>General:</strong>{' '}
                  {company?.email || 'info@nexoratech.com'}
                </p>
                <p style={{ color: '#475569', fontSize: '0.925rem', margin: 0 }}>
                  <strong style={{ color: '#0F172A' }}>Careers & HR:</strong>{' '}
                  {company?.careersEmail || 'careers@nexoratech.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Operating Hours Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#059669',
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700, color: '#0F172A' }}>
                  Operating Hours
                </h4>
                <p style={{ color: '#475569', fontSize: '0.925rem', margin: 0, lineHeight: 1.6 }}>
                  {company?.operatingHours ||
                    'Monday – Friday: 9:00 AM – 6:30 PM IST (Offshore Delivery Support: 24/7)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Enterprise Enquiry Form (Right Column) */}
        <div
          className="card"
          style={{
            padding: 'clamp(1.25rem, 4vw, 2.5rem)',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <MessageSquare size={22} color="#2563EB" />
            <h3 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 700, color: '#0F172A' }}>
              Send Us an Enterprise Message
            </h3>
          </div>

          {submitError && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                padding: '1rem 1.15rem',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                color: '#DC2626',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, color: '#DC2626' }} />
                <span style={{ flex: 1, lineHeight: 1.5, fontWeight: 500 }}>{submitError}</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                }}
              >
                <RefreshCw size={13} className={submitting ? 'spin' : ''} />
                {submitting ? 'Retrying...' : 'Click to Retry'}
              </button>
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#059669',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#0F172A', fontWeight: 700 }}>
                Message Dispatched Successfully!
              </h4>
              <p
                style={{
                  color: '#475569',
                  fontSize: '1rem',
                  maxWidth: '440px',
                  margin: '0 auto 1.75rem',
                  lineHeight: 1.6,
                }}
              >
                Thank you for reaching out to {company?.companyName || 'Nexora Technologies'}. We have received
                your enquiry and our team will get back to you shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                }}
                className="btn btn-secondary"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
                  Enquiry Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. Software engineering partnership or vacancy inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
                  Detailed Message / Requirements *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Provide your project context, timeline, or recruitment query..."
                  value={formData.message}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  padding: '0.9rem',
                  width: '100%',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.8 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="spin" size={18} />
                    <span>Transmitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <span>Send Enterprise Message</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
