import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function Footer() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    function fetchCompany() {
      import('../../features/public/company/companyApi.js').then(({ companyApi }) => {
        companyApi.getPublicProfile().then((data) => {
          if (data) setCompany(data);
        }).catch(() => {});
      });
    }

    fetchCompany();
    window.addEventListener('nexora:admin-authenticated', fetchCompany);
    return () => window.removeEventListener('nexora:admin-authenticated', fetchCompany);
  }, []);

  const logoUrl = company?.logoUrl;
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        padding: '4.5rem 1.5rem 2.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem',
        }}
      >
        {/* Column 1: Brand & Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                background: logoUrl ? '#FFFFFF' : 'var(--gradient-brand)',
                border: logoUrl ? '1px solid #E2E8F0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.15rem',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company?.companyName || 'Nexora Logo'}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                'N'
              )}
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                {company?.companyName || 'Nexora Technologies'}
              </span>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                Global Technology Services
              </div>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
            {company?.shortDescription ||
              'Delivering high-impact enterprise software engineering, cloud architectures, and an integrated global talent recruitment platform from Hyderabad, India.'}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#2563EB',
              background: '#EFF6FF',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #BFDBFE',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={15} />
            <span>ISO 9001:2015 Process Certified</span>
          </div>
        </div>

        {/* Column 2: Software Services */}
        <div>
          <h4
            style={{
              fontSize: '0.95rem',
              marginBottom: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0F172A',
              fontWeight: 700,
            }}
          >
            Technology Services
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link to="/services" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Full-Stack Web Development
              </Link>
            </li>
            <li>
              <Link to="/services" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Mobile App Engineering (iOS/Android)
              </Link>
            </li>
            <li>
              <Link to="/services" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Cloud & DevOps Architecture
              </Link>
            </li>
            <li>
              <Link to="/services" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Enterprise IT Consulting
              </Link>
            </li>
            <li>
              <Link to="/services" style={{ color: '#475569', fontSize: '0.9rem' }}>
                AI & Automation Systems
              </Link>
            </li>
            <li>
              <Link to="/services" style={{ color: '#475569', fontSize: '0.9rem' }}>
                QA & Automated Testing
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Portals & Career Hub */}
        <div>
          <h4
            style={{
              fontSize: '0.95rem',
              marginBottom: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0F172A',
              fontWeight: 700,
            }}
          >
            Careers & Portals
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link to="/careers" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Browse Open Vacancies
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Candidate Registration
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Candidate Portal Login
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ color: '#475569', fontSize: '0.9rem' }}>
                About Nexora Technologies
              </Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: '#475569', fontSize: '0.9rem' }}>
                Enterprise Enquiry Desk
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Verified Contact Coordinates */}
        <div>
          <h4
            style={{
              fontSize: '0.95rem',
              marginBottom: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0F172A',
              fontWeight: 700,
            }}
          >
            Corporate Coordinates
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <MapPin size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <span style={{ color: '#475569', lineHeight: 1.5 }}>
                {company?.address || 'LVS Arcade, Jubilee Enclave, Madhapur, Hitec City, Hyderabad, Telangana 500081, India'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <Phone size={16} color="#06B6D4" style={{ flexShrink: 0 }} />
              <span style={{ color: '#475569' }}>{company?.phone || '+91 40 4855 2244 / +91 93904 66320'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <Mail size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span style={{ color: '#475569' }}>{company?.email || 'info@nexoratech.com'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Strip */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#64748B',
        }}
      >
        <div>
          &copy; {currentYear} {company?.companyName || 'Nexora Technologies'}. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Enterprise Software Engineering</span>
          <span>&bull;</span>
          <span>Global Talent Sourcing</span>
          <span>&bull;</span>
          <span>ISO 9001:2015</span>
        </div>
      </div>
    </footer>
  );
}
