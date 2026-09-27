import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical, User, Check } from 'lucide-react';
import api from '../api/axios';

export default function TesterAssignModal({ bug, onClose, onAssigned }) {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(bug.testers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/team').then(res => setMembers(res.data)).catch(() => {});
  }, []);

  const toggleMember = (name) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) { setError(t('selectAtLeastOneTester')); return; }
    setLoading(true);
    setError('');
    try {
      await api.put(`/bugs/${bug._id}`, { ...bug, status: 'En test', testers: selected });
      onAssigned();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 14 }}>
            <div className="modal-icon" style={{ background: '#7e22ce' }}><FlaskConical size={22} /></div>
            <div>
              <h3>{t('sendToTest')}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>{bug.taskId} — {bug.title}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="auth-error">{error}</div>}
            <label className="field-label-icon"><User size={15} /> {t('assignTesters')}</label>
            <div style={{ border: '1px solid #e0e0dc', borderRadius: 10, maxHeight: 220, overflowY: 'auto' }}>
              {members.map(m => {
                const isChecked = selected.includes(m.name);
                return (
                  <div
                    key={m._id}
                    onClick={() => toggleMember(m.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: isChecked ? '#f3e8ff' : 'white' }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${isChecked ? '#7e22ce' : '#ccc'}`, background: isChecked ? '#7e22ce' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isChecked && <Check size={12} color="white" />}
                    </div>
                    <span style={{ fontSize: 14 }}>{m.name}{m.role === 'admin' ? ` ${t('adminLabel')}` : ''}</span>
                  </div>
                );
              })}
              {members.length === 0 && <div style={{ padding: 14, fontSize: 13, color: '#999' }}>{t('noMembers')}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>{t('cancel')}</button>
            <button type="submit" className="btn" style={{ flex: 1, background: '#7e22ce' }} disabled={loading}>
              {loading ? '...' : t('sendToTest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}