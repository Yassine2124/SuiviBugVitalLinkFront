import { useState } from 'react';
import { Info, Lock, Globe, Users, Save, Link as LinkIcon, Check } from 'lucide-react';
import api from '../api/axios';
import VisibilityPicker from './VisibilityPicker';

const visIcon = { Privé: Lock, Public: Globe, Restreint: Users };

export default function ItemDetailsModal({ item, type, onClose, onUpdated, currentUser }) {
  const [visibility, setVisibility] = useState(item.visibility);
  const [publicCanContribute, setPublicCanContribute] = useState(item.publicCanContribute || false);
  const [allowedUsers, setAllowedUsers] = useState(
    (item.allowedUsers || []).map(u => ({ userId: u.userId?._id || u.userId, role: u.role }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const canEdit = item.createdByName === currentUser?.name || currentUser?.role === 'admin';
  const endpoint = type === 'folder' ? 'folders' : 'documents';
  const VisIcon = visIcon[item.visibility];

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/${endpoint}/${item._id}`, { visibility, allowedUsers, publicCanContribute });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const shareLink = `${window.location.origin}/${type === 'folder' ? 'documents?folder=' : 'documents?doc='}${item._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 14 }}>
            <div className="modal-icon" style={{ background: '#555' }}><Info size={22} /></div>
            <div>
              <h3>{item.name}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>Détails & permissions</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <div className="auth-error">{error}</div>}

          <div style={{ background: '#f7f7f5', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 13.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#777' }}>Propriétaire</span>
              <span style={{ fontWeight: 500 }}>{item.createdByName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#777' }}>Créé le</span>
              <span style={{ fontWeight: 500 }}>{formatDate(item.createdAt)}</span>
            </div>
          </div>

          <button type="button" onClick={handleCopyLink} className="btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18, fontSize: 13 }}>
            {linkCopied ? <Check size={14} /> : <LinkIcon size={14} />} {linkCopied ? 'Lien copié !' : 'Copier le lien de partage'}
          </button>

          {canEdit ? (
            <>
              <label className="field-label-icon">Visibilité</label>
              <VisibilityPicker
                visibility={visibility} allowedUsers={allowedUsers} publicCanContribute={publicCanContribute}
                onChange={(v) => { setVisibility(v.visibility); setAllowedUsers(v.allowedUsers); setPublicCanContribute(v.publicCanContribute); }}
              />
            </>
          ) : (
            <div>
              <label className="field-label-icon">Visibilité actuelle</label>
              <span className={`visibility-badge ${item.visibility.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <VisIcon size={12} /> {item.visibility}
              </span>
              <p style={{ fontSize: 12, color: '#999', marginTop: 10 }}>Seul le propriétaire ou un admin peut modifier la visibilité.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Fermer</button>
          {canEdit && (
            <button className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={handleSave} disabled={loading}>
              {loading ? <span className="spinner" /> : <Save size={15} />} {loading ? '' : 'Enregistrer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}