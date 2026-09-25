import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, User, Calendar, Type, FileText, Grid, Layers, TrendingUp, Clock, Send } from 'lucide-react';
import api from '../api/axios';

export default function BugForm({ bug, onCreated, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(bug ? {
    taskId: bug.taskId, title: bug.title, description: bug.description || '',
    category: bug.category, platform: bug.platform, priority: bug.priority,
    status: bug.status, assignedTo: bug.assignedTo || '',
    dueDate: bug.dueDate ? bug.dueDate.slice(0, 10) : ''
  } : {
    taskId: '', title: '', description: '',
    category: 'Bug', platform: 'Web', priority: 'Moyenne',
    status: 'Ouvert', assignedTo: '', dueDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (bug) await api.put(`/bugs/${bug._id}`, form);
      else await api.post('/bugs', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;
    await api.delete(`/bugs/${bug._id}`);
    onCreated();
  };

  const priorityColor = { Haute: '#fbe9e4', Moyenne: '#fdf1de', Basse: '#eaf3de' }[form.priority];
  const statusColor = { 'Ouvert': '#e2f4ec', 'En cours': '#e6f1fb', 'Bloqué': '#fbe9e4', 'Résolu': '#eaf3de' }[form.status];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 14, minWidth: 0 }}>
            <div className="modal-icon" style={{ flexShrink: 0 }}><Bug size={24} /></div>
            <div style={{ minWidth: 0 }}>
              <h3>{bug ? t('editBug') : t('newBug')}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>{t('bugFormSubtitle')}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ flexShrink: 0 }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="auth-error">{error}</div>}

            <div className="field-row">
              <div>
                <label className="field-label-icon"><User size={15} /> {t('taskId')} <span className="required-star">*</span></label>
                <input className="input" name="taskId" placeholder="T-005" value={form.taskId} onChange={handleChange} required />
              </div>
              <div>
                <label className="field-label-icon"><Calendar size={15} /> {t('dueDate')}</label>
                <input className="input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
              </div>
            </div>

            <label className="field-label-icon"><Type size={15} /> {t('title')} <span className="required-star">*</span></label>
            <input className="input" name="title" placeholder={t('titlePlaceholder')} value={form.title} onChange={handleChange} required />

            <label className="field-label-icon"><FileText size={15} /> {t('description')}</label>
            <textarea className="input" name="description" placeholder={t('descriptionPlaceholder')} value={form.description} onChange={handleChange} rows={3} maxLength={1000} style={{ marginBottom: 2, resize: 'vertical' }} />
            <div className="char-count">{form.description.length}/1000</div>

            <div className="field-row">
              <div>
                <label className="field-label-icon"><Grid size={15} /> {t('category')}</label>
                <select className="input" name="category" value={form.category} onChange={handleChange}>
                  <option value="Bug">{t('catBug')}</option>
                  <option value="Amélioration">{t('catImprovement')}</option>
                  <option value="Nouvelle fonctionnalité">{t('catFeature')}</option>
                </select>
              </div>
              <div>
                <label className="field-label-icon"><Layers size={15} /> {t('platform')}</label>
                <select className="input" name="platform" value={form.platform} onChange={handleChange}>
                  <option value="Web">{t('platWeb')}</option>
                  <option value="Mobile">{t('platMobile')}</option>
                  <option value="Web & Mobile">{t('platBoth')}</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div>
                <label className="field-label-icon"><TrendingUp size={15} /> {t('priority')}</label>
                <select className="input" name="priority" value={form.priority} onChange={handleChange} style={{ background: priorityColor, borderColor: 'transparent' }}>
                  <option value="Haute">{t('prioHigh')}</option>
                  <option value="Moyenne">{t('prioMedium')}</option>
                  <option value="Basse">{t('prioLow')}</option>
                </select>
              </div>
              <div>
                <label className="field-label-icon"><Clock size={15} /> {t('status')}</label>
                <select className="input" name="status" value={form.status} onChange={handleChange} style={{ background: statusColor, borderColor: 'transparent' }}>
                  <option value="Ouvert">{t('statusOpen')}</option>
                  <option value="En cours">{t('statusProgress')}</option>
                  <option value="Bloqué">{t('statusBlocked')}</option>
                  <option value="Résolu">{t('statusResolved')}</option>
                </select>
              </div>
            </div>

            <label className="field-label-icon"><User size={15} /> {t('assignedTo')}</label>
            <input className="input" name="assignedTo" placeholder={t('assignedToPlaceholder')} value={form.assignedTo} onChange={handleChange} style={{ marginBottom: 0 }} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>{t('cancel')}</button>
            <button type="submit" className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4338ca' }} disabled={loading}>
              <Send size={15} /> {loading ? '...' : (bug ? t('saveBug') : t('createBug'))}
            </button>
          </div>
          {bug && (
            <div style={{ textAlign: 'center', paddingBottom: 14 }}>
              <button type="button" className="btn-danger-text" onClick={handleDelete}>{t('deleteBug')}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}