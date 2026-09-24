import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Admin() {
  const [pending, setPending] = useState([]);

  const fetchPending = () => {
    api.get('/auth/pending').then(res => setPending(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id) => {
    await api.put(`/auth/approve/${id}`);
    fetchPending();
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <h2>Comptes en attente</h2>
      {pending.length === 0 && <p style={{ color: '#666' }}>Aucun compte en attente.</p>}
      <div className="card">
        {pending.map(u => (
          <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{u.name}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{u.email}</div>
            </div>
            <button className="btn" onClick={() => approve(u._id)}>Approuver</button>
          </div>
        ))}
      </div>
    </div>
  );
}