import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, Ambulance, Bell, Check, ChevronDown, ChevronRight,
  CircleHelp, Clock3, Crosshair, Filter, Globe2, HeartPulse, Hospital,
  LocateFixed, MapPin, Navigation, Plus, Radio, Search, Send, Settings2,
  Shield, Siren, SlidersHorizontal, UserRound, Users, X, Zap, Minus,
  BarChart3, Megaphone, MessageSquareText
} from 'lucide-react';
import './styles.css';

const incidents = [
  { id: 1, type: 'Accident', title: 'Multi-vehicle collision', location: 'NH-19, Mathura', time: '12 min ago', severity: 'Critical', x: 52, y: 45, icon: '🚗', reports: 4, summary: 'Multiple vehicles are involved in a collision near the NH-19 corridor. Traffic is slowing in both directions.' },
  { id: 2, type: 'Accident', title: 'Bike accident', location: 'Near Mathura Junction', time: '18 min ago', severity: 'High', x: 59, y: 54, icon: '🏍️', reports: 2, summary: 'A motorcycle collision has been reported near the junction. Emergency response is being coordinated.' },
  { id: 3, type: 'Vehicle', title: 'Car overturned', location: 'Delhi–Agra Expressway', time: '32 min ago', severity: 'Medium', x: 44, y: 35, icon: '🚙', reports: 3, summary: 'A car has overturned on the expressway. One lane is affected according to current reports.' },
  { id: 4, type: 'Accident', title: 'Truck and car collision', location: 'NH-44, Mathura', time: '45 min ago', severity: 'High', x: 68, y: 40, icon: '🚛', reports: 5, summary: 'Truck and passenger vehicle collision reported. Responders are moving toward the location.' },
  { id: 5, type: 'Accident', title: 'Minor accident', location: 'Govardhan Road', time: '1 hour ago', severity: 'Low', x: 37, y: 66, icon: '🚗', reports: 1, summary: 'Minor road incident with limited disruption. No casualties reported by available sources.' },
  { id: 6, type: 'Fire', title: 'Industrial fire detected', location: 'Mathura industrial area', time: '1h 12m ago', severity: 'High', x: 61, y: 28, icon: '🔥', reports: 2, summary: 'Satellite detection indicates an active fire hotspot. Urban confirmation is pending.' },
  { id: 7, type: 'Weather', title: 'Heavy rainfall warning', location: 'Mathura district', time: '2 hours ago', severity: 'Medium', x: 30, y: 50, icon: '🌧️', reports: 1, summary: 'Weather warning active for heavy rainfall. This is a warning event, not a confirmed flood incident.' },
  { id: 8, type: 'Medical', title: 'Medical emergency', location: 'Govardhan Road', time: '2h 18m ago', severity: 'Critical', x: 75, y: 63, icon: '⚕️', reports: 3, summary: 'Medical emergency reported by nearby citizens. Nearest emergency services have been surfaced.' },
];

const services = [
  { icon: Hospital, name: 'District Hospital, Mathura', distance: '2.1 km', eta: '6 min', action: 'Directions', query: 'District Hospital Mathura' },
  { icon: Shield, name: 'Traffic Police Station', distance: '1.8 km', eta: '5 min', action: 'Directions', query: 'Traffic Police Station Mathura' },
  { icon: Siren, name: 'Fire Station', distance: '3.4 km', eta: '8 min', action: 'Directions', query: 'Fire Station Mathura' },
  { icon: Ambulance, name: 'Ambulance Services (108)', distance: 'Emergency', eta: '108', action: 'Call', query: '108' },
];

const severityClass = (s) => s.toLowerCase();

function Logo() {
  return <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="CrisisMap home"><div className="brand-mark"><Shield size={21} fill="currentColor" /></div><div><strong>Crisis<span>Map</span></strong><small>Safer roads. Safer people.</small></div></button>;
}

