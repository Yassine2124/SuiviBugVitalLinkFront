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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>{t('login')}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: 10, padding: 8 }} />
      <input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: 10, padding: 8 }} />
      <button type="submit" style={{ width: '100%', padding: 8 }}>{t('submit')}</button>
      <p><Link to="/register">{t('noAccount')}</Link></p>
    </form>
  );
}