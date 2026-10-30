import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Code2, 
  Smartphone, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Check, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { servicesApi } from './api/servicesApi';

const ICON_MAP = {
  Code2,
  Smartphone,
  Cloud,
  ShieldCheck,
  Cpu,
  Zap,
  Layers,
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError(null);
        const data = await servicesApi.getPublishedServices({ limit: 50 });
        setServices(data.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load enterprise services.');
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(3rem, 5vw, 5rem) clamp(1rem, 3vw, 1.5rem)', background: '#FFFFFF' }}>
      {/* 1. Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>
          Enterprise Capabilities
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
            marginBottom: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
          }}
        >
          Specialized Engineering & Technical Solutions
        </h1>
        <p
          style={{
            color: '#475569',
            maxWidth: '720px',
            margin: '0 auto',
            fontSize: '1.1rem',
            lineHeight: 1.7,
          }}
        >
          From initial system architecture to production scaling, we deliver end-to-end software capabilities
          across web, mobile, cloud, and AI domains.
        </p>
      </div>

      {/* 2. Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={36} className="spin" style={{ color: '#2563EB', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748B' }}>Loading enterprise services catalog...</p>
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            padding: '2rem',
            textAlign: 'center',
            borderColor: '#FECACA',
            background: '#FEF2F2',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem',
          }}
        >
          <AlertCircle size={32} color="#DC2626" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#DC2626' }}>Unable to Load Services</h3>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && !error && services.length === 0 && (
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            marginBottom: '4rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Layers size={40} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0F172A' }}>
            No Published Services Currently Available
          </h3>
          <p style={{ color: '#475569', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Our corporate service offerings catalog is currently being updated. Please check back shortly or request a
            direct consultation.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Contact Consultation Pod
          </Link>
        </div>
      )}

      {/* 4. Live Services Grid */}
      {!loading && !error && services.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            marginBottom: '5rem',
          }}
        >
          {services.map((service) => {
            const Icon = (service.iconName && ICON_MAP[service.iconName]) ? ICON_MAP[service.iconName] : Layers;
            return (
              <div
                key={service.id}
                className="card card-hover"
                style={{
                  padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span className="badge badge-primary">{service.category}</span>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  {service.title}
                </h3>

                <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                  {service.shortDescription}
                </p>

                {/* Core capabilities bullet list */}
                {service.capabilities && service.capabilities.length > 0 && (
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        marginBottom: '0.85rem',
                      }}
                    >
                      Core Capabilities
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                      {service.capabilities.map((cap, cIdx) => (
                        <li
                          key={cIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#0F172A',
                            lineHeight: 1.4,
                          }}
                        >
                          <Check size={16} color="#059669" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack badges */}
                {service.techStack && service.techStack.length > 0 && (
                  <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {service.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            background: '#F1F5FF',
                            border: '1px solid #DBEAFE',
                            color: '#2563EB',
                            fontWeight: 500,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Engagement Call To Action */}
      <div
        className="card"
        style={{
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #ECFEFF 100%)',
          borderRadius: '20px',
          border: '1px solid #BFDBFE',
        }}
      >
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: '#0F172A' }}>
          Ready to Scale Your Digital Product?
        </h2>
        <p style={{ color: '#475569', maxWidth: '640px', margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
          Schedule a technical architecture review with our principal engineers in Hyderabad to discuss requirements,
          project timelines, and engagement models.
        </p>
        <Link to="/contact" className="btn btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}>
          <span>Request Technical Consultation</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
