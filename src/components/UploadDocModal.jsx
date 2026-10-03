import { useState } from 'react';
import { FileUp } from 'lucide-react';
import api, { uploadDocFile } from '../api/axios';
import VisibilityPicker from './VisibilityPicker';

export default function UploadDocModal({ folderId, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('Privé');
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [publicCanContribute, setPublicCanContribute] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f && !name) setName(f.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Choisis un fichier'); return; }
    setError('');
    setLoading(true);
    try {
      const uploaded = await uploadDocFile(file);
      await api.post('/documents', {
        name, folder: folderId || null, fileUrl: uploaded.url,
        fileType: uploaded.fileType, fileSize: uploaded.fileSize,
        visibility, allowedUsers, publicCanContribute
      });
      onUploaded();
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
            <div className="modal-icon" style={{ background: '#2563eb' }}><FileUp size={22} /></div>
            <h3>Ajouter un document</h3>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="auth-error">{error}</div>}
            <label className="field-label-icon">Fichier</label>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleFile} className="input" style={{ padding: 8 }} />
            <label className="field-label-icon">Nom affiché</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
            <label className="field-label-icon">Visibilité</label>
            <VisibilityPicker
              visibility={visibility} allowedUsers={allowedUsers} publicCanContribute={publicCanContribute}
              onChange={(v) => { setVisibility(v.visibility); setAllowedUsers(v.allowedUsers); setPublicCanContribute(v.publicCanContribute); }}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
            <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>{loading ? 'Upload...' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}