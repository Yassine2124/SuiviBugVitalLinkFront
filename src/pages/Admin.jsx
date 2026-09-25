import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Check, Eye, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Admin() {
  const { t } = useTranslation();
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchData = () => {
    api.get('/auth/pending').then(res => setPending(res.data));
    api.get('/auth/users').then(res => setUsers(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const approve = async (id) => {
    await api.put(`/auth/approve/${id}`);
    fetchData();
  };

  const togglePermission = async (user, key) => {
    const updated = { ...user.permissions, [key]: !user.permissions[key] };
    await api.put(`/auth/permissions/${user._id}`, updated);
    fetchData();
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="page-content" style={{ maxWidth: 1000 }}>
          <div className="page-title-row" style={{ marginBottom: 22 }}>
            <div className="page-icon"><Users size={22} /></div>
            <div>
              <h2 className="page-title">{t('adminTitle')}</h2>
              <p className="page-subtitle">{t('adminSubtitle')}</p>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginTop: 0, fontSize: 15 }}>{t('pendingAccounts')} ({pending.length})</h3>
              {pending.map(u => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{u.email}</div>
                  </div>
                  <button className="btn" onClick={() => approve(u._id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={15} /> {t('approve')}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>{t('columnUser')}</th>
                  <th style={{ textAlign: 'center' }}><Eye size={14} /> {t('permCanView')}</th>
                  <th style={{ textAlign: 'center' }}><Plus size={14} /> {t('permCanCreate')}</th>
                  <th style={{ textAlign: 'center' }}><Pencil size={14} /> {t('permCanEdit')}</th>
                  <th style={{ textAlign: 'center' }}><Trash2 size={14} /> {t('permCanDelete')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="row-title">{u.name}</div>
                      <div className="row-sub">{u.email}</div>
                    </td>
                    {['canView', 'canCreate', 'canEdit', 'canDelete'].map(key => (
                      <td key={key} style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={u.permissions?.[key] || false} onChange={() => togglePermission(u, key)} style={{ width: 17, height: 17, cursor: 'pointer' }} />
                      </td>
                    ))}
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: 30 }}>{t('noUsers')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}