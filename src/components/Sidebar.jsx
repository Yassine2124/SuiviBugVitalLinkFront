import { Bug, LayoutDashboard, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Bug size={18} /></div>
        <div>
          <div className="sidebar-logo-text">{t('sidebarBrand')}</div>
          <div className="sidebar-logo-sub">{t('sidebarTagline')}</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <LayoutDashboard size={17} /> {t('sidebarBugs')}
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            <Users size={17} /> {t('sidebarUsers')}
          </Link>
        )}
      </div>
    </div>
  );
}