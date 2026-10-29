import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Menu, LogIn, LogOut } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import SignaturePad from '../components/SignaturePad';

const TEXT = {
  fr: {
    title: 'Mon pointage',
    subtitle: 'Pointez votre arrivée et votre départ avec votre signature.',
    site: 'Site',
    rule: (start, tol) => `Début ${start} · tolérance ${tol} min`,
    arrival: 'Arrivée',
    departure: 'Départ',
    clockIn: "Pointage d'arrivée",
    clockOut: 'Pointage de départ',
    notYet: "Pointez d'abord votre arrivée.",
    notStaff: "Vous n'êtes pas concerné par le pointage.",
    zoneMissing: "La zone de pointage n'est pas encore configurée. Contactez un administrateur.",
    onTime: "À l'heure",
    late: (n) => `Retard +${n} min`,
    nonWorking: 'Jour non travaillé',
    missingDeparture: 'Départ manquant',
    modalIn: "Pointage d'arrivée",
    modalOut: 'Pointage de départ',
    modalHint: "Signez avec le doigt ou la souris. L'heure et votre position sont enregistrées automatiquement à la validation.",
    clear: 'Effacer la signature',
    validate: 'Valider',
    cancel: 'Annuler',
    locating: 'Localisation...',
    sending: 'Envoi...',
    signatureRequired: 'Veuillez signer avant de valider.',
    geoDenied: "Impossible d'obtenir votre position. Autorisez la localisation dans votre navigateur, puis réessayez.",
    geoUnavailable: 'Position indisponible. Activez le GPS ou le Wi-Fi, puis réessayez.',
    geoTimeout: 'La localisation prend trop de temps. Réessayez.',
    geoUnsupported: "La géolocalisation n'est pas disponible sur cet appareil.",
    savedIn: (t) => `Arrivée enregistrée à ${t}`,
    savedOut: (t) => `Départ enregistré à ${t}`,
    history: 'Historique du mois',
    date: 'Date',
    status: 'Statut',
    noHistory: "Aucun pointage ce mois-ci.",
    loading: 'Chargement...',
    error: 'Une erreur est survenue.'
  },
  en: {
    title: 'My attendance',
    subtitle: 'Clock in and out with your signature.',
    site: 'Site',
    rule: (start, tol) => `Start ${start} · tolerance ${tol} min`,
    arrival: 'Arrival',
    departure: 'Departure',
    clockIn: 'Clock in',
    clockOut: 'Clock out',
    notYet: 'Clock in first.',
    notStaff: 'Attendance does not apply to you.',
    zoneMissing: 'The clock-in area is not configured yet. Contact an administrator.',
    onTime: 'On time',
    late: (n) => `Late +${n} min`,
    nonWorking: 'Non-working day',
    missingDeparture: 'Missing departure',
    modalIn: 'Clock in',
    modalOut: 'Clock out',
    modalHint: 'Sign with your finger or mouse. The time and your position are recorded automatically when you confirm.',
    clear: 'Clear signature',
    validate: 'Confirm',
    cancel: 'Cancel',
    locating: 'Locating...',
    sending: 'Sending...',
    signatureRequired: 'Please sign before confirming.',
    geoDenied: 'Unable to get your position. Allow location access in your browser, then try again.',
    geoUnavailable: 'Position unavailable. Turn on GPS or Wi-Fi, then try again.',
    geoTimeout: 'Locating is taking too long. Try again.',
    geoUnsupported: 'Geolocation is not available on this device.',
    savedIn: (t) => `Arrival recorded at ${t}`,
    savedOut: (t) => `Departure recorded at ${t}`,
    history: 'This month',
    date: 'Date',
    status: 'Status',
    noHistory: 'No attendance this month.',
    loading: 'Loading...',
    error: 'Something went wrong.'
  }
};

