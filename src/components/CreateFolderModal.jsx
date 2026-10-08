import { useState } from 'react';
import { Folder as FolderIcon } from 'lucide-react';
import api from '../api/axios';
import VisibilityPicker from './VisibilityPicker';

export default function CreateFolderModal({ parentId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('Privé');
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [publicCanContribute, setPublicCanContribute] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/folders', { name, parent: parentId || null, visibility, allowedUsers, publicCanContribute });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 14 }}>
            <div className="modal-icon" style={{ background: '#b45309' }}><FolderIcon size={22} /></div>
            <h3>Nouveau dossier</h3>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="auth-error">{error}</div>}
            <label className="field-label-icon">Nom du dossier</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Contrats" required />
            <label className="field-label-icon">Visibilité</label>
            <VisibilityPicker
              visibility={visibility} allowedUsers={allowedUsers} publicCanContribute={publicCanContribute}
              onChange={(v) => { setVisibility(v.visibility); setAllowedUsers(v.allowedUsers); setPublicCanContribute(v.publicCanContribute); }}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
            <button type="submit" className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading && <span className="spinner" />} {loading ? '' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}