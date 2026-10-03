import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, User, Calendar, Grid, Layers, Clock, Pencil, Maximize2, X, Copy, Check } from 'lucide-react';

export default function BugDetail({ bug, onClose, onEdit }) {
  const { t, i18n } = useTranslation();
  const [showFullImage, setShowFullImage] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const priorityBadge = (p) => p === 'Haute' ? 'badge-red' : p === 'Moyenne' ? 'badge-amber' : 'badge-green';
  const statusBadge = (s) => s === 'Résolu' ? 'badge-green' : s === 'En cours' ? 'badge-blue' : s === 'En test' ? 'badge-gray' : s === 'Dev terminé' ? 'badge-blue' : s === 'Bloqué' ? 'badge-red' : 'badge-amber';

  const priorityLabel = (p) => ({ Haute: t('prioHigh'), Moyenne: t('prioMedium'), Basse: t('prioLow') }[p] || p);
  const statusLabel = (s) => ({ Ouvert: t('statusOpen'), 'En cours': t('statusProgress'), 'Dev terminé': t('statusDevDone'), 'En test': t('statusTest'), Bloqué: t('statusBlocked'), Résolu: t('statusResolved') }[s] || s);

  const handleCopy = () => {
    navigator.clipboard.writeText(bug.description || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
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
            {bug.imageUrl && (
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <img src={bug.imageUrl} alt="Capture du bug" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, border: '1px solid #e0e0dc', display: 'block' }} />
                <button type="button" onClick={() => setShowFullImage(true)} className="btn-outline" style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12 }}>
                  <Maximize2 size={13} /> {t('preview')}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <span className={`badge ${priorityBadge(bug.priority)}`}>{priorityLabel(bug.priority)}</span>
              <span className={`badge ${statusBadge(bug.status)}`}>{statusLabel(bug.status)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="field-label-icon" style={{ marginBottom: 0 }}>{t('columnDescription')}</label>
              <button type="button" onClick={handleCopy} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: 12 }}>
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? t('copied') : t('copy')}
              </button>
            </div>
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
                <label className="field-label-icon"><User size={15} /> {t('testers')}</label>
                <p style={{ margin: 0, fontSize: 14 }}>{bug.testers && bug.testers.length > 0 ? bug.testers.join(', ') : '—'}</p>
              </div>
            </div>

            <div className="field-row" style={{ marginTop: 18 }}>
              <div>
                <label className="field-label-icon"><Calendar size={15} /> {t('dueDate')}</label>
                <p style={{ margin: 0, fontSize: 14 }}>{formatDate(bug.dueDate)}</p>
              </div>
              <div>
                <label className="field-label-icon"><Clock size={15} /> {t('columnCreated')}</label>
                <p style={{ margin: 0, fontSize: 14 }}>
                  {formatDate(bug.dateAdded || bug.createdAt)}{bug.createdBy ? ` ${t('by')} ${bug.createdBy}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>{t('cancel')}</button>
            <button className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4338ca' }} onClick={onEdit}>
              <Pencil size={15} /> {t('actionEdit')}
            </button>
          </div>
        </div>
      </div>

      {showFullImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowFullImage(false)}>
          <button onClick={() => setShowFullImage(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} color="white" />
          </button>
          <img src={bug.imageUrl} alt="Capture en grand" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 8 }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}