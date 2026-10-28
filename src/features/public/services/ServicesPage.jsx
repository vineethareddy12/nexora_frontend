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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 1.5rem' }}>
      {/* 1. Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge badge-info" style={{ marginBottom: '0.85rem' }}>Enterprise Services</span>
        <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', marginBottom: '1.25rem', fontWeight: 800 }}>
          Specialized Engineering & Technical Solutions
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
          From initial system architecture to production scaling, we deliver end-to-end software capabilities across web, mobile, cloud, and AI domains.
        </p>
      </div>

      {/* 2. Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading enterprise services catalog...</p>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: '3rem' }}>
          <AlertCircle size={32} color="var(--status-danger)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Unable to Load Services</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && !error && services.length === 0 && (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', marginBottom: '4rem' }}>
          <Layers size={40} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Published Services Currently Available</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Our corporate service offerings catalog is currently being updated. Please check back shortly or request a direct consultation.
          </p>
          <Link to="/contact" className="btn btn-primary">Contact Consultation Pod</Link>
        </div>
      )}

      {/* 4. Live Services Grid */}
      {!loading && !error && services.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', marginBottom: '5rem' }}>
          {services.map((service) => {
            const Icon = (service.iconName && ICON_MAP[service.iconName]) ? ICON_MAP[service.iconName] : Layers;
            return (
              <div
                key={service.id}
                className="glass-panel"
                style={{
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span className="badge badge-primary">{service.category}</span>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--gradient-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Icon size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.85rem', fontWeight: 700 }}>
                  {service.title}
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                  {service.shortDescription}
                </p>

                {/* Core capabilities bullet list */}
                {service.capabilities && service.capabilities.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                      Core Capabilities
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {service.capabilities.map((cap, cIdx) => (
                        <li key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                          <Check size={15} color="var(--accent)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack badges */}
                {service.techStack && service.techStack.length > 0 && (
                  <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {service.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-dim)',
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
        className="glass-panel"
        style={{
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
        }}
      >
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Ready to Scale Your Digital Product?</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
          Schedule a technical architecture review with our principal engineers in Hyderabad to discuss requirements, project timelines, and engagement models.
        </p>
        <Link to="/contact" className="btn btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}>
          <span>Request Technical Consultation</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