function Sidebar({ active, setActive }) {
  const items = [
    ['Live Map', Radio], ['Accidents', Siren], ['Report Accident', Plus], ['Nearby Services', Users],
    ['Analytics', Activity], ['Alerts', AlertTriangle], ['Community', Users], ['Settings', SlidersHorizontal]
  ];
  return <aside className="sidebar"><Logo />
    <nav>{items.map(([label, Icon]) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)}><Icon size={17}/><span>{label}</span>{label === 'Alerts' && <b className="nav-badge">3</b>}</button>)}</nav>
    <div className="sidebar-spacer" />
    <div className="save-card"><div className="save-glow"/><strong>Every Report<br/>Can Save a Life</strong><p>Real-time information.<br/>Faster help.<br/>Safer roads.</p><button onClick={() => setActive('Report Accident')}>Start a New Report <ChevronRight size={14}/></button></div>
    <div className="sidebar-foot">● Systems operational</div>
  </aside>;
}

function Topbar({ onReport, onNotifications, onProfile, search, setSearch, onSearch }) {
  return <header className="topbar"><div className="search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch()} placeholder="Search location (e.g. Mathura, NH-19, Delhi...)"/><kbd>⌘ K</kbd></div><div className="top-actions"><button className="live" onClick={onSearch}><i/> Live Updates</button><button className="icon-button" onClick={onNotifications} aria-label="Open alerts"><Bell size={18}/><b>3</b></button><button className="report-button" onClick={onReport}><Plus size={17}/> Report Accident</button><button className="avatar" onClick={onProfile} aria-label="Open profile">DS</button></div></header>;
}

function Filters({ filters, setFilters }) {
  const [open, setOpen] = useState(null);
  const menus = [
    ['period', filters.period, ['Last 24 hours', 'Last 7 days', 'Last 30 days']],
    ['severity', filters.severity === 'All' ? 'All Severities' : filters.severity, ['All', 'Critical', 'High', 'Medium', 'Low']],
    ['type', filters.type === 'All' ? 'All Vehicle Types' : filters.type, ['All', 'Accident', 'Fire', 'Medical', 'Weather']],
    ['state', filters.state, ['All States', 'Uttar Pradesh', 'Delhi', 'Rajasthan']]
  ];
  return <div className="filters"><button className="filter-select accent" onClick={() => setFilters({ ...filters, type: filters.type === 'Accident' ? 'All' : 'Accident' })}><Siren size={14}/><span>Accidents</span><ChevronDown size={14}/></button>{menus.map(([key, label, options]) => <div className="filter-wrap" key={key}><button className="filter-select" onClick={() => setOpen(open === key ? null : key)}><SlidersHorizontal size={13}/><span>{label}</span><ChevronDown size={13}/></button>{open === key && <div className="dropdown">{options.map(o => <button key={o} onClick={() => { setFilters({...filters, [key]: key === 'severity' && o === 'All' ? 'All' : key === 'type' && o === 'All' ? 'All' : o}); setOpen(null); }}>{o}</button>)}</div>}</div>)}<button className="clear" onClick={() => { setFilters({period:'Last 24 hours', severity:'All', type:'All', state:'All States'}); setOpen(null); }}>Clear Filters</button></div>;
}

