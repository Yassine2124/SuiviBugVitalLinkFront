import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await register(name, email, password);
      setMessage('Compte créé. En attente de validation par un administrateur.');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-box">
        <p className="auth-title">Suivi des bugs VitalLink</p>
        <p className="auth-subtitle">{t('register')}</p>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="field-label">{t('name')}</label>
          <input className="input" placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)} required />

          <label className="field-label">{t('email')}</label>
          <input type="email" className="input" placeholder="nom@vitallink.com" value={email} onChange={e => setEmail(e.target.value)} required />

          <label className="field-label">{t('password')}</label>
          <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />

          <button type="submit" className="btn" style={{ width: '100%', marginTop: 6 }} disabled={loading}>
            {loading ? '...' : t('submit')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#777', marginTop: 22, marginBottom: 0 }}>
          {t('haveAccount')} <Link to="/login" className="auth-link">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}