export default function Attendance() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fr';
  const tx = TEXT[lang];
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('idle');
  const [modalError, setModalError] = useState('');
  const padRef = useRef(null);

  const loadData = async () => {
    try {
      const todayRes = await api.get('/attendance/today');
      setInfo(todayRes.data);
      const month = todayRes.data.date.slice(0, 7);
      const mineRes = await api.get(`/attendance/mine?month=${month}`);
      setHistory(mineRes.data);
    } catch (err) {
      setPageError(err.response?.data?.error || tx.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const formatTime = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Conakry' });
  const formatDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short' });
  const formatLongDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const statusOf = (r) => {
    if (!r.isWorkingDay) return { label: tx.nonWorking, bg: '#ececea', color: '#555' };
    if (r.isLate) return { label: tx.late(r.lateMinutes), bg: '#fce9c9', color: '#854f0b' };
    return { label: tx.onTime, bg: '#e2eecb', color: '#3b6d11' };
  };

  const openModal = (kind) => {
    setModal(kind);
    setHasSigned(false);
    setModalError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModal(null);
    setHasSigned(false);
    setModalError('');
  };

  const getPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ custom: tx.geoUnsupported });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        const messages = { 1: tx.geoDenied, 2: tx.geoUnavailable, 3: tx.geoTimeout };
        reject({ custom: messages[err.code] || tx.geoUnavailable });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });

  const submitPunch = async () => {
    setModalError('');
    if (!hasSigned) {
      setModalError(tx.signatureRequired);
      return;
    }
    setSubmitting(true);
    try {
      setStep('locating');
      const pos = await getPosition();
      setStep('sending');
      const endpoint = modal === 'in' ? '/attendance/clock-in' : '/attendance/clock-out';
      const res = await api.post(endpoint, {
        signature: padRef.current.toDataURL(),
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      });
      const record = res.data;
      const time = modal === 'in' ? record.arrival.time : record.departure.time;
      setSuccess(modal === 'in' ? tx.savedIn(formatTime(time)) : tx.savedOut(formatTime(time)));
      setTimeout(() => setSuccess(''), 8000);
      closeModal();
      await loadData();
    } catch (err) {
      setModalError(err.custom || err.response?.data?.error || tx.error);
    } finally {
      setSubmitting(false);
      setStep('idle');
    }
  };

  const badge = (label, bg, color) => (
    <span className="badge" style={{ background: bg, color }}>{label}</span>
  );

  const record = info?.record;
  const arrival = record?.arrival;
  const departure = record?.departure;
  const hasDeparture = !!(departure && departure.time);
  const canPunch = info?.isStaff && info?.zoneConfigured;

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <div className="page-content" style={{ maxWidth: 900 }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ marginBottom: 12 }}>
            <Menu size={22} />
          </button>

          <div className="page-title-row" style={{ marginBottom: 22 }}>
            <div className="page-icon"><Clock size={22} /></div>
            <div>
              <h2 className="page-title">{tx.title}</h2>
              <p className="page-subtitle">{tx.subtitle}</p>
            </div>
          </div>

          {loading && <div className="table-loading"><span className="spinner spinner-dark" />{tx.loading}</div>}
          {!loading && pageError && <div className="auth-error">{pageError}</div>}
          {success && <div className="auth-success">{success}</div>}

          {!loading && info && !info.isStaff && (
            <div className="card" style={{ color: '#777', fontSize: 14 }}>{tx.notStaff}</div>
          )}

          {!loading && info && info.isStaff && (
            <>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, textTransform: 'capitalize' }}>{formatLongDay(info.date)}</div>
                <div style={{ fontSize: 13, color: '#777', margin: '4px 0 16px' }}>
                  {tx.site} : {info.siteName} · {tx.rule(info.workStart, info.toleranceMinutes)}
                </div>

                {!info.zoneConfigured && (
                  <div style={{ marginBottom: 14, background: '#fce9c9', color: '#854f0b', fontSize: 13, padding: '10px 14px', borderRadius: 8 }}>
                    {tx.zoneMissing}
                  </div>
                )}

                <div className="field-row">
                  <div style={{ background: '#f7f7f5', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 13, color: '#777', marginBottom: 8 }}>{tx.arrival}</div>
                    {arrival ? (
                      <>
                        <div style={{ fontSize: 30, fontWeight: 600, marginBottom: 8 }}>{formatTime(arrival.time)}</div>
                        {badge(statusOf(record).label, statusOf(record).bg, statusOf(record).color)}
                        {arrival.signatureUrl && (
                          <div style={{ marginTop: 12 }}>
                            <img src={arrival.signatureUrl} alt="" style={{ height: 52, background: 'white', borderRadius: 6, border: '1px solid #ececea', padding: 4 }} />
                          </div>
                        )}
                      </>
                    ) : (
                      <button className="btn" disabled={!canPunch} onClick={() => openModal('in')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4338ca' }}>
                        <LogIn size={16} /> {tx.clockIn}
                      </button>
                    )}
                  </div>

                  <div style={{ background: '#f7f7f5', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 13, color: '#777', marginBottom: 8 }}>{tx.departure}</div>
                    {hasDeparture ? (
                      <>
                        <div style={{ fontSize: 30, fontWeight: 600, marginBottom: 8 }}>{formatTime(departure.time)}</div>
                        {departure.signatureUrl && (
                          <img src={departure.signatureUrl} alt="" style={{ height: 52, background: 'white', borderRadius: 6, border: '1px solid #ececea', padding: 4 }} />
                        )}
                      </>
                    ) : record ? (
                      <button className="btn" disabled={!canPunch} onClick={() => openModal('out')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4338ca' }}>
                        <LogOut size={16} /> {tx.clockOut}
                      </button>
                    ) : (
                      <div style={{ fontSize: 13, color: '#999', padding: '10px 0' }}>{tx.notYet}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <div style={{ padding: '16px 20px 6px', fontSize: 15, fontWeight: 600 }}>{tx.history}</div>
                <table className="data-table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th>{tx.date}</th>
                      <th>{tx.arrival}</th>
                      <th>{tx.departure}</th>
                      <th>{tx.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(r => {
                      const st = statusOf(r);
                      const hasOut = !!(r.departure && r.departure.time);
                      const missing = !hasOut && r.date < info.date;
                      return (
                        <tr key={r._id}>
                          <td style={{ textTransform: 'capitalize' }}>{formatDay(r.date)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {formatTime(r.arrival.time)}
                              {r.arrival.signatureUrl && <img src={r.arrival.signatureUrl} alt="" style={{ height: 26, background: 'white', borderRadius: 4, border: '1px solid #ececea' }} />}
                            </div>
                          </td>
                          <td>
                            {hasOut ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {formatTime(r.departure.time)}
                                {r.departure.signatureUrl && <img src={r.departure.signatureUrl} alt="" style={{ height: 26, background: 'white', borderRadius: 4, border: '1px solid #ececea' }} />}
                              </div>
                            ) : missing ? badge(tx.missingDeparture, '#fbe4e4', '#a32d2d') : '—'}
                          </td>
                          <td>{badge(st.label, st.bg, st.color)}</td>
                        </tr>
                      );
                    })}
                    {history.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: 30 }}>{tx.noHistory}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => { if (!submitting) closeModal(); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 14 }}>
                <div className="modal-icon">{modal === 'in' ? <LogIn size={22} /> : <LogOut size={22} />}</div>
                <div>
                  <h3>{modal === 'in' ? tx.modalIn : tx.modalOut}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>{tx.modalHint}</p>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal} disabled={submitting}>&times;</button>
            </div>

            <div className="modal-body">
              {modalError && <div className="auth-error">{modalError}</div>}
              <SignaturePad ref={padRef} onChange={setHasSigned} />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <button type="button" className="btn-danger-text" onClick={() => padRef.current.clear()} disabled={submitting}>{tx.clear}</button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" style={{ flex: 1 }} onClick={closeModal} disabled={submitting}>{tx.cancel}</button>
              <button className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4338ca' }} onClick={submitPunch} disabled={submitting}>
                {submitting && <span className="spinner" />}
                {submitting ? (step === 'locating' ? tx.locating : tx.sending) : tx.validate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}