function MapCanvas({ visibleIncidents, selected, setSelected, zoom, setZoom, onLocate }) {
  return <div className="map-card" style={{ '--map-zoom': zoom }}><div className="map-texture"/><div className="road road-a"/><div className="road road-b"/><div className="road road-c"/><div className="river"/>
    <span className="place p1">Mathura</span><span className="place p2">Vrindavan</span><span className="place p3">Agra</span><span className="place p4">Kosi Kalan</span><span className="road-label r1">NH-19</span><span className="road-label r2">NH-44</span><span className="road-label r3">Yamuna Expressway</span>
    <div className="map-layer" style={{ transform: `scale(${zoom / 100})`, transformOrigin: '50% 50%' }}>{visibleIncidents.map((incident) => <button key={incident.id} className={`marker ${severityClass(incident.severity)} ${selected?.id === incident.id ? 'selected' : ''}`} style={{left:`${incident.x}%`, top:`${incident.y}%`}} onClick={() => setSelected(incident)} title={incident.title}><span>{incident.severity === 'Critical' ? incident.reports : incident.icon}</span></button>)}</div>
    <div className="map-info"><strong>{zoom > 100 ? 'Detailed incident view' : 'Zoom to see more incidents'}</strong><span>{zoom > 100 ? `${visibleIncidents.length} incidents in view` : '(as you zoom, more real-time updates appear)'}</span></div>
    <div className="heat"><div className="heat-ring ring1"/><div className="heat-ring ring2"/><div className="heat-dot"/><div className="heat-label"><b>Heatmap Overview</b><span>Zoom in: More<br/>incidents appear</span></div></div>
    <div className="key-card"><b>Key Indicators</b><div><Radio/><span>Total Active Incidents<strong>55</strong></span></div><div><Clock3/><span>Average Response Time<strong>6.2 mins</strong></span></div><div><Users/><span>Live Users Online<strong>148</strong></span></div><hr/><small><i className="dot critical"/>Critical <i className="dot high"/>High <i className="dot medium"/>Medium <i className="dot low"/>Low</small></div>
    <div className="map-tools"><button onClick={() => setZoom(Math.min(140, zoom + 10))} title="Zoom in"><Plus/></button><button onClick={() => setZoom(Math.max(80, zoom - 10))} title="Zoom out"><Minus/></button><button onClick={onLocate} title="Use my location"><LocateFixed/></button></div><div className="scale">{zoom > 115 ? '1 km' : '2 km'}</div>
  </div>;
}

function IncidentList({ visibleIncidents, selected, setSelected, sort, setSort, onViewAll }) {
  const ordered = useMemo(() => [...visibleIncidents].sort((a,b) => sort === 'Severity' ? ({Critical:0,High:1,Medium:2,Low:3}[a.severity] - {Critical:0,High:1,Medium:2,Low:3}[b.severity]) : a.id - b.id), [visibleIncidents, sort]);
  return <section className="incidents-panel"><div className="section-head"><div><h3>Incidents Nearby <em>({visibleIncidents.length * 3 + 1})</em></h3><span>Live reports around Mathura</span></div><div className="sort-wrap"><button onClick={() => setSort(sort === 'Latest' ? 'Severity' : 'Latest')}>Sort: {sort} <ChevronDown size={13}/></button></div></div><div className="incident-list">{ordered.slice(0,6).map(i => <button className={`incident-row ${selected?.id === i.id ? 'picked' : ''}`} key={i.id} onClick={() => setSelected(i)}><div className={`incident-icon ${severityClass(i.severity)}`}>{i.icon}</div><div className="incident-copy"><strong>{i.title}</strong><span>{i.location}</span><small>{i.time}</small></div><span className={`pill ${severityClass(i.severity)}`}>{i.severity}</span><div className="thumb">{i.type === 'Fire' ? '🔥' : i.type === 'Weather' ? '🌧️' : '🚘'}</div></button>)}</div><button className="view-all" onClick={onViewAll}>View All Incidents <ChevronRight size={14}/></button></section>;
}

function RecentAccidents({ visibleIncidents, onViewAll }) {
  return <section className="card recent"><div className="section-head"><h3>Recent Accidents</h3><button onClick={onViewAll}>View All <ChevronRight size={13}/></button></div>{visibleIncidents.filter(i => i.type === 'Accident' || i.type === 'Vehicle').slice(0,5).map(i => <button className="recent-row" key={i.id} onClick={() => onViewAll(i)}><span className="mini-thumb">{i.icon}</span><span><b>{i.title}</b><small>{i.location}</small></span><time>{i.time}</time><em className={`pill ${severityClass(i.severity)}`}>{i.severity}</em></button>)}</section>;
}

