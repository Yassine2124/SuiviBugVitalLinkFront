import { Bug, LayoutDashboard, Users, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Bug size={18} /></div>
        <div>
          <div className="sidebar-logo-text">VitalLink</div>
          <div className="sidebar-logo-sub">Suivi des bugs</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <LayoutDashboard size={17} /> Gestion des bugs
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            <Users size={17} /> Utilisateurs
          </Link>
        )}
      </div>
    </div>
  );
}