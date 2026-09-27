import { Bug, LayoutDashboard, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

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
          <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={onClose}>
            <LayoutDashboard size={17} /> {t('sidebarBugs')}
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={onClose}>
              <Users size={17} /> {t('sidebarUsers')}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}