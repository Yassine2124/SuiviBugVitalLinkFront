import { useEffect, useState } from 'react';
import { Lock, Globe, Users, Check } from 'lucide-react';
import api from '../api/axios';

export default function VisibilityPicker({ visibility, allowedUsers, onChange }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    api.get('/auth/team').then(res => setMembers(res.data)).catch(() => {});
  }, []);

  const setVisibility = (v) => onChange({ visibility: v, allowedUsers: v === 'Restreint' ? allowedUsers : [] });

  const toggleUser = (userId) => {
    const exists = allowedUsers.find(u => u.userId === userId);
    if (exists) {
      onChange({ visibility, allowedUsers: allowedUsers.filter(u => u.userId !== userId) });
    } else {
      onChange({ visibility, allowedUsers: [...allowedUsers, { userId, role: 'Lecteur' }] });
    }
  };

  const setRole = (userId, role) => {
    onChange({ visibility, allowedUsers: allowedUsers.map(u => u.userId === userId ? { ...u, role } : u) });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setVisibility('Privé')} className={visibility === 'Privé' ? 'btn' : 'btn-outline'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, padding: '8px' }}>
          <Lock size={14} /> Privé
        </button>
        <button type="button" onClick={() => setVisibility('Public')} className={visibility === 'Public' ? 'btn' : 'btn-outline'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, padding: '8px' }}>
          <Globe size={14} /> Public
        </button>
        <button type="button" onClick={() => setVisibility('Restreint')} className={visibility === 'Restreint' ? 'btn' : 'btn-outline'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, padding: '8px' }}>
          <Users size={14} /> Restreint
        </button>
      </div>

      {visibility === 'Restreint' && (
        <div style={{ border: '1px solid #e0e0dc', borderRadius: 10, padding: 10, maxHeight: 200, overflowY: 'auto' }}>
          {members.map(m => {
            const entry = allowedUsers.find(u => u.userId === m._id);
            return (
              <div key={m._id} className="user-pick-row">
                <div onClick={() => toggleUser(m._id)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${entry ? '#4338ca' : '#ccc'}`, background: entry ? '#4338ca' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {entry && <Check size={10} color="white" />}
                  </div>
                  {m.name}
                </div>
                {entry && (
                  <select value={entry.role} onChange={e => setRole(m._id, e.target.value)} style={{ fontSize: 12, padding: '3px 6px', borderRadius: 6, border: '1px solid #e0e0dc' }}>
                    <option value="Lecteur">Lecteur</option>
                    <option value="Contributeur">Contributeur</option>
                  </select>
                )}
              </div>
            );
          })}
          {members.length === 0 && <p style={{ fontSize: 12, color: '#999', margin: 0 }}>Aucun membre.</p>}
        </div>
      )}
    </div>
  );
}