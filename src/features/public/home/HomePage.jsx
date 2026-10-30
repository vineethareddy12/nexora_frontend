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
  RefreshCw,
  Terminal,
  Activity,
  Check
} from 'lucide-react';
import { companyApi } from '../company/companyApi';
import { servicesApi } from '../services/api/servicesApi';
import { jobsApi } from '../careers/api/jobsApi';

export default function HomePage() {
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setServicesError(null);
    try {
      const [compRes, servRes, jobRes] = await Promise.allSettled([
        companyApi.getPublicProfile(),
        servicesApi.getPublishedServices({ limit: 6 }),
        jobsApi.getPublishedJobs({ limit: 3 }),
      ]);

      if (compRes.status === 'fulfilled') setCompany(compRes.value);
      if (servRes.status === 'fulfilled') {
        setServices(servRes.value.items || servRes.value.services || []);
      } else {
        setServicesError('Failed to load services.');
      }
      if (jobRes.status === 'fulfilled') {
        setJobs(jobRes.value.items || jobRes.value.jobs || []);
      }
    } catch (err) {
      console.error('Error loading home page live data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ width: '100%', overflow: 'hidden', background: '#FFFFFF' }}>
      {/* ====================================================================
          1. Hero Section — Premium Light SaaS Two-Column Layout
          ==================================================================== */}
      <section
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 55%, #ECFEFF 100%)',
          borderBottom: '1px solid #E2E8F0',
          padding: 'clamp(3rem, 6vw, 5.5rem) clamp(1rem, 3vw, 1.5rem)',
          position: 'relative',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Headline, Description, CTAs, Feature Indicators */}
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
              <span
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#2563EB',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Sparkles size={14} color="#2563EB" />
                <span>Technology &bull; Engineering &bull; Talent</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                lineHeight: 1.15,
                color: '#0F172A',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: '1.35rem',
              }}
            >
              Engineering Digital Solutions.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Connecting Exceptional Talent.
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: '#475569',
                lineHeight: 1.7,
                marginBottom: '2.25rem',
                maxWidth: '580px',
              }}
            >
              {company?.shortDescription ||
                'Nexora Technologies helps businesses build reliable digital products and connects talented professionals with opportunities to grow.'}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Link
                to="/services"
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
              >
                <span>Explore Our Services</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/careers"
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
              >
                <span>Explore Careers</span>
              </Link>
            </div>

            {/* Feature Indicators Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                paddingTop: '1.5rem',
                borderTop: '1px solid #E2E8F0',
              }}
            >
              {[
                'Software Engineering',
                'Cloud & DevOps',
                'Talent & Recruitment',
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} color="#2563EB" strokeWidth={3} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Beautiful Layered Interface Artwork */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Background Decorative Gradient Orbs */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '10px',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(191, 219, 254, 0.45) 0%, rgba(207, 250, 254, 0) 70%)',
                filter: 'blur(30px)',
                zIndex: 0,
              }}
            />

            {/* Main Interactive System Preview Card */}
            <div
              className="card"
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '480px',
                padding: 'clamp(1.25rem, 3.5vw, 2rem)',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.08), 0 10px 15px -5px rgba(37, 99, 235, 0.05)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #F1F5F9',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#10B981',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    Enterprise Engineering Matrix
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                  }}
                >
                  Production Ready
                </span>
              </div>

              {/* Status Metric Preview */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>
                    System Reliability
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                    99.98%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                    &uarr; High Availability
                  </div>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>
                    Architecture Quality
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>
                    ISO 9001
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, marginTop: '0.2rem' }}>
                    Process Verified
                  </div>
                </div>
              </div>

              {/* Active Pipeline List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code2 size={16} color="#2563EB" />
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Cloud Microservices Mesh</span>
                  </div>
                  <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="#06B6D4" />
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Global Talent Pipeline</span>
                  </div>
                  <span style={{ color: '#2563EB', fontSize: '0.75rem', fontWeight: 600 }}>Connected</span>
                </div>
              </div>
            </div>

            {/* Floating Talent Badge Card */}
            <div
              className="card"
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '-20px',
                zIndex: 2,
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '14px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.15)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  Talent Matching Hub
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                  Verified Engineering Profiles
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. Services Section — Technology Services Built for What’s Next
          ==================================================================== */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1rem, 3vw, 1.5rem)',
          maxWidth: '1280px',
          margin: '0 auto',
          background: '#FFFFFF',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>
            Capabilities & Solutions
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem', color: '#0F172A' }}>
            Technology Services Built for What’s Next
          </h2>
          <p
            style={{
              color: '#475569',
              maxWidth: '640px',
              margin: '0 auto',
              fontSize: '1.1rem',
              lineHeight: 1.7,
            }}
          >
            Explore our engineering and technology capabilities.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="spin" size={28} color="#2563EB" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B' }}>Loading engineering capabilities...</p>
          </div>
        )}

        {/* Error State with Retry */}
        {servicesError && !loading && (
          <div
            style={{
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              borderRadius: '14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <p style={{ color: '#DC2626', marginBottom: '1rem', fontWeight: 600 }}>
              Unable to load live services at this moment.
            </p>
            <button type="button" onClick={loadData} className="btn btn-secondary">
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Services Responsive Grid (3-column desktop, 2 tablet, 1 mobile) */}
        {!loading && !servicesError && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'clamp(1.25rem, 3vw, 2rem)',
            }}
          >
            {services.map((service) => (
              <div
                key={service.id}
                className="card card-hover"
                style={{
                  padding: 'clamp(1.5rem, 4vw, 2.25rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                }}
              >
                {/* Light Blue Icon Container */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    color: '#2563EB',
                  }}
                >
                  <Code2 size={26} />
                </div>

                {service.category && (
                  <span
                    className="badge badge-primary"
                    style={{
                      alignSelf: 'flex-start',
                      marginBottom: '0.75rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    {service.category}
                  </span>
                )}

                <h3
                  style={{
                    fontSize: '1.35rem',
                    marginBottom: '0.75rem',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                >
                  {service.title}
                </h3>

                <p
                  style={{
                    color: '#475569',
                    fontSize: '0.95rem',
                    lineHeight: 1.65,
                    marginBottom: '1.5rem',
                  }}
                >
                  {service.shortDescription}
                </p>

                {/* Capability Tags */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                  {Array.isArray(service.capabilities) && service.capabilities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
                      {service.capabilities.slice(0, 4).map((cap, tIdx) => (
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
                      gap: '0.4rem',
                      fontSize: '0.9rem',
                      color: '#2563EB',
                      fontWeight: 600,
                    }}
                  >
                    <span>Explore Service</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====================================================================
          3. Why Choose Nexora — Alternate Pale-Blue Background
          ==================================================================== */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1rem, 3vw, 1.5rem)',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Heading, Supporting Content, and Benefits */}
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
              Why Choose Nexora
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                lineHeight: 1.25,
                marginBottom: '1.25rem',
                color: '#0F172A',
              }}
            >
              A Hybrid Global Delivery Model Designed for Scalability and Speed
            </h2>
            <p
              style={{
                color: '#475569',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                marginBottom: '2rem',
              }}
            >
              Guided by relentless dedication to client satisfaction, our unique onsite and offshore
              engagement model helps organizations transform operations, achieve higher flexibility, and maintain
              lower operating costs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                {
                  title: 'Engineering-Led Delivery',
                  desc: 'Senior architects and lead engineers engaged at every project milestone.',
                },
                {
                  title: 'Scalable Digital Solutions',
                  desc: 'Modular architectures designed to handle growing traffic, data, and users.',
                },
                {
                  title: 'Collaborative Development',
                  desc: 'Agile sprints with transparent source control, CI/CD pipelines, and regular reviews.',
                },
                {
                  title: 'Talent & Career Connections',
                  desc: 'Direct alignment between industry requirements and career advancement opportunities.',
                },
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.2rem',
                    }}
                  >
                    <Check size={14} color="#2563EB" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', color: '#0F172A' }}>
                      {point.title}
                    </h4>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Clean Composition of Feature Cards / Tech Stack */}
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
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0F172A' }}>
              Technology Excellence Stack
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Modern, battle-tested enterprise frameworks and cloud infrastructure.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '1rem' }}>
              {[
                { name: 'JavaScript & React', role: 'Full-Stack Ecosystem' },
                { name: 'Node.js & Express', role: 'Resilient Microservices' },
                { name: 'PostgreSQL & Prisma', role: 'ACID Relational Storage' },
                { name: 'Cloud & Container Hub', role: 'Scalable Deployments' },
                { name: 'Security & Auth', role: 'JWT & Role Gateways' },
                { name: 'DevOps & CI/CD', role: 'Automated Delivery' },
              ].map((tech, t) => (
                <div
                  key={t}
                  style={{
                    padding: '1rem',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                    {tech.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                    {tech.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. Careers and Job Opportunities — Section 8
          ==================================================================== */}
      {jobs.length > 0 && (
        <section
          style={{
            padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1rem, 3vw, 1.5rem)',
            maxWidth: '1280px',
            margin: '0 auto',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '3rem',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                Open Positions
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: '#0F172A', margin: 0 }}>
                Build Your Next Chapter with Nexora
              </h2>
              <p style={{ color: '#475569', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '600px' }}>
                Discover opportunities to develop your skills and contribute to meaningful technology projects.
              </p>
            </div>
            <Link to="/careers" className="btn btn-secondary">
              <span>View All Vacancies</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            }}
          >
            {jobs.map((job) => (
              <div
                key={job.id}
                className="card card-hover"
                style={{
                  padding: 'clamp(1.5rem, 3.5vw, 2rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="badge badge-info">{job.department}</span>
                  <span className="badge badge-primary">{job.workMode}</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.65rem', color: '#0F172A' }}>
                  {job.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#2563EB" />
                    <span>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Briefcase size={14} color="#06B6D4" />
                    <span>{job.employmentType}</span>
                  </div>
                </div>

                <p
                  style={{
                    color: '#475569',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}
                >
                  {job.description}
                </p>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                    {job.jobCode}
                  </span>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem' }}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          5. Recruitment Portal Callout Banner
          ==================================================================== */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 1.5rem)',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            We Are Actively Hiring
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem', color: '#0F172A' }}>
            Build Your Engineering Career at {company?.companyName || 'Nexora Technologies'}
          </h2>
          <p
            style={{
              color: '#475569',
              maxWidth: '680px',
              margin: '0 auto 2.25rem',
              fontSize: '1.1rem',
              lineHeight: 1.7,
            }}
          >
            Join our engineering team in Hyderabad or work across our hybrid hubs. Create your verified applicant
            profile, track applications in real time, and access official offer letters securely.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              <span>Create Candidate Account</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/careers"
              className="btn btn-secondary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              <span>Browse Job Listings</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
