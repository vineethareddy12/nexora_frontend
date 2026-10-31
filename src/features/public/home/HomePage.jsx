import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Code2,
  Cloud,
  ShieldCheck,
  Cpu,
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
  Activity,
  Check,
  Compass,
  Building2,
  CheckCircle2,
  Target,
  FileCheck
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
  const videoRef = useRef(null);

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
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Video background autoplay note:', err);
      });
    }
  }, []);

  return (
    <div style={{ width: '100%', overflow: 'hidden', background: '#FFFFFF' }}>
      {/* ====================================================================
          1. Hero Section — Premium Split Screen With Crystal-Clear Video Showcase
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(2.5rem, 5vw, 4.5rem)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Headline, Pitch, CTAs, Verified Metrics */}
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
                <span>Next-Gen Technology &bull; Engineering &bull; Talent</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.15rem, 5vw, 3.65rem)',
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
                'Nexora Technologies builds enterprise-grade digital products, cloud architectures, and scalable web platforms while empowering businesses globally with verified engineering talent from Hyderabad, India.'}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.25rem' }}>
              <Link
                to="/services"
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.85rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>Explore Services</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/careers"
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}
              >
                <span>Browse Careers</span>
              </Link>
              <Link
                to="/contact"
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', color: '#475569' }}
              >
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                padding: '1.25rem 0',
                borderTop: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563EB' }}>99.9%</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Platform SLA Uptime</div>
              </div>
              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#06B6D4' }}>24/7</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Proactive Monitoring</div>
              </div>
              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669' }}>100%</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Verified Profiles</div>
              </div>
            </div>

            {/* Value Checkmarks */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                'Enterprise Software Engineering',
                'Cloud Modernization & DevOps',
                'Integrated Talent Operations',
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
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

          {/* Right Column: Hero Video Showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Ambient Background Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-25px',
                right: '-10px',
                width: '440px',
                height: '440px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(6, 182, 212, 0.15) 45%, rgba(207, 250, 254, 0) 70%)',
                filter: 'blur(40px)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />

            {/* Video Player Showcase Card */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '580px',
                background: '#0F172A',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                border: '1px solid #CBD5E1',
              }}
            >
              {/* Crystal Clear Video Screen */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                  background: '#0F172A',
                  overflow: 'hidden',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'contrast(1.08) saturate(1.05) brightness(1.02)',
                  }}
                >
                  <source src="/hero-video.mp4" type="video/mp4" />
                </video>

                {/* Subtle Floating Status Pill (Non-blocking) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#34D399',
                    letterSpacing: '0.04em',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span>NEXORA PLATFORM</span>
                </div>
              </div>

              {/* Minimalist Lower Strip */}
              <div
                style={{
                  background: '#0F172A',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.82rem',
                  color: '#94A3B8',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={15} color="#06B6D4" />
                  <span>Enterprise Software Engineering & Cloud Architectures</span>
                </div>
                <span style={{ color: '#60A5FA', fontWeight: 700 }}>Nexora Technologies</span>
              </div>
            </div>

            {/* Floating Glassmorphic Badge: Verified Hub */}
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-15px',
                zIndex: 2,
                background: '#FFFFFF',
                border: '1px solid #BFDBFE',
                borderRadius: '14px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 12px 25px -4px rgba(37, 99, 235, 0.16)',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                <Award size={19} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  Talent Matching Hub
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Verified Engineering Candidates
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. Core Capabilities & Technology Services
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
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem', color: '#0F172A', fontWeight: 800 }}>
            Technology Services Built for Scale
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
            Explore our end-to-end engineering, cloud modernization, and verified technology delivery capabilities.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={28} color="#2563EB" style={{ margin: '0 auto 1rem' }} />
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

        {/* Services Responsive Grid */}
        {!loading && !servicesError && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
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
                  boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
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
                      textDecoration: 'none',
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

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link
            to="/services"
            className="btn btn-secondary"
            style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>View All Engineering Services</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ====================================================================
          3. About Nexora Technologies — Corporate Profile & Purpose
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(2.5rem, 5vw, 4.5rem)',
            alignItems: 'center',
          }}
        >
          {/* Left: Introduction & Mission */}
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
              About Nexora Technologies
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                lineHeight: 1.25,
                marginBottom: '1.25rem',
                color: '#0F172A',
                fontWeight: 800,
              }}
            >
              Pioneering Enterprise Software & High-Caliber Talent Synergy
            </h2>
            <p
              style={{
                color: '#475569',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}
            >
              Headquartered in Hyderabad, India, Nexora Technologies provides integrated software development, cloud platform engineering, and technical recruitment solutions to forward-looking companies worldwide.
            </p>
            <p
              style={{
                color: '#475569',
                fontSize: '1rem',
                lineHeight: 1.7,
                marginBottom: '2rem',
              }}
            >
              We bridge the critical gap between complex digital transformation goals and verified engineering talent, providing organizations with transparent, agile delivery partnerships.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/about"
                className="btn btn-primary"
                style={{ padding: '0.8rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <span>Learn More About Us</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="btn btn-secondary"
                style={{ padding: '0.8rem 1.5rem' }}
              >
                <span>Contact Leadership</span>
              </Link>
            </div>
          </div>

          {/* Right: Key Pillars Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              {
                icon: Building2,
                title: 'Global Delivery Synergy',
                desc: 'Strategic onsite consulting paired with offshore engineering execution for rapid, cost-effective delivery.',
              },
              {
                icon: ShieldCheck,
                title: 'Enterprise Security & IP',
                desc: 'Strict intellectual property protection, rigorous NDAs, and production data privacy safeguards.',
              },
              {
                icon: Target,
                title: 'Verified Technical Vetting',
                desc: 'Multi-round technical and problem-solving screenings ensure only top engineering profiles join projects.',
              },
              {
                icon: Clock,
                title: 'Rapid Turnaround',
                desc: 'Accelerated development sprints and talent placement pipelines that keep project deadlines on track.',
              },
            ].map((pillar, pIdx) => {
              const PIcon = pillar.icon;
              return (
                <div
                  key={pIdx}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      marginBottom: '1rem',
                    }}
                  >
                    <PIcon size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                    {pillar.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. Why Choose Nexora — Client & Candidate Value Proposition
          ==================================================================== */}
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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(2.5rem, 5vw, 4.5rem)',
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
                fontWeight: 800,
              }}
            >
              A Delivery Model Engineered for Transparency, Speed, and Quality
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
              engagement model helps organizations transform digital operations, achieve higher flexibility, and maintain
              lower operating costs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                {
                  title: 'Engineering-Led Accountability',
                  desc: 'Senior architects and lead engineers engaged at every project milestone.',
                },
                {
                  title: 'Scalable Architecture Foundations',
                  desc: 'Modular systems designed to handle growing traffic, high concurrency, and data complexity.',
                },
                {
                  title: 'Collaborative Agile Development',
                  desc: 'Transparent code repositories, sprint demos, and regular milestone retrospectives.',
                },
                {
                  title: 'Career & Talent Alignment',
                  desc: 'Direct harmony between client technical requirements and candidates’ long-term career growth.',
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
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', color: '#0F172A', fontWeight: 700 }}>
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

          {/* Right Column: Business & Delivery Guarantees Showcase */}
          <div
            className="card"
            style={{
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <FileCheck size={22} color="#2563EB" />
              <h3 style={{ fontSize: '1.35rem', margin: 0, color: '#0F172A', fontWeight: 800 }}>
                Enterprise Delivery Standards
              </h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Guaranteed operational baselines that protect your investments and timelines.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1.15rem' }}>
              {[
                { title: '100% IP Ownership', desc: 'All codebases and artifacts belong entirely to our clients upon delivery.' },
                { title: 'Predictable Milestones', desc: 'Clear sprint timelines with measurable acceptance criteria at each phase.' },
                { title: 'Continuous QA', desc: 'Automated integration testing and security scanning embedded in delivery.' },
                { title: 'Dedicated Governance', desc: 'Direct engagement with engineering leads and strategic account managers.' },
              ].map((std, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    padding: '1.15rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                    {std.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5 }}>
                    {std.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. How Nexora Delivers — 6-Step Structured Execution
          ==================================================================== */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1rem, 3vw, 1.5rem)',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>
              Structured Execution
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem', color: '#0F172A', fontWeight: 800 }}>
              How Nexora Delivers
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
              A disciplined, transparent delivery framework that ensures project clarity and on-time launches.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                step: '01',
                title: 'Discover & Plan',
                desc: 'Deep-dive into business goals, functional requirements, technical constraints, and scope definition.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Design & Architect',
                desc: 'System architecture, microservice topologies, database models, and intuitive UI/UX design wireframes.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Develop & Build',
                desc: 'Iterative agile development sprints with peer code reviews, continuous integration, and clean code standards.',
                icon: Code2,
              },
              {
                step: '04',
                title: 'Quality & Security Testing',
                desc: 'Comprehensive unit, end-to-end integration, performance load tests, and security vulnerability scanning.',
                icon: ShieldCheck,
              },
              {
                step: '05',
                title: 'Deploy & Scale',
                desc: 'Containerized production cloud rollout, zero-downtime deployment pipelines, and auto-scaling infrastructure.',
                icon: Cloud,
              },
              {
                step: '06',
                title: 'Support & Grow',
                desc: 'Continuous telemetry monitoring, proactive maintenance, SLA guarantees, and long-term capability expansion.',
                icon: Zap,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '2rem 1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: '#E2E8F0',
                      marginBottom: '0.75rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {item.step}
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. Careers & Job Opportunities
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
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: '#0F172A', margin: 0, fontWeight: 800 }}>
                Build Your Next Chapter with Nexora
              </h2>
              <p style={{ color: '#475569', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '600px' }}>
                Discover verified career opportunities to engineer impactful software platforms and grow with high-performing teams.
              </p>
            </div>
            <Link to="/careers" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
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
                  boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="badge badge-info">{job.department}</span>
                  <span className="badge badge-primary">{job.workMode}</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.65rem', color: '#0F172A', fontWeight: 700 }}>
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
          7. Final Call to Action
          ==================================================================== */}
      <section
        style={{
          padding: 'clamp(3.5rem, 6vw, 5.5rem) clamp(1rem, 3vw, 1.5rem)',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            Get Started With Nexora
          </span>
          <h2 style={{ fontSize: 'clamp(2.15rem, 4vw, 3rem)', marginBottom: '1.25rem', color: '#0F172A', fontWeight: 800 }}>
            Ready to Build Next-Generation Digital Products or Advance Your Career?
          </h2>
          <p
            style={{
              color: '#475569',
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
              fontSize: '1.15rem',
              lineHeight: 1.7,
            }}
          >
            Whether you are looking to build a resilient cloud product with our engineering team, or ready to apply for high-impact software roles, Nexora is here for you.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              className="btn btn-primary"
              style={{ padding: '0.95rem 2.25rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Schedule a Consultation</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/careers"
              className="btn btn-secondary"
              style={{ padding: '0.95rem 2.25rem', fontSize: '1rem' }}
            >
              <span>Browse Careers</span>
            </Link>
            <Link
              to="/services"
              className="btn btn-secondary"
              style={{ padding: '0.95rem 1.85rem', fontSize: '1rem', color: '#475569' }}
            >
              <span>Explore Services</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
