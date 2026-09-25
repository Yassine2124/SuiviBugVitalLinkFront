import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-box">
        <p className="auth-title">Suivi des bugs VitalLink</p>
        <p className="auth-subtitle">{t('login')} à votre espace</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="field-label">{t('email')}</label>
          <input type="email" className="input" placeholder="nom@vitallink.com" value={email} onChange={e => setEmail(e.target.value)} required />

          <label className="field-label">{t('password')}</label>
          <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />

          <button type="submit" className="btn" style={{ width: '100%', marginTop: 6 }} disabled={loading}>
            {loading ? '...' : t('login')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#777', marginTop: 22, marginBottom: 0 }}>
          {t('noAccount')} <Link to="/register" className="auth-link">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}