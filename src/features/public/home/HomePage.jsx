import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Smartphone, 
  Cloud, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  Award, 
  Zap, 
  Globe2, 
  ChevronRight,
  Layers,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react';
import { companyApi } from '../company/companyApi';
import { servicesApi } from '../services/api/servicesApi';
import { jobsApi } from '../careers/api/jobsApi';

export default function HomePage() {
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [compRes, servRes, jobRes] = await Promise.allSettled([
          companyApi.getPublicProfile(),
          servicesApi.getPublishedServices({ limit: 6 }),
          jobsApi.getPublishedJobs({ limit: 3 }),
        ]);

        if (compRes.status === 'fulfilled') setCompany(compRes.value);
        if (servRes.status === 'fulfilled') setServices(servRes.value.items || servRes.value.services || []);
        if (jobRes.status === 'fulfilled') setJobs(jobRes.value.items || jobRes.value.jobs || []);
      } catch (err) {
        console.error('Error loading home page live data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { value: '500+', label: 'Delivered Projects', sub: 'Global client footprint' },
    { value: '12+', label: 'Years of Excellence', sub: 'Industry leadership' },
    { value: '98%', label: 'Client Satisfaction', sub: 'Long-term partnerships' },
    { value: '150+', label: 'Tech Specialists', sub: 'Engineers & architects' },
  ];

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          padding: '6rem 1.5rem 4rem',
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
          <span className="badge badge-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            <Sparkles size={14} />
            <span>Enterprise Software Engineering & Global Recruitment</span>
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            lineHeight: 1.15,
            maxWidth: '1020px',
            margin: '0 auto 1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          Engineering High-Impact Digital Solutions & Empowering Global Tech Talent
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          {company?.shortDescription ||
            `${company?.companyName || 'Nexora Technologies'} delivers world-class software development, IT consulting, and cloud transformation while providing a transparent, modern career portal for ambitious engineers.`}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <Link to="/careers" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <span>Explore Open Careers</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/services" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <span>Explore Services</span>
          </Link>
          <Link to="/contact" className="btn btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <span>Contact Us</span>
          </Link>
        </div>

        {/* 2. Metrics / Statistics Strip */}
        <div
          className="glass-panel"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            padding: '2.5rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
          }}
        >
          {stats.map((s, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: '#ffffff',
                  lineHeight: 1.1,
                  marginBottom: '0.35rem',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Core Services Showcase Section (Live Published Services) */}
      <section style={{ padding: '5rem 1.5rem', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>Full Lifecycle Capabilities</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Comprehensive IT & Engineering Services</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem' }}>
              Organized by vertical industry and service lines to deliver turnkey digital transformation with precision and minimal business disruption.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw className="animate-spin" size={28} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading services...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
              {services.map((service) => (
                <div
                  key={service.id}
                  className="glass-panel"
                  style={{
                    padding: '2.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'var(--gradient-glow)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                      color: 'var(--primary)',
                    }}
                  >
                    <Code2 size={26} />
                  </div>

                  <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                    {service.category}
                  </span>

                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                    {service.title}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    {service.shortDescription}
                  </p>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    {Array.isArray(service.capabilities) && service.capabilities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
                        {service.capabilities.slice(0, 4).map((cap, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-dim)',
                            }}
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      to="/services"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        color: 'var(--primary)',
                        fontWeight: 600,
                      }}
                    >
                      <span>Explore Services</span>
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Live Featured Vacancies Section */}
      {jobs.length > 0 && (
        <section style={{ padding: '5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: '0.75rem' }}>Active Vacancies</span>
              <h2 style={{ fontSize: '2.25rem', margin: 0 }}>Join Our Global Engineering Team</h2>
            </div>
            <Link to="/careers" className="btn btn-secondary">
              <span>View All Vacancies</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {jobs.map((job) => (
              <div key={job.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-info">{job.department}</span>
                  <span className="badge badge-primary">{job.workMode}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Briefcase size={14} />
                    <span>{job.employmentType}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {job.description}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{job.jobCode}</span>
                  <Link to={`/jobs/${job.id}`} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Why Partner With Nexora (GTS Delivery Model) */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Our Value Proposition</span>
            <h2 style={{ fontSize: '2.5rem', lineHeight: 1.25, marginBottom: '1.25rem' }}>
              A Hybrid Global Delivery Model Designed for Scalability and Speed
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
              Guided by relentless dedication to client satisfaction, our unique onsite and offshore engagement model helps organizations transform operations, achieve higher flexibility, and maintain lower operating costs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {[
                { title: 'Industry-Specific Focus', desc: 'Domain expertise in FinTech, Healthcare, Enterprise SaaS, and Supply Chain.' },
                { title: 'Agile POD Architecture', desc: 'Dedicated self-managing teams of senior engineers, product owners, and QA leads.' },
                { title: 'Zero Compromise Security', desc: 'ISO 9001:2015 process compliance, secure credential vaults, and encrypted pipelines.' },
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.85rem' }}>
                  <div style={{ marginTop: '0.2rem' }}>
                    <CheckCircle2 size={20} color="var(--status-success)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{point.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Technology Excellence Stack</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              We leverage modern, battle-tested open-source frameworks and enterprise infrastructure.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                { name: 'JavaScript & TypeScript', role: 'Full-Stack Ecosystem' },
                { name: 'React 18 & Vite', role: 'High-Speed Web Frontend' },
                { name: 'Node.js & Express', role: 'Resilient Microservices' },
                { name: 'PostgreSQL & Prisma', role: 'ACID Relational Storage' },
                { name: 'Docker & Kubernetes', role: 'Container Orchestration' },
                { name: 'Python & AI Frameworks', role: 'Intelligent Data Models' },
              ].map((tech, t) => (
                <div key={t} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{tech.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{tech.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Careers & Recruitment Portal Callout */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="glass-panel"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          }}
        >
          <span className="badge badge-warning" style={{ marginBottom: '1rem' }}>
            We Are Actively Hiring
          </span>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Build Your Engineering Career at {company?.companyName || 'Nexora Technologies'}
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 2.5rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Join our engineering team in Hyderabad or work across our hybrid hubs. Create your verified applicant profile, track applications in real time, and download official offer letters securely.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
              <span>Create Candidate Account</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/careers" className="btn btn-secondary" style={{ padding: '0.85rem 2rem' }}>
              <span>Browse Job Listings</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
