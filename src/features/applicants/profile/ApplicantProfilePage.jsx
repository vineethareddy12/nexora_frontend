import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Building, 
  Globe, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  X, 
  Briefcase, 
  Sparkles,
  Lock,
  Edit3,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { profileApi } from './api/profileApi';
import { authApi } from '../../auth/api/authApi';

export default function ApplicantProfilePage() {
  const { user, accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab state: 'overview' | 'update' | 'links' | 'password'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam && ['overview', 'update', 'links', 'password'].includes(tabParam)
      ? tabParam
      : 'overview'
  );

  // Sync when search parameter changes
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && ['overview', 'update', 'links', 'password'].includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  // Unified profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentLocation: '',
    highestQualification: '',
    collegeUniversity: '',
    graduationYear: '',
    technicalSkills: [],
    totalExperienceYears: '',
    currentOrPreviousEmployer: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch candidate profile from PostgreSQL
  useEffect(() => {
    async function loadProfile() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await profileApi.getProfile(accessToken);

        // Spread operator merges real PostgreSQL profile data into state
        setProfile((prev) => ({
          ...prev,
          ...data,
          fullName: data.fullName || user?.fullName || '',
          email: data.email || user?.email || '',
          phone: data.phone || user?.phone || '',
          currentLocation: data.currentLocation || '',
          highestQualification: data.highestQualification || '',
          collegeUniversity: data.collegeUniversity || '',
          graduationYear: data.graduationYear != null ? String(data.graduationYear) : '',
          technicalSkills: Array.isArray(data.technicalSkills) ? [...data.technicalSkills] : [],
          totalExperienceYears: data.totalExperienceYears != null ? String(data.totalExperienceYears) : '',
          currentOrPreviousEmployer: data.currentOrPreviousEmployer || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
        }));
      } catch (err) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch candidate profile.' });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [accessToken, user]);

  // Handle generic profile input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add skill tag
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    if (!profile.technicalSkills.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, trimmed],
      }));
    }
    setNewSkill('');
  };

  // Remove skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((s) => s !== skillToRemove),
    }));
  };

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setStatusMessage(null);
    setSaving(true);

    try {
      const payload = {
        ...profile,
        graduationYear: profile.graduationYear ? parseInt(profile.graduationYear, 10) : null,
        totalExperienceYears: profile.totalExperienceYears ? parseFloat(profile.totalExperienceYears) : null,
        technicalSkills: [...profile.technicalSkills],
      };

      // Strip read-only identifiers
      delete payload.email;
      delete payload.userId;

      const updated = await profileApi.updateProfile({ ...payload }, accessToken);

      setProfile((prev) => ({
        ...prev,
        ...updated,
      }));

      setStatusMessage({ type: 'success', text: 'Candidate profile saved successfully in database!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save candidate profile.' });
    } finally {
      setSaving(false);
    }
  };

  // Save password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    try {
      setSaving(true);
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword, accessToken);

      setStatusMessage({ type: 'success', text: 'Password has been updated successfully in PostgreSQL database!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  const candidateInitial = (profile.fullName || user?.fullName || 'C').charAt(0).toUpperCase();
  const candidateName = profile.fullName || user?.fullName || 'Candidate Profile';
  const candidateEmail = profile.email || user?.email || '';

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: User },
    { id: 'update', label: 'Update Profile', icon: Edit3 },
    { id: 'links', label: 'Portfolio & Links', icon: Globe },
    { id: 'password', label: 'Change Password', icon: Lock },
  ];

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Loading candidate profile from database...</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Connecting to PostgreSQL</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(1.25rem, 3.5vw, 2rem) clamp(1rem, 3vw, 2.5rem)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.65) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              color: '#fff',
              fontSize: '1.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
              flexShrink: 0,
            }}
          >
            {candidateInitial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', margin: 0, fontWeight: 700, wordBreak: 'break-word' }}>{candidateName}</h1>
              <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.role || 'APPLICANT'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, wordBreak: 'break-all' }}>
              {candidateEmail} {profile.currentLocation && `• ${profile.currentLocation}`}
            </p>
          </div>
        </div>

        {activeTab !== 'overview' && activeTab !== 'password' && (
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        )}
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div
        className="profile-nav-tabs"
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '0.25rem',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id }, { replace: true });
                setStatusMessage(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.15rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                borderBottom: isActive ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1.25rem',
            marginBottom: '2rem',
            borderRadius: 'var(--radius-md)',
            background: statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: statusMessage.type === 'success' ? '#4ade80' : '#f87171',
            fontSize: '0.9rem',
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 3. Tab Contents */}

      {/* TAB 1: PROFILE OVERVIEW (Summary Mode) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary Card 1: Personal Coordinates */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <User size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Personal Coordinates</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('update')}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            </div>

            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Full Legal Name</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.fullName || 'Not specified'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Account Email (Locked)</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.email || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Mobile Phone</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.phone || 'Not provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Location</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.currentLocation || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Summary Card 2: Education & Experience */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GraduationCap size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Education & Experience</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('update')}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            </div>

            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Highest Qualification</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.highestQualification || 'Not provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>College / University</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.collegeUniversity || 'Not provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Graduation Year</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.graduationYear || 'Not provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Total Experience</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {profile.totalExperienceYears ? `${profile.totalExperienceYears} Years` : 'Fresher / Not specified'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Current / Previous Employer</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{profile.currentOrPreviousEmployer || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Summary Card 3: Skills Stack */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Technical Skill Stack</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('update')}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={13} />
                <span>Manage Skills</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.technicalSkills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#93c5fd',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </span>
              ))}
              {profile.technicalSkills.length === 0 && (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No technical skills added yet. Click Manage Skills to add your stack.</div>
              )}
            </div>
          </div>

          {/* Summary Card 4: Web Links */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Globe size={18} color="var(--status-success)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Web & Social Presence</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={13} />
                <span>Edit Links</span>
              </button>
            </div>

            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>LinkedIn</div>
                {profile.linkedinUrl ? (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>View LinkedIn Profile</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Not linked</span>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>GitHub</div>
                {profile.githubUrl ? (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>View GitHub Profile</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Not linked</span>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Portfolio Website</div>
                {profile.portfolioUrl ? (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Visit Portfolio</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Not linked</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPDATE PROFILE FORM */}
      {activeTab === 'update' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section A: Personal Coordinates */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <User size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Personal Coordinates</h3>
            </div>

            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Full Name (Legal / Preferred) *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Vineetha Busireddy"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Primary Login ID (Locked)</span>
                </div>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-dim)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Current City & Country
                </label>
                <input
                  type="text"
                  name="currentLocation"
                  placeholder="e.g. Hyderabad, Telangana"
                  value={profile.currentLocation}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section B: Education & Experience */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <GraduationCap size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Education & Experience</h3>
            </div>

            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Highest Qualification
                </label>
                <input
                  type="text"
                  name="highestQualification"
                  placeholder="e.g. B.Tech Computer Science"
                  value={profile.highestQualification}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  College / University
                </label>
                <input
                  type="text"
                  name="collegeUniversity"
                  placeholder="e.g. National Institute of Technology"
                  value={profile.collegeUniversity}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Year of Graduation
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  placeholder="e.g. 2024"
                  value={profile.graduationYear}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Total Relevant Experience (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="totalExperienceYears"
                  placeholder="e.g. 2.5"
                  value={profile.totalExperienceYears}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Current or Most Recent Employer
                </label>
                <input
                  type="text"
                  name="currentOrPreviousEmployer"
                  placeholder="e.g. Tech Innovations Pvt Ltd"
                  value={profile.currentOrPreviousEmployer}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section C: Skills */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Technical Skill Stack</h3>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', maxWidth: '480px' }}>
              <input
                type="text"
                placeholder="e.g. React, Node.js, PostgreSQL, Docker"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Add Skill</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {profile.technicalSkills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '24px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#93c5fd',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#93c5fd',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {profile.technicalSkills.length === 0 && (
                <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  No skills entered yet. Add your key technologies above.
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SOCIAL & PORTFOLIO LINKS */}
      {activeTab === 'links' && (
        <form onSubmit={handleSaveProfile} className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
            <Globe size={18} color="var(--status-success)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Web, Repository & Portfolio Links</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/yourprofile"
                value={profile.linkedinUrl}
                onChange={handleProfileChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                GitHub Profile URL
              </label>
              <input
                type="url"
                name="githubUrl"
                placeholder="https://github.com/yourusername"
                value={profile.githubUrl}
                onChange={handleProfileChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Personal Portfolio or Project Showcase URL
              </label>
              <input
                type="url"
                name="portfolioUrl"
                placeholder="https://yourportfolio.dev"
                value={profile.portfolioUrl}
                onChange={handleProfileChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving Links...' : 'Save Links'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: CHANGE PASSWORD / SECURITY */}
      {activeTab === 'password' && (
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
            <Lock size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Update Security Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                New Password (Minimum 8 characters) *
              </label>
              <input
                type="password"
                name="newPassword"
                required
                placeholder="Minimum 8 characters"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmNewPassword"
                required
                placeholder="Repeat new password"
                value={passwordForm.confirmNewPassword}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={16} />
              <span>{saving ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
