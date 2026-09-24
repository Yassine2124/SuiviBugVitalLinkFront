import { useState } from 'react';
import api from '../api/axios';

export default function BugForm({ bug, onCreated, onClose }) {
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (bug) {
        await api.put(`/bugs/${bug._id}`, form);
      } else {
        await api.post('/bugs', form);
      }
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce bug ?')) return;
    await api.delete(`/bugs/${bug._id}`);
    onCreated();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: 400, maxHeight: '85vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>{bug ? 'Modifier le bug' : 'Nouveau bug'}</h3>
        {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
        <input className="input" name="taskId" placeholder="ID (ex: T-005)" value={form.taskId} onChange={handleChange} required />
        <input className="input" name="title" placeholder="Titre" value={form.title} onChange={handleChange} required />
        <textarea className="input" name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} />

        <select className="input" name="category" value={form.category} onChange={handleChange}>
          <option>Bug</option><option>Amélioration</option><option>Nouvelle fonctionnalité</option>
        </select>
        <select className="input" name="platform" value={form.platform} onChange={handleChange}>
          <option>Web</option><option>Mobile</option><option>Web & Mobile</option>
        </select>
        <select className="input" name="priority" value={form.priority} onChange={handleChange}>
          <option>Haute</option><option>Moyenne</option><option>Basse</option>
        </select>
        <select className="input" name="status" value={form.status} onChange={handleChange}>
          <option>Ouvert</option><option>En cours</option><option>Bloqué</option><option>Résolu</option>
        </select>

        <input className="input" name="assignedTo" placeholder="Assigné à" value={form.assignedTo} onChange={handleChange} />
        <input className="input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn" style={{ flex: 1 }}>{bug ? 'Enregistrer' : 'Créer'}</button>
          <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
        </div>
        {bug && (
          <button type="button" onClick={handleDelete} style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', color: '#a32d2d', fontSize: 13, cursor: 'pointer' }}>
            Supprimer ce bug
          </button>
        )}
      </form>
    </div>
  );
}