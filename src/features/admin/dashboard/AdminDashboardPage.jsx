import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileCheck2, 
  Calendar, 
  Award, 
  MessageSquare,
  Building2,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { jobsApi } from '../../public/careers/api/jobsApi';
import { servicesApi } from '../../public/services/api/servicesApi';
import { enquiryApi } from '../../public/contact/api/enquiryApi';

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();
  const token = accessToken || localStorage.getItem('nexora_access_token');

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    openVacancies: 0,
    totalServices: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    totalApplications: 0,
    shortlisted: 0,
    offersIssued: 0,
  });

  const loadLiveStats = async () => {
    try {
      setLoading(true);
      const [jobsRes, servRes, enqRes] = await Promise.allSettled([
        jobsApi.getAdminJobs({ limit: 100 }, token),
        servicesApi.getAdminServices({ limit: 100 }, token),
        enquiryApi.getAdminEnquiries({ limit: 100 }, token),
      ]);

      let jobs = [];
      let services = [];
      let enquiries = [];

      if (jobsRes.status === 'fulfilled') {
        jobs = jobsRes.value.items || jobsRes.value.jobs || [];
      }
      if (servRes.status === 'fulfilled') {
        services = servRes.value.items || servRes.value.services || [];
      }
      if (enqRes.status === 'fulfilled') {
        enquiries = enqRes.value.items || enqRes.value.enquiries || [];
      }

      const openVacancies = jobs.filter((j) => j.status === 'PUBLISHED').length;
      const newEnquiries = enquiries.filter((e) => e.status === 'NEW').length;

      setStats({
        totalJobs: jobs.length,
        openVacancies,
        totalServices: services.length,
        totalEnquiries: enquiries.length,
        newEnquiries,
        totalApplications: 0,
        shortlisted: 0,
        offersIssued: 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadLiveStats();
    } else {
      setLoading(false);
    }
  }, [token]);

  const statCards = [
    { label: 'Job Postings', count: stats.totalJobs, sub: `${stats.openVacancies} published`, icon: Briefcase, color: '#06b6d4', link: '/admin/jobs' },
    { label: 'Open Vacancies', count: stats.openVacancies, sub: 'Active on careers page', icon: Briefcase, color: '#10b981', link: '/admin/jobs' },
    { label: 'Enterprise Services', count: stats.totalServices, sub: 'In services catalog', icon: Layers, color: '#6366f1', link: '/admin/services' },
    { label: 'Contact Enquiries', count: stats.totalEnquiries, sub: `${stats.newEnquiries} pending review`, icon: MessageSquare, color: '#f59e0b', link: '/admin/enquiries' },
    { label: 'Candidate Applications', count: stats.totalApplications, sub: 'Live applicant submissions', icon: FileCheck2, color: '#8b5cf6', link: '/admin/applications' },
    { label: 'Issued Offers', count: stats.offersIssued, sub: 'Official employment offers', icon: Award, color: '#ec4899', link: '/admin/offers' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Recruitment & Operations Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Live metrics and management shortcuts across your Nexora Technologies portal.
          </p>
        </div>
        <button onClick={loadLiveStats} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Grid of real live stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.link}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.25rem' }}>
                  {loading ? '—' : item.count}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.sub}</div>
              </div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: `${item.color}18`,
                border: `1px solid ${item.color}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
                flexShrink: 0,
              }}>
                <Icon size={22} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: 'clamp(1.15rem, 3vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Briefcase size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Job Vacancy Management</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Publish open job postings to the public careers page, edit requirements, manage deadlines, or archive positions.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/admin/jobs" className="btn btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <Plus size={15} />
              <span>Post New Vacancy</span>
            </Link>
            <Link to="/careers" target="_blank" className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <span>View Public Careers</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 'clamp(1.15rem, 3vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Layers size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Company Services Catalog</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Maintain service offerings, technology stacks, capabilities, and presentation orders visible on the public portal.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/admin/services" className="btn btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <Plus size={15} />
              <span>Add New Service</span>
            </Link>
            <Link to="/services" target="_blank" className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <span>View Public Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 'clamp(1.15rem, 3vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MessageSquare size={20} color="var(--status-warning)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Inbound Client Enquiries</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Review, triage, and record notes on technical consulting and enterprise project leads sent via the Contact page.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/admin/enquiries" className="btn btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <span>Review Enquiries</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/contact" target="_blank" className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <span>Test Contact Form</span>
            </Link>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 'clamp(1.15rem, 3vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Building2 size={20} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Corporate Profile & Identity</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Update official company details, mission statement, contact numbers, address, and enterprise expertise domains.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/admin/company" className="btn btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <span>Edit Company Profile</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/about" target="_blank" className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
              <span>Preview About Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
