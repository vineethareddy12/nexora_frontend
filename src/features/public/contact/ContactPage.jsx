import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
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
    e.preventDefault();
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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 1.5rem' }}>
      {/* 1. Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>Get in Touch</span>
        <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', marginBottom: '1.25rem', fontWeight: 800 }}>
          Contact {company?.companyName || 'Nexora Technologies'}
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
          Whether you are exploring a software engineering partnership or seeking recruitment and career opportunities, our enterprise team is here to assist you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem' }}>
        {/* 2. Contact Information Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={22} color="var(--primary)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700 }}>Corporate Headquarters</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  {company?.address || 'LVS Arcade, Jubilee Enclave, Madhapur, Hitec City, Hyderabad, Telangana 500081, India'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={22} color="var(--accent)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700 }}>Direct Contact Desks</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.35rem 0' }}>
                  <strong>Enterprise Desk:</strong> {company?.phone || '+91 40 4855 2244'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  <strong>Recruitment Hotline:</strong> {company?.secondaryPhone || '+91 93904 66320'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={22} color="var(--accent-purple)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700 }}>Electronic Mail</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.35rem 0' }}>
                  <strong>General:</strong> {company?.email || 'info@nexoratech.com'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  <strong>Careers & HR:</strong> {company?.careersEmail || 'careers@nexoratech.com'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={22} color="var(--status-success)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', fontWeight: 700 }}>Operating Hours</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  {company?.operatingHours || 'Monday – Friday: 9:00 AM – 6:30 PM IST (Offshore Delivery Support: 24/7)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Enquiry Form */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <MessageSquare size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Send Us a Message</h3>
          </div>

          {submitError && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, color: '#ef4444' }} />
                <span style={{ flex: 1, lineHeight: 1.5 }}>{submitError}</span>
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
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#fff',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  cursor: 'pointer',
                  marginTop: '0.25rem',
                }}
              >
                <RefreshCw size={14} className={submitting ? 'spin' : ''} />
                {submitting ? 'Retrying...' : 'Click to Retry'}
              </button>
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <CheckCircle2 size={56} color="var(--status-success)" style={{ margin: '0 auto 1.25rem' }} />
              <h4 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Message Sent Successfully!</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Thank you for reaching out to {company?.companyName || 'Nexora Technologies'}. We have received your message and our team will get back to you shortly.
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
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Full Name *
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
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
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
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
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
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. Inquiry regarding services or career opportunities"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Write your message, question, or inquiry here..."
                  value={formData.message}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '0.95rem' }}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send size={16} />
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
