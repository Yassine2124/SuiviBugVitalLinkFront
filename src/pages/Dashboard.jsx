import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BugForm from '../components/BugForm';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);

  const fetchBugs = () => {
    api.get('/bugs').then(res => setBugs(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { fetchBugs(); }, []);

  const total = bugs.length;
  const open = bugs.filter(b => b.status !== 'Résolu').length;
  const resolved = bugs.filter(b => b.status === 'Résolu').length;

  const priorityBadge = (p) => p === 'Haute' ? 'badge-red' : p === 'Moyenne' ? 'badge-amber' : 'badge-green';

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>{t('dashboard')}</h2>
          <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/admin" className="btn-outline" style={{ textDecoration: 'none', color: 'inherit' }}>Admin</Link>
          <button className="btn-outline" onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}>
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card"><div style={{ fontSize: 13, color: '#666' }}>{t('total')}</div><div style={{ fontSize: 24, fontWeight: 600 }}>{total}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: '#666' }}>{t('open')}</div><div style={{ fontSize: 24, fontWeight: 600 }}>{open}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: '#666' }}>{t('resolved')}</div><div style={{ fontSize: 24, fontWeight: 600 }}>{resolved}</div></div>
      </div>

      <button className="btn" onClick={() => { setSelectedBug(null); setShowForm(true); }} style={{ marginBottom: 12 }}>{t('newBug')}</button>

      <div className="card">
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#666', fontSize: 13 }}>
              <th style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>ID</th>
              <th style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Titre</th>
              <th style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Priorité</th>
              <th style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map(bug => (
              <tr key={bug._id} onClick={() => { setSelectedBug(bug); setShowForm(true); }} style={{ cursor: 'pointer' }}>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{bug.taskId}</td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{bug.title}</td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}><span className={`badge ${priorityBadge(bug.priority)}`}>{bug.priority}</span></td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}><span className="badge badge-blue">{bug.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <BugForm bug={selectedBug} onCreated={() => { setShowForm(false); setSelectedBug(null); fetchBugs(); }} onClose={() => { setShowForm(false); setSelectedBug(null); }} />}
    </div>
  );
}