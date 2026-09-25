import { useTranslation } from 'react-i18next';
import { Bug, User, Calendar, Grid, Layers, Clock, Pencil } from 'lucide-react';

export default function BugDetail({ bug, onClose, onEdit }) {
  const { t, i18n } = useTranslation();

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const priorityBadge = (p) => p === 'Haute' ? 'badge-red' : p === 'Moyenne' ? 'badge-amber' : 'badge-green';
  const statusBadge = (s) => s === 'Résolu' ? 'badge-green' : s === 'En cours' ? 'badge-blue' : s === 'Bloqué' ? 'badge-red' : 'badge-amber';

  const priorityLabel = (p) => ({ Haute: t('prioHigh'), Moyenne: t('prioMedium'), Basse: t('prioLow') }[p] || p);
  const statusLabel = (s) => ({ Ouvert: t('statusOpen'), 'En cours': t('statusProgress'), Bloqué: t('statusBlocked'), Résolu: t('statusResolved') }[s] || s);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 14, minWidth: 0 }}>
            <div className="modal-icon" style={{ flexShrink: 0 }}><Bug size={24} /></div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ color: '#4338ca' }}>{bug.taskId}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 500 }}>{bug.title}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <span className={`badge ${priorityBadge(bug.priority)}`}>{priorityLabel(bug.priority)}</span>
            <span className={`badge ${statusBadge(bug.status)}`}>{statusLabel(bug.status)}</span>
          </div>

          <label className="field-label-icon" style={{ marginBottom: 8 }}>{t('columnDescription')}</label>
          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f7f7f5', padding: 14, borderRadius: 10, marginTop: 0 }}>
           {bug.description || t('noDescription')}
          </p>

          <div className="field-row" style={{ marginTop: 18 }}>
            <div>
              <label className="field-label-icon"><Grid size={15} /> {t('category')}</label>
              <p style={{ margin: 0, fontSize: 14 }}>{bug.category}</p>
            </div>
            <div>
              <label className="field-label-icon"><Layers size={15} /> {t('platform')}</label>
              <p style={{ margin: 0, fontSize: 14 }}>{bug.platform}</p>
            </div>
          </div>

          <div className="field-row" style={{ marginTop: 18 }}>
            <div>
              <label className="field-label-icon"><User size={15} /> {t('assignedTo')}</label>
              <p style={{ margin: 0, fontSize: 14 }}>{bug.assignedTo || '—'}</p>
            </div>
            <div>
              <label className="field-label-icon"><Calendar size={15} /> {t('dueDate')}</label>
              <p style={{ margin: 0, fontSize: 14 }}>{formatDate(bug.dueDate)}</p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label className="field-label-icon"><Clock size={15} /> {t('columnCreated')}</label>
            <p style={{ margin: 0, fontSize: 14 }}>{formatDate(bug.dateAdded || bug.createdAt)}</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>{t('cancel')}</button>
          <button className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4338ca' }} onClick={onEdit}>
            <Pencil size={15} /> Modifier
          </button>
        </div>
      </div>
    </div>
  );
}