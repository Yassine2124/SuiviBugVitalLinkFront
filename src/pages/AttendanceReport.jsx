import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Menu, Pencil } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

const TEXT = {
  fr: {
    title: 'Rapport de ponctualité',
    rule: (start, tol, limit) => `Début ${start} · tolérance ${tol} min · arrivée acceptée jusqu'à ${limit}`,
    monthMode: 'Un mois',
    customMode: 'Période personnalisée',
    from: 'Du',
    to: 'Au',
    present: 'Présences',
    expectedOf: (n) => `sur ${n} jours attendus`,
    late: 'Retards',
    minCumulated: (n) => `${n} min cumulées`,
    absences: 'Absences',
    absSplit: (j, u) => `${j} justifiées · ${u} non justifiées`,
    punctuality: 'Ponctualité',
    onTimeOf: (a, b) => `${a} arrivées à l'heure sur ${b}`,
    byPerson: 'Détail par personne',
    clickHint: 'Cliquez sur une ligne pour voir le détail',
    member: 'Membre',
    presents: 'Présents',
    onTimeCol: "À l'heure",
    latesCol: 'Retards',
    missionsCol: 'Missions',
    absJ: 'Abs. justifiées',
    absU: 'Abs. non justifiées',
    rate: 'Taux',
    rating: 'Appréciation',
    ratings: { veryGood: 'Très bon', satisfactory: 'Satisfaisant', watch: 'À surveiller', insufficient: 'Insuffisant' },
    legend: (t) => `Appréciation : très bon à partir de ${t.veryGood} % · satisfaisant à partir de ${t.satisfactory} % · à surveiller à partir de ${t.watch} % · insuffisant en dessous`,
    dayByDay: (name) => `Jour par jour · ${name}`,
    date: 'Date',
    arrival: 'Arrivée',
    departure: 'Départ',
    status: 'Statut',
    reason: 'Motif',
    actions: 'Action',
    statuses: {
      onTime: "À l'heure",
      late: (n) => `Retard +${n} min`,
      absent: 'Absent non justifié',
      justified: 'Absent justifié',
      mission: 'Mission hors site',
      nonWorking: 'Jour non travaillé'
    },
    missingDeparture: 'Départ manquant',
    justify: 'Justifier',
    edit: 'Modifier',
    modalTitle: 'Justifier ce jour',
    typeJustified: 'Absence justifiée',
    typeMission: 'Mission hors site',
    reasonLabel: 'Motif (facultatif)',
    reasonPlaceholder: 'Ex. Congé autorisé',
    save: 'Enregistrer',
    remove: 'Retirer',
    cancel: 'Annuler',
    noStaff: "Aucun membre du personnel pour l'instant. Cochez des membres dans les réglages du pointage.",
    noDays: 'Aucun jour à afficher pour cette personne sur cette période.',
    invalidRange: 'La date de début doit précéder la date de fin.',
    loading: 'Chargement...',
    error: 'Une erreur est survenue.'
  },
  en: {
    title: 'Punctuality report',
    rule: (start, tol, limit) => `Start ${start} · tolerance ${tol} min · arrival accepted until ${limit}`,
    monthMode: 'One month',
    customMode: 'Custom period',
    from: 'From',
    to: 'To',
    present: 'Attendance',
    expectedOf: (n) => `out of ${n} expected days`,
    late: 'Late arrivals',
    minCumulated: (n) => `${n} min in total`,
    absences: 'Absences',
    absSplit: (j, u) => `${j} justified · ${u} unjustified`,
    punctuality: 'Punctuality',
    onTimeOf: (a, b) => `${a} on-time arrivals out of ${b}`,
    byPerson: 'Details by person',
    clickHint: 'Click a row to see the details',
    member: 'Member',
    presents: 'Present',
    onTimeCol: 'On time',
    latesCol: 'Late',
    missionsCol: 'Missions',
    absJ: 'Justified abs.',
    absU: 'Unjustified abs.',
    rate: 'Rate',
    rating: 'Rating',
    ratings: { veryGood: 'Very good', satisfactory: 'Satisfactory', watch: 'To watch', insufficient: 'Insufficient' },
    legend: (t) => `Rating: very good from ${t.veryGood}% · satisfactory from ${t.satisfactory}% · to watch from ${t.watch}% · insufficient below`,
    dayByDay: (name) => `Day by day · ${name}`,
    date: 'Date',
    arrival: 'Arrival',
    departure: 'Departure',
    status: 'Status',
    reason: 'Reason',
    actions: 'Action',
    statuses: {
      onTime: 'On time',
      late: (n) => `Late +${n} min`,
      absent: 'Unjustified absence',
      justified: 'Justified absence',
      mission: 'Off-site mission',
      nonWorking: 'Non-working day'
    },
    missingDeparture: 'Missing departure',
    justify: 'Justify',
    edit: 'Edit',
    modalTitle: 'Justify this day',
    typeJustified: 'Justified absence',
    typeMission: 'Off-site mission',
    reasonLabel: 'Reason (optional)',
    reasonPlaceholder: 'E.g. Approved leave',
    save: 'Save',
    remove: 'Remove',
    cancel: 'Cancel',
    noStaff: 'No staff member yet. Tick members in the attendance settings.',
    noDays: 'No day to display for this person in this period.',
    invalidRange: 'The start date must be before the end date.',
    loading: 'Loading...',
    error: 'Something went wrong.'
  }
};

