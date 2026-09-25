import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, CheckCircle2, Search, Bell, Bug, Send, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BugForm from '../components/BugForm';
import BugDetail from '../components/BugDetail';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewingBug, setViewingBug] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchBugs = () => {
    api.get('/bugs').then(res => setBugs(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { fetchBugs(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const total = bugs.length;
  const open = bugs.filter(b => b.status === 'Ouvert').length;
  const inProgress = bugs.filter(b => b.status === 'En cours').length;
  const resolved = bugs.filter(b => b.status === 'Résolu').length;

  const priorityBadge = (p) => p === 'Haute' ? 'badge-red' : p === 'Moyenne' ? 'badge-amber' : 'badge-green';
  const statusBadge = (s) => s === 'Résolu' ? 'badge-green' : s === 'En cours' ? 'badge-blue' : s === 'Bloqué' ? 'badge-red' : 'badge-amber';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const initials = (name) => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  const daysLeft = (dueDate) => {
    if (!dueDate) return null;
    return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const daysLeftClass = (days) => {
    if (days === null) return '';
    if (days < 0) return 'overdue';
    if (days <= 3) return 'soon';
    return 'ok';
  };

  const handleDelete = async (bug) => {
    if (!confirm(t('confirmDelete'))) return;
    await api.delete(`/bugs/${bug._id}`);
    setOpenMenuId(null);
    fetchBugs();
  };

  const canCreate = user?.role === 'admin' || user?.permissions?.canCreate;
  const canEdit = user?.role === 'admin' || user?.permissions?.canEdit;
  const canDelete = user?.role === 'admin' || user?.permissions?.canDelete;

  const filtered = bugs.filter(b =>
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.taskId.toLowerCase().includes(search.toLowerCase())) &&
    (!filterPriority || b.priority === filterPriority) &&
    (!filterStatus || b.status === filterStatus) &&
    (!filterPlatform || b.platform === filterPlatform)
  );

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <div className="topbar">
          <div className="search-bar">
            <Search size={16} />
            <input placeholder="Rechercher un bug, un identifiant, un titre..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
          </div>
          <div className="topbar-user">
            <button className="btn-outline" onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')} style={{ padding: '8px 14px' }}>
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <Bell size={18} color="#777" />
            <div className="avatar-circle">{initials(user?.name)}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 11.5, color: '#999' }}>{user?.role === 'admin' ? 'Administrateur' : 'Membre'}</div>
            </div>
            <button className="btn-outline" onClick={logout} style={{ padding: '8px 14px' }}>Logout</button>
          </div>
        </div>

        <div className="page-content">
          <div className="page-header">
            <div className="page-title-row">
              <div className="page-icon"><Bug size={22} /></div>
              <div>
                <h2 className="page-title">Liste des bugs</h2>
                <p className="page-subtitle">Consultez et suivez tous les bugs signalés sur la plateforme.</p>
              </div>
            </div>
            {canCreate && (
              <button className="btn" onClick={() => { setSelectedBug(null); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#4338ca' }}>
                <Send size={15} /> {t('newBug')}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ececff', color: '#4338ca' }}><Bug size={20} /></div>
              <div><div className="stat-value">{total}</div><div className="stat-label">{t('total')}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><AlertCircle size={20} /></div>
              <div><div className="stat-value">{open}</div><div className="stat-label">{t('open')}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Clock size={20} /></div>
              <div><div className="stat-value">{inProgress}</div><div className="stat-label">En cours</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle2 size={20} /></div>
              <div><div className="stat-value">{resolved}</div><div className="stat-label">{t('resolved')}</div></div>
            </div>
          </div>

          <div className="filters-bar">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">Toutes priorités</option>
              <option value="Haute">Haute</option><option value="Moyenne">Moyenne</option><option value="Basse">Basse</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tous statuts</option>
              <option value="Ouvert">Ouvert</option><option value="En cours">En cours</option><option value="Bloqué">Bloqué</option><option value="Résolu">Résolu</option>
            </select>
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
              <option value="">Toutes plateformes</option>
              <option value="Web">Web</option><option value="Mobile">Mobile</option><option value="Web & Mobile">Web & Mobile</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 1300 }}>
              <thead>
                <tr>
                  <th>ID</th><th>Titre</th><th>{t('columnDescription')}</th><th>{t('category')}</th><th>{t('platform')}</th>
                  <th>Priorité</th><th>Statut</th><th>Assigné à</th><th>{t('columnCreated')}</th><th>{t('columnDue')}</th><th>{t('columnDaysLeft')}</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bug => {
                  const days = daysLeft(bug.dueDate);
                  return (
                    <tr key={bug._id}>
                      <td style={{ fontWeight: 600, color: '#4338ca' }}>{bug.taskId}</td>
                      <td className="row-title">{bug.title}</td>
                      <td style={{ color: '#777', maxWidth: 200 }}>{bug.description ? (bug.description.length > 35 ? bug.description.slice(0, 35) + '…' : bug.description) : '—'}</td>
                      <td>{bug.category}</td>
                      <td>{bug.platform}</td>
                      <td><span className={`badge ${priorityBadge(bug.priority)}`}>{bug.priority}</span></td>
                      <td><span className={`badge ${statusBadge(bug.status)}`}>{bug.status}</span></td>
                      <td>
                        {bug.assignedTo ? (
                          <div className="assignee-cell">
                            <div className="avatar-circle sm">{initials(bug.assignedTo)}</div>
                            {bug.assignedTo}
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ color: '#888' }}>{formatDate(bug.dateAdded || bug.createdAt)}</td>
                      <td style={{ color: '#888' }}>{formatDate(bug.dueDate)}</td>
                      <td>
                        {days === null ? '—' : (
                          <span className={`days-left ${daysLeftClass(days)}`}>{days < 0 ? t('overdue') : `${days}j`}</span>
                        )}
                      </td>
                      <td>
                        <div className="action-menu-wrap" ref={openMenuId === bug._id ? menuRef : null}>
                          <button className="action-menu-btn" onClick={() => setOpenMenuId(openMenuId === bug._id ? null : bug._id)}>
                            <MoreVertical size={17} />
                          </button>
                          {openMenuId === bug._id && (
                            <div className="action-menu-dropdown">
                              <button className="action-menu-item" onClick={() => { setViewingBug(bug); setOpenMenuId(null); }}>
                                <Eye size={14} /> Voir
                              </button>
                              {canEdit && (
                                <button className="action-menu-item" onClick={() => { setSelectedBug(bug); setShowForm(true); setOpenMenuId(null); }}>
                                  <Pencil size={14} /> Modifier
                                </button>
                              )}
                              {canDelete && (
                                <button className="action-menu-item danger" onClick={() => handleDelete(bug)}>
                                  <Trash2 size={14} /> Supprimer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={12} style={{ textAlign: 'center', color: '#999', padding: 30 }}>Aucun bug trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewingBug && (
        <BugDetail bug={viewingBug} onClose={() => setViewingBug(null)} onEdit={() => { setSelectedBug(viewingBug); setShowForm(true); setViewingBug(null); }} />
      )}

      {showForm && <BugForm bug={selectedBug} onCreated={() => { setShowForm(false); setSelectedBug(null); fetchBugs(); }} onClose={() => { setShowForm(false); setSelectedBug(null); }} />}
    </div>
  );
}