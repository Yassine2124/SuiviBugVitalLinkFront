import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Menu, Crosshair, ExternalLink, Plus, Trash2, Save } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

const TEXT = {
  fr: {
    title: 'Réglages du pointage',
    subtitle: "Zone autorisée, horaires, jours fériés et personnel concerné.",
    zone: 'Zone de pointage',
    zoneHint: "Placez-vous sur le site (de préférence avec un téléphone, le GPS y est plus précis), puis cliquez pour remplir les coordonnées.",
    siteName: 'Nom du site',
    siteNamePlaceholder: 'Ex. Siège de Conakry',
    latitude: 'Latitude',
    longitude: 'Longitude',
    radius: 'Rayon autorisé (mètres)',
    fillPosition: 'Utiliser ma position actuelle',
    locating: 'Localisation en cours...',
    accuracy: (n) => `Précision de la position : environ ${n} m`,
    viewOnMap: 'Voir sur la carte',
    noZoneWarning: "Aucune zone définie : le pointage ne pourra pas fonctionner tant que la zone n'est pas enregistrée.",
    geoDenied: "Impossible d'obtenir votre position. Autorisez la localisation dans votre navigateur.",
    geoUnsupported: "La géolocalisation n'est pas disponible sur cet appareil.",
    schedule: 'Horaires',
    workStart: 'Heure de début',
    tolerance: 'Tolérance (minutes)',
    arrivalLimit: "Arrivée acceptée jusqu'à",
    workDays: 'Jours travaillés',
    days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    holidays: 'Jours fériés',
    holidaysHint: "Ces jours ne comptent ni comme retard ni comme absence.",
    holidayLabel: "Nom (ex. Fête de l'indépendance)",
    add: 'Ajouter',
    noHolidays: 'Aucun jour férié enregistré.',
    thresholds: "Seuils d'appréciation",
    thresholdsHint: "Sous le dernier seuil, l'appréciation est « Insuffisant ».",
    veryGood: 'Très bon à partir de (%)',
    satisfactory: 'Satisfaisant à partir de (%)',
    watch: 'À surveiller à partir de (%)',
    save: 'Enregistrer les réglages',
    saved: 'Réglages enregistrés.',
    staff: 'Personnel concerné',
    staffHint: "Seules les personnes cochées pointent. Les autres (la direction, par exemple) n'ont pas de pointage.",
    adminBadge: 'Admin',
    noMembers: 'Aucun membre validé.',
    loading: 'Chargement...',
    error: 'Une erreur est survenue.'
  },
  en: {
    title: 'Attendance settings',
    subtitle: 'Allowed area, working hours, public holidays and staff concerned.',
    zone: 'Clock-in area',
    zoneHint: 'Stand on site (preferably with a phone, its GPS is more accurate), then click to fill in the coordinates.',
    siteName: 'Site name',
    siteNamePlaceholder: 'E.g. Conakry head office',
    latitude: 'Latitude',
    longitude: 'Longitude',
    radius: 'Allowed radius (meters)',
    fillPosition: 'Use my current position',
    locating: 'Locating...',
    accuracy: (n) => `Position accuracy: about ${n} m`,
    viewOnMap: 'View on map',
    noZoneWarning: 'No area defined: clocking in will not work until the area is saved.',
    geoDenied: 'Unable to get your position. Allow location access in your browser.',
    geoUnsupported: 'Geolocation is not available on this device.',
    schedule: 'Working hours',
    workStart: 'Start time',
    tolerance: 'Tolerance (minutes)',
    arrivalLimit: 'Arrival accepted until',
    workDays: 'Working days',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    holidays: 'Public holidays',
    holidaysHint: 'These days count neither as late nor as absent.',
    holidayLabel: 'Name (e.g. Independence Day)',
    add: 'Add',
    noHolidays: 'No public holiday saved.',
    thresholds: 'Rating thresholds',
    thresholdsHint: `Below the last threshold, the rating is "Insufficient".`,
    veryGood: 'Very good from (%)',
    satisfactory: 'Satisfactory from (%)',
    watch: 'To watch from (%)',
    save: 'Save settings',
    saved: 'Settings saved.',
    staff: 'Staff concerned',
    staffHint: 'Only checked people clock in. Others (management, for example) have no attendance.',
    adminBadge: 'Admin',
    noMembers: 'No approved member.',
    loading: 'Loading...',
    error: 'Something went wrong.'
  }
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const chipStyle = (active) => ({
  padding: '8px 14px',
  borderRadius: 999,
  fontSize: 13,
  cursor: 'pointer',
  border: `1px solid ${active ? '#4338ca' : '#e0e0dc'}`,
  background: active ? '#4338ca' : 'white',
  color: active ? 'white' : '#1a1a1a'
});

const computeLimit = (start, tolerance) => {
  const [h, m] = (start || '09:00').split(':').map(Number);
  const total = h * 60 + m + Number(tolerance || 0);
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function AttendanceSettings() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fr';
  const tx = TEXT[lang];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    siteName: '', latitude: '', longitude: '', radius: 100,
    workStart: '09:00', toleranceMinutes: 10, workDays: [1, 2, 3, 4, 5],
    holidays: [], thresholds: { veryGood: 95, satisfactory: 85, watch: 70 }
  });
  const [newHoliday, setNewHoliday] = useState({ date: '', label: '' });
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/settings')
      .then(res => {
        const s = res.data;
        setForm({
          siteName: s.siteName || '',
          latitude: s.latitude ?? '',
          longitude: s.longitude ?? '',
          radius: s.radius,
          workStart: s.workStart,
          toleranceMinutes: s.toleranceMinutes,
          workDays: s.workDays,
          holidays: (s.holidays || []).map(h => ({ date: h.date, label: h.label })),
          thresholds: {
            veryGood: s.thresholds.veryGood,
            satisfactory: s.thresholds.satisfactory,
            watch: s.thresholds.watch
          }
        });
      })
      .catch(() => setError(tx.error))
      .finally(() => setLoading(false));

    api.get('/auth/staff')
      .then(res => setStaff(res.data))
      .catch(() => {})
      .finally(() => setStaffLoading(false));
  }, []);

  const setField = (name, value) => setForm(f => ({ ...f, [name]: value }));
  const setThreshold = (name, value) => setForm(f => ({ ...f, thresholds: { ...f.thresholds, [name]: value } }));

  const toggleDay = (day) => {
    setForm(f => {
      const active = f.workDays.includes(day);
      if (active && f.workDays.length === 1) return f;
      return { ...f, workDays: active ? f.workDays.filter(d => d !== day) : [...f.workDays, day] };
    });
  };

  const addHoliday = () => {
    if (!newHoliday.date) return;
    if (form.holidays.some(h => h.date === newHoliday.date)) return;
    const updated = [...form.holidays, { date: newHoliday.date, label: newHoliday.label.trim() }]
      .sort((a, b) => a.date.localeCompare(b.date));
    setField('holidays', updated);
    setNewHoliday({ date: '', label: '' });
  };

  const removeHoliday = (date) => setField('holidays', form.holidays.filter(h => h.date !== date));

  const fillWithMyPosition = () => {
    setError('');
    if (!navigator.geolocation) { setError(tx.geoUnsupported); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        setAccuracy(Math.round(pos.coords.accuracy));
        setLocating(false);
      },
      () => { setError(tx.geoDenied); setLocating(false); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSave = async () => {
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = {
        siteName: form.siteName,
        radius: Number(form.radius),
        workStart: form.workStart,
        toleranceMinutes: Number(form.toleranceMinutes),
        workDays: form.workDays,
        holidays: form.holidays,
        thresholds: {
          veryGood: Number(form.thresholds.veryGood),
          satisfactory: Number(form.thresholds.satisfactory),
          watch: Number(form.thresholds.watch)
        }
      };
      if (form.latitude !== '' && form.longitude !== '') {
        payload.latitude = Number(form.latitude);
        payload.longitude = Number(form.longitude);
      }
      await api.put('/attendance/settings', payload);
      setMessage(tx.saved);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || tx.error);
    } finally {
      setSaving(false);
    }
  };

  const toggleStaff = async (member) => {
    try {
      const res = await api.put(`/auth/staff/${member._id}`, { isStaff: !member.isStaff });
      setStaff(prev => prev.map(m => (m._id === member._id ? res.data : m)));
    } catch (err) {
      setError(err.response?.data?.error || tx.error);
    }
  };

  const formatDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });

  const hasZone = form.latitude !== '' && form.longitude !== '';

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <div className="page-content" style={{ maxWidth: 900 }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ marginBottom: 12 }}>
            <Menu size={22} />
          </button>

          <div className="page-title-row" style={{ marginBottom: 22 }}>
            <div className="page-icon"><MapPin size={22} /></div>
            <div>
              <h2 className="page-title">{tx.title}</h2>
              <p className="page-subtitle">{tx.subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="table-loading"><span className="spinner spinner-dark" />{tx.loading}</div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>{tx.zone}</h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#777' }}>{tx.zoneHint}</p>

                <div className="field-row">
                  <div>
                    <label className="field-label-icon">{tx.siteName}</label>
                    <input className="input" value={form.siteName} placeholder={tx.siteNamePlaceholder} onChange={e => setField('siteName', e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label-icon">{tx.radius}</label>
                    <input className="input" type="number" min="10" max="5000" value={form.radius} onChange={e => setField('radius', e.target.value)} />
                  </div>
                </div>

                <div className="field-row">
                  <div>
                    <label className="field-label-icon">{tx.latitude}</label>
                    <input className="input" type="number" step="any" value={form.latitude} onChange={e => setField('latitude', e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label-icon">{tx.longitude}</label>
                    <input className="input" type="number" step="any" value={form.longitude} onChange={e => setField('longitude', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-outline" onClick={fillWithMyPosition} disabled={locating} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {locating ? <span className="spinner spinner-dark" /> : <Crosshair size={15} />} {locating ? tx.locating : tx.fillPosition}
                  </button>
                  {hasZone && (
                    <a href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4338ca', textDecoration: 'none' }}>
                      <ExternalLink size={14} /> {tx.viewOnMap}
                    </a>
                  )}
                  {accuracy !== null && <span style={{ fontSize: 12, color: '#777' }}>{tx.accuracy(accuracy)}</span>}
                </div>

                {!hasZone && (
                  <div style={{ marginTop: 14, background: '#fce9c9', color: '#854f0b', fontSize: 13, padding: '10px 14px', borderRadius: 8 }}>
                    {tx.noZoneWarning}
                  </div>
                )}
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>{tx.schedule}</h3>
                <div className="field-row">
                  <div>
                    <label className="field-label-icon">{tx.workStart}</label>
                    <input className="input" type="time" value={form.workStart} onChange={e => setField('workStart', e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label-icon">{tx.tolerance}</label>
                    <input className="input" type="number" min="0" max="120" value={form.toleranceMinutes} onChange={e => setField('toleranceMinutes', e.target.value)} />
                  </div>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#555' }}>
                  {tx.arrivalLimit} <span style={{ fontWeight: 600 }}>{computeLimit(form.workStart, form.toleranceMinutes)}</span>
                </p>

                <label className="field-label-icon">{tx.workDays}</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DAY_ORDER.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)} style={chipStyle(form.workDays.includes(d))}>
                      {tx.days[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>{tx.holidays}</h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#777' }}>{tx.holidaysHint}</p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                  <input className="input" type="date" value={newHoliday.date} onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })} style={{ width: 170, marginBottom: 0 }} />
                  <input className="input" placeholder={tx.holidayLabel} value={newHoliday.label} onChange={e => setNewHoliday({ ...newHoliday, label: e.target.value })} style={{ flex: 1, minWidth: 180, marginBottom: 0 }} />
                  <button type="button" className="btn-outline" onClick={addHoliday} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> {tx.add}
                  </button>
                </div>

                {form.holidays.length === 0 && <p style={{ margin: 0, fontSize: 13, color: '#999' }}>{tx.noHolidays}</p>}
                {form.holidays.map(h => (
                  <div key={h.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{formatDate(h.date)}</div>
                      {h.label && <div style={{ fontSize: 12, color: '#777' }}>{h.label}</div>}
                    </div>
                    <button type="button" onClick={() => removeHoliday(h.date)} style={{ background: 'none', border: 'none', color: '#a32d2d', cursor: 'pointer', padding: 6 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>{tx.thresholds}</h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#777' }}>{tx.thresholdsHint}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
                  <div>
                    <label className="field-label-icon">{tx.veryGood}</label>
                    <input className="input" type="number" min="0" max="100" value={form.thresholds.veryGood} onChange={e => setThreshold('veryGood', e.target.value)} style={{ marginBottom: 0 }} />
                  </div>
                  <div>
                    <label className="field-label-icon">{tx.satisfactory}</label>
                    <input className="input" type="number" min="0" max="100" value={form.thresholds.satisfactory} onChange={e => setThreshold('satisfactory', e.target.value)} style={{ marginBottom: 0 }} />
                  </div>
                  <div>
                    <label className="field-label-icon">{tx.watch}</label>
                    <input className="input" type="number" min="0" max="100" value={form.thresholds.watch} onChange={e => setThreshold('watch', e.target.value)} style={{ marginBottom: 0 }} />
                  </div>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {message && <div className="auth-success">{message}</div>}

              <button className="btn" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, background: '#4338ca' }}>
                {saving ? <span className="spinner" /> : <Save size={15} />} {saving ? '' : tx.save}
              </button>

              <div className="card">
                <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>{tx.staff}</h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#777' }}>{tx.staffHint}</p>

                {staffLoading && <div className="table-loading" style={{ padding: 24 }}><span className="spinner spinner-dark" />{tx.loading}</div>}
                {!staffLoading && staff.length === 0 && <p style={{ margin: 0, fontSize: 13, color: '#999' }}>{tx.noMembers}</p>}
                {!staffLoading && staff.map(m => (
                  <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {m.name}
                        {m.role === 'admin' && <span className="badge badge-blue" style={{ marginLeft: 8 }}>{tx.adminBadge}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#777' }}>{m.email}</div>
                    </div>
                    <input type="checkbox" checked={!!m.isStaff} onChange={() => toggleStaff(m)} style={{ width: 17, height: 17, cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}