const RATING_STYLE = {
  veryGood: { bg: '#e2eecb', color: '#3b6d11', bar: '#6aa329' },
  satisfactory: { bg: '#d6e8fa', color: '#185fa5', bar: '#4338ca' },
  watch: { bg: '#fce9c9', color: '#854f0b', bar: '#d9972b' },
  insufficient: { bg: '#fbe4e4', color: '#a32d2d', bar: '#c0392b' }
};

const STATUS_STYLE = {
  onTime: { bg: '#e2eecb', color: '#3b6d11' },
  late: { bg: '#fce9c9', color: '#854f0b' },
  absent: { bg: '#fbe4e4', color: '#a32d2d' },
  justified: { bg: '#ececea', color: '#555' },
  mission: { bg: '#d6e8fa', color: '#185fa5' },
  nonWorking: { bg: '#ececea', color: '#555' }
};

const computeLimit = (start, tolerance) => {
  const [h, m] = (start || '09:00').split(':').map(Number);
  const total = h * 60 + m + Number(tolerance || 0);
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceReport() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fr';
  const tx = TEXT[lang];
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState('month');
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const [from, setFrom] = useState(`${todayStr().slice(0, 7)}-01`);
  const [to, setTo] = useState(todayStr());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ type: 'justified', reason: '' });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const rangeInvalid = mode === 'custom' && from && to && from > to;
  const queryValid = mode === 'month' ? !!month : !!from && !!to && from <= to;
  const query = mode === 'month' ? `month=${month}` : `from=${from}&to=${to}`;

  const loadReport = async () => {
    if (!queryValid) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/attendance/report?${query}`);
      setReport(res.data);
      setSelectedId(prev => (res.data.members.some(m => m.userId === prev) ? prev : (res.data.members[0]?.userId || null)));
    } catch (err) {
      setError(err.response?.data?.error || tx.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [mode, month, from, to]);

  const formatTime = (iso) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Conakry' });
  const formatDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  const formatLongDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const statusLabel = (row) => (row.status === 'late' ? tx.statuses.late(row.lateMinutes) : tx.statuses[row.status]);

  const badge = (label, style) => (
    <span className="badge" style={{ background: style.bg, color: style.color }}>{label}</span>
  );

  const openModal = (member, row) => {
    setModalError('');
    setForm({ type: row.status === 'mission' ? 'mission' : 'justified', reason: row.reason || '' });
    setModal({ member, row });
  };

  const saveException = async () => {
    setSaving(true);
    setModalError('');
    try {
      await api.put('/attendance/exceptions', {
        userId: modal.member.userId,
        date: modal.row.date,
        type: form.type,
        reason: form.reason
      });
      setModal(null);
      await loadReport();
    } catch (err) {
      setModalError(err.response?.data?.error || tx.error);
    } finally {
      setSaving(false);
    }
  };

  const removeException = async () => {
    setSaving(true);
    setModalError('');
    try {
      await api.delete(`/attendance/exceptions/${modal.row.exceptionId}`);
      setModal(null);
      await loadReport();
    } catch (err) {
      setModalError(err.response?.data?.error || tx.error);
    } finally {
      setSaving(false);
    }
  };

  const members = report?.members || [];
  const selected = members.find(m => m.userId === selectedId);
  const totals = report?.totals;
  const settings = report?.settings;
  const cardStyle = { background: 'white', border: '1px solid #ececea', borderRadius: 14, padding: '14px 18px' };

  return (
    <div className="app-shell">
      <style>{`.report-table tr.clickable td { cursor: pointer !important; }`}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <div className="page-content" style={{ maxWidth: 1100 }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ marginBottom: 12 }}>
            <Menu size={22} />
          </button>

          <div className="page-header">
            <div className="page-title-row">
              <div className="page-icon"><ClipboardList size={22} /></div>
              <div>
                <h2 className="page-title">{tx.title}</h2>
                {settings && <p className="page-subtitle">{tx.rule(settings.workStart, settings.toleranceMinutes, computeLimit(settings.workStart, settings.toleranceMinutes))}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="input" value={mode} onChange={e => setMode(e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
                <option value="month">{tx.monthMode}</option>
                <option value="custom">{tx.customMode}</option>
              </select>
              {mode === 'month' ? (
                <input className="input" type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 'auto', marginBottom: 0 }} />
              ) : (
                <>
                  <input className="input" type="date" aria-label={tx.from} value={from} onChange={e => setFrom(e.target.value)} style={{ width: 'auto', marginBottom: 0 }} />
                  <input className="input" type="date" aria-label={tx.to} value={to} onChange={e => setTo(e.target.value)} style={{ width: 'auto', marginBottom: 0 }} />
                </>
              )}
            </div>
          </div>

          {rangeInvalid && <div className="auth-error">{tx.invalidRange}</div>}
          {error && <div className="auth-error">{error}</div>}
          {loading && <div className="table-loading"><span className="spinner spinner-dark" />{tx.loading}</div>}

          {!loading && report && members.length === 0 && (
            <div className="card" style={{ color: '#777', fontSize: 14 }}>{tx.noStaff}</div>
          )}

          {!loading && report && members.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, color: '#777' }}>{tx.present}</div>
                  <div style={{ fontSize: 26, fontWeight: 600 }}>{totals.present}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{tx.expectedOf(totals.expectedDays)}</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, color: '#777' }}>{tx.late}</div>
                  <div style={{ fontSize: 26, fontWeight: 600 }}>{totals.late}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{tx.minCumulated(totals.lateMinutes)}</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, color: '#777' }}>{tx.absences}</div>
                  <div style={{ fontSize: 26, fontWeight: 600 }}>{totals.absJustified + totals.absUnjustified}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{tx.absSplit(totals.absJustified, totals.absUnjustified)}</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, color: '#777' }}>{tx.punctuality}</div>
                  <div style={{ fontSize: 26, fontWeight: 600 }}>{totals.rate === null ? '—' : `${totals.rate} %`}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{tx.onTimeOf(totals.onTime, totals.present)}</div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{tx.byPerson}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{tx.clickHint}</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table report-table" style={{ minWidth: 820 }}>
                    <thead>
                      <tr>
                        <th>{tx.member}</th>
                        <th>{tx.presents}</th>
                        <th>{tx.onTimeCol}</th>
                        <th>{tx.latesCol}</th>
                        <th>{tx.missionsCol}</th>
                        <th>{tx.absJ}</th>
                        <th>{tx.absU}</th>
                        <th>{tx.rate}</th>
                        <th>{tx.rating}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.userId} className="clickable" onClick={() => setSelectedId(m.userId)} style={{ background: m.userId === selectedId ? '#f5f5f8' : 'transparent' }}>
                          <td style={{ fontWeight: m.userId === selectedId ? 600 : 400 }}>{m.name}</td>
                          <td>{m.present}</td>
                          <td>{m.onTime}</td>
                          <td>{m.late} <span style={{ color: '#999' }}>· {m.lateMinutes} min</span></td>
                          <td>{m.missions}</td>
                          <td>{m.absJustified}</td>
                          <td>{m.absUnjustified}</td>
                          <td>
                            {m.rate === null ? '—' : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 56, height: 6, background: '#ececea', borderRadius: 3 }}>
                                  <div style={{ width: `${m.rate}%`, height: 6, background: RATING_STYLE[m.rating].bar, borderRadius: 3 }} />
                                </div>
                                {m.rate} %
                              </div>
                            )}
                          </td>
                          <td>{m.rating ? badge(tx.ratings[m.rating], RATING_STYLE[m.rating]) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 10 }}>{tx.legend(settings.thresholds)}</div>
              </div>

              {selected && (
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: '16px 20px 6px', fontSize: 15, fontWeight: 600 }}>{tx.dayByDay(selected.name)}</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 760 }}>
                      <thead>
                        <tr>
                          <th>{tx.date}</th>
                          <th>{tx.arrival}</th>
                          <th>{tx.departure}</th>
                          <th>{tx.status}</th>
                          <th>{tx.reason}</th>
                          <th>{tx.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.days.map(row => (
                          <tr key={row.date}>
                            <td style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{formatDay(row.date)}</td>
                            <td>
                              {row.arrival ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {formatTime(row.arrival.time)}
                                  {row.arrival.signatureUrl && <img src={row.arrival.signatureUrl} alt="" style={{ height: 26, background: 'white', borderRadius: 4, border: '1px solid #ececea' }} />}
                                </div>
                              ) : '—'}
                            </td>
                            <td>
                              {row.departure ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {formatTime(row.departure.time)}
                                  {row.departure.signatureUrl && <img src={row.departure.signatureUrl} alt="" style={{ height: 26, background: 'white', borderRadius: 4, border: '1px solid #ececea' }} />}
                                </div>
                              ) : row.missingDeparture ? badge(tx.missingDeparture, STATUS_STYLE.absent) : '—'}
                            </td>
                            <td>{badge(statusLabel(row), STATUS_STYLE[row.status])}</td>
                            <td style={{ color: '#777' }}>{row.reason || '—'}</td>
                            <td>
                              {['absent', 'justified', 'mission'].includes(row.status) && (
                                <button className="btn-outline" onClick={() => openModal(selected, row)} style={{ padding: '5px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {row.status !== 'absent' && <Pencil size={12} />}
                                  {row.status === 'absent' ? tx.justify : tx.edit}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {selected.days.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 30 }}>{tx.noDays}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => { if (!saving) setModal(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div>
                <h3>{tx.modalTitle}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777', textTransform: 'capitalize' }}>{modal.member.name} · {formatLongDay(modal.row.date)}</p>
              </div>
              <button className="modal-close" onClick={() => setModal(null)} disabled={saving}>&times;</button>
            </div>

            <div className="modal-body">
              {modalError && <div className="auth-error">{modalError}</div>}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button type="button" onClick={() => setForm({ ...form, type: 'justified' })} className={form.type === 'justified' ? 'btn' : 'btn-outline'} style={{ flex: 1, fontSize: 13, padding: '8px' }}>
                  {tx.typeJustified}
                </button>
                <button type="button" onClick={() => setForm({ ...form, type: 'mission' })} className={form.type === 'mission' ? 'btn' : 'btn-outline'} style={{ flex: 1, fontSize: 13, padding: '8px' }}>
                  {tx.typeMission}
                </button>
              </div>
              <label className="field-label-icon">{tx.reasonLabel}</label>
              <input className="input" maxLength={200} value={form.reason} placeholder={tx.reasonPlaceholder} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ marginBottom: 0 }} />
            </div>

            <div className="modal-footer">
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setModal(null)} disabled={saving}>{tx.cancel}</button>
              <button className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#4338ca' }} onClick={saveException} disabled={saving}>
                {saving && <span className="spinner" />} {saving ? '' : tx.save}
              </button>
            </div>
            {modal.row.exceptionId && (
              <div style={{ textAlign: 'center', paddingBottom: 14 }}>
                <button type="button" className="btn-danger-text" onClick={removeException} disabled={saving}>{tx.remove}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}