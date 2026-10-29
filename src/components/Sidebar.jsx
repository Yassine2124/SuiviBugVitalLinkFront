import { Bug, LayoutDashboard, Users, X, FolderOpen, MapPin, Clock, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const isEn = i18n.language === 'en';

  const activeClass = (path) => (location.pathname === path ? 'active' : '');

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="sidebar-logo-icon"><Bug size={18} /></div>
            <div>
              <div className="sidebar-logo-text">{t('sidebarBrand')}</div>
              <div className="sidebar-logo-sub">{t('sidebarTagline')}</div>
            </div>
          </div>
          <button className="mobile-menu-btn" onClick={onClose} style={{ color: 'white' }}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-nav">
          <Link to="/dashboard" className={`sidebar-link ${activeClass('/dashboard')}`} onClick={onClose}>
            <LayoutDashboard size={17} /> {t('sidebarBugs')}
          </Link>
          <Link to="/documents" className={`sidebar-link ${activeClass('/documents')}`} onClick={onClose}>
            <FolderOpen size={17} /> Documents
          </Link>
          {user?.isStaff && (
            <Link to="/attendance" className={`sidebar-link ${activeClass('/attendance')}`} onClick={onClose}>
              <Clock size={17} /> {isEn ? 'My attendance' : 'Mon pointage'}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/attendance/report" className={`sidebar-link ${activeClass('/attendance/report')}`} onClick={onClose}>
              <ClipboardList size={17} /> {isEn ? 'Punctuality report' : 'Rapport de ponctualité'}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/attendance/settings" className={`sidebar-link ${activeClass('/attendance/settings')}`} onClick={onClose}>
              <MapPin size={17} /> {isEn ? 'Attendance settings' : 'Réglages du pointage'}
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`sidebar-link ${activeClass('/admin')}`} onClick={onClose}>
              <Users size={17} /> {t('sidebarUsers')}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}