function Services({ onViewAll }) {
  const act = (service) => service.action === 'Call' ? (window.location.href = 'tel:108') : window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.query)}`, '_blank', 'noopener,noreferrer');
  return <section className="card services"><div className="section-head"><div><h3>Nearby Services</h3><span>Find help close to this location</span></div><button onClick={onViewAll}>View All <ChevronRight size={13}/></button></div>{services.map(({icon:Icon,name,distance,eta,action,query}) => <div className="service-row" key={name}><div className="service-icon"><Icon size={16}/></div><span><b>{name}</b><small>{distance} <i>•</i> {eta}</small></span><button className="phone" onClick={() => action === 'Call' ? (window.location.href = 'tel:108') : window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank')} title={action === 'Call' ? 'Call 108' : 'Open map'}><Navigation size={14}/></button><button className="direction" onClick={() => act({action,query})}>{action}</button></div>)}</section>;
}

function BottomRelief({ onOpen }) {
  return <section className="relief-card"><div className="relief-icon"><HeartPulse/></div><div><b>Need help beyond emergency services?</b><span>Connect with verified relief organizations and community responders.</span></div><button onClick={onOpen}>Explore Relief Network <ChevronRight size={15}/></button></section>;
}

function ReportModal({ close, notify }) {
  const [sent, setSent] = useState(false);
  const [type, setType] = useState('Accident');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Mathura, Uttar Pradesh');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const useLocation = () => {
    if (!navigator.geolocation) return notify('Location services are not available in this browser.');
    navigator.geolocation.getCurrentPosition(({coords}) => setLocation(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`), () => notify('Location permission was not granted.'));
  };
  const submit = () => {
    if (!description.trim()) return notify('Please add a short factual description before submitting.');
    setSent(true);
  };
  if (sent) return <div className="modal-backdrop"><div className="modal success"><button className="close" onClick={close}><X/></button><div className="success-icon"><Check/></div><h2>Report received</h2><p>Your <b>{type.toLowerCase()}</b> report is now <b>unverified</b> and will be correlated with other available sources before verification.</p><button className="primary" onClick={() => { close(); notify('Report submitted successfully.'); }}>Back to Live Map</button></div></div>;
  return <div className="modal-backdrop"><div className="modal"><button className="close" onClick={close}><X/></button><div className="modal-kicker"><Radio size={15}/> COMMUNITY REPORT</div><h2>Witness an incident?</h2><p>Share what you know. Keep it short, location-aware, and factual.</p><label>Incident type<select value={type} onChange={e => setType(e.target.value)}><option>Accident</option><option>Fire</option><option>Medical emergency</option><option>Infrastructure</option><option>Other</option></select></label><label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What happened? Add any useful details..." /></label><label>Location<button className="location-input" onClick={useLocation}><LocateFixed size={16}/> Use current location <span>{location}</span></button></label><button className="upload" onClick={() => fileRef.current?.click()}><Plus size={18}/><span><b>{file ? file.name : 'Add photo'}</b><small>{file ? 'Evidence selected' : 'Optional evidence'}</small></span></button><input ref={fileRef} type="file" accept="image/*" hidden onChange={e => setFile(e.target.files?.[0] || null)} /><button className="primary" onClick={submit}><Send size={16}/> Submit Report</button><small className="privacy">Your identity is not shown publicly. Reports remain unverified until reviewed.</small></div></div>;
}

function DetailDrawer({ incident, close, onRoute }) {
  if (!incident) return null;
  return <div className="detail-drawer"><button className="drawer-close" onClick={close}><X/></button><div className={`detail-icon ${severityClass(incident.severity)}`}>{incident.icon}</div><span className={`status ${severityClass(incident.severity)}`}>{incident.severity.toUpperCase()} SEVERITY</span><h2>{incident.title}</h2><div className="detail-location"><MapPin size={16}/> {incident.location}</div><div className="verified"><Shield size={15}/> Unverified incident <span>• {incident.reports} reports</span></div><div className="detail-section"><h4>AI SUMMARY</h4><p>{incident.summary}</p></div><div className="detail-section"><h4>SOURCES & CONFIDENCE</h4><div className="source"><span>Citizen reports</span><b>{Math.min(96, 52 + incident.reports * 7)}%</b></div><div className="source"><span>Automated processing</span><b>89%</b></div></div><div className="detail-section"><h4>NEARBY HELP</h4><div className="help-row"><Hospital size={17}/> District Hospital <span>2.1 km</span></div><div className="help-row"><Shield size={17}/> Traffic Police <span>1.8 km</span></div></div><button className="route" onClick={() => onRoute(incident)}><Navigation size={16}/> Get route to incident</button></div>;
}

function UtilityModal({ title, icon:Icon, children, close }) {
  return <div className="modal-backdrop"><div className="modal utility-modal"><button className="close" onClick={close}><X/></button><div className="modal-kicker"><Icon size={15}/> CRISISMAP</div><h2>{title}</h2>{children}<button className="primary" onClick={close}>Done</button></div></div>;
}

function App() {
  const [active, setActive] = useState('Live Map');
  const [filters, setFilters] = useState({period:'Last 24 hours', severity:'All', type:'All', state:'All States'});
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Latest');
  const [zoom, setZoom] = useState(100);
  const [utility, setUtility] = useState(null);
  const [toast, setToast] = useState('');
  const [settings, setSettings] = useState({live:true, alerts:true, location:false});

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3000); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { const onKey = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.querySelector('.search input')?.focus(); } if (e.key === 'Escape') { setSelected(null); setReport(false); setUtility(null); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);

  const visible = useMemo(() => incidents.filter(i => (filters.severity === 'All' || i.severity === filters.severity) && (filters.type === 'All' || i.type === filters.type) && (filters.state === 'All States' || filters.state === 'Uttar Pradesh')), [filters]);
  const searchResults = useMemo(() => search.trim() ? incidents.filter(i => `${i.title} ${i.location} ${i.type}`.toLowerCase().includes(search.toLowerCase())) : [], [search]);

  const notify = (message) => setToast(message);
  const handleNav = (label) => {
    setActive(label);
    if (label === 'Report Accident') return setReport(true);
    if (label === 'Live Map') return setUtility(null);
    if (label === 'Accidents') { setFilters({...filters, type:'Accident'}); notify('Accident incidents are now filtered.'); return; }
    if (label === 'Nearby Services') return setUtility('services');
    if (label === 'Analytics') return setUtility('analytics');
    if (label === 'Alerts') return setUtility('alerts');
    if (label === 'Community') return setUtility('community');
    if (label === 'Settings') return setUtility('settings');
  };
  const handleSearch = () => {
    if (!search.trim()) return notify('Type a location, road, or incident to search.');
    const found = searchResults[0];
    if (found) { setSelected(found); notify(`Showing ${found.title}.`); }
    else notify(`No matching incident found for “${search.trim()}”.`);
  };
  const locate = () => {
    if (!navigator.geolocation) return notify('Location services are not available in this browser.');
    navigator.geolocation.getCurrentPosition(() => { setZoom(120); notify('Map centered on your current location.'); }, () => notify('Location permission was not granted.'));
  };
  const route = incident => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(incident.location)}`, '_blank');
  const openUtility = (kind) => setUtility(kind);
  const utilityContent = {
    analytics: <><p className="utility-copy">A quick operational snapshot of the current incident feed.</p><div className="metric-grid"><div><b>55</b><span>Active incidents</span></div><div><b>6.2m</b><span>Avg. response</span></div><div><b>148</b><span>Live users</span></div><div><b>91%</b><span>Source coverage</span></div></div><div className="utility-list"><div><BarChart3/> Critical incidents <b>2</b></div><div><Activity/> High severity <b>3</b></div><div><Radio/> Reports today <b>24</b></div></div></>,
    alerts: <><p className="utility-copy">Three active notices require attention.</p><div className="alert-item"><AlertTriangle/><span><b>Heavy rainfall warning</b><small>Mathura district • 2h ago</small></span></div><div className="alert-item"><Siren/><span><b>NH-19 collision response</b><small>Emergency crews dispatched • 12m ago</small></span></div><div className="alert-item"><Zap/><span><b>System status</b><small>All ingestion services operational</small></span></div></>,
    community: <><p className="utility-copy">Community reporting is open. Share verified local information and help responders build context.</p><button className="utility-action" onClick={() => { setUtility(null); setReport(true); }}><MessageSquareText/> Register community alert <ChevronRight/></button><button className="utility-action" onClick={() => notify('Community bulletin refreshed.')}><Megaphone/> Refresh bulletin <ChevronRight/></button></>,
    services: <><p className="utility-copy">Choose a service to open directions or call emergency support.</p>{services.map(s => <button className="utility-action" key={s.name} onClick={() => s.action === 'Call' ? (window.location.href='tel:108') : window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.query)}`,'_blank')}><s.icon size={17}/><span>{s.name}</span><ChevronRight/></button>)}</>,
    settings: <><p className="utility-copy">Local dashboard preferences are stored for this session.</p>{[['live','Live update indicator'],['alerts','Alert notifications'],['location','Location assistance']].map(([key,label]) => <button className="setting-row" key={key} onClick={() => setSettings({...settings,[key]:!settings[key]})}><span><Settings2 size={16}/>{label}</span><i className={settings[key] ? 'toggle on' : 'toggle'}><b/></i></button>)}</>
  };

  return <div className="app"><Sidebar active={active} setActive={handleNav}/><main><Topbar onReport={() => setReport(true)} onNotifications={() => openUtility('alerts')} onProfile={() => openUtility('settings')} search={search} setSearch={setSearch} onSearch={handleSearch}/><div className="content">
    {search && <div className="search-results">{searchResults.length ? searchResults.slice(0,5).map(i => <button key={i.id} onClick={() => {setSelected(i); setSearch('')}}><span>{i.icon}</span><div><b>{i.title}</b><small>{i.location}</small></div><ChevronRight size={14}/></button>) : <span>No matching incidents</span>}</div>}
    <div className="page-title"><div><div className="eyebrow"><i/> LIVE INTELLIGENCE</div><h1>Live Incident Map</h1><p>Real-time public safety events and response resources across your area.</p></div><div className="last-updated"><span><Zap size={13}/> LIVE</span> Updated just now</div></div>
    <Filters filters={filters} setFilters={setFilters}/><div className="dashboard-grid"><div className="map-column"><MapCanvas visibleIncidents={visible} selected={selected} setSelected={setSelected} zoom={zoom} setZoom={setZoom} onLocate={locate}/><div className="bottom-grid"><RecentAccidents visibleIncidents={visible} onViewAll={() => openUtility('incidents')}/><Services onViewAll={() => openUtility('services')}/></div><BottomRelief onOpen={() => openUtility('relief')}/></div><IncidentList visibleIncidents={visible} selected={selected} setSelected={setSelected} sort={sort} setSort={setSort} onViewAll={() => openUtility('incidents')}/></div></div></main>
    {selected && <DetailDrawer incident={selected} close={() => setSelected(null)} onRoute={route}/>} {report && <ReportModal close={() => setReport(false)} notify={notify}/>} {utility && utility !== 'incidents' && utility !== 'relief' && utilityContent[utility] && <UtilityModal title={utility[0].toUpperCase()+utility.slice(1)} icon={utility === 'analytics' ? BarChart3 : utility === 'alerts' ? Bell : utility === 'community' ? Users : utility === 'services' ? Hospital : Settings2} close={() => setUtility(null)}>{utilityContent[utility]}</UtilityModal>}
    {utility === 'incidents' && <UtilityModal title="All Incidents" icon={Siren} close={() => setUtility(null)}><div className="all-incidents">{visible.map(i => <button key={i.id} onClick={() => {setSelected(i); setUtility(null)}}><span className={`pill ${severityClass(i.severity)}`}>{i.severity}</span><div><b>{i.title}</b><small>{i.location} • {i.time}</small></div><ChevronRight/></button>)}</div></UtilityModal>}
    {utility === 'relief' && <UtilityModal title="Relief Network" icon={HeartPulse} close={() => setUtility(null)}><p className="utility-copy">Connect with verified organizations and community responders. This demo keeps donations and external actions outside CrisisMap.</p><div className="relief-option"><HeartPulse/><div><b>Verified NGO partners</b><small>Browse participating organizations and response needs.</small></div></div><div className="relief-option"><Users/><div><b>Volunteer response</b><small>Register your availability for local support.</small></div></div><button className="utility-action" onClick={() => notify('Relief network request recorded for this demo.')}><Send/> Request connection <ChevronRight/></button></UtilityModal>}
    <button className="emergency" onClick={() => window.location.href='tel:112'}><CircleHelp size={15}/> In an emergency, always call <b>112</b></button>{toast && <div className="toast"><Check size={15}/>{toast}</div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
