import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  RotateCcw,
  X
} from 'lucide-react';
import { notificationsApi } from './notificationsApi';

export default function NotificationBell({ role = 'APPLICANT' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount(role);
      setUnreadCount(count);
    } catch (err) {
      // non-blocking
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications(role, { limit: 10 });
      setNotifications(res.data?.notifications || res.notifications || []);
      setUnreadCount(res.data?.unreadCount ?? res.unreadCount ?? 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // 15s background poll
    const handleFocus = () => fetchUnreadCount();
    const handleDataUpdated = () => fetchUnreadCount();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('nexora:data-updated', handleDataUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('nexora:data-updated', handleDataUpdated);
    };
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id, role);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead(role);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    setIsOpen(false);

    // 1. Direct explicit link attached to the notification
    if (notification.link && typeof notification.link === 'string') {
      navigate(notification.link);
      return;
    }

    // 2. Metadata link
    if (notification.metadata?.link && typeof notification.metadata.link === 'string') {
      navigate(notification.metadata.link);
      return;
    }

    // 3. Entity type or context search
    const entityType = String(notification.relatedEntityType || notification.metadata?.entityType || '').toLowerCase();
    const fullText = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();

    if (entityType.includes('offer') || fullText.includes('offer')) {
      navigate(role === 'ADMIN' ? '/admin/offers' : '/app/offers');
    } else if (entityType.includes('interview') || fullText.includes('interview')) {
      navigate(role === 'ADMIN' ? '/admin/interviews' : '/app/interviews');
    } else if (entityType.includes('application') || fullText.includes('application')) {
      navigate(role === 'ADMIN' ? '/admin/applications' : '/app/applications');
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle size={16} color="#059669" />;
      case 'WARNING':
        return <AlertTriangle size={16} color="#D97706" />;
      case 'ACTION_REQUIRED':
        return <AlertCircle size={16} color="#2563EB" />;
      default:
        return <Info size={16} color="#64748B" />;
    }
  };

  return (
    <div ref={popoverRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        style={{
          position: 'relative',
          background: 'none',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '0.45rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          background: isOpen ? '#F1F5F9' : '#FFFFFF',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '9999px',
              fontSize: '0.65rem',
              fontWeight: 700,
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              boxShadow: '0 0 0 2px #FFFFFF',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 'min(90vw, 360px)',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 10000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #F1F5F9',
              background: '#F8FAFC',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Notifications</strong>
              {unreadCount > 0 && (
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                <RotateCcw className="animate-spin" size={20} style={{ margin: '0 auto 0.5rem' }} />
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                <Bell size={24} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.isRead;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid #F1F5F9',
                      background: isUnread ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.65rem',
                      alignItems: 'flex-start',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {renderIcon(n.notificationType)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.25rem' }}>
                        <h5
                          style={{
                            margin: 0,
                            fontSize: '0.825rem',
                            fontWeight: isUnread ? 700 : 600,
                            color: '#0F172A',
                          }}
                        >
                          {n.title}
                        </h5>
                        {isUnread && (
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#2563EB',
                              flexShrink: 0,
                              marginTop: '4px',
                            }}
                          />
                        )}
                      </div>
                      <p
                        style={{
                          margin: '0.2rem 0 0.35rem 0',
                          fontSize: '0.78rem',
                          color: '#475569',
                          lineHeight: 1.4,
                        }}
                      >
                        {n.message}
                      </p>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

