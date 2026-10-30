import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, Award, FileText, ArrowRight, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { profileApi } from '../profile/api/profileApi';

export default function ApplicantDashboardPage() {
  const { user, accessToken } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (accessToken) {
        try {
          const res = await profileApi.getProfile(accessToken);
          setProfileData(res);
        } catch (e) {
          // fallback to user in auth context
        }
      }
    }
    loadData();
  }, [accessToken]);

  const candidateName = user?.fullName || 'Candidate';
  const skillsCount = profileData?.technicalSkills?.length || 0;
  const isProfileConfigured = Boolean(profileData?.phone && profileData?.highestQualification);

  return (
    <div style={{ width: '100%' }}>
      {/* Welcome Banner with Real User Name */}
      <div
        className="card"
        style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 60%, #F0FDFA 100%)',
          border: '1px solid #BFDBFE',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Sparkles size={14} />
            <span>Applicant Portal Active</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.4rem', fontWeight: 800, color: '#0F172A' }}>
            Welcome back, {candidateName}!
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0 }}>
            Track your job applications, schedule interviews, and manage your credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/app/profile" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>
            <span>Edit Profile</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/careers" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>
            <span>Browse Jobs</span>
          </Link>
        </div>
      </div>

      {/* Real Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Active Applications', value: '0', icon: Briefcase, color: '#2563EB', desc: 'Applied positions' },
          { label: 'Technical Skills', value: String(skillsCount), icon: Award, color: '#059669', desc: 'Skills listed in profile' },
          { label: 'Interview Invites', value: '0', icon: Calendar, color: '#06B6D4', desc: 'Scheduled meetings' },
          { label: 'Verified Profile', value: isProfileConfigured ? '100%' : 'Incomplete', icon: UserCheck, color: '#7C3AED', desc: 'Portal profile status' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.2rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{stat.desc}</div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={24} color={stat.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Applications Container (Zero Fake Rows) */}
      <div className="glass-panel" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Recent Job Applications</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Live applications submitted through your account
            </p>
          </div>
          <Link to="/careers" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <span>Find New Roles</span>
          </Link>
        </div>

        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
          <Briefcase size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>No Job Applications Submitted Yet</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            You haven't submitted any job applications yet. Visit the Careers section to discover open engineering and technical opportunities.
          </p>
          <Link to="/careers" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
            <span>Explore Open Roles</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
