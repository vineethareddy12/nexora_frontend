import React, { useState, useEffect } from 'react';
import { Target, Eye, Award, CheckCircle2, Globe, Shield, Users, Building, Laptop, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { companyApi } from '../company/companyApi';

export default function AboutPage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      try {
        const data = await companyApi.getPublicProfile();
        setCompany(data);
      } catch (err) {
        console.error('Failed to load company profile in AboutPage:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, []);

  const values = [
    {
      title: 'Dedication to Client Success',
      desc: 'Our delivery model is guided by an unwavering commitment to client satisfaction, delivering solutions with the precision and reliability your business requires.',
      icon: Target,
    },
    {
      title: 'Technical Mastery & Innovation',
      desc: 'We cultivate an environment of continuous learning, modern architecture adoption, and clean engineering standards across our development teams.',
      icon: Award,
    },
    {
      title: 'Transparency & Integrity',
      desc: 'Clear communication, measurable milestones, and ethical candidate recruitment practices form the bedrock of our company culture.',
      icon: Shield,
    },
    {
      title: 'People & Career Empowerment',
      desc: 'We believe our engineers are our greatest strength. We invest in skills, structured mentorship, and transparent career progression.',
      icon: Users,
    },
  ];

  const milestones = [
    { year: '2014', title: 'Company Inception', desc: 'Founded in Hyderabad as Global Technology Services to deliver tailored web and IT solutions.' },
    { year: '2018', title: 'Global Delivery Expansion', desc: 'Expanded delivery models across North American and European enterprise clientele.' },
    { year: '2022', title: 'Cloud & AI Practice', desc: 'Established dedicated centers of excellence for cloud migration, DevOps, and machine learning.' },
    { year: '2026', title: 'Nexora Digital Portal', desc: 'Launched the unified Nexora enterprise portal and integrated recruitment platform.' },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(3rem, 5vw, 5rem) clamp(1rem, 3vw, 1.5rem)', background: '#FFFFFF' }}>
      {/* 1. Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>
          About {company?.companyName || 'Nexora Technologies'}
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
            marginBottom: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
          }}
        >
          Pioneering Enterprise Software Solutions & Technology Consulting
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
          {company?.about ||
            'From our headquarters in Hitec City, Hyderabad, we architect, engineer, and deploy high-impact software systems for global industry leaders.'}
        </p>
      </div>

      {/* 2. Mission & Vision Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1.25rem, 3vw, 2rem)',
          marginBottom: '4.5rem',
        }}
      >
        <div
          className="card"
          style={{
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
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
                color: '#2563EB',
              }}
            >
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 700, color: '#0F172A' }}>Our Mission</h3>
          </div>
          <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '1rem' }}>
            {company?.mission ||
              "To accelerate our clients' digital competitiveness through resilient software engineering, business-process consulting, and agile delivery. We help organizations transform with minimal risk, higher efficiency, and predictable cost structures."}
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
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
                color: '#06B6D4',
              }}
            >
              <Eye size={24} />
            </div>
            <h3 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 700, color: '#0F172A' }}>Our Vision</h3>
          </div>
          <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '1rem' }}>
            {company?.vision ||
              'To be recognized globally as the technology partner of choice—celebrated for engineering excellence, reliable delivery, and a vibrant career platform that discovers and elevates world-class software professionals.'}
          </p>
        </div>
      </div>

      {/* 3. Areas of Expertise & Business Capabilities from Database */}
      {(company?.areasOfExpertise?.length > 0 || company?.businessCapabilities?.length > 0) && (
        <div
          className="card"
          style={{
            padding: 'clamp(1.75rem, 4vw, 3rem) clamp(1.25rem, 3.5vw, 2.5rem)',
            marginBottom: '4.5rem',
            background: '#F8FAFC',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              Enterprise Competencies
            </span>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: '#0F172A' }}>
              Areas of Expertise & Capabilities
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem' }}>
              Approved corporate domains driving transformation across industries.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            }}
          >
            {company?.areasOfExpertise?.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#0F172A',
                  }}
                >
                  <Layers size={20} color="#2563EB" />
                  <span>Core Expertise</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                  {company.areasOfExpertise.map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        color: '#475569',
                        fontSize: '0.95rem',
                      }}
                    >
                      <CheckCircle2 size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {company?.businessCapabilities?.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#0F172A',
                  }}
                >
                  <Sparkles size={20} color="#06B6D4" />
                  <span>Business Capabilities</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                  {company.businessCapabilities.map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        color: '#475569',
                        fontSize: '0.95rem',
                      }}
                    >
                      <CheckCircle2 size={18} color="#06B6D4" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Delivery Model Showcase */}
      <div
        className="card"
        style={{
          padding: 'clamp(1.75rem, 4vw, 3.5rem) clamp(1.25rem, 3.5vw, 2.5rem)',
          marginBottom: '4.5rem',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
            Onsite / Offshore Synergy
          </span>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: '#0F172A' }}>
            The Nexora Global Delivery Model
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Our unique engagement framework combines local technical leadership with high-capacity offshore
            engineering pods to guarantee 24/7 delivery velocity and maximum cost efficiency.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 'clamp(1.25rem, 3vw, 2rem)',
          }}
        >
          <div
            style={{
              padding: '2rem',
              background: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem', color: '#2563EB' }}>
              1. Discovery & Design
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Architecture workshops, requirements elicitation, UI/UX prototyping, and technical stack selection
              tailored to your business roadmap.
            </p>
          </div>

          <div
            style={{
              padding: '2rem',
              background: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem', color: '#059669' }}>
              2. Agile Pod Execution
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Two-week sprint cadences, automated test coverage, continuous integration, and transparent stakeholder
              reporting with live demos.
            </p>
          </div>

          <div
            style={{
              padding: '2rem',
              background: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem', color: '#06B6D4' }}>
              3. Cloud Deployment & SLA
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Zero-downtime automated deployment, SOC2/ISO compliance verification, real-time APM telemetry, and 24/7
              enterprise support SLAs.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Core Values Grid */}
      <div style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
            Guiding Principles
          </span>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: '#0F172A' }}>
            Our Core Values
          </h2>
          <p style={{ color: '#475569', fontSize: '1rem' }}>
            The fundamental standards that drive our day-to-day decisions.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: 'clamp(1rem, 2.5vw, 1.75rem)',
          }}
        >
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="card card-hover"
                style={{
                  padding: 'clamp(1.25rem, 3.5vw, 2rem)',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    color: '#2563EB',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0F172A', fontWeight: 700 }}>
                  {v.title}
                </h4>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Company Journey Timeline */}
      <div
        className="card"
        style={{
          padding: 'clamp(1.75rem, 4vw, 3.5rem) clamp(1.25rem, 3.5vw, 2.5rem)',
          background: '#F8FAFC',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
        }}
      >
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem', color: '#0F172A' }}>
          Our Growth Journey
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}
        >
          {milestones.map((m, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                borderLeft: '3px solid #2563EB',
                paddingLeft: '1.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#2563EB',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '0.25rem',
                }}
              >
                {m.year}
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', color: '#0F172A' }}>
                {m.title}
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
