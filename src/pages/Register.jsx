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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await register(name, email, password);
      setMessage('Compte créé. En attente de validation par un administrateur.');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>{t('register')}</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder={t('name')} value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginBottom: 10, padding: 8 }} />
      <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: 10, padding: 8 }} />
      <input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: 10, padding: 8 }} />
      <button type="submit" style={{ width: '100%', padding: 8 }}>{t('submit')}</button>
      <p><Link to="/login">{t('haveAccount')}</Link></p>
    </form>
  );
}