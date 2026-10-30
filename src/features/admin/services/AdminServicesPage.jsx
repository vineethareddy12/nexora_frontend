import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, CheckCircle2, AlertCircle, RefreshCw, X, Eye, EyeOff, Search } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { servicesApi } from '../../public/services/api/servicesApi';
import { useToast } from '../../../components/toast/ToastContext';

export default function AdminServicesPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    shortDescription: '',
    fullDescription: '',
    capabilities: '',
    displayOrder: 1,
    isPublished: false,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm.trim() || undefined,
        category: filterCategory !== 'ALL' ? filterCategory : undefined,
        isPublished: filterStatus !== 'ALL' ? filterStatus : undefined,
      };
      const res = await servicesApi.getAdminServices(params, token);
      setServices(res.items || res.services || []);
    } catch (err) {
      console.error('Error fetching admin services:', err);
      setError(err.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 250);

    const handleAuth = () => fetchServices();
    window.addEventListener('nexora:admin-authenticated', handleAuth);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('nexora:admin-authenticated', handleAuth);
    };
  }, [searchTerm, filterCategory, filterStatus, token, accessToken]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      title: '',
      slug: '',
      category: '',
      shortDescription: '',
      fullDescription: '',
      capabilities: '',
      displayOrder: services.length + 1,
      isPublished: false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      title: svc.title || '',
      slug: svc.slug || '',
      category: svc.category || '',
      shortDescription: svc.shortDescription || '',
      fullDescription: svc.fullDescription || '',
      capabilities: Array.isArray(svc.capabilities) ? svc.capabilities.join(', ') : '',
      displayOrder: svc.displayOrder || 1,
      isPublished: !!svc.isPublished,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      // Auto-generate slug if creating new
      slug: editingService ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

    try {
      setSaving(true);
      setFormError(null);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category: formData.category.trim(),
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim() || undefined,
        capabilities: formData.capabilities
          ? formData.capabilities.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        displayOrder: parseInt(formData.displayOrder, 10) || 1,
        isPublished: formData.isPublished,
      };

      if (editingService) {
        await servicesApi.updateService(editingService.id, payload, currentToken);
        toast.success(`Service "${payload.title}" updated successfully!`, { title: 'Service Saved' });
      } else {
        await servicesApi.createService(payload, currentToken);
        toast.success(`New service "${payload.title}" created successfully!`, { title: 'Service Created' });
      }

      setModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Save service failed:', err);
      toast.error(err.message || 'Operation failed.', { title: 'Error' });
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (svc) => {
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);
    try {
      await servicesApi.updateServiceStatus(svc.id, !svc.isPublished, currentToken);
      toast.success(`Service "${svc.title}" is now ${!svc.isPublished ? 'Published' : 'Draft'}.`, {
        title: 'Status Updated',
      });
      fetchServices();
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status.', { title: 'Update Failed' });
    }
  };

  const handleDelete = async (svc) => {
    if (!window.confirm(`Are you sure you want to delete service "${svc.title}"?`)) {
      return;
    }
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);
    try {
      await servicesApi.deleteService(svc.id, currentToken);
      toast.success(`Service "${svc.title}" was deleted.`, { title: 'Service Removed' });
      fetchServices();
    } catch (err) {
      toast.error(err.message || 'Failed to delete service.', { title: 'Delete Failed' });
    }
  };

  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Standard Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Service Offerings Catalog
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Maintain enterprise technology services, capabilities, and solutions visible on the public portal.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.15rem' }}>
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.5rem', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
          >
            <option value="ALL">All Publication States</option>
            <option value="true">Published</option>
            <option value="false">Draft / Unpublished</option>
          </select>

          {categories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.875rem', outline: 'none' }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={28} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading services...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--status-danger)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
            <p>{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Layers size={36} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Services Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create your first service draft or adjust your search filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="desktop-table-view">
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.75rem 1rem', width: '70px' }}>Order</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Service Title</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-dim)', fontWeight: 600 }}>{item.displayOrder}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>/{item.slug}</div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.category}</td>
                      <td style={{ padding: '1rem' }}>
                        {item.isPublished ? (
                          <span className="badge badge-success">Published</span>
                        ) : (
                          <span className="badge badge-warning">Unpublished</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          title={item.isPublished ? 'Unpublish' : 'Publish'}
                          onClick={() => handleToggleStatus(item)}
                          style={{ padding: '0.4rem 0.65rem', marginRight: '0.4rem', fontSize: '0.8rem' }}
                        >
                          {item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          className="btn btn-secondary"
                          title="Edit Service"
                          onClick={() => handleOpenEdit(item)}
                          style={{ padding: '0.4rem 0.65rem', marginRight: '0.4rem', fontSize: '0.8rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          title="Delete Service"
                          onClick={() => handleDelete(item)}
                          style={{ padding: '0.4rem 0.65rem', color: 'var(--status-danger)', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View */}
            <div className="mobile-cards-view">
              {services.map((item) => (
                <div
                  key={`card-${item.id}`}
                  className="card"
                  style={{
                    padding: '1.15rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Order: #{item.displayOrder}</div>
                      <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{item.title}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>/{item.slug}</div>
                    </div>
                    {item.isPublished ? (
                      <span className="badge badge-success">Published</span>
                    ) : (
                      <span className="badge badge-warning">Unpublished</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    <span className="badge badge-info">{item.category}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleToggleStatus(item)}
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      {item.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{item.isPublished ? 'Unpublish' : 'Publish'}</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenEdit(item)}
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDelete(item)}
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--status-danger)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 2.5vw, 1.5rem)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)', padding: 'clamp(1.25rem, 4vw, 2rem)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              {editingService ? 'Edit Service' : 'Create New Service Offering'}
            </h2>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#fca5a5', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Software Engineering"
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Short Summary (Card Preview) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Key Capabilities (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.capabilities}
                  onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                  placeholder="React, Microservices, CI/CD, Containerization"
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div style={{ paddingTop: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: '130px' }}>
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
