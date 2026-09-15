import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, Ambulance, Bell, Check, ChevronDown, ChevronRight,
  Clock3, HeartPulse, Hospital, LocateFixed, MapPin, Navigation, Plus, Radio,
  Search, Send, Shield, Siren, SlidersHorizontal, Users, X, Zap, Minus
} from 'lucide-react';
import './styles.css';
import './backend.css';
import { api, apiBase } from './api';

const severityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const typeLabels = {
  FIRE: 'Fire', FLOOD: 'Flood', EARTHQUAKE: 'Earthquake', ACCIDENT: 'Accident',
  MEDICAL: 'Medical', ROAD_BLOCK: 'Road Block', BUILDING_COLLAPSE: 'Building Collapse', OTHER: 'Other'
};
const typeIcon = { FIRE: '🔥', FLOOD: '🌊', EARTHQUAKE: '🌐', ACCIDENT: '🚗', MEDICAL: '⚕️', ROAD_BLOCK: '🚧', BUILDING_COLLAPSE: '🏚️', OTHER: '⚠️' };
const severityClass = (value = '') => String(value).toLowerCase();

function relativeTime(value) {
  if (!value) return 'Recently';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function normalizeIncident(item, index) {
  const lat = Number(item.location?.latitude) || 27.4924;
  const lng = Number(item.location?.longitude) || 77.6737;
  const x = Math.max(8, Math.min(92, 50 + (lng - 77.6737) * 45));
  const y = Math.max(10, Math.min(90, 50 - (lat - 27.4924) * 45));
  return {
    ...item,
    id: item._id,
    typeLabel: typeLabels[item.type] || item.type || 'Incident',
    icon: typeIcon[item.type] || '⚠️',
    severity: item.severity || 'MEDIUM',
    time: relativeTime(item.createdAt),
    locationLabel: item.location?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    x, y,
    reports: item.reports || 1,
    summary: item.description || 'No additional description is available.'
  };
}

function Logo() {
  return <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="CrisisMap home">
    <div className="brand-mark"><Shield size={21} fill="currentColor" /></div>
    <div><strong>Crisis<span>Map</span></strong><small>Safer roads. Safer people.</small></div>
  </button>;
}

function Sidebar({ active, setActive, alertCount }) {
  const items = [['Live Map', Radio], ['Accidents', Siren], ['Report Accident', Plus], ['Nearby Services', Users], ['Analytics', Activity], ['Alerts', AlertTriangle], ['Community', Users], ['Settings', SlidersHorizontal]];
  return <aside className="sidebar">
    <Logo />
    <nav>{items.map(([label, Icon]) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon size={17}/><span>{label}</span>{label === 'Alerts' && alertCount > 0 && <b className="nav-badge">{alertCount}</b>}</button>)}</nav>
    <div className="sidebar-spacer" />
    <div className="save-card"><strong>Every Report<br/>Can Save a Life</strong><p>Real-time information.<br/>Faster help.<br/>Safer roads.</p><button onClick={() => setActive('Report Accident')}>Start a New Report <ChevronRight size={14}/></button></div>
    <div className="sidebar-foot">● API connected</div>
  </aside>;
}

function Topbar({ search, setSearch, onSearch, onReport, onAlerts, onProfile }) {
  return <header className="topbar">
    <div className="search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch()} placeholder="Search incidents, roads or locations..."/><kbd>⌘ K</kbd></div>
    <div className="top-actions"><button className="live"><i/> Live Updates</button><button className="icon-button" onClick={onAlerts} aria-label="Open alerts"><Bell size={18}/></button><button className="report-button" onClick={onReport}><Plus size={17}/> Report Accident</button><button className="avatar" onClick={onProfile}>CM</button></div>
  </header>;
}

function Filters({ filters, setFilters }) {
  const menus = [
    ['severity', filters.severity === 'All' ? 'All Severities' : filters.severity, ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']],
    ['type', filters.type === 'All' ? 'All Types' : (typeLabels[filters.type] || filters.type), ['All', 'ACCIDENT', 'FIRE', 'FLOOD', 'EARTHQUAKE', 'MEDICAL', 'ROAD_BLOCK', 'BUILDING_COLLAPSE', 'OTHER']],
    ['status', filters.status === 'All' ? 'All Status' : filters.status, ['All', 'ACTIVE', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']]
  ];
  const [open, setOpen] = useState(null);
  return <div className="filters">
    <button className={filters.type === 'ACCIDENT' ? 'filter-select accent selected-filter' : 'filter-select accent'} onClick={() => setFilters({ ...filters, type: filters.type === 'ACCIDENT' ? 'All' : 'ACCIDENT' })}><Siren size={14}/><span>Accidents</span><ChevronDown size={14}/></button>
    {menus.map(([key, label, options]) => <div className="filter-wrap" key={key}><button className="filter-select" onClick={() => setOpen(open === key ? null : key)}><SlidersHorizontal size={13}/><span>{label}</span><ChevronDown size={13}/></button>{open === key && <div className="dropdown">{options.map(option => <button key={option} onClick={() => { setFilters({ ...filters, [key]: option }); setOpen(null); }}>{key === 'type' ? (typeLabels[option] || option) : option}</button>)}</div>}</div>)}
    <button className="clear" onClick={() => setFilters({ severity: 'All', type: 'All', status: 'All' })}>Clear Filters</button>
  </div>;
}

function MapCanvas({ incidents, selected, setSelected, zoom, setZoom, onLocate }) {
  return <div className="map-card backend-map">
    <div className="map-texture"/><div className="road road-a"/><div className="road road-b"/><div className="road road-c"/><div className="river"/>
    <span className="place p1">Mathura</span><span className="place p2">Vrindavan</span><span className="place p3">Agra</span><span className="place p4">Kosi Kalan</span>
    <div className="map-layer" style={{ transform: `scale(${zoom / 100})` }}>{incidents.map(item => <button key={item.id} className={`marker ${severityClass(item.severity)} ${selected?.id === item.id ? 'selected' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => setSelected(item)} title={item.title}><span>{item.icon}</span></button>)}</div>
    <div className="map-info"><strong>{incidents.length ? `${incidents.length} incidents in view` : 'No incidents found'}</strong><span>Live data from the CrisisMap backend</span></div>
    <div className="key-card"><b>Live Overview</b><div><Radio/><span>Active Incidents<strong>{incidents.filter(i => i.status === 'ACTIVE' || i.status === 'IN_PROGRESS').length}</strong></span></div><div><Clock3/><span>API Endpoint<strong>{apiBase}</strong></span></div><hr/><small><i className="dot critical"/>Critical <i className="dot high"/>High <i className="dot medium"/>Medium <i className="dot low"/>Low</small></div>
    <div className="map-tools"><button onClick={() => setZoom(Math.min(140, zoom + 10))}><Plus/></button><button onClick={() => setZoom(Math.max(80, zoom - 10))}><Minus/></button><button onClick={onLocate}><LocateFixed/></button></div>
  </div>;
}

function IncidentList({ incidents, selected, setSelected, sort, setSort }) {
  const ordered = useMemo(() => [...incidents].sort((a, b) => sort === 'Severity' ? severityRank[a.severity] - severityRank[b.severity] : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [incidents, sort]);
  return <section className="incidents-panel"><div className="section-head"><div><h3>Incidents Nearby <em>({incidents.length})</em></h3><span>Live records from MongoDB</span></div><button onClick={() => setSort(sort === 'Latest' ? 'Severity' : 'Latest')}>Sort: {sort}<ChevronDown size={13}/></button></div><div className="incident-list">{ordered.slice(0, 8).map(item => <button className={`incident-row ${selected?.id === item.id ? 'picked' : ''}`} key={item.id} onClick={() => setSelected(item)}><div className={`incident-icon ${severityClass(item.severity)}`}>{item.icon}</div><div className="incident-copy"><strong>{item.title}</strong><span>{item.locationLabel}</span><small>{relativeTime(item.createdAt)} · {item.status?.replace('_', ' ')}</small></div><span className={`pill ${severityClass(item.severity)}`}>{item.severity}</span></button>)}</div>{!ordered.length && <div className="empty-state"><Siren size={24}/><b>No incidents match these filters</b><span>Reports created through the backend will appear here.</span></div>}</section>;
}

function Services({ services, onViewAll }) {
  const iconFor = type => type === 'HOSPITAL' ? Hospital : type === 'POLICE' ? Shield : type === 'FIRE_STATION' ? Siren : Ambulance;
  const openService = service => service.type === 'AMBULANCE' && service.phone ? window.location.href = `tel:${service.phone}` : window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${service.name} ${service.address}`)}`, '_blank');
  return <section className="card services"><div className="section-head"><div><h3>Nearby Services</h3><span>Emergency resources from the backend</span></div><button onClick={onViewAll}>View All <ChevronRight size={13}/></button></div>{services.slice(0, 5).map(service => { const Icon = iconFor(service.type); return <div className="service-row" key={service._id}><div className="service-icon"><Icon size={16}/></div><span><b>{service.name}</b><small>{service.address} {service.available ? '· Available' : '· Unavailable'}</small></span><button className="direction" onClick={() => openService(service)}>{service.type === 'AMBULANCE' ? 'Call' : 'Directions'}</button></div>; })}{!services.length && <div className="empty-state small"><Hospital size={20}/><span>No services have been added yet.</span></div>}</section>;
}

function ReportModal({ close, notify, onCreated }) {
  const [type, setType] = useState('ACCIDENT');
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ latitude: 27.4924, longitude: 77.6737 });
  const [busy, setBusy] = useState(false);
  const locate = () => navigator.geolocation?.getCurrentPosition(({ coords: c }) => setCoords({ latitude: c.latitude, longitude: c.longitude }), () => notify('Location permission was not granted.'));
  const submit = async () => {
    if (!description.trim()) return notify('Please describe what happened.');
    setBusy(true);
    try {
      const result = await api.createIncident({ title: `${typeLabels[type] || 'Incident'} reported by citizen`, description: description.trim(), type, severity, location: { ...coords, address: address.trim() || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` } });
      onCreated(result.incident);
      notify('Incident submitted to the CrisisMap backend.');
      close();
    } catch (error) { notify(error.message); } finally { setBusy(false); }
  };
  return <div className="modal-backdrop"><div className="modal"><button className="close" onClick={close}><X/></button><div className="modal-kicker"><Radio size={15}/> COMMUNITY REPORT</div><h2>Report an incident</h2><p>Your report is stored as unverified data until reviewed.</p><label>Incident type<select value={type} onChange={e => setType(e.target.value)}>{Object.entries(typeLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label>Severity<select value={severity} onChange={e => setSeverity(e.target.value)}>{['LOW','MEDIUM','HIGH','CRITICAL'].map(v => <option key={v}>{v}</option>)}</select></label><label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What happened? Keep it factual and useful..."/></label><label>Location<button className="location-input" onClick={locate}><LocateFixed size={16}/> Use current location <span>{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</span></button></label><label>Address<input value={address} onChange={e => setAddress(e.target.value)} placeholder="Road, landmark or area"/></label><button className="primary" disabled={busy} onClick={submit}><Send size={16}/> {busy ? 'Submitting...' : 'Submit Report'}</button><small className="privacy">The backend records the incident. Review and verification can happen separately.</small></div></div>;
}

function DetailDrawer({ incident, close, onRoute }) {
  if (!incident) return null;
  return <div className="detail-drawer"><button className="drawer-close" onClick={close}><X/></button><div className={`detail-icon ${severityClass(incident.severity)}`}>{incident.icon}</div><span className={`status ${severityClass(incident.severity)}`}>{incident.severity} SEVERITY</span><h2>{incident.title}</h2><div className="detail-location"><MapPin size={16}/> {incident.locationLabel}</div><div className="verified"><Shield size={15}/> Status: {incident.status?.replace('_', ' ')} <span>· {relativeTime(incident.createdAt)}</span></div><div className="detail-section"><h4>DESCRIPTION</h4><p>{incident.description}</p></div><div className="detail-section"><h4>REPORTED BY</h4><p>{incident.reportedBy?.name || 'Citizen report'}</p></div><button className="route" onClick={() => onRoute(incident)}><Navigation size={16}/> Get route to incident</button></div>;
}

function UtilityModal({ title, children, close }) { return <div className="modal-backdrop"><div className="modal utility-modal"><button className="close" onClick={close}><X/></button><div className="modal-kicker"><Shield size={15}/> CRISISMAP</div><h2>{title}</h2>{children}<button className="primary" onClick={close}>Done</button></div></div>; }

function App() {
  const [active, setActive] = useState('Live Map');
  const [incidents, setIncidents] = useState([]);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ severity: 'All', type: 'All', status: 'All' });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Latest');
  const [zoom, setZoom] = useState(100);
  const [report, setReport] = useState(false);
  const [utility, setUtility] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [incidentData, serviceData] = await Promise.all([
        api.getIncidents(),
        api.getServices()
      ]);
      setIncidents(Array.isArray(incidentData) ? incidentData.map(normalizeIncident) : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
      setError('');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3500); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { const onKey = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.querySelector('.search input')?.focus(); } if (e.key === 'Escape') { setSelected(null); setReport(false); setUtility(null); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);

  const visible = useMemo(() => incidents.filter(i => (filters.severity === 'All' || i.severity === filters.severity) && (filters.type === 'All' || i.type === filters.type) && (filters.status === 'All' || i.status === filters.status) && (!search.trim() || `${i.title} ${i.locationLabel} ${i.typeLabel}`.toLowerCase().includes(search.toLowerCase()))), [incidents, filters, search]);
  const notify = message => setToast(message);
  const handleNav = label => { setActive(label); if (label === 'Report Accident') setReport(true); else if (label === 'Nearby Services') setUtility('services'); else if (label === 'Analytics') setUtility('analytics'); else if (label === 'Alerts') setUtility('alerts'); else if (label === 'Settings') setUtility('settings'); else if (label === 'Community') setUtility('community'); else if (label === 'Accidents') setFilters({ ...filters, type: 'ACCIDENT' }); };
  const locate = () => navigator.geolocation?.getCurrentPosition(() => { setZoom(120); notify('Map centered on your location.'); }, () => notify('Location permission was not granted.'));
  const route = incident => window.open(`https://www.google.com/maps/dir/?api=1&destination=${incident.location.latitude},${incident.location.longitude}`, '_blank');
  const created = () => load();
  const alertCount = incidents.filter(i => i.status === 'ACTIVE' && (i.severity === 'CRITICAL' || i.severity === 'HIGH')).length;

  return <div className="app">
    <Sidebar active={active} setActive={handleNav} alertCount={alertCount}/>
    <main><Topbar search={search} setSearch={setSearch} onSearch={() => setSearch(search)} onReport={() => setReport(true)} onAlerts={() => setUtility('alerts')} onProfile={() => setUtility('settings')}/>
      <div className="content">
        <div className="page-title"><div><div className="eyebrow"><i/> LIVE INTELLIGENCE</div><h1>Live Incident Map</h1><p>Real-time public safety events connected to the CrisisMap backend.</p></div><div className="last-updated"><span><Zap size={13}/> {loading ? 'SYNCING' : 'LIVE'}</span> {error ? 'Backend unavailable' : `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</div></div>
        {error && <div className="backend-error"><AlertTriangle size={17}/><div><b>Backend connection needs attention</b><span>{error}. Set <code>VITE_API_URL</code> to your deployed backend URL.</span></div><button onClick={load}>Retry</button></div>}
        <Filters filters={filters} setFilters={setFilters}/>
        <div className="dashboard-grid"><div className="map-column"><MapCanvas incidents={visible} selected={selected} setSelected={setSelected} zoom={zoom} setZoom={setZoom} onLocate={locate}/><div className="bottom-grid"><section className="card recent"><div className="section-head"><h3>Recent Incidents</h3><span>{incidents.length} records</span></div>{incidents.slice(0, 5).map(i => <button className="recent-row" key={i.id} onClick={() => setSelected(i)}><span className="mini-thumb">{i.icon}</span><span><b>{i.title}</b><small>{i.locationLabel}</small></span><time>{relativeTime(i.createdAt)}</time><em className={`pill ${severityClass(i.severity)}`}>{i.severity}</em></button>)}{!incidents.length && <div className="empty-state small"><Radio size={20}/><span>No incident records yet.</span></div>}</section><Services services={services} onViewAll={() => setUtility('services')}/></div><section className="relief-card"><div className="relief-icon"><HeartPulse/></div><div><b>Need help beyond emergency services?</b><span>Connect with verified relief organizations and community responders.</span></div><button onClick={() => setUtility('relief')}>Explore Relief Network <ChevronRight size={15}/></button></section></div><IncidentList incidents={visible} selected={selected} setSelected={setSelected} sort={sort} setSort={setSort}/></div>
      </div>
    </main>
    {selected && <DetailDrawer incident={selected} close={() => setSelected(null)} onRoute={route}/>} {report && <ReportModal close={() => setReport(false)} notify={notify} onCreated={created}/>} {utility === 'services' && <UtilityModal title="Nearby Services" close={() => setUtility(null)}><p className="utility-copy">{services.length} emergency service records are currently available.</p>{services.map(s => <div className="relief-option" key={s._id}><Hospital/><div><b>{s.name}</b><small>{s.address}</small></div></div>)}</UtilityModal>}{utility === 'analytics' && <UtilityModal title="Analytics" close={() => setUtility(null)}><p className="utility-copy">Live operational totals calculated from the records returned by MongoDB.</p><div className="metric-grid"><div><b>{incidents.length}</b><span>Total loaded</span></div><div><b>{incidents.filter(i => i.severity === 'CRITICAL').length}</b><span>Critical</span></div><div><b>{incidents.filter(i => i.status === 'ACTIVE').length}</b><span>Active</span></div><div><b>{services.length}</b><span>Services</span></div></div></UtilityModal>}{utility === 'alerts' && <UtilityModal title="Alerts" close={() => setUtility(null)}><p className="utility-copy">High-priority active incidents from the live backend feed.</p>{incidents.filter(i => i.status === 'ACTIVE' && (i.severity === 'CRITICAL' || i.severity === 'HIGH')).slice(0, 5).map(i => <div className="alert-item" key={i.id}><AlertTriangle/><span><b>{i.title}</b><small>{i.locationLabel} · {relativeTime(i.createdAt)}</small></span></div>)}</UtilityModal>}{utility === 'community' && <UtilityModal title="Community" close={() => setUtility(null)}><p className="utility-copy">Citizen reports are submitted through the same incident API and remain subject to review.</p><button className="utility-action" onClick={() => { setUtility(null); setReport(true); }}><Plus/> Report a community incident <ChevronRight/></button></UtilityModal>}{utility === 'settings' && <UtilityModal title="Connection" close={() => setUtility(null)}><p className="utility-copy">Frontend API base</p><div className="connection-box"><code>{apiBase}</code><span>Authenticated requests automatically use the stored CrisisMap JWT.</span></div></UtilityModal>}{utility === 'relief' && <UtilityModal title="Relief Network" close={() => setUtility(null)}><p className="utility-copy">Relief partners can be connected here as the responder and NGO modules grow.</p><div className="relief-option"><HeartPulse/><div><b>Verified relief organizations</b><small>Partner records can be surfaced alongside incidents.</small></div></div><div className="relief-option"><Users/><div><b>Community responders</b><small>Responder records are already supported by the backend.</small></div></div></UtilityModal>}
    {toast && <div className="toast"><Check size={15}/>{toast}</div>}<button className="emergency" onClick={() => window.location.href='tel:112'}>In an emergency, always call <b>112</b></button>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
