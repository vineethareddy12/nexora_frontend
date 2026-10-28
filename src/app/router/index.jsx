import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import ApplicantLayout from '../layouts/ApplicantLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import HomePage from '../../features/public/home/HomePage';
import AboutPage from '../../features/public/about/AboutPage';
import ServicesPage from '../../features/public/services/ServicesPage';
import CareersPage from '../../features/public/careers/CareersPage';
import JobDetailsPage from '../../features/public/job-details/JobDetailsPage';
import ContactPage from '../../features/public/contact/ContactPage';

// Auth pages
import LoginPage from '../../features/auth/LoginPage';
import RegisterPage from '../../features/auth/RegisterPage';
import ForgotPasswordPage from '../../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';

// Applicant pages
import ApplicantDashboardPage from '../../features/applicants/dashboard/ApplicantDashboardPage';
import ApplicantProfilePage from '../../features/applicants/profile/ApplicantProfilePage';
import ApplicantDocumentsPage from '../../features/applicants/documents/ApplicantDocumentsPage';
import ApplicantApplicationsPage from '../../features/applicants/applications/ApplicantApplicationsPage';
import ApplicantInterviewsPage from '../../features/applicants/interviews/ApplicantInterviewsPage';
import ApplicantOffersPage from '../../features/applicants/offers/ApplicantOffersPage';

// Admin pages
import AdminDashboardPage from '../../features/admin/dashboard/AdminDashboardPage';
import AdminCompanyPage from '../../features/admin/company/AdminCompanyPage';
import AdminServicesPage from '../../features/admin/services/AdminServicesPage';
import AdminJobsPage from '../../features/admin/jobs/AdminJobsPage';
import AdminApplicantsPage from '../../features/admin/applicants/AdminApplicantsPage';
import AdminApplicationsPage from '../../features/admin/applications/AdminApplicationsPage';
import AdminInterviewsPage from '../../features/admin/interviews/AdminInterviewsPage';
import AdminOffersPage from '../../features/admin/offers/AdminOffersPage';
import AdminEnquiriesPage from '../../features/admin/enquiries/AdminEnquiriesPage';
import AdminActivityPage from '../../features/admin/activity/AdminActivityPage';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'careers', element: <CareersPage /> },
      { path: 'jobs/:id', element: <JobDetailsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Applicant Portal Routes
  {
    path: '/app',
    element: <ApplicantLayout />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <ApplicantDashboardPage /> },
      { path: 'profile', element: <ApplicantProfilePage /> },
      { path: 'documents', element: <ApplicantDocumentsPage /> },
      { path: 'applications', element: <ApplicantApplicationsPage /> },
      { path: 'interviews', element: <ApplicantInterviewsPage /> },
      { path: 'offers', element: <ApplicantOffersPage /> },
      { path: 'settings', element: <Navigate to="/app/profile?tab=password" replace /> },
    ],
  },

  // Administrator Portal Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'company', element: <AdminCompanyPage /> },
      { path: 'services', element: <AdminServicesPage /> },
      { path: 'jobs', element: <AdminJobsPage /> },
      { path: 'applicants', element: <AdminApplicantsPage /> },
      { path: 'applications', element: <AdminApplicationsPage /> },
      { path: 'interviews', element: <AdminInterviewsPage /> },
      { path: 'offers', element: <AdminOffersPage /> },
      { path: 'enquiries', element: <AdminEnquiriesPage /> },
      { path: 'activity', element: <AdminActivityPage /> },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Page Not Found</p>
        <a href="/" className="btn btn-primary">Return to Homepage</a>
      </div>
    ),
  },
]);
