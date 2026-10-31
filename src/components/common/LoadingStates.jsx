import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

/**
 * Modern Animated Shimmer Skeleton for Tables, Lists, and Cards
 */
export function Skeleton({ width = '100%', height = '1.25rem', borderRadius = '6px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.5s infinite ease-in-out',
        ...style,
      }}
    />
  );
}

/**
 * Content Section Skeleton for Cards / KPI Rows
 */
export function CardSkeleton({ count = 3, height = '90px' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: '1rem', width: '100%', marginBottom: '1.5rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
          <Skeleton width="40%" height="0.85rem" style={{ marginBottom: '0.65rem' }} />
          <Skeleton width="65%" height="1.6rem" />
        </div>
      ))}
    </div>
  );
}

/**
 * Standardized Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.75rem' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} width={`${100 / cols}%`} height="1rem" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid #F8FAFC' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={`${100 / cols}%`} height="1.1rem" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Subtle Background Refreshing Indicator
 */
export function RefreshBadge({ isRefreshing }) {
  if (!isRefreshing) return null;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        background: '#EFF6FF',
        color: '#2563EB',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid #BFDBFE',
      }}
    >
      <RefreshCw size={11} className="spin" />
      <span>Updating...</span>
    </div>
  );
}

/**
 * Standardized Error State with Retry Button
 */
export function ErrorState({ title = 'Failed to load content', message, onRetry }) {
  return (
    <div
      className="card"
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '16px',
        maxWidth: '560px',
        margin: '1.5rem auto',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#FEE2E2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}
      >
        <AlertCircle size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991B1B', margin: 0, marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ color: '#7F1D1D', fontSize: '0.88rem', margin: 0, marginBottom: '1.25rem', lineHeight: 1.5 }}>
        {message || 'An unexpected error occurred while communicating with the service.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1.15rem', background: '#FFFFFF', borderColor: '#FCA5A5', color: '#991B1B' }}
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

/**
 * Standardized Empty State
 */
export function EmptyState({ icon: Icon = Inbox, title = 'No records found', description, action }) {
  return (
    <div
      className="card"
      style={{
        padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem',
        textAlign: 'center',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: '#F8FAFC',
          color: '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0, maxWidth: '440px', marginInline: 'auto', marginBottom: action ? '1.25rem' : 0, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
    </div>
  );
}
