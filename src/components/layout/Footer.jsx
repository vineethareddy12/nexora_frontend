import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [company, setCompany] = React.useState(null);

  React.useEffect(() => {
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
  return (
    <footer
      style={{
        background: '#070a12',
        borderTop: '1px solid var(--border-subtle)',
        padding: '4.5rem 1.5rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem',
        }}
      >
        {/* Column 1: Brand & Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.15rem',
              }}
            >
              N
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
                {company?.companyName || 'Nexora Technologies'}
              </span>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Global Technology Services
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {company?.shortDescription || 'Delivering high-impact enterprise software engineering, cloud architectures, and an integrated global talent recruitment platform from Hyderabad, India.'}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.78rem' }}>
            <ShieldCheck size={14} />
            <span>ISO 9001:2015 Process Certified</span>
          </div>
        </div>

        {/* Column 2: Software Services */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', fontWeight: 700 }}>
            Engineering Services
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li><Link to="/services" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full-Stack Web Development</Link></li>
            <li><Link to="/services" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Mobile App Engineering (iOS/Android)</Link></li>
            <li><Link to="/services" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cloud & DevOps Architecture</Link></li>
            <li><Link to="/services" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enterprise IT Consulting</Link></li>
            <li><Link to="/services" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI & Automation Solutions</Link></li>
            <li><Link to="/services" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>QA & Automated Testing</Link></li>
          </ul>
        </div>

        {/* Column 3: Portals & Career Hub */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', fontWeight: 700 }}>
            Careers & Portals
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li><Link to="/careers" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Browse Open Vacancies</Link></li>
            <li><Link to="/register" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Applicant Registration</Link></li>
            <li><Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Candidate Portal Login</Link></li>
            <li><Link to="/app/profile" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Professional Profile Vault</Link></li>
            <li><Link to="/app/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Application Tracking</Link></li>
          </ul>
        </div>

        {/* Column 4: Corporate Headquarters */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-main)', fontWeight: 700 }}>
            Corporate Headquarters
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <span>{company?.address || 'LVS Arcade, Jubilee Enclave, Madhapur, Hitec City, Hyderabad, Telangana 500081'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Phone size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
              <span>{company?.phone || '+91 93904 66320 / +91 40 4855 2244'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Mail size={16} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
              <span>{company?.email || 'info@nexoratech.com'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Strip */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.825rem',
          color: 'var(--text-dim)',
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} Nexora Technologies Pvt Ltd (Global Technology Services). All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/about" style={{ color: 'var(--text-dim)' }}>Privacy Policy</Link>
          <Link to="/about" style={{ color: 'var(--text-dim)' }}>Terms of Service</Link>
          <Link to="/contact" style={{ color: 'var(--text-dim)' }}>Security & Compliance</Link>
        </div>
      </div>
    </footer>
  );
}
