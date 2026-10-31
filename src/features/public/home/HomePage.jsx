import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Server,
  TrendingUp,
  Compass,
  Building2,
  Lock
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

  // Hero Video Player controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

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
          1. Hero Section — Two-Column Layout With High-Tech Video Showcase
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
                'Nexora Technologies builds enterprise-grade digital products, cloud architectures, and scalable web platforms while empowering businesses with verified engineering talent.'}
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
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Cloud Monitoring</div>
              </div>
              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669' }}>100%</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Verified Profiles</div>
              </div>
            </div>

            {/* Feature Indicators Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                'Full-Stack Software Engineering',
                'Cloud Infrastructure & DevOps',
                'Talent & Recruitment Hub',
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

          {/* Right Column: Hero Video Showcase in Modern Browser Window */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Ambient Background Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-25px',
                right: '-10px',
                width: '420px',
                height: '420px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(6, 182, 212, 0.12) 40%, rgba(207, 250, 254, 0) 70%)',
                filter: 'blur(35px)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />

            {/* Video Player Device Window Container */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '560px',
                background: '#0F172A',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                border: '1px solid #CBD5E1',
              }}
            >
              {/* Browser Window Chrome Top Header */}
              <div
                style={{
                  background: '#1E293B',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.76rem', color: '#94A3B8', marginLeft: '0.5rem', fontWeight: 600 }}>
                    Nexora Technology Showcase
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.68rem',
                      color: '#34D399',
                      background: 'rgba(52, 211, 153, 0.15)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    LIVE PREVIEW
                  </span>

                  {/* Sound Toggle */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#E2E8F0',
                      cursor: 'pointer',
                      padding: '0.3rem 0.45rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>

                  {/* Play/Pause Toggle */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#E2E8F0',
                      cursor: 'pointer',
                      padding: '0.3rem 0.45rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={isPlaying ? 'Pause Video' : 'Play Video'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>
              </div>

              {/* Video Element Screen */}
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
                  src="/hero-video.mp4"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Clickable Overlay to Pause/Play */}
                <div
                  onClick={togglePlay}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    cursor: 'pointer',
                    background: isPlaying ? 'transparent' : 'rgba(15, 23, 42, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                >
                  {!isPlaying && (
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(37, 99, 235, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                      }}
                    >
                      <Play size={28} style={{ marginLeft: '4px' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Chrome Bottom Footer Bar */}
              <div
                style={{
                  background: '#0F172A',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #1E293B',
                  fontSize: '0.78rem',
                  color: '#94A3B8',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Activity size={14} color="#06B6D4" />
                  <span>Enterprise Engineering & Scalable Cloud Solutions</span>
                </div>
                <span style={{ color: '#60A5FA', fontWeight: 600 }}>Nexora Technologies</span>
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
          2. Technology Excellence & Trust Strip
          ==================================================================== */}
      <section
        style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '1.75rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Enterprise Tech Stack:
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(1rem, 3vw, 2.25rem)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'React & Next.js', icon: Code2 },
              { label: 'Node.js & Express', icon: Server },
              { label: 'PostgreSQL & Prisma', icon: Layers },
              { label: 'Cloud Architecture & DevOps', icon: Cloud },
              { label: 'JWT & Security Gateways', icon: ShieldCheck },
              { label: 'Verified Talent Operations', icon: Users },
            ].map((tech, idx) => {
              const IconComp = tech.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <IconComp size={15} color="#2563EB" />
                  <span>{tech.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. Core Capabilities & Technology Services
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
            Explore our end-to-end engineering, cloud modernization, and technology delivery capabilities.
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
      </section>

      {/* ====================================================================
          4. Impact Numbers & Enterprise Performance Grid
          ==================================================================== */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: 'clamp(3.5rem, 5vw, 5rem) clamp(1rem, 3vw, 1.5rem)',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span
              style={{
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid #3B82F6',
                color: '#93C5FD',
                padding: '0.35rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Enterprise Impact
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Delivering Measurable Outcomes Globally
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', marginTop: '0.75rem', maxWidth: '640px', margin: '0.75rem auto 0' }}>
              Engineered for resilience, high concurrency, and rapid talent deployment.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              { stat: '100+', label: 'Digital Products Engineered', desc: 'Scalable platforms deployed for clients', icon: RocketIcon },
              { stat: '99.99%', label: 'Cloud Architecture Uptime', desc: 'Zero unmanaged downtime SLA', icon: Cloud },
              { stat: '15 Days', label: 'Average Talent Matching', desc: 'Rapid interview-to-offer turnaround', icon: Clock },
              { stat: '100%', label: 'Security & Compliance', desc: 'Enterprise-grade access & audit logging', icon: ShieldCheck },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, color: '#38BDF8', marginBottom: '0.35rem' }}>
                  {item.stat}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. Why Choose Nexora — Hybrid Delivery Model
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
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
                fontWeight: 800,
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
                  title: 'Collaborative Agile Development',
                  desc: 'Transparent source control, CI/CD pipelines, sprint demos, and regular reviews.',
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

          {/* Right Column: Clean Composition of Tech Stack */}
          <div
            className="card"
            style={{
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Cpu size={20} color="#2563EB" />
              <h3 style={{ fontSize: '1.35rem', margin: 0, color: '#0F172A', fontWeight: 800 }}>
                Technology Excellence Stack
              </h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Modern, battle-tested enterprise frameworks, secure pipelines, and cloud infrastructure.
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
                    padding: '1.1rem 1rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                    {tech.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                    {tech.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. How We Work — 4-Step Engineering Delivery Lifecycle
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              step: '01',
              title: 'Discovery & Architecture',
              desc: 'Deep-dive into business goals, technical constraints, and system design specifications.',
              icon: Compass,
            },
            {
              step: '02',
              title: 'Agile Sprints & Build',
              desc: 'Iterative two-week development sprints with code reviews and automated CI/CD checks.',
              icon: Code2,
            },
            {
              step: '03',
              title: 'Quality & Security Testing',
              desc: 'End-to-end integration, performance load tests, vulnerability scanning, and QA verification.',
              icon: ShieldCheck,
            },
            {
              step: '04',
              title: 'Deployment & Scale',
              desc: 'Production cloud rollout, monitoring telemetry, SLA maintenance, and continuous optimization.',
              icon: TrendingUp,
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
                    fontSize: '2rem',
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          7. Careers and Job Opportunities
          ==================================================================== */}
      {jobs.length > 0 && (
        <section
          style={{
            padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1rem, 3vw, 1.5rem)',
            maxWidth: '1280px',
            margin: '0 auto',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
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
          8. Dual Action Callout Banner (For Clients & Candidates)
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
              to="/register"
              className="btn btn-secondary"
              style={{ padding: '0.95rem 2.25rem', fontSize: '1rem' }}
            >
              <span>Create Candidate Account</span>
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

function RocketIcon(props) {
  return <Zap {...props} />;
}
