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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 1.5rem' }}>
      {/* 1. Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>About {company?.companyName || 'Nexora Technologies'}</span>
        <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', marginBottom: '1.25rem', fontWeight: 800 }}>
          Pioneering Enterprise Software Solutions & Technology Consulting
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
          {company?.about || 'From our headquarters in Hitec City, Hyderabad, we architect, engineer, and deploy high-impact software systems for global industry leaders.'}
        </p>
      </div>

      {/* 2. Mission & Vision Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4.5rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Our Mission</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '1rem' }}>
            {company?.mission || "To accelerate our clients' digital competitiveness through resilient software engineering, business-process consulting, and agile delivery. We help organizations transform with minimal risk, higher efficiency, and predictable cost structures."}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Our Vision</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '1rem' }}>
            {company?.vision || "To be recognized globally as the technology partner of choice—celebrated for engineering excellence, reliable delivery, and a vibrant career platform that discovers and elevates world-class software professionals."}
          </p>
        </div>
      </div>

      {/* Areas of Expertise & Business Capabilities from Database */}
      {(company?.areasOfExpertise?.length > 0 || company?.businessCapabilities?.length > 0) && (
        <div className="glass-panel" style={{ padding: '3rem 2.5rem', marginBottom: '4.5rem' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>Enterprise Competencies</span>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Areas of Expertise & Capabilities</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Approved corporate domains driving transformation across industries.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {company?.areasOfExpertise?.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--primary)" />
                  <span>Core Expertise</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                  {company.areasOfExpertise.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {company?.businessCapabilities?.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="var(--accent)" />
                  <span>Business Capabilities</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                  {company.businessCapabilities.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Delivery Model Showcase (GTS Reference) */}
      <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', marginBottom: '4.5rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>Onsite / Offshore Synergy</span>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>The Nexora Global Delivery Model</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
            Our unique engagement framework combines local technical leadership with high-capacity offshore engineering pods to guarantee 24/7 delivery velocity and maximum cost efficiency.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '1.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem', color: '#93c5fd' }}>1. Discovery & Design</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              Architecture workshops, requirements elicitation, UI/UX prototyping, and technical stack selection tailored to your business roadmap.
            </p>
          </div>

          <div style={{ padding: '1.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem', color: '#a7f3d0' }}>2. Agile Pod Execution</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              Two-week sprint cadences, automated test coverage, continuous integration, and transparent stakeholder reporting with live demos.
            </p>
          </div>

          <div style={{ padding: '1.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem', color: '#fbcfe8' }}>3. Cloud Deployment & SLA</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              Zero-downtime automated deployment, SOC2/ISO compliance verification, real-time APM telemetry, and 24/7 enterprise support SLAs.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Core Values Grid */}
      <div style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Guiding Principles</span>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Our Core Values</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>The fundamental standards that drive our day-to-day decisions.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="glass-panel" style={{ padding: '2rem' }}>
                <Icon size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{v.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Company Journey Timeline */}
      <div className="glass-panel" style={{ padding: '3rem 2.5rem' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>Our Growth Journey</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {milestones.map((m, idx) => (
            <div key={idx} style={{ position: 'relative', borderLeft: '2px solid var(--primary)', paddingLeft: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
                {m.year}
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{m.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
